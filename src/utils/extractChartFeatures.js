//Parsing ChartInEditor for extracting chart features from vegalite spec
export default function (chart){
    let spec = chart.spec;
    let data = chart.spec.data;
    let features = [],
        // scaleNames = [],
        fields = [];

    //extracting the name of all scales
    // console.log("spec:", spec);
    spec.scales.map(s => {
        // scaleNames.push(s["name"]);
        fields.push(s.domain.field);
    });
    // if (spec.data[0].url !== undefined) {
    //   const path = process.env.PUBLIC_URL + spec.data[0].url;
    //   //TODO: Handle the case where data is read from the URL
    //   return;
    // }

    fields.forEach(function (field) {
        data[0].values.map(val => {
            if (val[field] !== undefined) features.push(val[field].toString()); //FuzzySet expects a string value!
        });
    });
    // Get Unique Elements in case of repetition
    features = [...new Set(features)];
    features = features.filter(f => {
        return f !== undefined;
    });
    return features;
};
