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
            let entries = Object.entries(datum); //Object.entries(isMap ? datum : datum);
            if (isMap) {
                // combine with map properties
                entries = entries.concat(Object.entries(datum.properties));
            }
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
        // console.log("viewdata", viewdata);
    });
    //Extracting Axes of the charts
    const axesMap = extractChartAxes(spec);
    spec.scales
        .filter((scale) => ["ordinal", "band", "point"].includes(scale.type))
        .forEach((scale) => {
            // each discrete scale
            spec.data.forEach((datum) => {
                // for each data table
                const viewdata = view.data(datum.name);
                viewdata.forEach((row) => {
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
                        scale.domain.fields.forEach((d) => {
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
    return properties;
}

export const searchFieldName = (spec, scaleName) => {
    for (const mark of spec.marks) {
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

export const extractChartAxes = (spec) => {
    let axesMap = {};
    spec.scales.forEach((scale) => {
        //TODO: handle cases where data is aggregated e.g., stack bar chart, stack area chart, pie chart,
        const name = scale.name;
        const field =
            //field is array of objects
            isArray(scale.domain.fields) && scale.domain.fields[0].hasOwnProperty("field")
                ? scale.domain.fields[0].field
                : //field is simple array
                isArray(scale.domain.fields)
                ? scale.domain.fields
                : scale.domain.field;
        const data = scale.domain.data;
        const type = scale.type;

        const relatedAxis = spec.axes
            ? spec.axes.filter((axis) => {
                  return (axis.scale === name && axis.title !== undefined) || null;
              })
            : undefined;
        const title =
            isArray(relatedAxis) && relatedAxis.length > 0 && relatedAxis[0].hasOwnProperty("title")
                ? relatedAxis[0].title
                : field //if title is not found, saving field as title (needed for maps!)
                ? field
                : undefined;

        const axis = { name: name, field: field, data: data, type: type, title: title };
        axesMap[name] = axis;
    });
    return axesMap;
};
