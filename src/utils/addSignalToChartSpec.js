// TODO: support different encodings?
import { isArray, isObject } from "vega-util";
import addBrushToVegaLiteSpec from "utils/addBrushToVegaLiteSpec";
import { compile } from "vega-lite/build/vega-lite";

export default (highlight, liteSpec) => {
    addBrushToVegaLiteSpec(liteSpec);
    console.log("VegaLite Spec After adding brush", liteSpec);

    const spec = compile(liteSpec).spec; // vega spec
    // support vega-lite sample datasets

    spec.data.forEach((d) => {
        if (d.url && d.url.startsWith("data")) {
            d.url = process.env.PUBLIC_URL + "/" + d.url;
        }
    });

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
            mark.marks.forEach((mark) => addSignalToMark(mark, highlight)); // will this generalize to all charts?
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
    const oldProp = mark.encode.update[highlight.channel];
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
            ...(isObject(oldProp) ? [oldProp] : isArray(oldProp) ? oldProp : []),
        ],
    };
}
