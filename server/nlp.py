from nltk.util import ngrams
from difflib import SequenceMatcher as SM
import sys
from gensim.models import KeyedVectors
import spacy
from spacy.matcher import Matcher
from spacy.matcher import PhraseMatcher
import re
import networkx as nx
import numpy as np
import datetime

# THRESHOLD = 0.7
# WORD2VEC_THRESHOLD = 0.7
NO_OF_MOST_FREQUENT_WORDS = 100000

model = KeyedVectors.load_word2vec_format(
    'lang_models/GoogleNews-vectors-negative300.bin.gz', binary=True, limit=NO_OF_MOST_FREQUENT_WORDS)

nlp = spacy.load('en_core_web_sm')


def find_links(charts, sentence, sentence_offset, block_key, THRESHOLD):
    links = []
    # word or phrase links
    for chart in charts:
        features = chart.get('properties').get('features')
        for feature in features:
            result = fuzzy_substr_search(feature['value'], sentence)
            result_w2v = compute_word2vec_similarity(
                feature['value'], sentence, THRESHOLD)
            # don't match strings that are single character long
            if result.get('similarity') > THRESHOLD and len(result.get('matching_str')) > 1:
                link_text = sentence[result.get('offset'): result.get(
                    'offset') + len(result.get('matching_str'))]
                link = create_link(link_text, feature, chart.get('id'), [feature.get(
                    'value')], result.get('offset'), sentence, sentence_offset, block_key, [], [])
                links.append(link)
            if result.get('similarity') < THRESHOLD and result_w2v != "":
                if result_w2v.get('similarity') > THRESHOLD and len(result_w2v.get('matching_str')) > 1:
                    link_text = sentence[result_w2v.get('offset'): result.get(
                        'offset') + len(result_w2v.get('matching_str'))]
                    link = create_link(link_text, feature, chart.get('id'), [feature.get(
                        'value')], result_w2v.get('offset'), sentence, sentence_offset, block_key, [], [])
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
            result = fuzzy_substr_search(axis.get('title'), sentence)
            result_w2v = compute_word2vec_similarity(
                axis.get('title'), sentence, THRESHOLD)
            if result.get('similarity') < THRESHOLD and result_w2v != "":
                result = result_w2v
            if result.get('similarity') > THRESHOLD:
                result['field'] = axis.get('title')
                result['type'] = axis.get('type')
                axis['match_props'] = result
                matched_axes.append(axis)
        interval_matches = get_intervals(sentence)
        # TODO: Handle this in a better way
        # Only uncomment (the following *67-70* lines) for quantitative eval
        for interval in interval_matches:
            interval_link = create_link(interval.get('text'), axis, chart.get('id'), axis.get(
                'field'), interval.get('offset'), sentence, sentence_offset, block_key, [], [])
            links.append(interval_link)
        interval_links = combine_axis_interval(
            sentence, matched_axes, interval_matches)
        for link in interval_links:
            range = [link.get('min'), link.get('max')]
            if link.get('type') == 'time' or link.get('type') == 'temporal':
                # Getting time in milliseconds since 1970-1-1: Equivalent of JavaScript date.getTime()
                minTime = (datetime.datetime(int(link.get('min')), 1,
                                             1) - datetime.datetime(1970, 1, 1)).total_seconds()
                maxTime = (datetime.datetime(int(link.get('max')), 1,
                                             1) - datetime.datetime(1970, 1, 1)).total_seconds()
                range = [minTime*1000, maxTime*1000]
            range_link = create_link(link.get('text'), "", chart.get('id'), [], link.get(
                'offset'), sentence, sentence_offset, block_key, [link.get('rangeField')], range)
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
        instance_id = 0
        for instance in axis_instances:
            new_axis = axis.copy()
            updated_match_props = new_axis.get('match_props').copy()
            updated_match_props['offset'] = instance
            updated_match_props['instance_id'] = instance_id
            new_axis['match_props'] = updated_match_props
            all_matched_axes_instances.append(new_axis)
            instance_id += 1

    links = []
    distance_matrix = []
    for axis in all_matched_axes_instances:
        distances = []
        for interval in interval_matches:
            # Sometimes range is defined with a hypen
            # TODO: See if we can combine two tokens (words) for computing shortest distance
            # at the moment, first token of the interval is used.
            term = re.split(' |-', interval.get('text'))[0]
            dist = compute_shortest_path(
                sentence, axis.get('match_props'), term)
            distances.append(dist)
        distance_matrix.append(distances)
        # TODO: how to handle if distances are equal?
    distance_matrix = np.array(distance_matrix)
    # Case: 1 axis, 1 interval
    if len(distance_matrix) == 1 and len(distance_matrix[0]) == 1:
        link = merge_axis_interval(
            sentence, all_matched_axes_instances[0], interval_matches[0])
        links.append(link)

    # Case: 1 interval, many axes
    if len(distance_matrix) > 1 and len(distance_matrix[0]) == 1:
        min_pos = np.argwhere(distance_matrix == np.min(distance_matrix))[0]
        winner_axis = all_matched_axes_instances[min_pos[0]]
        winner_interval = interval_matches[min_pos[1]]
        link = merge_axis_interval(sentence, winner_axis, winner_interval)
        links.append(link)

    # Case: many intervals, many axes
    if len(distance_matrix) >= 1 and len(distance_matrix[0]) > 1:
        for index, axis in enumerate(all_matched_axes_instances):
            min_index = np.argmin(distance_matrix[index])
            link = merge_axis_interval(
                sentence, axis, interval_matches[min_index])
            links.append(link)
            # Delete interval that is already assigned
            del interval_matches[min_index]
            distance_matrix = np.delete(distance_matrix, min_index, axis=1)
    return links


def merge_axis_interval(sentence, axis, interval):
    interval_offset = interval.get('offset')
    axis_offset = axis.get('match_props').get('offset')
    length = len(axis.get('match_props').get('matching_str')) if axis_offset > interval_offset else len(
        interval.get('text'))
    link_text = sentence[min(axis_offset, interval_offset): max(
        axis_offset, interval_offset) + length]
    link = interval
    link['text'] = link_text
    # To store if a variable is temporal or not!
    link['type'] = axis.get('match_props').get('type')
    link['offset'] = sentence.find(link_text)
    link['rangeField'] = axis.get('match_props').get('field')
    return link


def compute_shortest_path(sentence, axis_phrase_obj, interval_phrase):
    # Source: https://stackoverflow.com/questions/32835291/how-to-find-the-shortest-dependency-path-between-two-words-in-python
    document = nlp(sentence)
    # Load spacy's dependency tree into a networkx graph
    edges = []
    for token in document:
        # FYI https://spacy.io/docs/api/token
        for child in token.children:
            edges.append(('{0}-{1}'.format(token.lower_, token.i),
                          '{0}-{1}'.format(child.lower_, child.i)))
    graph = nx.Graph(edges)
    # convert both phrases in node format
    axis_phrase = axis_phrase_obj.get('matching_str')
    axis_phrase_instances = []
    for a, b in edges:
        if a.find(axis_phrase) > -1:
            axis_phrase_instances.append(a)
        if b.find(axis_phrase) > -1:
            axis_phrase_instances.append(b)
        if a.find(interval_phrase) > -1:
            interval_phrase = a
        if b.find(interval_phrase) > -1:
            interval_phrase = b
    # https://networkx.github.io/documentation/networkx-1.10/reference/algorithms.shortest_paths.html
    distances = []
    unique_instances = np.unique(np.array(axis_phrase_instances))
    # axis_phrase_instances = list(set(axis_phrase_instances))
    for instance in unique_instances:
        try:
            dist = nx.shortest_path_length(
                graph, source=instance, target=interval_phrase)
            distances.append(dist)
        except:
            distances.append(100000)
    return distances[axis_phrase_obj.get('instance_id')]


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


def create_link(link_text, feature, chartId, val, offset, sentence, sentence_offset, block_key, rangeField, range):
    link = {
        "text": link_text,
        "feature": feature,
        "chartId": chartId,
        "active": False,
        "type": "point",
        "data": val,
        "startIndex": sentence_offset + offset,
        "endIndex": sentence_offset + offset + len(link_text),
        "sentence": sentence,
        "isConfirmed": False,
        "blockKey": block_key,
        "rangeField": rangeField,
        "range": range
    }
    return link


def compute_word2vec_similarity(word, sentence, THRESHOLD):
    match_in_sentence = ''
    # corpus expects spaces to be replaced with '_'
    if(word is None):
        return match_in_sentence
    word = "_".join(word.split())
    try:
        similar_words = model.most_similar(word)
        similar_words = [sm[0]
                         for sm in similar_words if sm[1] > THRESHOLD]
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
                {'POS': 'NUM'}],
               [{'POS': 'NUM'},
                {'POS': 'CCONJ'},
                {'POS': 'SYM'},
                {'POS': 'NUM'}]]
    matcher.add("Interval", pattern)
    doc = nlp(sentence.lower())
    matches = matcher(doc)
    for match_id, start, end in matches:
        # string_id = nlp.vocab.strings[match_id]  # Get string representation
        span = doc[start:end]  # The matched span
        offset = sentence.find(span.text)
        # TODO: See if we can convert numbers to numerals e.g., ten to 10.
        # spacy recognizes ten as a number.
        try:
            extent = get_interval_extent(span.text)
            interval = {'text': span.text, 'offset': offset,
                        'min': extent[0], 'max': extent[1]}
        except ValueError:
            interval = {'text': span.text, 'offset': offset,
                        'min': 0, 'max': 0}
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
