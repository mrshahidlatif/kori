import FuzzySet from "fuzzyset.js";
import splitTextIntoNWordsList from "./splitTextIntoNWordsList";
import { Wit } from "node-wit";
import { isArray } from "vega";
import parseWitResponse from "./parseWitResponse";
import util from "util";
import { link } from "fs";
const request = require("request");

const MIN_MATCH_THRESHOLD = 0.75;
const WIT_CHARACTER_LIMIT = 280;
const client = new Wit({
    accessToken: "LKKJIM2L7TQ6JJJCUBGDUSQGAI5SZB7N",
    // logger: new log.Logger(log.DEBUG), // optional
});

export default async (charts, sentence) => {
    let links = [];
    //forEach loop doesn't work with async-await!
    for (const chart of charts) {
        links = links.concat(
            findWordOrPhraseLinks(chart, sentence).filter((link) => link !== null)
        );
        const rangeLink = await findRangeLinks(chart, sentence);
        if (rangeLink !== null) links.push(rangeLink);
        links = links.filter((link) => link !== undefined);
        //only call when there is one phrase link!
        if (rangeLink !== null && rangeLink !== undefined && links.length > 1) {
            const groupableLinks = await findGroupableLinks(sentence, links);
            if (groupableLinks.length > 1) {
                const groupLink = createGroupLink(sentence, groupableLinks, links);
                links.push(groupLink);
            }
        }
    }

    return links;
};

export const findWordOrPhraseLinks = (chart, sentence) => {
    let matches = [];
    chart.properties.features.forEach(function (f) {
        const fsResult = fuzzyMatch(sentence.text, f.value); //returns a [score, word] pair!
        // if (f.type === "string" && sentence.text.includes(f.value)) {
        if (f.type === "string" && fsResult[0] > MIN_MATCH_THRESHOLD) {
            matches.push({ userTyped: fsResult[1], matchedFeature: f });
        }
    });
    let pointLinks = [];
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
            pointLinks.push(link);
        });
    return pointLinks;
};
function fuzzyMatch(sentence, word) {
    if (typeof word === "string") {
        const wordLength = word.split(/[_-\s]+/).length;
        let list =
            wordLength == 1 ? sentence.split(" ") : splitTextIntoNWordsList(sentence, wordLength);
        let fs = FuzzySet(list);
        return fs.get(word) !== null ? fs.get(word).shift() : [0, ""];
    } else return [0, ""];
}

export async function findRangeLinks(chart, sentence) {
    let match = [];
    let rangeLink = null;
    chart.properties.axes.forEach(function (a) {
        const fsResult = fuzzyMatch(sentence.text, a.title); //returns a [score, word] pair!
        // TODO: Later check only if the f.type is a number!
        if (fsResult[0] > MIN_MATCH_THRESHOLD) {
            match.push({
                userTyped: fsResult[1],
                matchedFeature: a,
            });
        }
    });
    //only send request to Wit.ai when we have a potential match!
    if (match !== null) {
        const { text } = sentence;
        if (text.length > WIT_CHARACTER_LIMIT) return;
        const response = await client.message(text, {});
        const parsedResponse = parseWitResponse(response);
        if (parsedResponse !== null) {
            //TODO: Also see if we can check if Wit.ai can also give us numbers described
            // as words (e.g., fifty, thirty four, etc.)
            if (
                Math.abs(parsedResponse.min) == Infinity &&
                Math.abs(parsedResponse.max) == Infinity
            )
                return;
            switch (parsedResponse.intent) {
                case "range_selection":
                    const fieldsOffsets = match.map((match) => {
                        return text.indexOf(match.userTyped);
                    });

                    const maxOffset = text.indexOf(parsedResponse.max);
                    const minOffset = text.indexOf(parsedResponse.min);
                    let distFromField = [];
                    fieldsOffsets.forEach((offset) => {
                        distFromField.push(
                            Math.min(Math.abs(offset - minOffset), Math.abs(offset - maxOffset))
                        );
                    });
                    const closestMatch = match[distFromField.indexOf(Math.min(...distFromField))];

                    const linkStartIndex = text.indexOf(closestMatch.userTyped);

                    let linkEndIndex =
                        minOffset > maxOffset
                            ? minOffset + text.indexOf(parsedResponse.min).toString().length
                            : minOffset + text.indexOf(parsedResponse.max).toString().length;
                    if (minOffset == -1 && maxOffset == -1) linkEndIndex = sentence.endIndex;

                    const linkPhrase = text.substring(linkStartIndex, linkEndIndex);
                    rangeLink = {
                        text: linkPhrase,
                        feature: closestMatch.matchedFeature, //information about how the rangeLink was found
                        chartId: chart.id,
                        active: false,
                        type: "range",
                        data: isArray(closestMatch.matchedFeature.field)
                            ? closestMatch.matchedFeature.field
                            : [closestMatch.matchedFeature.field],
                        startIndex:
                            linkStartIndex > linkEndIndex
                                ? sentence.startIndex + linkEndIndex
                                : sentence.startIndex + linkStartIndex,
                        endIndex:
                            linkEndIndex < linkStartIndex
                                ? sentence.startIndex + linkStartIndex
                                : sentence.startIndex + linkEndIndex,

                        sentence: text,
                        rangeMin: parsedResponse.min,
                        rangeMax: parsedResponse.max,
                        isConfirmed: false,
                    };
                    break;
            }
            return rangeLink;
        }
    }
}
async function findGroupableLinks(sentence, links) {
    const pointLinks = links.map((l) => l.text);
    const sentenceObject = { text: sentence["text"], links: pointLinks };

    const options = {
        uri: "http://localhost:8885/processjson",
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-Charset": "utf-8",
        },
        json: true,
        body: sentenceObject,
    };

    const requestPromise = util.promisify(request);
    const response = await requestPromise(options);
    return response.body.data;
}

function createGroupLink(sentence, groupableLinks, links) {
    //Limited to ONE range link with multiple individual links of same chart FIELD!
    if (!sentence || links.length < 2 || !groupableLinks) return;

    links = links.filter((link) => {
        let shouldKeep = false;
        groupableLinks.forEach((glink) => {
            if (link.text === glink) shouldKeep = true;
        });
        return shouldKeep;
    });
    const pointLinks = links.filter((link) => link.type === "point");

    const rangeLink = links.filter((link) => link.type === "range")[0];
    if (!rangeLink) return;
    const firstIndividualLink = links.reduce(function (prev, curr) {
        return prev.startIndex < curr.startIndex ? prev : curr;
    });

    const lastIndividualLink = links.reduce(function (prev, curr) {
        return prev.endIndex > curr.endIndex ? prev : curr;
    });

    const linkStartIndex = firstIndividualLink.startIndex;
    const linkEndIndex = lastIndividualLink.endIndex;

    const linkText = sentence.text.substring(
        firstIndividualLink.startIndex,
        lastIndividualLink.endIndex
    );
    const groupLink = {
        text: linkText,
        feature: pointLinks[0].feature, //information about how the link was found
        chartId: pointLinks[0].chartId,
        active: false,
        type: "group",
        data: pointLinks.map((pointLink) => pointLink.data[0]),
        startIndex: linkStartIndex,
        endIndex: linkEndIndex,
        sentence: sentence.text,
        rangeField: rangeLink?.feature?.field ? rangeLink.feature.field : "",
        rangeMin: rangeLink.rangeMin,
        rangeMax: rangeLink.rangeMax,
        isConfirmed: false,
    };
    return groupLink;
}
