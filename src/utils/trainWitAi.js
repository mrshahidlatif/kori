function validateSamples(samples) {
    return fetch("https://api.wit.ai/samples?v=20170307", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${NEW_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(samples),
    }).then((res) => res.json());
}

validateSamples(samples).then((res) => console.log(res));
