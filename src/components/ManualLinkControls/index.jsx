import React from "react";
import css from "./index.module.css";

import { useDispatch } from "react-redux";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

import Paper from "@material-ui/core/Paper";

import { setTextSelection } from "ducks/ui";
import { createLinks } from "ducks/links";
import { setManualLinkId, exitManualLinkMode } from "ducks/ui";

export default function ManualLinkControls(props) {
    const dispatch = useDispatch();
    const selection = window.getSelection();
    const pos = selection.rangeCount > 0 ? selection.getRangeAt(0).getBoundingClientRect() : null;
    const padding = 10;

    const chartProperties = props.selectedChart.properties;

    function handleResetClick(event) {
        dispatch(exitManualLinkMode(true));
        event.preventDefault();
        event.stopPropagation();
        dispatch(setTextSelection(null));
    }
    function handleAcceptClick(event) {
        event.preventDefault();
        event.stopPropagation();
        makeManualLink(props.textSelection, props.selectedMarks, props.brush, props.viewData);
        dispatch(setTextSelection(null));
        dispatch(exitManualLinkMode(true));
    }

    function makeManualLink(textSelection, multiPoint, brush, viewData) {
        let link = null;
        if (multiPoint.length > 0) {
            let points = [];
            for (let i = 0; i < multiPoint.length; i++) {
                for (let j = 0; j < viewData.length; j++) {
                    if (multiPoint[i].values[0] === viewData[j]._vgsid_) points.push(viewData[j]);
                }
            }
            let data = [];
            let field;
            points.forEach(function (p) {
                field = chartProperties?.axes.filter((axis) =>
                    ["ordinal", "band", "point"].includes(axis.type)
                )[0];
                if (p.hasOwnProperty("properties")) {
                    field = chartProperties?.features.filter(
                        (feature) => feature?.value != "Feature"
                    )[0];
                    //Special case: Maps
                    //Look for data in TopoJSON Properties or in the datafile!
                    if (!p["properties"][field?.field]) {
                        data.push(p[field?.field]);
                    } else data.push(p["properties"][field?.field]);
                } else data.push(p[field?.field]);
            });

            link = {
                text: textSelection.text,
                feature: { field: field?.field },
                chartId: props.selectedChart.id,
                active: false,
                type: "multipoint",
                data: data,
                startIndex: props.textSelection.startIndex,
                endIndex: props.textSelection.endIndex,
                sentence: "",
                isConfirmed: true,
            };
        }
        if (brush.length > 0) {
            let points;
            let fieldX;
            let fieldY;
            let rangeX;
            let rangeY;
            let brushField;
            let rangeMin;
            let rangeMax;

            //Rectangular Brush
            if (
                brush[0].fields.length === 2 &&
                brush[0].fields[0].type === "R" &&
                brush[0].fields[1].type === "R"
            ) {
                fieldX = brush[0].fields[0].field;
                fieldY = brush[0].fields[1].field;
                rangeX = brush[0].values[0];
                rangeY = brush[0].values[1];
                points = [];
            } else {
                //Single Axis Brush
                if (brush[0].fields[0].type === "E") {
                    brushField = brush[0].fields[0].field;
                    points = brush[0].values[0];
                }
                if (brush[0].fields[0].type === "R") {
                    brushField = brush[0].fields[0].field;
                    points = [];
                    rangeMin = brush[0].values[0][0];
                    rangeMax = brush[0].values[0][1];
                }
            }
            link = {
                text: textSelection.text,
                feature: { field: brushField },
                chartId: props.selectedChart.id,
                active: false,
                type: "brush",
                data: points,
                startIndex: props.textSelection.startIndex,
                endIndex: props.textSelection.endIndex,
                sentence: "",
                isConfirmed: true,
                fieldX: fieldX,
                rangeX: rangeX,
                fieldY: fieldY,
                rangeY: rangeY,
            };
            if (brush[0]?.fields.length < 2 && brush[0]?.fields[0].type === "R")
                link = { ...link, rangeField: brushField, rangeMin, rangeMax };
        }
        if (link !== null) {
            const action = createLinks(props.currentDoc.id, [link]);
            dispatch(action);
            dispatch(setManualLinkId(action.links[0].id));
        } else dispatch(setManualLinkId(null));
    }
    return pos && props.textSelection ? (
        <Box right={0} top={0} className={css.potentialLinkControls}>
            <Paper elevation={1}>
                <ButtonGroup size="small" variant="text" fullWidth aria-label="small button group">
                    <Button onMouseDown={handleAcceptClick}>Accept</Button>
                    <Button onMouseDown={handleResetClick}>Cancel</Button>
                </ButtonGroup>
            </Paper>
        </Box>
    ) : (
        ""
    );
}
