const CLEAR_SELECTION_TIMER = 10000; //time in ms
export default (liteSpec) => {
    console.log("VegaLite Spec", liteSpec);

    const selectionClearCondition = {
        type: "timer",
        throttle: CLEAR_SELECTION_TIMER,
    };

    //TODO: Brush doesn't make sense for maps or pie chart. If we do add, it throws an error
    const isMap = liteSpec.mark === "geoshape" || liteSpec.mark.type === "arc";
    const selections = isMap
        ? {
              paintbrush: { type: "multi", toggle: true, clear: selectionClearCondition },
          }
        : {
              brush: {
                  type: "interval",
                  clear: selectionClearCondition,
              },
              paintbrush: {
                  type: "multi",
                  toggle: true,
                  clear: selectionClearCondition,
              },
          };

    liteSpec["selection"] = selections;
    //TODO: Check what's wrong with multiple conditions https://github.com/vega/vega-lite/issues/3040
    if (!isMap)
        liteSpec.encoding["opacity"] = {
            condition: [
                // {
                //     selection: "paintbrush",
                //     value: 1,
                // },
                {
                    selection: "brush",
                    value: 1,
                },
            ],
            value: 0.1,
        };
    return liteSpec;
};
