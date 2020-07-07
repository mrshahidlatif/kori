export default (liteSpec) => {
    console.log("VegaLite Spec", liteSpec);

    liteSpec["selection"] = {
        brush: { type: "interval" },
        paintbrush: { type: "multi", toggle: true },
    };
    return liteSpec;
};
