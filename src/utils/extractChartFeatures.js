//Parsing ChartInEditor for extracting chart features from vegalite spec

import { parse } from 'vega-parser';
import { View } from 'vega-view';
import { toString, isDate, isString, isArray } from 'vega-util';

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
    
    spec.scales.filter(scale => ['ordinal', 'band', 'point'].includes(scale.type))
        .map(scale => {// each discrete scale
            spec.data.forEach(datum => {// for each data table
                const viewdata = view.data(datum.name);
                console.log('viewdata', viewdata);
                viewdata.map(row => { // for each row in the table
                    // a single field
                    if (scale.domain.field) {
                        const field = scale.domain.field;
                        const value = isDate(row[field])?row[field]:toString(row[field]);
                        const type = isDate(value)? 'date':'string'
                        featureMap[value] = {
                            value,
                            type,
                            field,
                            data: datum.name
                        };
                    } else if (scale.domain.fields) { //multiple fields from the same data
                        scale.domain.fields.map(d => {
                            const field = isString(d) ? d : d.field;
                            const value = isDate(row[field])?row[field]:toString(row[field]);
                            const type = isDate(value)? 'date':'string'
                            featureMap[value] = {
                                value,
                                type,
                                field,
                                data: datum.name
                            };
                        })
                    }
                });
            })
            if (isArray(scale.domain)) { // literal array
                scale.domain.forEach(value => {
                    value = isDate(value)?value:toString(value);
                    const type = isDate(value)? 'date':'string'
                    const field = searchFieldName(spec, scale.name);
                    featureMap[value] = {
                        value,
                        type,
                        field,
                        data: null
                    }
                });
            }
        })

    console.log('features', Object.values(featureMap));
    return Object.values(featureMap);
};


export const searchFieldName = (spec, scaleName)=>{
    console.log(scaleName);
    for (const mark of spec.marks){
        console.log('mark');
        if (mark.encode.enter){
            for (const [,props] of Object.entries(mark.encode.enter)){
                if (props.scale===scaleName && props.field){
                    return props.field;
                }
            }
        }
        if (mark.encode.update){
            for (const [,props] of Object.entries(mark.encode.update)){
                if (props.scale===scaleName && props.field){
                    return props.field;
                }
            }
        }
    }
    return null;
}