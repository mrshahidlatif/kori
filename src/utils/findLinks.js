import FuzzySet from "fuzzyset.js";
import splitTextIntoNWordsList from "./splitTextIntoNWordsList";
import { Wit, log } from "node-wit";
import { isArray } from "vega";

const MIN_MATCH_THRESHOLD = 0.8;
const client = new Wit({
    accessToken: "FFJCMCE6JAQ3CT52WH5YBFED5TKENKTI",
    // logger: new log.Logger(log.DEBUG), // optional
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
            word.split(" ").length == 1
                ? sentence.split(" ")
                : splitTextIntoNWordsList(sentence, word.split(" ").length);
        let fs = FuzzySet(list);
        return fs.get(word) !== null ? fs.get(word).shift() : [0, ""];
    } else return [0, ""];
}

export async function findPhraseLink(chart, sentence) {
    let match = null;
    chart.properties.axes.forEach(function (a) {
        const fsResult = fuzzyMatch(sentence.text, a.title); //returns a [score, word] pair!
        // TODO: Later check only if the f.type is a number!
        if (fsResult[0] > MIN_MATCH_THRESHOLD) {
            match = { userTyped: fsResult[1], matchedFeature: a };
        }
    });
    //only send request to Wit.ai when we have a potential match!
    if (match !== null) {
        const witResponse = await client.message(sentence.text, {});
        // console.log("WIT Response", witResponse);

        const entities = parseResponse(witResponse);
        if (entities !== null) {
            //TODO: Also see if we can check if Wit.ai can also give us numbers described
            // as words (e.g., fifty, thirty four, etc.)
            const linkStartIndex = sentence.text.indexOf(match.userTyped);
            const linkEndIndex =
                entities.max !== Infinity
                    ? sentence.text.indexOf(entities.max) !== -1
                        ? sentence.text.indexOf(entities.max) + entities.max.toString().length
                        : sentence.text.length - 1
                    : entities.min !== -Infinity
                    ? sentence.text.indexOf(entities.min) !== -1
                        ? sentence.text.indexOf(entities.min) + entities.min.toString().length
                        : sentence.text.length - 1
                    : sentence.text.length - 1;
            const linkPhrase = sentence.text.substring(linkStartIndex, linkEndIndex);
            const link = {
                text: linkPhrase,
                feature: match.matchedFeature, //information about how the link was found
                chartId: chart.id,
                active: false,
                type: entities.intent,
                data: isArray(match.matchedFeature.field)
                    ? match.matchedFeature.field
                    : [match.matchedFeature.field],
                startIndex: sentence.startIndex + linkStartIndex,
                endIndex: sentence.startIndex + linkEndIndex,

                sentence: sentence.text,
                rangeMin: entities.min,
                rangeMax: entities.max,
            };
            // console.log("Phrase Link", link);
            return link;
        }
    }
}
function parseResponse(response) {
    //TODO: This function will be modified depending on the training on Wit.ai service!
    let entities = null;
    if (response.entities.hasOwnProperty("range_selection")) {
        if (response.entities.range_selection[0].confidence > 0.5) {
            const intent = "range_selection";
            const min = response.entities.hasOwnProperty("min_number")
                ? response.entities.min_number[0].value
                : -Infinity;
            const max =
                //TODO: Use a consistent and ONLY ONE entity name for max value in the Wit.ai Training!
                response.entities.hasOwnProperty("number") ||
                response.entities.hasOwnProperty("max")
                    ? response.entities.number !== undefined
                        ? response.entities.number[0].value
                        : response.entities.max[0] !== undefined
                        ? response.entities.max[0].value
                        : 0
                    : Infinity;
            entities = { intent: intent, min: min, max: max };
        }
    }
    // console.log("Parsed Response", entities);
    return entities;
}
