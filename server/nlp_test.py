import json
import pandas as pd
from nlp import *
import math
import spacy
import codecs
import sys
import datetime
import time
from get_sim import *
import fasttext

# loging outputs
# old_stdout = sys.stdout
# log_file = codecs.open("Output.log", "w", "utf-8")
# sys.stdout = log_file

nlp = spacy.load("en_core_web_md")


def main():
    # Testing functions
    sentence = "Most movies (shown as the Count of Records in the chart) have a Rotten Tomatoes rating between 60 and 100 and an IMDB rating between 6 and 8."
    term = "IMDB Rating"
    r = term_matching(model, term, sentence)  # gets Obama right
    print(r)
    return
    # test_interval_extraction()
    # r1 = word2vec_matching(term, sentence)
    # r2 = keyword_matching(term, sentence)
    print('-----Begin Testing NLP Module------')
    f = codecs.open("logs.txt", "w", "utf-8")
    f.write('Ngram Size / Threshold / Accuracy / Precision / Recall / F1 \n')
    for ngram_size in range(4, 7, 4):
        for threshold in range(6, 11, 5):
            # accurate, false_positives, missed
            overall_performance = [0, 0, 0]
            df = pd.read_excel('training_data/Training Dataset.xlsx')
            for index, row in df.iterrows():
                if(index > 91):
                    continue
                sentence = row['Sentence']
                chart_id = int(row['Chart ID'])
                print('Processing Item # ', index, 'Chart ID # ',
                      chart_id, 'Threshold', threshold/10, 'Sentence: ', sentence[0:40])
                try:
                    with open('training_data/features/' + str(chart_id) + '.json', 'r') as chart_feature_json:
                        chart_features = json.load(chart_feature_json)
                        # nlp methods accept array of charts
                        chart_properties = [{'properties': chart_features}]
                        # sentence_offset and block_key are only relevant for creating links in Draft.js!
                        links = find_links(chart_properties, sentence,
                                           0, 'block_key', threshold*0.1, ngram_size)
                        matches = get_matches(links)
                        print('matches', matches)
                        true_matches = get_true_matches(
                            row['Match Point Phrase'], row['Matched Interval Phrase'], row['Matched Group Phrase'])
                        print('true matches', true_matches)
                        performance = compute_performance(
                            matches, true_matches)
                        # print('Row/TP/FP/FN/Total-True-References', index,
                        #   performance[0], performance[1], performance[2], len(true_matches), sep='\t')
                        overall_performance = [a + b for a,
                                               b in zip(overall_performance, performance)]
                except Exception as e:
                    # print(e)
                    continue
            tp = overall_performance[0]
            fp = overall_performance[1]
            fn = overall_performance[2]
            accuracy = round(tp/(tp+fp+fn)*100, 2)
            precision = round(tp/(tp+fp)*100, 2)
            recall = round(tp/(tp + fn)*100, 2)
            f1 = round(tp / (tp+0.5*(fp+fn))*100, 2)
            print('Ngram Size/Threshold/Accuracy/Precision/Recall/F1', ngram_size,
                  threshold/10, accuracy, precision, recall, f1, sep='\t')
            f.write(str(ngram_size) + '\t' + str(threshold/10) + '\t' + str(accuracy) + '\t' +
                    str(precision) + '\t' + str(recall) + '\t' + str(f1) + '\n')
    f.close()
    print('-----End Testing NLP Module------')

    # sys.stdout = old_stdout
    # log_file.close()


def test_interval_extraction():
    count = 0
    df = pd.read_excel('training_data/Interval Dataset.xlsx')
    f = codecs.open("missed_intervals.txt", "w", "utf-8")
    for index, row in df.iterrows():
        sentence = row['Individual Sentences']
        intervals = get_intervals(sentence)
        if len(intervals) > 0:
            count += 1
            print('Success Count:', count, "/ 116")
            print('sentence:', sentence[0:80])
            print('Interval Matches:', intervals)
        else:
            f.write(str(index+2) + '\t' + sentence + '\t \n')
    f.close()


def get_matches(links):
    matches = []
    for link in links:
        matches.append(link.get('text'))
    return matches


def get_true_matches(point_matches, interval_matches, group_matches):
    matches = [point_matches, interval_matches, group_matches]
    true_matches = []
    for match in matches:
        if(isinstance(match, str) and match != 'None'):
            true_matches = true_matches + \
                re.split('; |;', match)  # match.split('; ')
    true_matches = [match.replace(' (numeric)', '')
                    for match in true_matches if match != '']
    return true_matches


def compute_performance(matches, true_matches):
    true_positive = 0
    false_positive = 0
    false_negative = 0
    for match in matches:
        not_found = True
        for true_match in true_matches:
            if(is_match(match, true_match)):
                true_positive += 1
                not_found = False
                break
        if(not_found):
            false_positive += 1

    for true_match in true_matches:
        not_found = False
        for match in matches:
            if(not is_match(match, true_match)):
                not_found = True
        if(not_found):
            false_negative += 1
    return [true_positive, false_positive, false_negative]


def is_match(a, b):
    return a.lower() == b.lower()


if __name__ == "__main__":
    main()
