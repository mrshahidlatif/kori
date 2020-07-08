import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import css from "./index.module.css";
import Chart from "components/Chart";
import { createChart, getCharts } from "ducks/charts";
import Snackbar from "@material-ui/core/Snackbar";
import { compile } from "vega-lite/build/vega-lite";
import extractChartFeatures from "utils/extractChartFeatures";
import createThumbnail from "utils/createThumbnail";

export default function ChartGallery(props) {
    const dispatch = useDispatch();
    let { docId } = useParams();
    const [dragging, setDragging] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const charts = useSelector((state) => getCharts(state, docId));

    function handleDragEnter() {
        setDragging(true);
    }
    function handleDragLeave() {
        setDragging(false);
    }
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        // console.log('VegaLite', VegaLite);
        let file = e.dataTransfer.files[0];
        if (!file) {
            return;
        }
        if (file.size > 1000000) {
            // larger than 1 MB
            setErrorMsg("Size too big (>1MB)!");
            return;
        }
        if (file.type.match("application/json")) {
            const reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = async (e) => {
                const liteSpec = JSON.parse(e.target.result);
                const spec = compile(liteSpec).spec; // vega spec
                // support vega-lite sample datasets

                spec.data.forEach((d) => {
                    if (d.url && d.url.startsWith("data")) {
                        d.url = process.env.PUBLIC_URL + "/" + d.url;
                    }
                });
                const thumbnail = await createThumbnail(spec);

                const properties = await extractChartFeatures(spec);
                dispatch(createChart(docId, spec, liteSpec, { properties, thumbnail }));
            };

            reader.readAsText(file);
        } else {
            setErrorMsg("Wrong format!");
        }
        setDragging(false);
    }
    return (
        <div
            className={css.container}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <Snackbar
                open={errorMsg !== null}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                autoHideDuration={5000}
                onClose={() => {
                    setErrorMsg(null);
                }}
                message={errorMsg}
            />

            <div className={css.draggingArea} style={{ opacity: dragging ? 0.5 : 0.0 }}>
                Drop Vega-lite Spec
            </div>
            {charts.map((chart) => (
                <Chart key={chart.id} id={chart.id} spec={chart.spec} />
            ))}
        </div>
    );
}
