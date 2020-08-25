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
    let options = [];

    const chartProperties = props.selectedChart.properties;
    options = chartProperties.axes.map((cp) => cp.field);
    let featureFields = chartProperties.features.map((f) => f.field);

    options = options.concat(featureFields);
    options = [...new Set(options)];

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
        console.log("View Data", viewData);
        let link = null;
        if (multiPoint.length > 0) {
            let points = [];
            for (let i = 0; i < multiPoint.length; i++) {
                for (let j = 0; j < viewData.length; j++) {
                    if (multiPoint[i].values[0] === viewData[j]._vgsid_) points.push(viewData[j]);
                }
            }
            let data = [];
            points.forEach(function (p) {
                if (p.hasOwnProperty("properties")) {
                    //Special case: Maps
                    data.push(p["properties"][options[selectedIndex]]);
                } else data.push(p[options[selectedIndex]]);
            });

            link = {
                text: textSelection.text,
                feature: { field: options[selectedIndex] },
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
        if (link !== null) {
            const action = createLinks(props.currentDoc.id, [link]);
            dispatch(action);
            dispatch(setManualLinkId(action.links[0].id));
        } else dispatch(setManualLinkId(null));
    }

    return pos && props.textSelection ? (
        <Box
            // zIndex="modal"
            // left={pos.x + padding}
            // top={pos.y + padding}
            right={0}
            top={0}
            className={css.panel}
        >
            <Paper elevation={1}>
                <ButtonGroup size="small" variant="text" fullWidth aria-label="small button group">
                    <Button
                        ref={anchorRef}
                        aria-controls={open ? "split-button-menu" : undefined}
                        aria-expanded={open ? "true" : undefined}
                        aria-label="Select an axis"
                        aria-haspopup="menu"
                        onClick={handleToggle}
                        endIcon={<ArrowDropDownIcon />}
                    >
                        {options[selectedIndex]}
                    </Button>
                </ButtonGroup>
                <ButtonGroup size="small" variant="text" fullWidth aria-label="small button group">
                    <Button onMouseDown={handleAcceptClick}>Accept</Button>
                    <Button onMouseDown={handleResetClick}>Cancel</Button>
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
            </Paper>

            {/* <Grid container direction="column" alignItems="center">
                <Grid item xs={12}>
                    
                </Grid>
            </Grid> */}
        </Box>
    ) : (
        ""
    );
}
