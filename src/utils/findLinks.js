

// import FuzzySet from "fuzzyset.js";

export default (charts, text)=>{
    return charts.map(chart=>findLink(chart, text)).filter(link=>link!==null);
}
// const MIN_MATCH_THRESHOLD = 0.7;


export const findLink = (chart, text)=>{
    // keyword matching
    // Maybe I am wrong but this Fuzzyset thing really gets in the way
    // TODO: Can we make it more implicit rather than autocorrect ?
    // const fs = FuzzySet(chart.features); 
    // console.log(chart.features, text,fs);
    // let word = fs.get(text, '', MIN_MATCH_THRESHOLD);
    // console.log(word);
    // word = word.length>0? word[0][1]: text;
    const match = chart.features.find(feature=>feature===text);
    
    return match? {
        text,
        chartId: chart.id,
        active: false,
        type: "point"//TODO: range selection
    }: null;
}