import FuzzySet from "fuzzyset.js";
import nlp from "compromise";

export default (charts, sentence) => {
    let links = [];
    charts.forEach(function (chart) {
        links = links.concat(findWordLink(chart, sentence).filter((link) => link !== null));
    });
    return links;
};

export const findWordLink = (chart, sentence) => {
    let matches = [];
    const MIN_MATCH_THRESHOLD = 0.8;
    chart.features.forEach(function (f) {
        const fs_res = fuzzyMatch(sentence.text, f.value);
        console.log("FUZZY MATCH", fs_res[0]);
        // if (f.type === "string" && sentence.text.includes(f.value)) {
        if (f.type === "string" && fs_res[0] > MIN_MATCH_THRESHOLD) {
            console.log("Feature", f.value);
            matches.push({ userTyped: fs_res[1], matchedFeature: f });
        }
    });
    let links = [];
    if (matches.length > 0)
        matches.forEach(function (m) {
            const linkStartIndex = sentence.startIndex + sentence.text.indexOf(m.userTyped);
            const linkEndIndex = linkStartIndex + m.userTyped.length;
            const link = {
                text: m.userTyped,
                feature: m.matchedFeature, //information about how the link was found
                chartId: chart.id,
                active: false,
                type: "point", //TODO: range selection
                data: [m.matchedFeature.value],
                startIndex: linkStartIndex,
                endIndex: linkEndIndex,
                sentence: sentence.text,
            };
            links.push(link);
        });
    return links;
};
function fuzzyMatch(sentence, word) {
    let list =
        word.split(" ").length == 1
            ? sentence.split(" ")
            : splitIntoNWordsList(sentence, word.split(" ").length);
    let fs = FuzzySet(list);
    console.log("FUZZY LIST", list);
    return fs.get(word) !== null ? fs.get(word)[0] : [0, ""];
}
function splitIntoNWordsList(sentence, n) {
    let words = sentence.split(" ");
    let blocks = [];
    if (words.length > n) {
        for (let i = n - 1; i < words.length; i++) {
            let block = "";
            for (let j = n - 1; j >= 0; j--) {
                block += j === 0 ? words[i - j] : words[i - j] + " ";
            }
            blocks.push(block);
        }
    } else blocks = words;
    console.log(blocks);
    return blocks;
}
