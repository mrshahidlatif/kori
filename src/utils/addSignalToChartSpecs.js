import getVariableNameFromScale from "./VegaHelpers";
function updateChartSpecsWithSignals(oldChartSpecs, chartType) {
  // console.log("Old Chart Specs:", oldChartSpecs);

  //I think this is not the right way to work with data cloning in Reactjs!
  //soultion Source: https://stackoverflow.com/questions/55567386/react-cannot-add-property-x-object-is-not-extensible
  let newChartSpecs = JSON.parse(JSON.stringify(oldChartSpecs));
  newChartSpecs.width = 350;
  newChartSpecs.height = 200;

  //Create a Highlight signal if doesn't exist already, else append it in signals
  const hasAlreadySignalsField = newChartSpecs.hasOwnProperty("signals");
  if (hasAlreadySignalsField) {
    newChartSpecs.signals.push({
      name: "signal_highlight",
      value: { data: [], start: 0, end: 100 }
    });
  } else {
    newChartSpecs.signals = [
      {
        name: "signal_highlight",
        value: { data: [], start: 0, end: 100 }
      }
    ];
  }
  //Case Stack-Bar chart
  if (chartType === "stack-bar") {
    const x = getVariableNameFromScale(newChartSpecs, "x");
    const y = getVariableNameFromScale(newChartSpecs, "y");
    const color = getVariableNameFromScale(newChartSpecs, "color");

    newChartSpecs.marks[0].encode.update = {
      fillOpacity: [
        {
          test:
            "indexof(signal_highlight.data,datum." +
            x +
            ") != -1 || (datum." +
            y +
            " > signal_highlight.data[0] && datum." +
            y +
            " < signal_highlight.data[1]) || indexof(signal_highlight.data,datum." +
            color +
            ") != -1",
          value: 1.0
        },
        { value: 0.6 }
      ]
    };
  }
  // Case Simple Bar chart
  else if (chartType === "bar") {
    const x = getVariableNameFromScale(newChartSpecs, "xscale");
    const y = getVariableNameFromScale(newChartSpecs, "yscale");

    newChartSpecs.marks[0].encode.update = {
      fill: { value: "steelblue" },
      fillOpacity: [
        {
          test:
            "indexof(signal_highlight.data,datum." +
            x +
            ") >= 0 || (datum." +
            y +
            " > signal_highlight.data[0] && datum." +
            y +
            " < signal_highlight.data[1])",
          value: 1.0
        },
        { value: 0.6 }
      ]
    };
  }
  // Case Multi-Line Chart
  else if (chartType === "multi-line") {
    const x = getVariableNameFromScale(newChartSpecs, "x");
    const y = getVariableNameFromScale(newChartSpecs, "y");
    const color = getVariableNameFromScale(newChartSpecs, "color");

    if (newChartSpecs.marks[0].marks[0].encode.hasOwnProperty("update")) {
      newChartSpecs.marks[0].marks[0].encode.update.strokeOpacity = [
        {
          test:
            "indexof(signal_highlight.data,datum." +
            x +
            ") !== -1 || (datum." +
            y +
            " > signal_highlight.data[0] && datum." +
            y +
            " < signal_highlight.data[1]) || indexof(signal_highlight.data,datum." +
            color +
            ") !== -1",
          value: 1.0
        },
        { value: 0.6 }
      ];
    } else {
      newChartSpecs.marks[0].marks[0].encode.update = {
        //TODO: BUG: When value is 0, it highlights both the lines!
        strokeOpacity: [
          {
            test:
              "indexof(signal_highlight.data,datum." +
              x +
              ") != -1 || (datum." +
              y +
              " > signal_highlight.data[0] && datum." +
              y +
              " < signal_highlight.data[1]) || indexof(signal_highlight.data,datum." +
              color +
              ") !== -1",
            value: 1.0
          },
          { value: 0.4 }
        ]
      };
    }
  }
  // console.log("New Chart Specs:", newChartSpecs);
  return newChartSpecs;
}

export default updateChartSpecsWithSignals;
