//Arguments//
        //commonProps={text, extent, chartId}, 
        //dataProps={feature, values}, 
        //rangeProps={fieldX, rangeX, fieldY, rangeY}, 
        //suggestionProps={trigger}

export default ({text, extent, blockKey, chartId}, {feature, values}, {fieldX, rangeX, fieldY, rangeY}, trigger) => {
    return { 

        // common props
        text: text,
        startIndex: extent[0],
        endIndex: extent[1],
        blockKey:blockKey,
        chartId: chartId,
        
        //data props
        feature: feature,
        data: values,

        //range link props
        fieldX: fieldX,
        rangeX: rangeX,
        fieldY: fieldY,
        rangeY: rangeY,


        active: false,
        isConfirmed: true,
        trigger: trigger
    };
}