//Parsing ChartInEditor for extracting chart features from vegalite spec

//These are just here for testing!
import bar from "../ducks/specs/bar.vl.json";
import stackbar from "../ducks/specs/stackbar.vl.json";
import groupbar from "../ducks/specs/groupbar.vl.json";
import scatterplot from "../ducks/specs/scatterplot.vl.json";
import columnStackBar from "../ducks/specs/columnstackbar.vl.json";
import line from "../ducks/specs/line.vl.json";
import multiLine from "../ducks/specs/multiline.vl.json";
import map from "../ducks/specs/map.vl.json";
import * as d3 from "d3-fetch";
import file from "../ducks/specs/weather.csv";

//TODO: Also handle cases where data is read from CSV file.
//TODO: Also see if we can support Maps!
export default function () {
  //This function expects VegaLite specs as an argument
  let spec = bar;
  let chartFeatures = {
    chartType: "",
    encodings: {},
    features: [],
  };

  //TODO: @Nam: Can you have a look at this CSV reading method!
  // d3.csv(file).then(function (data) {
  //   console.log(data);
  // });

  //Data is embedded inside the chart specs
  if (spec.data.url === undefined) {
    handleAllChartTypes(spec, spec.data.values, chartFeatures);
    chartFeatures.features = stringifyFeatures(chartFeatures);
    console.log("Chart Features:", chartFeatures);
    return;
  }
  //Data is JSON file and read from URL
  fetch(process.env.PUBLIC_URL + "/" + spec.data.url)
    .then((response) => response.json())
    .then(function (data) {
      // console.log("Data", data);
      handleAllChartTypes(spec, data, chartFeatures);
      chartFeatures.features = stringifyFeatures(chartFeatures);
      console.log("Chart Features:", chartFeatures);
    })
    .catch(function (error) {
      console.log(error);
    });
}
function handleAllChartTypes(spec, data, features) {
  switch (spec.mark || spec.spec.mark) {
    case "bar":
      features.chartType = "bar";
      extractEncodings(spec, data, features);
      break;
    case "geoshape":
      break;
    case "point":
      features.chartType = "scatter";
      extractEncodings(spec, data, features);
      break;
    case "circle":
      break;
    case "line":
      features.chartType = "line";
      if (spec.mark === undefined) spec = spec.spec;
      extractEncodings(spec, data, features);
      break;
    case "text":
      break;
    default:
      if (spec.mark.type === "line") {
        features.chartType = "line";
        if (spec.mark === undefined) spec = spec.spec;
        extractEncodings(spec, data, features);
      }
      console.log("ChartTypeError: Chart type not supported!");
      break;
  }
}
function extractEncodings(spec, data, features) {
  Object.entries(spec.encoding).forEach(([key, value]) => {
    features.encodings[key] = value;
    features.encodings[key]["labels"] = filterDataByField(data, value.field);
  });
}
function filterDataByField(data, field) {
  let filteredValues = [];
  data.map(function (d) {
    filteredValues.push(d[field]);
  });
  filteredValues = removeDuplicates(filteredValues);
  return filteredValues;
}
function removeDuplicates(list) {
  let cleanList = [...new Set(list)];
  list = list.filter((f) => {
    return f !== undefined && f !== null;
  });
  return cleanList;
}
function stringifyFeatures(features) {
  let featureList = [];
  Object.entries(features.encodings).forEach(([key, value]) => {
    featureList.push(value.field);
    featureList = featureList.concat(value.labels);
  });
  featureList = removeDuplicates(featureList);
  return featureList;
}
