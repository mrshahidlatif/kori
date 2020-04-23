// import FuzzySet from "fuzzyset.js";
import nlp from "compromise";

export default (charts, sentence) => {
    let links = [];
    charts.forEach(function (chart) {
        links = links.concat(findWordLink(chart, sentence).filter((link) => link !== null));
    });
    return links;
};
// const MIN_MATCH_THRESHOLD = 0.7;

export const findWordLink = (chart, sentence) => {
    // keyword matching
    // Maybe I am wrong but this Fuzzyset thing really gets in the way
    // TODO: Can we make it more implicit rather than autocorrect ?
    // const fs = FuzzySet(chart.features);
    // console.log(chart.features, text,fs);
    // let sentence = fs.get(text, '', MIN_MATCH_THRESHOLD);
    // console.log(sentence);
    // sentence = sentence.length>0? sentence[0][1]: text;
    let matches = [];
    chart.features.forEach(function (f) {
        if (f.type === "string" && sentence.text.includes(f.value)) {
            matches.push(f);
        }
    });
    // const match = chart.features.find((d) => {
    //     if (d.type === "string") {
    //         return sentence.text.includes(d.value);
    //     }
    //     return false;
    // });
    // console.log("Chart Features", chart.features);
    console.log("Matched Values", matches);
    let links = [];
    if (matches.length > 0)
        matches.forEach(function (m) {
            let link = {
                text: m.value,
                feature: m, //information about how the link was found
                chartId: chart.id,
                active: false,
                type: "point", //TODO: range selection
                data: [m.value],
                startOffset: sentence.startOffset + sentence.text.indexOf(m.value),
                endOffset: sentence.startOffset + sentence.text.indexOf(m.value) + m.value.length,
                fullText: sentence.text,
            };
            links.push(link);
        });
    console.log("matched link", links);
    return links;
};
// function findPhraseLink(chart, sentence) {
//     let terms = [];
//     let wordLinks = [];
//     const fullText = sentence.text;
//     nlp(sentence.text)
//         .json()[0]
//         .terms.map((t) => {
//             terms.push(t.text);
//         });
//     terms.map(function (t, i) {
//         chart.features.find((d) => {
//             if (d.type === "string" && d.value === t) {
//                 //For now: assuming that every word in list refers to same chart feature field!
//                 wordLinks.push(t);
//             }
//         });
//     });
//     const match = chart.features.find((d) => {
//         if (d.type === "string") {
//             return d.value === wordLinks[0];
//         }
//         return false;
//     });
//     let start = sentence.text.indexOf(wordLinks[0]);
//     let end =
//         sentence.text.indexOf(wordLinks[wordLinks.length - 1]) +
//         wordLinks[wordLinks.length - 1].length;
//     let text = sentence.text.slice(start, end);
//     let link = {
//         text,
//         feature: match, //information about how the link was found
//         chartId: chart.id,
//         active: false,
//         type: "group", //TODO: range selection
//         data: wordLinks,
//         startOffset: start + sentence.startOffset,
//         endOffset: end + sentence.startOffset,
//         fullText: fullText,
//     };
//     return match ? link : null;
// }
