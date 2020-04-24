export default (charts, sentence) => {
    let links = [];
    charts.forEach(function (chart) {
        links = links.concat(findWordLink(chart, sentence).filter((link) => link !== null));
    });
    return links;
};
// const MIN_MATCH_THRESHOLD = 0.7;

export const findWordLink = (chart, sentence) => {
    let matches = [];
    chart.features.forEach(function (f) {
        if (f.type === "string" && sentence.text.includes(f.value)) {
            matches.push(f);
        }
    });
    let links = [];
    if (matches.length > 0)
        matches.forEach(function (m) {
            const linkStartIndex = sentence.startIndex + sentence.text.indexOf(m.value);
            const linkEndIndex = linkStartIndex + m.value.length;
            const link = {
                text: m.value,
                feature: m, //information about how the link was found
                chartId: chart.id,
                active: false,
                type: "point", //TODO: range selection
                data: [m.value],
                startIndex: linkStartIndex,
                endIndex: linkEndIndex,
                sentence: sentence.text,
            };
            links.push(link);
        });
    return links;
};
