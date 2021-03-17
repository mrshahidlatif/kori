import json
import pandas as pd
from nlp import *
import math
import spacy

THRESHOLD = 0.6
nlp = spacy.load("en_core_web_md")


def main():
    print('-----Begin Testing NLP Module------')
    overall_performance = [0, 0, 0]  # accurate, false_positives, missed
    df = pd.read_excel('training_data/Training Dataset.xlsx')
    for index, row in df.iterrows():
        if(index != 7):
            continue
        sentence = row['Sentence']
        chart_id = int(row['Chart ID'])
        print('Processing Item # ', index, 'Chart ID # ',
              chart_id, 'Sentence: ', sentence[0:80])
        with open('training_data/features/' + str(chart_id) + '.json', 'r') as chart_feature_json:
            chart_features = json.load(chart_feature_json)
            # nlp methods accept array of charts
            chart_properties = [{'properties': chart_features}]
            # sentence_offset and block_key are only relevant for creating links in Draft.js!
            links = find_links(chart_properties, sentence, 0, 'block_key')
            matches = get_matches(links)
            print('matches', matches)
            true_matches = get_true_matches(
                row['Match Point Phrase'], row['Matched Range Phrase'], row['Matched Aggregated Phrase'])
            performance = compute_performance(matches, true_matches)
            print('Accurate/False Positives/Missed Instances', performance)
            print('---')
            overall_performance = [a + b for a,
                                   b in zip(overall_performance, performance)]
    print('Overall Performance Summary')
    print('Accurate/False Positives/Missed Instances', overall_performance)
    tp = overall_performance[0]
    fp = overall_performance[1]
    fn = overall_performance[2]
    print('Accuracy:', round(tp/(tp+fp+fn)*100, 2))
    print('Precision:', round(tp/(tp+fp)*100, 2))
    print('Recall:', round(tp/(tp + fn)*100, 2))

    print('-----End Testing NLP Module------')
    # test_interval_extraction()
    print(fuzzy_substr_search('miles_per_gallon', 'There seems to be a negative correlation between horsepower and miles per gallon with more European cars lying around in the range of 20-35 miles per gallon as seen in the middle of the chart.'))


def test_interval_extraction():
    count = 0
    df = pd.read_excel('training_data/Interval Dataset.xlsx')
    for index, row in df.iterrows():
        sentence = row['Individual Sentences']
        intervals = get_intervals(sentence)
        if len(intervals) > 0:
            count += 1
            print('Success Count:', count, "/ 116")
            print('sentence:', sentence[0:80])
            print('Interval Matches:', intervals)


def get_matches(links):
    matches = []
    for link in links:
        matches.append(link.get('text'))
    return matches


def get_true_matches(point_matches, interval_matches, group_matches):
    matches = [point_matches, interval_matches, group_matches]
    true_matches = []
    for match in matches:
        if(isinstance(match, str)):
            true_matches = true_matches + match.split('; ')
    true_matches = [match for match in true_matches if match != '']
    return true_matches


def compute_performance(matches, true_matches):
    true_positive = 0
    false_positive = 0
    false_negative = 0
    for match in matches:
        not_found = True
        for true_match in true_matches:
            if(is_partial_match(match, true_match)):
                true_positive += 1
                not_found = False
                break
        if(not_found):
            false_positive += 1

    for true_match in true_matches:
        not_found = False
        for match in matches:
            if(not is_partial_match(match, true_match)):
                not_found = True
        if(not_found):
            false_negative += 1
    return [true_positive, false_positive, false_negative]


def is_partial_match(a, b):
    doc1 = nlp(a)
    doc2 = nlp(b)
    similarity = doc1.similarity(doc2)
    return similarity > THRESHOLD


if __name__ == "__main__":
    main()
