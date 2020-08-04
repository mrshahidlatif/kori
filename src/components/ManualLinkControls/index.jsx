import React from "react";
import css from "./index.module.css";

import { useDispatch, useSelector } from "react-redux";

import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

import { setTextSelection } from "ducks/ui";
import { createLinks } from "ducks/links";
import { setManualLinkId, exitManualLinkMode } from "ducks/ui";

export default function ManualLinkControls(props) {
    const dispatch = useDispatch();
    const selection = window.getSelection();
    const pos = selection.rangeCount > 0 ? selection.getRangeAt(0).getBoundingClientRect() : null;
    const padding = 10;
    const chartProperties = props.selectedChart.properties;
    let options = chartProperties.axes.map((cp) => cp.field);
    let featureFields = chartProperties.features.map((f) => f.field);

    options = options.concat(featureFields);
    options = [...new Set(options)];
    console.log("Options", options);

    function handleResetClick(event) {
        event.preventDefault();
        event.stopPropagation();
        dispatch(exitManualLinkMode(true));

        // dispatch(setTextSelection(null));
    }
    function handleAcceptClick(event) {
        event.preventDefault();
        event.stopPropagation();
        makeManualLink(props.textSelection, props.selectedMarks, props.brush, props.viewData);
        dispatch(setTextSelection(null));
    }

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(1);

    const handleClick = () => {
        console.info(`You clicked ${options[selectedIndex]}`);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    function makeManualLink(textSelection, multiPoint, brush, viewData) {
        console.log("Selected Points", multiPoint);
        console.log("Selected Brush", brush);
        console.log("View Data", viewData);

        let link = null;
        if (multiPoint.length > 0) {
            //TODO: _vegasid_ doesn't exist for charts that have built-in data (e.g., canada.json) Strange!
            //TODO: handle multi selection on maps; data is inside viewData.properties: We don't have an example for it.
            console.log("Handle MultiPoint Selection");
            var points = [];
            for (let i = 0; i < multiPoint.length; i++) {
                for (let j = 0; j < viewData.length; j++) {
                    if (multiPoint[i].values[0] === viewData[j]._vgsid_) points.push(viewData[j]);
                }
            }

            link = {
                text: textSelection.text,
                feature: { field: options[selectedIndex] },
                chartId: props.selectedChart.id,
                active: false,
                type: "multipoint",
                data: points.map((d) => d[options[selectedIndex]]),
                startIndex: props.textSelection.startIndex,
                endIndex: props.textSelection.endIndex,
                sentence: "",
                isConfirmed: true,
            };
        }
        if (brush.length > 0) {
            console.log("Handle Brush Selection");
            let points;
            let fieldX;
            let fieldY;
            let rangeX;
            let rangeY;

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
                const brushFieldIndex = brush[0].fields.findIndex(
                    (f) => f.field === options[selectedIndex] && f.type === "E"
                );
                //TODO: handle single axis brush of type "R" too

                if (brushFieldIndex > -1) {
                    points = brush[0].values[brushFieldIndex];
                }
            }

            link = {
                text: textSelection.text,
                feature: { field: options[selectedIndex] },
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
        }
        const action = createLinks(props.currentDoc.id, [link]);
        dispatch(action);
        dispatch(setManualLinkId(action.links[0].id));
    }

    return pos && props.textSelection ? (
        <div>
            <Box
                // zIndex="modal"
                // left={pos.x + padding}
                // top={pos.y + padding}
                right={0}
                top={0}
                className={css.message}
            >
                Select visual marks and a dimension to link.
            </Box>
            <Box
                // zIndex="modal"
                // left={pos.x + padding}
                // top={pos.y + padding}
                right={0}
                top={25}
                className={css.panel}
            >
                <ButtonGroup size="small" variant="contained" aria-label="smaller button group">
                    <Button onMouseDown={handleAcceptClick}>Accept</Button>
                    <Button onMouseDown={handleResetClick}>Cancel</Button>
                </ButtonGroup>
                <Grid container direction="column" alignItems="center">
                    <Grid item xs={12}>
                        <ButtonGroup
                            variant="contained"
                            // color="primary"
                            ref={anchorRef}
                            aria-label="split button"
                        >
                            <Button
                                onClick={handleClick} // color="primary"
                                size="small"
                                aria-controls={open ? "split-button-menu" : undefined}
                                aria-expanded={open ? "true" : undefined}
                                aria-label="Select an axis"
                                aria-haspopup="menu"
                                onClick={handleToggle}
                            >
                                {options[selectedIndex]}
                                <ArrowDropDownIcon />
                            </Button>
                        </ButtonGroup>
                        <Popper
                            open={open}
                            anchorEl={anchorRef.current}
                            role={undefined}
                            transition
                            disablePortal
                        >
                            {({ TransitionProps, placement }) => (
                                <Grow
                                    {...TransitionProps}
                                    style={{
                                        transformOrigin:
                                            placement === "bottom" ? "center top" : "center bottom",
                                    }}
                                >
                                    <Paper>
                                        <ClickAwayListener onClickAway={handleClose}>
                                            <MenuList id="split-button-menu">
                                                {options.map((option, index) => (
                                                    <MenuItem
                                                        key={option}
                                                        // disabled={index === 2}
                                                        selected={index === selectedIndex}
                                                        onClick={(event) =>
                                                            handleMenuItemClick(event, index)
                                                        }
                                                    >
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </Grid>
                </Grid>
            </Box>
        </div>
    ) : (
        ""
    );
}
