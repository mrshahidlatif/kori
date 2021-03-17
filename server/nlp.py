from nltk.util import ngrams
from difflib import SequenceMatcher as SM
from wit import Wit
import sys
from gensim.models import KeyedVectors
import spacy
from spacy.matcher import Matcher
from spacy.matcher import PhraseMatcher
import re
import networkx as nx
import numpy as np

client = Wit('LKKJIM2L7TQ6JJJCUBGDUSQGAI5SZB7N')
THRESHOLD = 0.53
WORD2VEC_THRESHOLD = 0.50
NO_OF_MOST_FREQUENT_WORDS = 100000

model = KeyedVectors.load_word2vec_format(
    'lang_models/GoogleNews-vectors-negative300.bin.gz', binary=True, limit=NO_OF_MOST_FREQUENT_WORDS)

nlp = spacy.load('en_core_web_sm')


def find_links(charts, sentence, sentence_offset, block_key):
    links = []
    # word or phrase links
    for chart in charts:
        features = chart.get('properties').get('features')
        for feature in features:
            result = fuzzy_substr_search(feature['value'], sentence)
            result_w2v = compute_word2vec_similarity(
                feature['value'], sentence)
            # don't match strings that are single character long
            if result.get('similarity') > THRESHOLD and len(result.get('matching_str')) > 1:
                link = create_link(result.get(
                    'matching_str'), feature, chart.get('id'), feature.get('value'), result.get('offset'), sentence, sentence_offset, block_key, range_link_props=[])
                links.append(link)
            if result.get('similarity') < THRESHOLD and result_w2v != "":
                if result_w2v.get('similarity') > THRESHOLD and len(result_w2v.get('matching_str')) > 1:
                    link = create_link(result_w2v.get(
                        'matching_str'), feature, chart.get('id'), feature.get('value'), result_w2v.get('offset'), sentence, sentence_offset, block_key, range_link_props=[])
                    links.append(link)

    # range links
    for chart in charts:
        matched_axes = []
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
                axis['match_props'] = result
                matched_axes.append(axis)
        interval_matches = get_intervals(sentence)
        print('interval matches', interval_matches)
        # TODO: Handle this in a better way
        # Only uncomment (the following *67-70* lines) for quantitative eval
        for interval in interval_matches:
            interval_link = create_link(interval.get('text'), axis, chart.get('id'), axis.get(
                'field'), interval.get('offset'), sentence, sentence_offset, block_key, range_link_props=[])
            links.append(interval_link)
        interval_links = combine_axis_interval(
            sentence, matched_axes, interval_matches)
        for link in interval_links:
            interval_props = [{'min_val': link.get('min')}, {
                'max_val': link.get('max')}]
            range_link = create_link(link.get('text'), axis, chart.get('id'), axis.get(
                'field'), link.get('offset'), sentence, sentence_offset, block_key, range_link_props=interval_props)
            links.append(range_link)
    return links


def combine_axis_interval(sentence, matched_axes, interval_matches):
    # one axis can appear multiple times
    if len(interval_matches) < 1:
        return []
    all_matched_axes_instances = []
    for axis in matched_axes:
        axis_instances = [m.start()
                          for m in re.finditer(axis.get('match_props').get('matching_str'), sentence)]
        for instance in axis_instances:
            new_axis = axis.copy()
            updated_match_props = new_axis.get('match_props').copy()
            updated_match_props['offset'] = instance
            new_axis['match_props'] = updated_match_props
            all_matched_axes_instances.append(new_axis)

    links = []
    distance_matrix = []
    for axis in all_matched_axes_instances:
        distances = []
        print('Axis', axis.get('match_props').get(
            'matching_str'))
        for interval in interval_matches:
            # Sometimes range is defined with a hypen
            # TODO See if we can combine two tokens (words) for computing shortest distance
            # at the moment, first token of the interval is used.
            term = re.split(' |-', interval.get('text'))[0]
            dist = compute_shortest_path(
                sentence, axis.get('match_props'), term)
            distances.append(dist)
        distance_matrix.append(distances)
        # TODO how to handle if distances are equal?
        # min_index = distances.index(min(distances))
        # interval_end_offset = interval_matches[min_index].get(
        #     'offset') + len(interval_matches[min_index].get('text'))
        # axis_offset = axis.get('match_props').get('offset')
        # link_text = sentence[min(axis_offset, interval_end_offset): max(
        #     axis_offset, interval_end_offset)]
        # link = interval_matches[min_index]
        # link['text'] = link_text
        # link['offset'] = sentence.find(link_text)
        # links.append(link)
        # don't allow axis <-> many intervals linking!
        # del interval_matches[min_index]
    distance_matrix = np.array(distance_matrix)
    print('Distance Matrix', distance_matrix)
    # Case: 1 range, many axes
    if len(distance_matrix) > 1 and len(distance_matrix[0]) == 1:
        print('Edge Case 1', all_matched_axes_instances, interval_matches)
        result = np.argwhere(distance_matrix == np.min(distance_matrix))[0]
        print('min position', result)
        print(
            'min pos', all_matched_axes_instances[result[0]], interval_matches[result[1]])
        # winner_axis =
        # for distances in distance_matrix:
        #     print('row', distances)
        #     print('row min', min(distances))
    return links


def compute_shortest_path(sentence, phrase_a, phrase_b):
    # Copied from https://stackoverflow.com/questions/32835291/how-to-find-the-shortest-dependency-path-between-two-words-in-python
    document = nlp(sentence)
    # print('document: {0}'.format(document))
    # Load spacy's dependency tree into a networkx graph
    edges = []
    for token in document:
        # FYI https://spacy.io/docs/api/token
        for child in token.children:
            edges.append(('{0}-{1}'.format(token.lower_, token.i),
                          '{0}-{1}'.format(child.lower_, child.i)))
    graph = nx.Graph(edges)
    # convert both phrases in node format
    phrase_a_offset = phrase_a.get('offset')
    phrase_a = phrase_a.get('matching_str')
    for a, b in edges:
        if a.find(phrase_a) > -1 and sentence[phrase_a_offset: len(sentence)].find(a.split('-')[0]) > -1:
            phrase_a = a
        if b.find(phrase_a) > -1 and sentence[phrase_a_offset: len(sentence)].find(b.split('-')[0]) > -1:
            print('Offset of b/off', b,
                  sentence.find(b.split('-')[0]), phrase_a_offset)
            phrase_a = b
        if a.find(phrase_b) > -1:
            phrase_b = a
        if b.find(phrase_b) > -1:
            phrase_b = b
    print('a/b', a, b)
    # https://networkx.github.io/documentation/networkx-1.10/reference/algorithms.shortest_paths.html
    dist = nx.shortest_path_length(graph, source=phrase_a, target=phrase_b)
    return dist


def fuzzy_substr_search(needle, hay):
    if needle == None or isinstance(needle, list):
        return {"similarity": 0, "matching_str": '', "offset": 0}
    hay = hay.lower()
    needle = needle.lower()
    if hay.find(needle) > -1:
        offset = hay.find(needle)
        matching_str = hay[offset: offset+len(needle)]
        return {"similarity": 1, "matching_str": matching_str, "offset": offset}
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


# TODO: refactor this function to match createLinks() in \util
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


def get_intervals(sentence):
    interval_matches = []
    matcher = Matcher(nlp.vocab)
    pattern = [[{'POS': 'NUM'},
                {'DEP': 'prep'},
                {'POS': 'NUM'}],
               [{'POS': 'NUM'},
                {'POS': 'CCONJ'},
                {'POS': 'NUM'}],
               [{'POS': 'NUM'},
                {'IS_PUNCT': True},
                {'POS': 'NUM'}],
               [{'ORTH': 'more'},
                {'ORTH': 'than'},
                {'POS': 'NUM'}],
               [{'ORTH': 'less'},
                {'ORTH': 'than'},
                {'POS': 'NUM'}]]
    matcher.add("Interval", pattern)
    doc = nlp(sentence)
    matches = matcher(doc)
    for match_id, start, end in matches:
        # string_id = nlp.vocab.strings[match_id]  # Get string representation
        span = doc[start:end]  # The matched span
        # print(match_id, string_id, start, end, span.text)
        offset = sentence.find(span.text)
        extent = get_interval_extent(span.text)
        interval = {'text': span.text, 'offset': offset,
                    'min': extent[0], 'max': extent[1]}
        interval_matches.append(interval)
    return interval_matches


def get_interval_extent(interval):
    numbers = []
    matcher = Matcher(nlp.vocab)
    pattern = [[{'POS': 'NUM'}]]
    matcher.add("Number", pattern)
    doc = nlp(interval)
    matches = matcher(doc)
    for match_id, start, end in matches:
        string_id = nlp.vocab.strings[match_id]  # Get string representation
        span = doc[start: end]  # The matched span
        # print(match_id, string_id, start, end, span.text)
        numbers.append(float(span.text))
    # TODO handle other cases with 1 value
    if len(numbers) == 1:
        if interval.find('more') > -1:
            return [min(numbers), sys.float_info.max]
        if interval.find('less') > -1:
            return [- sys.float_info.max, max(numbers)]
    if len(numbers) == 2:
        return [min(numbers), max(numbers)]
    return [0, 0]
