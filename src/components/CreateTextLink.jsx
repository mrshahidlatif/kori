const createTextLink = text => {
  //Types of possible links: point, multipoint, group, range, series
  //TODO: Replace this logic with the suggestion functionality
  //The following logic is just to text various link types for generalizing vega signals
  //create and store the link
  var data = text;
  var type = "point";
  var chartId = 6;

  if (text == "ACH") {
    data = ["A", "C", "H"];
    type = "multipoint";
  } else if (text == "50To100") {
    data = [50, 100];
    type = "range";
  } else if (text == "OrangeSeries") {
    data = [0];
    chartId = 5;
    type = "point";
  } else if (text == "OrangeLine") {
    data = [1];
    chartId = 2;
    type = "point";
  } else if (text == "Apple") {
    data = ["AAPL"];
    chartId = 6;
    type = "point";
  }
  let link = {
    linkId: text,
    data: data,
    chartId: chartId,
    active: false,
    type: type
  };
  return link;
};

export default createTextLink;
