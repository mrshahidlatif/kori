import React, { useMemo, memo, useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import vegaEmbed from "vega-embed";
import PropTypes from "prop-types";
import css from "./index.module.css";
import Paper from "@material-ui/core/Paper";
import { deleteChart } from "ducks/charts";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "components/Alert";

// See ChartBlock for a chart in the editor
export function Chart(props) {
    const dispatch = useDispatch();
    const chartEl = useRef(null);
    const chartsInEditor = useSelector((state) => state.docs[props.docId].chartsInEditor);
    // why we need to stringify and parse it back? needs further investigation
    const spec = useMemo(() => JSON.parse(JSON.stringify(props.spec)), [props.spec]);
    // const [view, setView] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        vegaEmbed(chartEl.current, spec).then((result) => {
            // setView(result.view);
        });
    }, [spec]); // will run only once

    function handleDragStart(e) {
        e.dataTransfer.setData("chartId", props.id);
    }

    const [hover, setHover] = useState(false);
    function handleEnter() {
        setHover(true);
    }
    function handleLeave() {
        setHover(false);
    }
    function handleKeyPress(event) {
        if (event.key === "Delete") {
            if (!chartsInEditor.includes(props.id))
                dispatch(deleteChart(props.id, { docId: props.docId }));
            else setErrorMsg("Chart can not be deleted. It is active in the editor!");
        }
    }
    return (
        <Paper
            className={css.container}
            onKeyDown={handleKeyPress}
            tabIndex="0"
            elevation={hover ? 2 : 0}
        >
            <div
                draggable={true}
                onDragStart={handleDragStart}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                <div ref={chartEl} />
            </div>
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
            >
                <Alert severity="error">{errorMsg}</Alert>
            </Snackbar>
        </Paper>
    );
}

Chart.propTypes = {
    id: PropTypes.any,
    spec: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
};

export default memo(Chart);
