import util from "util";
const request = require("request");

export default async (sentence, sentenceOffset, charts) => {
    const payload = { text: sentence, sentenceOffset, charts: charts};
    const options = {
        uri: "http://localhost:8885/discover-links",
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-Charset": "utf-8",
        },
        json: true,
        body: payload,
    };

    const requestPromise = util.promisify(request);
    const response = await requestPromise(options);
    return response.body.data;
}