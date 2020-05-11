import FuzzySet from "fuzzyset.js";
import splitTextIntoNWordsList from "./splitTextIntoNWordsList";
import { Wit, log } from "node-wit";

const MIN_MATCH_THRESHOLD = 0.8;
const client = new Wit({
    accessToken: "FFJCMCE6JAQ3CT52WH5YBFED5TKENKTI",
    logger: new log.Logger(log.DEBUG), // optional
});

export default (charts, sentence) => {
    let links = [];
    charts.forEach(function (chart) {
        links = links.concat(findWordLink(chart, sentence).filter((link) => link !== null));
        findPhraseLink(chart, sentence);
    });
    return links;
};

export const findWordLink = (chart, sentence) => {
    let matches = [];
    chart.properties.features.forEach(function (f) {
        const fsResult = fuzzyMatch(sentence.text, f.value); //returns a [score, word] pair!
        // console.log("FUZZY MATCH", fs_res);
        // if (f.type === "string" && sentence.text.includes(f.value)) {
        if (f.type === "string" && fsResult[0] > MIN_MATCH_THRESHOLD) {
            matches.push({ userTyped: fsResult[1], matchedFeature: f });
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
    console.log("WORD TYPE OF", word, typeof word);
    if (typeof word === "string") {
        let list =
            word.split(" ").length == 1
                ? sentence.split(" ")
                : splitTextIntoNWordsList(sentence, word.split(" ").length);
        let fs = FuzzySet(list);
        return fs.get(word) !== null ? fs.get(word).shift() : [0, ""];
    } else return [0, ""];
}

function findPhraseLink(chart, sentence) {
    let match = null;
    chart.properties.features.forEach(function (f) {
        const fsResult = fuzzyMatch(sentence.text, f.field); //returns a [score, word] pair!
        console.log("FUZZY MATCH", fsResult);
        // TODO: Later check only if the f.type is a number!
        if (f.type === "string" && fsResult[0] > MIN_MATCH_THRESHOLD) {
            match = { userTyped: fsResult[1], matchedFeature: f };
        }
    });
    //only send request to Wit.ai when we have a potential match!
    if (match !== null) {
        client
            .message(sentence.text, {})
            .then((response) => {
                console.log("RESPONSE", response);
                const entities = parseResponse(response);

                const link = {
                    text: match.userTyped,
                    feature: match.matchedFeature, //information about how the link was found
                    chartId: chart.id,
                    active: false,
                    type: entities.intent,
                    data: [match.matchedFeature.field],
                    startIndex: sentence.startIndex,
                    endIndex: sentence.endIndex,
                    sentence: sentence.text,
                };
                console.log("Created LINK", link);
            })
            .catch(console.error);
    }
}
function parseResponse(response) {
    let entities = null;
    if (response.entities.hasOwnProperty("range_selection")) {
        if (response.entities.range_selection.shift().confidence > 0.5) {
            const intent = "range_selection";
            const min = response.entities.min_number.shift().value;
            const max = response.entities.number.shift().value;
            entities = { intent: intent, min: min, max: max };
        }
    }
    console.log("Parsed Response", entities);
    return entities;
}
