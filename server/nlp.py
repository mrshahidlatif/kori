from nltk.util import ngrams
from difflib import SequenceMatcher as SM
from wit import Wit
import sys
from gensim.models import KeyedVectors

client = Wit('LKKJIM2L7TQ6JJJCUBGDUSQGAI5SZB7N')
THRESHOLD = 0.70
WORD2VEC_THRESHOLD = 0.70
NO_OF_MOST_FREQUENT_WORDS = 100000

model = KeyedVectors.load_word2vec_format(
    'lang_models/GoogleNews-vectors-negative300.bin.gz', binary=True, limit=NO_OF_MOST_FREQUENT_WORDS)


def find_links(charts, sentence, sentence_offset, block_key):
    links = []
    # word or phrase links
    for chart in charts:
        features = chart.get('properties').get('features')
        for feature in features:
            result = fuzzy_substr_search(feature['value'], sentence)
            result_w2v = compute_word2vec_similarity(
                feature['value'], sentence)
            if result.get('similarity') > THRESHOLD:
                link = create_link(result.get(
                    'matching_str'), feature, chart.get('id'), feature.get('value'), result.get('offset'), sentence, sentence_offset, block_key, range_link_props=[])
                links.append(link)
            if result.get('similarity') < THRESHOLD and result_w2v != "":
                if result_w2v.get('similarity') > THRESHOLD:
                    link = create_link(result_w2v.get(
                        'matching_str'), feature, chart.get('id'), feature.get('value'), result_w2v.get('offset'), sentence, sentence_offset, block_key, range_link_props=[])
                    links.append(link)

    # range links
    for chart in charts:
        axes = chart.get('properties').get('axes')
        for axis in axes:
            if axis.get('type') in ["ordinal", "band", "point"]:
                continue
            if isinstance(axis.get('title'), list):
                continue
            result_fuzzy = fuzzy_substr_search(axis.get('title'), sentence)
            result_w2v = compute_word2vec_similarity(
                axis.get('title'), sentence)
            if result_fuzzy != None and result_w2v != "":
                if result_w2v.get('similarity') > result_fuzzy.get('similarity'):
                    result = result_w2v
                else:
                    result = result_fuzzy
            if result.get('similarity') > THRESHOLD:
                wit_response = get_and_parse_wit_response(sentence)
                interval = get_interval(sentence)
                if(wit_response[0].get('min_body') != "" or wit_response[1].get('max_body') != ""):
                    entities = [result.get('matching_str'), wit_response[0].get(
                        'min_body'), wit_response[1].get('max_body')]
                    indices = [result.get('offset'), sentence.index(wit_response[0].get(
                        'min_body')), sentence.index(wit_response[1].get('max_body'))]
                    min_offset = min(i for i in indices if i > 0)
                    max_offset = max(i for i in indices)
                    max_offset = max_offset + \
                        len(entities[indices.index(max_offset)])
                    range_link_text = sentence[min_offset:max_offset]
                    range_link = create_link(range_link_text, axis, chart.get('id'), axis.get(
                        'field'), min_offset, sentence, sentence_offset, block_key, range_link_props=wit_response)
                    links.append(range_link)
    individual_matches = get_matches(links)
    g_links = group_links(sentence, individual_matches)
    return links


def fuzzy_substr_search(needle, hay):
    if needle == None or isinstance(needle, list):
        return {"similarity": 0, "matching_str": '', "offset": 0}
    needle_length = len(needle.split())
    max_sim_val = 0
    max_sim_string = u""
    for ngram in ngrams(hay.split(), needle_length + int(.2*needle_length)):
        hay_ngram = u" ".join(ngram)
        similarity = SM(None, hay_ngram, needle).ratio()
        if similarity > max_sim_val:
            max_sim_val = similarity
            max_sim_string = hay_ngram
    return {"similarity": max_sim_val, "matching_str": max_sim_string, "offset": hay.find(max_sim_string)}


def create_link(link_text, feature, chartId, val, offset, sentence, sentence_offset, block_key, range_link_props):
    link = {
        "text": link_text,
        "feature": feature,
        "chartId": chartId,
        "active": False,
        "type": "point",
        "data": [val],
        "startIndex": sentence_offset + offset,
        "endIndex": sentence_offset + offset + len(link_text),
        "sentence": sentence,
        "isConfirmed": False,
        "blockKey": block_key,
    }
    if(len(range_link_props) == 2):
        link["rangeMin"] = range_link_props[0].get('min_val')
        link["rangeMax"] = range_link_props[1].get('max_val')
    return link


def get_and_parse_wit_response(msg):
    response = client.message(msg)
    try:
        max_val = response['entities']['wit$number:max'][0]['value']
        max_body = response['entities']['wit$number:max'][0]['body']
    except:
        max_val = sys.float_info.max
        max_body = ''
    try:
        min_val = response['entities']['wit$number:min'][0]['value']
        min_body = response['entities']['wit$number:min'][0]['body']
    except:
        min_val = - sys.float_info.max
        min_body = ''
    return [{'min_body': min_body, 'min_val': min_val}, {'max_body': max_body, 'max_val': max_val}]


def compute_word2vec_similarity(word, sentence):
    match_in_sentence = ''
    # corpus expects spaces to be replaced with '_'
    if(word is None):
        return match_in_sentence
    word = "_".join(word.split())
    try:
        similar_words = model.most_similar(word)
        similar_words = [sm[0]
                         for sm in similar_words if sm[1] > WORD2VEC_THRESHOLD]
        for word in similar_words:
            match_in_sentence = fuzzy_substr_search(
                " ".join(word.split("_")), sentence)
            if match_in_sentence.get('similarity') > THRESHOLD:
                return match_in_sentence
    except:
        pass
    return match_in_sentence


def group_links(sentence, matches):
    # TODO
    # print('Group Links', matches)
    return ''


def get_matches(links):
    matches = []
    for link in links:
        matches.append(link.get('text'))
    return matches


def get_interval(sentence):
    return ''
