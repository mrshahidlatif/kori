// TODO: support different encodings?
import { isArray, isObject } from "vega-util";

export default (spec, highlight) => {
    // highlight
    spec.signals = [
        ...(spec.signals || []),
        {
            name: "highlight", // should we add a prefix to avoid conflict with existing signals
            value: { data: [], start: 0, end: 100, enabled: false },
        },
    ];

    spec.marks.forEach((mark) => {
        addSignalToMark(mark, highlight);
    });
    return spec;
};

export function addSignalToMark(mark, highlight) {
    if (mark.type === "group") {
        // recursive
        if (mark.marks) {
            mark.marks.forEach((mark) => addSignalToMark(mark)); // will this generalize to all charts?
        }
        return;
    }
    const isMap = mark.type === "shape" && mark.style.includes("geoshape");
    const activePredicate = `highlight.enabled===true && (
        (indexof(highlight.data, ${isMap ? "datum.properties" : "datum"}[highlight.field])!=-1) ||
        (datum[highlight.field] > highlight.rangeMin && datum[highlight.field]<highlight.rangeMax)
    )`;
    //TODO: reduce redundant checking
    const inactivePredicate = `highlight.enabled===true && !(
        (indexof(highlight.data, ${isMap ? "datum.properties" : "datum"}[highlight.field])!=-1) ||
        (datum[highlight.field] > highlight.rangeMin && datum[highlight.field]<highlight.rangeMax)
    )`;
    const oldProp  = mark.encode.update[highlight.channel];
    mark.encode.update = {
        ...mark.encode.update,
        [highlight.channel]: [
            {
                test: activePredicate,
                value: highlight.active,
            },
            {
                test: inactivePredicate,
                value: highlight.inactive,
            },
            // put existing property if exists either in array or object form
            ...(isObject(oldProp)? [oldProp]:(isArray(oldProp)?oldProp:[]))
            
        ],
    };
}
