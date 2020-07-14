export default (liteSpec) => {
    console.log("VegaLite Spec", liteSpec);

    //TODO: Brush doesn't make sense for maps or pie chart. If we do add, it throws an error
    const isMap = liteSpec.mark === "geoshape" || liteSpec.mark.type === "arc";
    const selections = isMap
        ? {
              paintbrush: { type: "multi", toggle: true },
          }
        : {
              brush: { type: "interval" },
              paintbrush: { type: "multi", toggle: true },
          };

    liteSpec["selection"] = selections;
    if (!isMap)
        liteSpec.encoding["opacity"] = {
            condition: {
                selection: "brush",
                value: 1,
            },
            condition: {
                selection: "paintbrush",
                value: 1,
            },
            value: 0.3,
        };
    return liteSpec;
};
