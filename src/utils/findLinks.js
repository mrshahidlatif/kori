import FuzzySet from "fuzzyset.js";
import splitTextIntoNWordsList from "./splitTextIntoNWordsList";

const MIN_MATCH_THRESHOLD = 0.8;

export default (charts, sentence) => {
    let links = [];
    charts.forEach(function (chart) {
        links = links.concat(findWordLink(chart, sentence).filter((link) => link !== null));
    });
    return links;
};

export const findWordLink = (chart, sentence) => {
    let matches = [];
    chart.features.forEach(function (f) {
        const fs_res = fuzzyMatch(sentence.text, f.value); //returns a [score, word] pair!
        console.log("FUZZY MATCH", fs_res);
        // if (f.type === "string" && sentence.text.includes(f.value)) {
        if (f.type === "string" && fs_res[0] > MIN_MATCH_THRESHOLD) {
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
            : splitTextIntoNWordsList(sentence, word.split(" ").length);
    let fs = FuzzySet(list);
    return fs.get(word) !== null ? fs.get(word).shift() : [0, ""];
}
