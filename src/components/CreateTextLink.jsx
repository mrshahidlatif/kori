import FuzzySet from "fuzzyset.js";
const createTextLink = (text, suggestions) => {
  //Types of possible links: point, multipoint, group, range, series
  //TODO: Replace this logic with the suggestion functionality
  //The following logic is just to text various link types for generalizing vega signals
  //create and store the link
  let fs = FuzzySet(suggestions);
  let closestSuggestion =
    fs.get(text, "", 0.4).length > 0 ? fs.get(text, "", 0.4)[0][1] : text;

  let link = {
    linkId: text,
    data: closestSuggestion,
    chartId: 0,
    active: false,
    type: "point"
  };
  return link;
};

export default createTextLink;
