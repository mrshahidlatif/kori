const MIN_INTENT_COFIDENCE = 0.5;
export default (response) => {
    //TODO: This function will be modified depending on the training on Wit.ai service!
    //TODO: Updated Version of Wit.ai will store *Intents* and *Entities* separately in the response!
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
            parsedResponse = { intent: intent, min: min, max: max };
            break;
        case "group_selection":
            const group = response.entities.object_in_group.map((obj) => obj.value);
            parsedResponse = { intent: intent, group: group };
            break;
        case "comparison":
            const group1 = response.entities.group_one.map((obj) => obj.value);
            const group2 = response.entities.group_two.map((obj) => obj.value);
            parsedResponse = { intent: intent, group1: group1, group2: group2 };
            break;
    }
    return parsedResponse;
};
