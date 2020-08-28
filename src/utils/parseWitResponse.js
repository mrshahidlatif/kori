const MIN_INTENT_COFIDENCE = 0.8;
export default (response) => {
    //TODO: Updated Version of Wit.ai will store *Intents* and *Entities* separately in the response!
    console.log("Parsed response", response);
    let parsedResponse = null;
    let intent;
    if (response.entities.hasOwnProperty("intent")) {
        if (response.entities.intent[0].confidence > MIN_INTENT_COFIDENCE) {
            intent = response.entities.intent[0].value;
        }
    }
    switch (intent) {
        case "range_selection":
            const min = response.entities.hasOwnProperty("min")
                ? response.entities.min[0].value
                : -Infinity;
            const minBody = response.entities.hasOwnProperty("min")
                ? response.entities.min[0].body
                : "";
            const max = response.entities.hasOwnProperty("max")
                ? response.entities.max[0].value
                : Infinity;
            const maxBody = response.entities.hasOwnProperty("max")
                ? response.entities.max[0].body
                : "";
            parsedResponse = {
                intent: intent,
                min: min,
                minText: minBody,
                max: max,
                maxText: maxBody,
            };
            break;
    }
    return parsedResponse;
};
