import React, { useEffect, useMemo, memo, useState, useRef } from "react";
import { useSelector, shallowEqual } from "react-redux";
import addSignalToChartSpec from "utils/addSignalToChartSpec";
import vegaEmbed from "vega-embed";
import throttle from "utils/throttle";
import { parse } from "vega-parser";
import { View } from "vega-view";
import ChartConfigPanel from "components/ChartConfigPanel";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from "@material-ui/icons/Settings";

export default memo(function ChartBlock({
    block,
    blockProps,
    customStyleMap,
    customStyleFn,
    decorator,
    forceSelection,
    offsetKey,
    selection,
    tree,
    contentState,
    blockStyleFn, //weird props passed from editor
    preventScroll, //weird props passed from editor
    style,
    ...elementProps
}) {
    const [view, setView] = useState(null);
    const containerEl = useRef(null);
    const chartEl = useRef(null);
    const [ratio, setRatio] = useState(1);
    const chart = useSelector((state) => state.charts[blockProps.id]);
    const [toggleSettings, setToggleSettings] = useState(false);
    const viewMode = useSelector((state) => state.ui.viewMode);

    // TODO: use a memoized selector for performance
    const links = useSelector(
        (state) => Object.values(state.links).filter((link) => link.chartId === blockProps.id),
        shallowEqual
    );
    const spec = useMemo(
        () =>
            addSignalToChartSpec(
                chart.highlight,
                JSON.parse(JSON.stringify(chart.liteSpec))
            ),
        [chart.spec, chart.highlight]
    );

    useEffect(() => {
        const asyncExec = async () => {
            // compute canvas aspect ratio to maintain it while resizing

            const runtime = parse(spec);
            const tempView = await new View(runtime).runAsync();

            const canvas = await tempView.toCanvas();
            const ratio = canvas.height / canvas.width;
            setRatio(ratio);

            // add autosize: has limitations: https://vega.github.io/vega-lite/docs/size.html#limitations

            // spec.autosize = {
            //     type: "fit",
            //     contains: "padding",
            //     resize: true,
            // };
            const result = await vegaEmbed(chartEl.current, spec, { actions: false });
            const view = result.view;
            setView(view);
        };
        asyncExec();
    }, [spec]);

    useEffect(
        throttle(async () => {
            resize(view, ratio);
        }, 500)
    );

    function resize(view, ratio) {
        if (view) {
            const { width } = containerEl.current.getBoundingClientRect();
            const height = ratio * width;
            // view.resize().height(height).width(width).runAsync();
        }
    }

    useEffect(() => {
        if (!view) {
            return;
        }
        if (links.some((link) => link.active)) {
            // Should we send all signals at once? would it improve performance?
            links
                .filter((link) => link.active)
                .forEach((link) => {
                    view.signal("highlight", {
                        type: link.type,
                        data: link.data,
                        field: link.feature.field,
                        enabled: true,
                        //Next 2 fields refer to range selection links
                        rangeField: link.rangeField || "",
                        rangeMin: link.rangeMin || 0,
                        rangeMax: link.rangeMax || 0,
                        //Rectangular Brushes
                        fieldX: link.fieldX || "",
                        fieldY: link.fieldY || "",
                        rangeX: link.rangeX || [0, 0],
                        rangeY: link.rangeY || [0, 0],
                    }).runAsync();
                });
        } else {
            view.signal("highlight", { enabled: false }).runAsync();
        }
    }, [links]);

    function handleSettingClick() {
        setToggleSettings(!toggleSettings);
    }

    const showConfig = viewMode ? false : selection.getAnchorKey() === block.getKey(); // show only clicking this block

    return (
        <React.Fragment>
            <div ref={containerEl} {...elementProps} style={{...style, position: "relative", width: "fit-content"}}>
                <div>
                    {showConfig && (
                        <IconButton
                            onMouseDown={handleSettingClick}
                            aria-label="settings"
                            // color="primary"
                        >
                            <SettingsIcon />
                        </IconButton>
                    )}
                </div>
                <div ref={chartEl} />
                {showConfig && toggleSettings && <ChartConfigPanel chart={chart} />}
            </div>
        </React.Fragment>
    );
});
