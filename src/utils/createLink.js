export default ({text, extent, blockKey, chartId}, {feature, values}, {fieldX, rangeX, fieldY, rangeY}) => {
    const link = {
        //Arguments//
        //commonProps={text, extent, chartId}, 
        //dataProps={feature, values}, 
        //rangeProps={fieldX, rangeX, fieldY, rangeY}, 
        //suggestionProps={trigger}

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
        // trigger: suggestionProps.trigger
    };
    console.log('createLink()', link);
    return link;
}