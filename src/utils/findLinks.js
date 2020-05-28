import FuzzySet from "fuzzyset.js";
import splitTextIntoNWordsList from "./splitTextIntoNWordsList";
import { Wit } from "node-wit";
import { isArray } from "vega";
import parseWitResponse from "./parseWitResponse";

const MIN_MATCH_THRESHOLD = 0.8;
const client = new Wit({
    accessToken: "FFJCMCE6JAQ3CT52WH5YBFED5TKENKTI",
    logger: new log.Logger(log.DEBUG), // optional
});

export default async (charts, sentence) => {
    let links = [];
    //forEach loop doesn't work with async-await!
    for (const chart of charts) {
        links = links.concat(findWordLink(chart, sentence).filter((link) => link !== null));
        const link = await findPhraseLink(chart, sentence);
        if (link !== null) links.push(link);
    }
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
    if (typeof word === "string") {
        let list =
            word.split(" ").length === 1
                ? sentence.split(" ")
                : splitTextIntoNWordsList(sentence, word.split(" ").length);
        let fs = FuzzySet(list);
        return fs.get(word) !== null ? fs.get(word).shift() : [0, ""];
    } else return [0, ""];
}

export async function findPhraseLink(chart, sentence) {
    let match = null;
    let link = null;
    chart.properties.axes.forEach(function (a) {
        const fsResult = fuzzyMatch(sentence.text, a.title); //returns a [score, word] pair!
        // TODO: Later check only if the f.type is a number!
        if (fsResult[0] > MIN_MATCH_THRESHOLD) {
            match = { userTyped: fsResult[1], matchedFeature: a };
        }
    });
    //only send request to Wit.ai when we have a potential match!
    if (match !== null) {
        const response = await client.message(sentence.text, {});
        const parsedResponse = parseWitResponse(response);
        if (parsedResponse !== null) {
            //TODO: Also see if we can check if Wit.ai can also give us numbers described
            // as words (e.g., fifty, thirty four, etc.)
            switch (parsedResponse.intent) {
                case "range_selection":
                    const linkStartIndex = sentence.text.indexOf(match.userTyped);
                    const linkEndIndex =
                        parsedResponse.max !== Infinity
                            ? sentence.text.indexOf(parsedResponse.max) !== -1
                                ? sentence.text.indexOf(parsedResponse.max) +
                                  parsedResponse.max.toString().length
                                : sentence.text.length - 1
                            : parsedResponse.min !== -Infinity
                            ? sentence.text.indexOf(parsedResponse.min) !== -1
                                ? sentence.text.indexOf(parsedResponse.min) +
                                  parsedResponse.min.toString().length
                                : sentence.text.length - 1
                            : sentence.text.length - 1;
                    const linkPhrase = sentence.text.substring(linkStartIndex, linkEndIndex);
                    link = {
                        text: linkPhrase,
                        feature: match.matchedFeature, //information about how the link was found
                        chartId: chart.id,
                        active: false,
                        type: parsedResponse.intent,
                        data: isArray(match.matchedFeature.field)
                            ? match.matchedFeature.field
                            : [match.matchedFeature.field],
                        startIndex: sentence.startIndex + linkStartIndex,
                        endIndex: sentence.startIndex + linkEndIndex,

                        sentence: sentence.text,
                        rangeMin: parsedResponse.min,
                        rangeMax: parsedResponse.max,
                    };
                    break;
            }
            console.log("Phrase Link out", link);
            return link;
        }
    }
}
