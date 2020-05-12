import React, { useEffect, useMemo, memo, useState, useRef } from "react";
// import { Vega } from "react-vega"; // having a problem with this, keep rerendering for no reason
import { useSelector, shallowEqual } from "react-redux";
import addSignalToChartSpec from "utils/addSignalToChartSpec";
import vegaEmbed from "vega-embed";
import throttle from "utils/throttle";
import { parse } from "vega-parser";
import { View } from "vega-view";

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
    // const data = props.contentState.getEntity(props.block.getEntityAt(0)).getData();
    // let view = null;
    const [view, setView] = useState(null);
    const containerEl = useRef(null);
    const chartEl = useRef(null);
    const [ratio, setRatio] = useState(1);

    // TODO: use a memoized selector for performance
    const links = useSelector(
        (state) => Object.values(state.links).filter((link) => link.chartId === blockProps.id),
        shallowEqual
    );
    const spec = useMemo(() => addSignalToChartSpec(JSON.parse(JSON.stringify(blockProps.spec))), [
        blockProps.spec,
    ]);

    useEffect(() => {
        const asyncExec = async () => {
            // compute canvas aspect ratio to maintain it while resizing
            const runtime = parse(spec);
            const tempView = await new View(runtime).runAsync();

            const canvas = await tempView.toCanvas();
            const ratio = canvas.height / canvas.width;
            setRatio(ratio);
            // add autosize: has limitations: https://vega.github.io/vega-lite/docs/size.html#limitations
            spec.autosize = {
                type: "fit",
                contains: "padding",
            };

            const result = await vegaEmbed(chartEl.current, spec, { actions: false });
            const view = result.view;

            setView(view);
        };
        asyncExec();
    }, []); // will run only once

    useEffect(
        throttle(async () => {
            resize(view, ratio);
        }, 500)
    );

    function resize(view, ratio) {
        if (view) {
            const { width } = containerEl.current.getBoundingClientRect();
            const height = ratio * width;
            view.resize().height(height).width(width).run();
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
                        data: link.data,
                        field: link.feature.field,
                        enabled: true,
                        //Next 3 fields refer to range selection links
                        rangeField: link.feature.field || "",
                        rangeMin: link.rangeMin || 0,
                        rangeMax: link.rangeMax || 0,
                    }).run();
                });
        } else {
            view.signal("highlight", { enabled: false }).run();
        }
    }, [view, links]);

    // const [resizing, setResizing] = useState(false);
    return (
        //TODO: BUG: Text Wrap controls doesn't work as expected! perhaps the problem is with the css files and styles!
        //TODO: Make the width of this div fit to the contents. At the moment it is hard-coded!
        <div
            ref={containerEl}
            {...elementProps}
            style={{ ...style }}
            // onMouseEnter={()=>setResizing(true)}
            // onMouseLeave={()=>setResizing(false)}
        >
            {/* <Vega spec={spec} onNewView={handleView} onParseError={handleError} /> */}
            <div ref={chartEl} />
            {/* {resizing && <AspectRatioIcon style={{color: grey[500], zIndex:2, marginLeft:"-30px"}}/>} */}
        </div>
    );
});
