import util from "util";


const request = require("request");

export default async (sentence, sentenceOffset, charts) => {

    const payload = { text: sentence, sentenceOffset, charts: charts};

    const options = {
        uri: "http://localhost:8885/testing",
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
    console.log('Returned from backend', response.body.data);
    return response.body.data;
}