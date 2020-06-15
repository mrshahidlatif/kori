import React, { useEffect, useMemo, memo, useState, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import addSignalToChartSpec from "utils/addSignalToChartSpec";
import vegaEmbed from "vega-embed";
import throttle from "utils/throttle";
import { parse } from "vega-parser";
import { View } from "vega-view";
import ChartConfigPanel from "components/ChartConfigPanel";
import { useParams } from "react-router-dom";

import { createLinks } from "ducks/links";
import { setSelectedLink, setManualLinkId } from "ducks/ui";
import ManualLinkControls from "components/ManualLinkControls";
import { SelectionState } from "draft-js";

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
    const dispatch = useDispatch();
    const [view, setView] = useState(null);
    const containerEl = useRef(null);
    const chartEl = useRef(null);
    const [ratio, setRatio] = useState(1);
    const chart = useSelector((state) => state.charts[blockProps.id]);
    const textSelection = useSelector((state) => state.ui.textSelection);
    let { docId } = useParams();
    const doc = useSelector((state) => state.docs[docId]);
    const [selectedMarks, setSelectedMarks] = useState([]);

    // TODO: use a memoized selector for performance
    const links = useSelector(
        (state) => Object.values(state.links).filter((link) => link.chartId === blockProps.id),
        shallowEqual
    );
    const spec = useMemo(
        () => addSignalToChartSpec(JSON.parse(JSON.stringify(chart.spec)), chart.highlight),
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
            spec.autosize = {
                type: "fit",
                contains: "padding",
            };

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
    useEffect(() => {
        if (view && textSelection) {
            view.addEventListener("click", function (event, item) {
                // console.log("CLICK", event, item.datum);
                setSelectedMarks(selectedMarks.concat(item.datum));
                // console.log("SELECTED MARKS", selectedMarks);
            });
        }
    });
    function makeManualLink(textSelection, data) {
        if (textSelection && data) {
            const link = {
                text: textSelection.text,
                feature: { field: "category" },
                chartId: chart.id,
                active: false,
                type: "point",
                data: data.map((d) => d.category),
                startIndex: textSelection.startIndex,
                endIndex: textSelection.endIndex,
                sentence: "",
                isConfirmed: true,
            };
            const action = createLinks(doc.id, [link]);
            dispatch(action);
            console.log("Manual LInk ID", action.links);
            dispatch(setManualLinkId(action.links[0].id));
        }
    }
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
                        //Next 2 fields refer to range selection links
                        rangeMin: link.rangeMin || 0,
                        rangeMax: link.rangeMax || 0,
                    }).run();
                });
        } else {
            view.signal("highlight", { enabled: false }).run();
        }
    }, [view, links]);

    function handleManualLinkAccept() {
        makeManualLink(textSelection, selectedMarks);
    }
    function handleManualLinkReset() {
        setSelectedMarks([]);
    }

    const showConfig = selection.getAnchorKey() === block.getKey(); // show only clicking this block

    return (
        <div
            ref={containerEl}
            {...elementProps}
            style={{ ...style, position: "relative" }} // absolute positioning config panel
            // onMouseEnter={()=>setResizing(true)}
            // onMouseLeave={()=>setResizing(false)}
        >
            {/* <Vega spec={spec} onNewView={handleView} onParseError={handleError} /> */}
            <div ref={chartEl} />
            {/* {showConfig && <ChartConfigPanel chart={chart} />} */}
            {/* {resizing && <AspectRatioIcon style={{color: grey[500], zIndex:2, marginLeft:"-30px"}}/>} */}
            {showConfig && textSelection && (
                <ManualLinkControls
                    textSelection={textSelection}
                    onAccept={handleManualLinkAccept}
                    onReset={handleManualLinkReset}
                />
            )}
        </div>
    );
});
