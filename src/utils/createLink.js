//Arguments//
        //commonProps={text, extent, chartId}, 
        //dataProps={feature, values}, 
        //rangeProps={fieldX, rangeX, fieldY, rangeY}, 
        //suggestionProps={trigger}

export default ({text, extent, blockKey, chartId}, {feature, values}, {rangeField, range}, trigger) => {
    return { 
        // common props
        text: text,
        startIndex: extent[0],
        endIndex: extent[1],
        blockKey:blockKey,
        chartId: chartId,
        
        //data props
        feature: feature || '',
        data: values || [],

        //Brush props
        //Syntax: rangeField is list of *fields* & *range* is list of tuples for each field
        rangeField: rangeField || [],
        range: range || [],

        active: false,
        isConfirmed: true,
        trigger: trigger
    };
}