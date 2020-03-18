const createTextLink = text => {
  //Types of possible links: point, multipoint, group, range, series
  //TODO: Replace this logic with the suggestion functionality
  //The following logic is just to text various link types for generalizing vega signals
  //create and store the link

  let link = {
    linkId: text,
    data: text,
    chartId: 0,
    active: false,
    type: "point"
  };
  return link;
};

export default createTextLink;
