// import { getVariableNameFromScale } from "./VegaHelpers";
function addSignalToChartSpec(spec) {
  // console.log("Old Chart Specs:", oldChartSpecs);

  //I think this is not the right way to work with data cloning in Reactjs!
  //soultion Source: https://stackoverflow.com/questions/55567386/react-cannot-add-property-x-object-is-not-extensible
  // let spec = JSON.parse(JSON.stringify(oldChartSpecs));
  // spec.width = 350;
  // spec.height = 200;

  // highlight
  spec.signals = [
    ...(spec.signals||[]),
    {
      name: "highlight", // should we add a prefix to avoid conflict with existing signals
      value: { data: [], start: 0, end: 100, enabled:false, }
    }
  ];

  // TODO: the following is temporary
  // const fields = spec.scales.filter(scale=>scale.domain.field)
  //   .map(scale=>scale.domain.field);
    // ${fields.map(field=>`
    //             
    //           `).join('')}
  // console.log('fields', fields);
  spec.marks.forEach(mark=>{
    mark.encode.update = {
      ...mark.encode.update,
      fillOpacity:[
        {
          test:` 
              highlight.enabled === false 
              || indexof(highlight.data, datum[highlight.field])!=-1
            `,
          value: 1.0
        },
        {
          value: 0.2
        }
      ]
    }
  })
 
  // add mark update rules
  
  //Case Stack-Bar chart
  // if (chartType === "stack-bar") {
  //   const x = getVariableNameFromScale(spec, "x");
  //   const y = getVariableNameFromScale(spec, "y");
  //   const color = getVariableNameFromScale(spec, "color");

  //   spec.marks[0].encode.update = {
  //     ...spec.marks[0].encode.update,
  //     fillOpacity: [
  //       {
  //         test:
  //           "highlight.data[0] !== 'CLEAR' && (" +
  //           "indexof(highlight.data,datum." +
  //           x +
  //           ") != -1 || (datum." +
  //           y +
  //           " > highlight.data[0] && datum." +
  //           y +
  //           " < highlight.data[1]) || indexof(highlight.data,datum." +
  //           color +
  //           ") != -1)",
  //         value: 1.0
  //       },
  //       { value: 0.6 }
  //     ]
  //   };
  // }
  // // Case Simple Bar chart
  // else if (chartType === "bar") {
  //   const x = getVariableNameFromScale(spec, "xscale");
  //   const y = getVariableNameFromScale(spec, "yscale");

  //   spec.marks[0].encode.update = {
  //     fill: { value: "steelblue" },
  //     fillOpacity: [
  //       {
  //         test:
  //           "highlight.data[0] !== 'CLEAR' && (" +
  //           "indexof(highlight.data,datum." +
  //           x +
  //           ") >= 0 || (datum." +
  //           y +
  //           " > highlight.data[0] && datum." +
  //           y +
  //           " < highlight.data[1]))",
  //         value: 1.0
  //       },
  //       { value: 0.6 }
  //     ]
  //   };
  // }
  // // Case Multi-Line Chart
  // else if (chartType === "multi-line") {
  //   const x = getVariableNameFromScale(spec, "x");
  //   const y = getVariableNameFromScale(spec, "y");
  //   const color = getVariableNameFromScale(spec, "color");

  //   if (spec.marks[0].marks[0].encode.hasOwnProperty("update")) {
  //     spec.marks[0].marks[0].encode.update.strokeOpacity = [
  //       {
  //         test:
  //           "indexof(highlight.data,datum." +
  //           x +
  //           ") !== -1 || (datum." +
  //           y +
  //           " > highlight.data[0] && datum." +
  //           y +
  //           " < highlight.data[1]) || indexof(highlight.data,datum." +
  //           color +
  //           ") !== -1",
  //         value: 1.0
  //       },
  //       { value: 0.6 }
  //     ];
  //   } else {
  //     spec.marks[0].marks[0].encode.update = {
  //       //TODO: BUG: When value is 0, it highlights both the lines!
  //       strokeOpacity: [
  //         {
  //           test:
  //             "indexof(highlight.data,datum." +
  //             x +
  //             ") != -1 || (datum." +
  //             y +
  //             " > highlight.data[0] && datum." +
  //             y +
  //             " < highlight.data[1]) || indexof(highlight.data,datum." +
  //             color +
  //             ") !== -1",
  //           value: 1.0
  //         },
  //         { value: 0.4 }
  //       ]
  //     };
  //   }
  // }
  // console.log("New Chart Specs:", spec);
  return spec;
}

export default addSignalToChartSpec;
