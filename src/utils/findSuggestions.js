export default (charts, partialText)=>{

    return partialText.length===0? []: [].concat(...charts.map(chart=>
        chart.features
            .filter(d=>d.toLowerCase().startsWith(partialText.toLowerCase()))
            .map(d=>({ 
                chartId: chart.id, 
                feature:d,// temporary, feature can  be more than just a text, will see
                text:d
            }))
        )
    );
}