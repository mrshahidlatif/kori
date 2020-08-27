// TODO: support different encodings?
import { isArray, isObject } from "vega-util";
import addBrushToVegaLiteSpec from "utils/addBrushToVegaLiteSpec";
import { compile } from "vega-lite/build/vega-lite";

export default (highlight, liteSpec) => {
    addBrushToVegaLiteSpec(liteSpec);

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
        (highlight.rangeField === '' && indexof(highlight.data, ${
            isMap ? "datum.properties" : "datum"
        }[highlight.field])!=-1) ||
        (highlight.rangeField != '' && indexof(highlight.data, ${
            isMap ? "datum.properties" : "datum"
        }[highlight.field])!=-1 && (datum[highlight.rangeField] > highlight.rangeMin && datum[highlight.rangeField]<highlight.rangeMax)) ||
        (datum[highlight.field] > highlight.rangeMin && datum[highlight.field]<highlight.rangeMax) ||
        (datum[highlight.fieldX] > highlight.rangeX[0] && datum[highlight.fieldX] < highlight.rangeX[1] &&
            datum[highlight.fieldY] < highlight.rangeY[0] && datum[highlight.fieldY] > highlight.rangeY[1] )
    )`;
    //TODO: reduce redundant checking
    const inactivePredicate = `highlight.enabled===true && !(
        (highlight.rangeField === '' && indexof(highlight.data, ${
            isMap ? "datum.properties" : "datum"
        }[highlight.field])!=-1) ||
        (highlight.rangeField != '' && indexof(highlight.data, ${
            isMap ? "datum.properties" : "datum"
        }[highlight.field])!=-1 && (datum[highlight.rangeField] > highlight.rangeMin && datum[highlight.rangeField]<highlight.rangeMax)) ||
        (datum[highlight.field] > highlight.rangeMin && datum[highlight.field]<highlight.rangeMax) ||
        (datum[highlight.fieldX] > highlight.rangeX[0] && datum[highlight.fieldX] < highlight.rangeX[1] &&
            datum[highlight.fieldY] < highlight.rangeY[0] && datum[highlight.fieldY] > highlight.rangeY[1] )
    )`;
    const oldProp = mark.encode.update[highlight.channel];
    const highlightProp = [
        {
            test: activePredicate,
            value: highlight.active,
        },
        {
            test: inactivePredicate,
            value: highlight.inactive,
        },
        // put existing property if exists either in array or object form
        //TODO: see if we need the Object Check?
        // ...(isObject(oldProp) ? [oldProp] : isArray(oldProp) ? oldProp : []),
    ];
    mark.encode.update = {
        ...mark.encode.update,
        [highlight.channel]: highlightProp.concat(isArray(oldProp) ? oldProp : []),
    };
}
