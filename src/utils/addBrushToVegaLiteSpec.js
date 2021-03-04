export default (liteSpec) => {
    // No rectangular brush for bar, area, pie charts and maps
    const noBrush = ["geoshape"].includes(liteSpec.mark) || liteSpec.mark.type === "arc";
    const selections = noBrush
        ? {
              paintbrush: { type: "multi", toggle: true, clear: "window:keypress", },
              
          }
        : {
              brush: {
                  type: "interval",
                  clear: "window:keypress",
              },
              paintbrush: {
                  type: "multi",
                  toggle: true,
                  clear: "window:keypress",
              },
          };

    liteSpec["selection"] = selections;
    //TODO: Check what's wrong with multiple conditions https://github.com/vega/vega-lite/issues/3040
    liteSpec.encoding["opacity"] = {
        condition: [
            // {
            //     selection: "brush",
            //     value: 1,
            // },
            {
                selection: "paintbrush",
                value: 1,
            },
        ],
        value: 0.1,
    };
    return liteSpec;
};
