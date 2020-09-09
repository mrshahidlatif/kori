const MIN_INTENT_COFIDENCE = 0.999;
export default (response) => {
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

            const max = response.entities.hasOwnProperty("max")
                ? response.entities.max[0].value
                : Infinity;

            parsedResponse = {
                intent: intent,
                min: min,
                max: max,
            };
            break;
    }
    return parsedResponse;
};
