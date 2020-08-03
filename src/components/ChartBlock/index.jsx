import React, { useEffect, useMemo, memo, useState, useRef } from "react";
import { useDispatch, useSelector, shallowEqual, connect } from "react-redux";
import addSignalToChartSpec from "utils/addSignalToChartSpec";
import vegaEmbed from "vega-embed";
import throttle from "utils/throttle";
import { parse } from "vega-parser";
import { View } from "vega-view";
import ChartConfigPanel from "components/ChartConfigPanel";
import { useParams } from "react-router-dom";

import ManualLinkControls from "components/ManualLinkControls";
import { setTextSelection } from "ducks/ui";

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
    const chartsInEditor = useSelector((state) => state.docs[docId].chartsInEditor);
    const [selectedMarks, setSelectedMarks] = useState([]);
    const [viewData, setViewData] = useState([]);
    const [brush, setBrush] = useState([]);

    // TODO: use a memoized selector for performance
    const links = useSelector(
        (state) => Object.values(state.links).filter((link) => link.chartId === blockProps.id),
        shallowEqual
    );
    const spec = useMemo(
        () =>
            addSignalToChartSpec(
                // JSON.parse(JSON.stringify(chart.spec)),
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
            //TODO: brushes interfere with autosize
            // spec.autosize = {
            //     type: "fit",
            //     contains: "padding",
            // };
            console.log("Vega Specs", spec);
            const result = await vegaEmbed(chartEl.current, spec, { actions: false });
            const view = result.view;

            const viewData = view.data("source_0");
            setViewData(viewData);

            view.addDataListener("paintbrush_store", function (name, value) {
                console.log(name, value);
                setSelectedMarks(selectedMarks.concat(value));
            });
            try {
                view.addDataListener("brush_store", function (name, value) {
                    console.log(name, value);
                    setBrush(brush.concat(value));
                });
            } catch (error) {
                //No brush_store if no brush added
            }

            // view.addEventListener("click", function (event, item) {
            //     // console.log("CLICK", item.datum);
            //     setSelectedMarks(selectedMarks.push(item.datum));
            //     // console.log("SELECTED MARKS", selectedMarks);
            //     // highlightMarks(view);
            // });
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
            // view.resize().height(height).width(width).run();
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
                        rangeMin: link.rangeMin || 0,
                        rangeMax: link.rangeMax || 0,
                        //Rectangular Brushes
                        fieldX: link.fieldX || "",
                        fieldY: link.fieldY || "",
                        rangeX: link.rangeX || [0, 0],
                        rangeY: link.rangeY || [0, 0],
                    }).run();
                });
        } else {
            view.signal("highlight", { enabled: false }).run();
        }
    }, [view, links]);

    const showConfig = selection.getAnchorKey() === block.getKey(); // show only clicking this block
    const highlightStyle =
        chartsInEditor.indexOf(chart.id) > -1 && !showConfig && textSelection
            ? { ...style, position: "relative", borderStyle: "solid" }
            : { ...style, position: "relative" };

    return (
        <div
            ref={containerEl}
            {...elementProps}
            // style={{ ...style, position: "relative", borderStyle: "solid" }} // absolute positioning config panel
            style={highlightStyle}
            // onMouseEnter={()=>setResizing(true)}
            // onMouseLeave={()=>setResizing(false)}
        >
            {/* <Vega spec={spec} onNewView={handleView} onParseError={handleError} /> */}
            <div ref={chartEl} />
            {/* TODO: Commented our for now as it interferes with manual creation of links! */}
            {/* {showConfig && !textSelection && <ChartConfigPanel chart={chart} />} */}
            {/* {resizing && <AspectRatioIcon style={{color: grey[500], zIndex:2, marginLeft:"-30px"}}/>} */}
            {showConfig && textSelection && (
                <ManualLinkControls
                    currentDoc={doc}
                    selectedChart={chart}
                    textSelection={textSelection}
                    selectedMarks={selectedMarks}
                    brush={brush}
                    viewData={viewData}
                />
            )}
        </div>
    );
});
