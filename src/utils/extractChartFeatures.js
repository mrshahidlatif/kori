//Parsing ChartInEditor for extracting chart features from vegalite spec

import { parse } from "vega-parser";
import { View } from "vega-view";
import { truthy, falsy } from "vega-util";
import { toString, isDate, isString, isArray } from "vega-util";

// potential features?
// data categories (discrete)
// data values (continuous)
// axis titles
// legends
// scales etc
export default async function (spec) {
    if (!spec.data) {
        return [];
    }
    const featureMap = {};
    const axesMap = {};
    const runtime = parse(spec);
    const view = await new View(runtime).runAsync();
    const state = view.getState({
        data: truthy,
        signals: falsy,
        recurse: true,
    });

    // sometimes, individual data points are not explicitely encoded using scales
    for (const mark of spec.marks) {
        // mu
        const data = state.data[mark.name].map((d) => d.datum);

        for (const datum of data) {
            const isMap = mark.type === "shape" && mark.style.includes("geoshape");
            const entries = Object.entries(isMap ? datum.properties : datum);
            for (const [field, value] of entries) {
                if (!isString(value)) {
                    // only categorical data
                    continue;
                }
                featureMap[value] = {
                    value,
                    type: "string",
                    field,
                    data: datum.name,
                };
            }
        }
    }
    // Note: The following logic addressses two missing cases
    // 1. Nested marks
    // 2. Categorical scale with numeric data domain
    // TODO: Can we combine the two logics elegantly?
    spec.data.forEach((datum) => {
        // for each data table
        const viewdata = view.data(datum.name);
        console.log("viewdata", viewdata);
    });
    spec.scales.map((scale) => {
        console.log("Scales in Chart:", scale);
        //TODO: handle cases where data is aggregated e.g., stack bar chart, stack area chart, pie chart,
        const name = scale.name;
        const field = scale.domain.field;
        const data = scale.domain.data;
        const type = scale.type;
        const axis = { name: name, field: field, data: data, type: type };
        axesMap[name] = axis;
    });
    spec.scales
        .filter((scale) => ["ordinal", "band", "point"].includes(scale.type))
        .map((scale) => {
            // each discrete scale
            spec.data.forEach((datum) => {
                // for each data table
                const viewdata = view.data(datum.name);
                viewdata.map((row) => {
                    // for each row in the table
                    // a single field
                    if (scale.domain.field) {
                        const field = scale.domain.field;
                        const value = isDate(row[field]) ? row[field] : toString(row[field]);
                        const type = isDate(value) ? "date" : "string";
                        featureMap[value] = {
                            value,
                            type,
                            field,
                            data: datum.name,
                        };
                    } else if (scale.domain.fields) {
                        //multiple fields from the same data
                        scale.domain.fields.map((d) => {
                            const field = isString(d) ? d : d.field;
                            const value = isDate(row[field]) ? row[field] : toString(row[field]);
                            const type = isDate(value) ? "date" : "string";
                            featureMap[value] = {
                                value,
                                type,
                                field,
                                data: datum.name,
                            };
                        });
                    }
                });
            });
            if (isArray(scale.domain)) {
                // literal array
                scale.domain.forEach((value) => {
                    value = isDate(value) ? value : toString(value);
                    const type = isDate(value) ? "date" : "string";
                    const field = searchFieldName(spec, scale.name);
                    featureMap[value] = {
                        value,
                        type,
                        field,
                        data: null,
                    };
                });
            }
        });
    const properties = { axes: Object.values(axesMap), features: Object.values(featureMap) };
    console.log("properties", properties);
    return properties;
}

export const searchFieldName = (spec, scaleName) => {
    console.log(scaleName);
    for (const mark of spec.marks) {
        console.log("mark");
        if (mark.encode.enter) {
            for (const [, props] of Object.entries(mark.encode.enter)) {
                if (props.scale === scaleName && props.field) {
                    return props.field;
                }
            }
        }
        if (mark.encode.update) {
            for (const [, props] of Object.entries(mark.encode.update)) {
                if (props.scale === scaleName && props.field) {
                    return props.field;
                }
            }
        }
    }
    return null;
};
