// import FuzzySet from "fuzzyset.js";
import nlp from "compromise";

export default (charts, word, type) => {
  switch (type) {
    case "WORD":
      return charts
        .map((chart) => findWordLink(chart, word))
        .filter((link) => link !== null);
      break;
    case "SENTENCE":
      return charts
        .map((chart) => findPhraseLink(chart, word))
        .filter((link) => link !== null);
  }
};
// const MIN_MATCH_THRESHOLD = 0.7;

export const findWordLink = (chart, word) => {
  // keyword matching
  // Maybe I am wrong but this Fuzzyset thing really gets in the way
  // TODO: Can we make it more implicit rather than autocorrect ?
  // const fs = FuzzySet(chart.features);
  // console.log(chart.features, text,fs);
  // let word = fs.get(text, '', MIN_MATCH_THRESHOLD);
  // console.log(word);
  // word = word.length>0? word[0][1]: text;
  const match = chart.features.find((d) => {
    if (d.type === "string") {
      return d.value === word.text;
    }
    return false;
  });

  return match
    ? {
        text: word.text,
        feature: match, //information about how the link was found
        chartId: chart.id,
        active: false,
        type: "point", //TODO: range selection
        data: [word.text],
        startOffset: word.startOffset,
        endOffset: word.endOffset,
        fullText: word.text,
      }
    : null;
};
function findPhraseLink(chart, sentence) {
  let terms = [];
  let wordLinks = [];
  const fullText = sentence.text;
  nlp(sentence.text)
    .json()[0]
    .terms.map((t) => {
      terms.push(t.text);
    });
  terms.map(function (t, i) {
    chart.features.find((d) => {
      if (d.type === "string" && d.value === t) {
        //For now: assuming that every word in list refers to same chart feature field!
        wordLinks.push(t);
      }
    });
  });
  const match = chart.features.find((d) => {
    if (d.type === "string") {
      return d.value === wordLinks[0];
    }
    return false;
  });
  let start = sentence.text.indexOf(wordLinks[0]);
  let end =
    sentence.text.indexOf(wordLinks[wordLinks.length - 1]) +
    wordLinks[wordLinks.length - 1].length;
  let text = sentence.text.slice(start, end);
  let link = {
    text,
    feature: match, //information about how the link was found
    chartId: chart.id,
    active: false,
    type: "group", //TODO: range selection
    data: wordLinks,
    startOffset: start + sentence.startOffset,
    endOffset: end + sentence.startOffset,
    fullText: fullText,
  };
  return match ? link : null;
}
