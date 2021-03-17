// TODO: support different encodings?
import { isArray, isObject } from "vega-util";
import addBrushToVegaLiteSpec from "utils/addBrushToVegaLiteSpec";
import { compile } from "vega-lite/build/vega-lite";

export default (highlight, liteSpec, addBrush) => {
    try {
        if(addBrush) addBrushToVegaLiteSpec(liteSpec);
        
    } catch (e) {}

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
    //Warning: Not scalable solution, only handles combination of a categorical with upto 3 numerical axis
    //TODO: see if we can combine two categorical variables using the same logic
    const activePredicate = `highlight.enabled===true && (
        (length(highlight.rangeField) === 0 && ${
            isMap ? "indexof(highlight.data, datum.properties[highlight.field]) != -1" : "indexof(highlight.data, datum[highlight.field]) != -1"
        }) || 

        length(highlight.rangeField) === 0 && length(highlight.field) === 2 && indexof(highlight.data, datum[highlight.field[0]]) != -1 && 
        indexof(highlight.data, datum[highlight.field[1]]) || 

        (length(highlight.rangeField) === 1 && ${
            isMap ? "indexof(highlight.data, datum.properties[highlight.field]) != -1" : "indexof(highlight.data, datum[highlight.field]) != -1"
        }) && inrange(datum[highlight.rangeField[0]], [highlight.range[0], highlight.range[1]]) || 

        length(highlight.rangeField) === 1 && length(highlight.data) === 0 && inrange(datum[highlight.rangeField[0]], [highlight.range[0], highlight.range[1]]) ||

        length(highlight.rangeField) === 2 && length(highlight.data) === 0 && inrange(datum[highlight.rangeField[0]], [highlight.range[0], highlight.range[1]]) && 
        inrange(datum[highlight.rangeField[1]], [highlight.range[2], highlight.range[3]]) ||

        (length(highlight.rangeField) === 2 && ${
            isMap ? "indexof(highlight.data, datum.properties[highlight.field]) != -1" : "indexof(highlight.data, datum[highlight.field]) != -1"
        }) && inrange(datum[highlight.rangeField[0]], [highlight.range[0], highlight.range[1]]) && inrange(datum[highlight.rangeField[1]], [highlight.range[2], highlight.range[3]]) ||

        length(highlight.rangeField) === 3 && length(highlight.data) === 0 && inrange(datum[highlight.rangeField[0]], [highlight.range[0], highlight.range[1]]) && 
        inrange(datum[highlight.rangeField[1]], [highlight.range[2], highlight.range[3]]) && inrange(datum[highlight.rangeField[2]], [highlight.range[4], highlight.range[5]]) ||

        (length(highlight.rangeField) === 3 && ${
            isMap ? "indexof(highlight.data, datum.properties[highlight.field]) != -1" : "indexof(highlight.data, datum[highlight.field]) != -1"
        }) && inrange(datum[highlight.rangeField[0]], [highlight.range[0], highlight.range[1]]) && inrange(datum[highlight.rangeField[1]], [highlight.range[2], highlight.range[3]]) &&
        inrange(datum[highlight.rangeField[2]], [highlight.range[4], highlight.range[5]])


    )`;
    //TODO: reduce redundant checking, Also check if we need this at all
    const inactivePredicate =`highlight.enabled===true && !(
        (length(highlight.rangeField) === 0 && ${
            isMap ? "indexof(highlight.data, datum.properties[highlight.field]) != -1" : "indexof(highlight.data, datum[highlight.field]) != -1"
        })
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
