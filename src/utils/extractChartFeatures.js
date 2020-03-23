//Parsing ChartInEditor for extracting chart features from vegalite specs
const extractChartFeatures = chart => {
  let specs = chart.specs;
  let data = chart.specs.data;
  let features = [],
    scaleNames = [],
    varNames = [];

  //extracting the name of all scales
  console.log("Specs:", specs);
  specs.scales.map(s => {
    scaleNames.push(s["name"]);
    varNames.push(s.domain.field);
  });
  if (specs.data[0].url !== undefined) {
    const path = process.env.PUBLIC_URL + specs.data[0].url;
    //TODO: Handle the case where data is read from the URL
    return;
  }

  varNames.forEach(function(v) {
    data[0].values.map(val => {
      if (val[v] !== undefined) features.push(val[v].toString()); //FuzzySet expects a string value!
    });
  });
  // Get Unique Elements in case of repetition
  let uniqueFeatures = [...new Set(features)];
  uniqueFeatures = uniqueFeatures.filter(f => {
    return f !== undefined;
  });
  return uniqueFeatures;
};
export default extractChartFeatures;
