//Parsing ChartInEditor for extracting chart features from vegalite specs
import getVariableNameFromScale from "./VegaHelpers";
const extractChartFeatures = chart => {
  let specs = chart.specs;
  let data = chart.specs.data;
  var features = [];

  const x = getVariableNameFromScale(specs, "xscale");
  const y = getVariableNameFromScale(specs, "yscale");

  data[0].values.map(val => {
    features.push(val[x]);
  });
  return features;
};
export default extractChartFeatures;
