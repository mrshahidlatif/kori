import React,  { useState } from "react";
import css from "./index.module.css";
import { useDispatch } from "react-redux";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useEffect } from "react";
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { setTextSelection } from "ducks/ui";
import { createLinks } from "ducks/links";
import { setManualLinkId, exitManualLinkMode } from "ducks/ui";
import createLink from "utils/createLink"

const useStyles = makeStyles((theme) => ({
    root: {
      width: 300,
    },
  }));

  function valuetext(value) {
    return `${value}°C`;
}


export default function ManualLinkControls(props) {
    const dispatch = useDispatch();
    const classes = useStyles();
    const selection = window.getSelection();
    const pos = selection.rangeCount > 0 ? selection.getRangeAt(0).getBoundingClientRect() : null;

    const [value, setValue] = useState([20, 37]);
    const [marks, setMarks] = useState([{value:1, label:1}, {value:100, label:100}]);
    const [axis, setAxis] = useState('');

    const chartProperties = props.selectedChart.properties;

    const axisOptions = chartProperties.axes.map(axis => axis?.title);

    const handleAxisChange = (event) => {
        const name = event.target.value;
        setAxis(name);
        console.log('axis name', name);
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
      };
  

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
            const feature={ field: field?.field };
            const commonProps = {text: textSelection.text, extent:[props.textSelection.startIndex, props.textSelection.endIndex], blockKey:props.textSelection.blockKey, chartId: props.selectedChart.id};
            link = createLink(commonProps, {feature,values:data}, {});
            console.log('MultiPoint Link', link);
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
            const commonProps = {text:textSelection.text, extent:[props.textSelection.startIndex, props.textSelection.endIndex], blockKey:props.textSelection.blockKey, chartId:props.selectedChart.id};
            const dataProps = {feature: { field: brushField }, values:points }
            const rangeProps = {fieldX: fieldX, rangeX: rangeX, fieldY: fieldY, rangeY: rangeY}
            link = createLink(commonProps, dataProps,rangeProps);
            console.log('Single Axis Brush Link', link);

            if (brush[0]?.fields.length < 2 && brush[0]?.fields[0].type === "R")
                link = { ...link, rangeField: brushField, rangeMin, rangeMax };
            console.log('Rectangular Brush Link', link);
        }
        if (link !== null) {
            const action = createLinks(props.currentDoc.id, [link]);
            dispatch(action);
            dispatch(setManualLinkId(action.links[0].id));
        } else dispatch(setManualLinkId(null));
    }
    return pos && props.textSelection ? (
        <React.Fragment>
        <Box right={0} top={0} className={css.potentialLinkControls}>
            <Paper elevation={1}>
                <ButtonGroup size="small" variant="text" fullWidth aria-label="small button group">
                    <Button onMouseDown={handleAcceptClick}>Accept</Button>
                    <Button onMouseDown={handleResetClick}>Cancel</Button>
                </ButtonGroup>
            </Paper>
        </Box>
        <div className={classes.root}>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-simple">Axis</InputLabel>
                <Select
                    native
                    value={axis}
                    onChange={handleAxisChange}
                    >
                    {axisOptions.map(ao => <option key={ao} value={ao}>{ao}</option>)}
                </Select>
                <FormHelperText>Some important helper text</FormHelperText>
            </FormControl>
            <Typography id="range-slider" gutterBottom>
                Interval range
            </Typography>
           <Slider
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={valuetext}
                marks={marks}
            />
            <Paper elevation={1}>
                <ButtonGroup size="small" variant="text" fullWidth aria-label="small button group">
                    <Button onMouseDown={()=> {}}>Save</Button>
                    <Button onMouseDown={()=>{}}>Cancel</Button>
                </ButtonGroup>
            </Paper>
        </div>
        </React.Fragment>
    ) : (
        ""
    );
}
