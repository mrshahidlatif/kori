import FuzzySet from "fuzzyset.js";
import splitTextIntoNWordsList from "./splitTextIntoNWordsList";
import { Wit } from "node-wit";
import { isArray } from "vega";
import parseWitResponse from "./parseWitResponse";
import util from "util";
const request = require("request");

const MIN_MATCH_THRESHOLD = 0.8;
const client = new Wit({
    accessToken: "LKKJIM2L7TQ6JJJCUBGDUSQGAI5SZB7N",
    // logger: new log.Logger(log.DEBUG), // optional
});

export default async (charts, sentence) => {
    let links = [];
    //forEach loop doesn't work with async-await!
    for (const chart of charts) {
        links = links.concat(findWordLink(chart, sentence).filter((link) => link !== null));
        const rangeLink = await findPhraseLink(chart, sentence);
        if (rangeLink != null) links.push(rangeLink);
        links = links.filter((link) => link !== undefined);
        //only call when there is one phrase link!
        if (rangeLink != null && links.length > 1) {
            const joinableLinks = await groupLinks(sentence, links);
            if (joinableLinks.length > 1) {
                const groupLink = createGroupLink(sentence, joinableLinks, links);
                links.push(groupLink);
            }
        }
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
                type: "point",
                data: [
                    isNaN(Number(m.matchedFeature.value))
                        ? m.matchedFeature.value
                        : Number(m.matchedFeature.value),
                ],
                startIndex: linkStartIndex,
                endIndex: linkEndIndex,
                sentence: sentence.text,
                isConfirmed: false,
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
    if (match != null) {
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
                        type: "range",
                        data: isArray(match.matchedFeature.field)
                            ? match.matchedFeature.field
                            : [match.matchedFeature.field],
                        startIndex: sentence.startIndex + linkStartIndex,
                        endIndex: sentence.startIndex + linkEndIndex,

                        sentence: sentence.text,
                        rangeMin: parsedResponse.min,
                        rangeMax: parsedResponse.max,
                        isConfirmed: false,
                    };
                    break;
            }
            return link;
        }
    }
}
function findMatchesInChartFeatures(terms, chart) {
    let matches = [];
    for (let i = 0; i < terms.length; i++) {
        chart.properties.features.forEach(function (f) {
            const fsResult = fuzzyMatch(terms[i], f.value); //returns a [score, word] pair!
            if (f.type === "string" && fsResult[0] > MIN_MATCH_THRESHOLD) {
                matches.push({ userTyped: fsResult[1], matchedFeature: f });
            }
        });
    }
    return matches;
}
async function groupLinks(sentence, links) {
    const singleLinks = links.map((l) => l.text);
    const sen = { text: sentence["text"], links: singleLinks };

    const options = {
        uri: "http://localhost:8885/processjson",
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-Charset": "utf-8",
        },
        json: true,
        body: sen,
    };

    const promRequest = util.promisify(request);
    const response = await promRequest(options);
    return response.body.data;
}

function createGroupLink(sentence, data, links) {
    if (sentence == null || links.length < 2 || data == null) return;

    const pointLink = links.find((l) => l.text === data[0] && l.type === "point");
    const rangeLink = links.find((l) => l.text === data[1] && l.type === "range");
    const linkStartIndex = sentence.text.indexOf(pointLink.text);
    const linkEndIndex = rangeLink.endIndex;
    const linkText = sentence.text.substring(linkStartIndex, linkEndIndex);
    console.log("LInks ", pointLink, rangeLink);
    console.log("text", data);
    const glink = {
        text: linkText,
        feature: pointLink.feature, //information about how the link was found
        chartId: pointLink.chartId,
        active: false,
        type: "group",
        data: pointLink.data,
        startIndex: linkStartIndex,
        endIndex: linkEndIndex,
        sentence: sentence.text,
        rangeField: rangeLink.feature.field,
        rangeMin: rangeLink.rangeMin,
        rangeMax: rangeLink.rangeMax,
        isConfirmed: false,
    };
    console.log("Group Link", glink);
    return glink;
}
