import React,  { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useEffect } from "react";
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import uniqueId from "utils/uniqueId";
import Grid from '@material-ui/core/Grid';


import { setTextSelection } from "ducks/ui";
import { createLinks } from "ducks/links";
import { setManualLinkId, exitManualLinkMode } from "ducks/ui";
import createLink from "utils/createLink"
import Filter from "components/Filter"
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "components/Alert";

//TODO: needs cleaning & refactoring

const useStyles = makeStyles((theme) => ({
    chartAvatars: {
        display: 'flex',
        '& > *': {
          margin: theme.spacing(1),
        },
      },
    root: {
      width: 300,
    },
  }));

export default function ManualLinkControls(props) {
    const dispatch = useDispatch();
    const classes = useStyles();

    const [value, setValue] = useState([20, 37]);
    const [marks, setMarks] = useState([{value:1900, label:1900}, {value:2000, label:2000}]);
    const [axis, setAxis] = useState('');
    const [showField, setShowField] = useState(false);
    const [link, setLink]=useState(null);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [showSlider, setShowSlider]=useState(false);
    const [filters, setFilters] = useState([])
    const [infoMsg, setInfoMsg] = useState(null);

    const chartProperties = props.selectedChart.properties;
    let axisOptions = chartProperties.axes.map(axis => axis?.field);
    const featureFields = [...new Set(chartProperties.features.map((f) => f.field))];
    axisOptions = axisOptions.concat(featureFields);
    axisOptions = [...new Set(axisOptions)];

    const handleAxisChange = (event) => {
        const selectedAxis = event.target.value;
        setAxis(selectedAxis);
        link['data'] = selectedPoints.map(sp => sp[selectedAxis]);
        setLink(link);

        const axisObj = getAxisObjectByName(chartProperties.axes ,selectedAxis)

        if(!["ordinal", "band", "point"].includes(axisObj.type)){
            const min = getMin(props.viewData, selectedAxis);
            const max = getMax(props.viewData, selectedAxis);
            if (min instanceof Date){
                setMarks([{value:min.getTime(), label:min.toLocaleString()}, {value:max.getTime(), label:max.toLocaleString()}]);
            }
            else{
                setMarks([{value:min, label:min.toLocaleString()}, {value:max, label:max.toLocaleString()}]);
            }
            setShowSlider(true);
        }
        else setShowSlider(false)
    }
    function getMin(data, axisName){
        const min = data.reduce((prev, curr) => {
            if (typeof curr === 'string') {
                return Number.parseFloat(prev[axisName]) < Number.parseFloat(curr[axisName]) ? prev : curr
            }
            else {
                return prev[axisName] < curr[axisName] ? prev : curr
            }
        });
        return typeof min[axisName] === 'string' ? parseFloat(min[axisName]): min[axisName];
    }

    function getMax(data, axisName){
        const max = data.reduce((prev, curr) => {
            if (typeof curr === 'string'){
                return Number.parseFloat(prev[axisName]) > Number.parseFloat(curr[axisName]) ? prev : curr
            }
            else{
                return prev[axisName] > curr[axisName] ? prev : curr
            }
        });
        return typeof max[axisName] === 'string' ? parseFloat(max[axisName]): max[axisName];
    }

    function getAxisObjectByName(axes, name){
        //TODO: handle if matches to title or field
        const axisObj = axes.find(a => a.field === name);
        return axisObj;
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
        //TODO: send to createLink() for updating link
        link['rangeField'] = {field:axis}
        link['rangeMin'] = newValue[0];
        link['rangeMax'] = newValue[1];
        setLink(link);
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
        // makeManualLink(props.textSelection, props.selectedMarks, props.brush, props.viewData);
        if (link !== null) {
            link['feature']={field:axis};
            const action = createLinks(props.currentDoc.id, [link]);
            dispatch(action);
            dispatch(setManualLinkId(action.links[0].id));
        } else dispatch(setManualLinkId(null));
        dispatch(setTextSelection(null));
        dispatch(exitManualLinkMode(true));

        setInfoMsg("Reference Created!");
    }

    useEffect(()=>{
        if(props.selectedMarks.length > 0){
            setShowField(true);
            const link = makeManualLink(props.textSelection, props.selectedMarks, props.brush, props.viewData);
            setLink(link);
        }
        if(props.brush.length > 0){
            setShowField(true);
            const link = makeManualLink(props.textSelection, props.selectedMarks, props.brush, props.viewData);
            setLink(link);
        }
    },[props.selectedMarks, props.brush]);

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
            setSelectedPoints(points);
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
            setAxis(feature.field);

            const commonProps = {text: textSelection.text, extent:[props.textSelection.startIndex, props.textSelection.endIndex], blockKey:props.textSelection.blockKey, chartId: props.selectedChart.id};
            link = createLink(commonProps, {feature,values:data}, {});
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
                setAxis(fieldX);
            } else {
                //Single Axis Brush
                if (brush[0]?.fields[0]?.type === "E" && brush[0]?.fields[1]?.type === "R" ) {
                    brushField = brush[0].fields[0].field;
                    points = brush[0].values[0];
                }
                if (brush[0]?.fields[0]?.type === "R" && brush[0]?.fields[1]?.type === "E" ) {
                    brushField = brush[0].fields[1].field;
                    points = brush[0].values[1];
                }
                if (brush[0].fields.length === 1 && brush[0]?.fields[0]?.type === "R") {
                    brushField = brush[0].fields[0].field;
                    points = [];
                    rangeMin = brush[0].values[0][0];
                    rangeMax = brush[0].values[0][1];
                }
                setAxis(brushField);
            }
            const commonProps = {text:textSelection.text, extent:[props.textSelection.startIndex, props.textSelection.endIndex], blockKey:props.textSelection.blockKey, chartId:props.selectedChart.id};
            const dataProps = {feature: { field: brushField }, values:points }
            const rangeProps = {fieldX: fieldX, rangeX: rangeX, fieldY: fieldY, rangeY: rangeY}
            link = createLink(commonProps, dataProps,rangeProps);
            if (brush[0]?.fields.length < 2 && brush[0]?.fields[0].type === "R")
                link = { ...link, rangeField: brushField, rangeMin, rangeMax };
        }
        return link;
    }
    
    function handleAddSelectionBtn(){
        setFilters([...filters, {id:uniqueId('filter-'), props:{}}]);
    }
    function handleFilterDelete(filterId){
        console.log('Delete', filterId)
        const updatedFilters = filters.filter(f=> f.id !== filterId);
        setFilters(updatedFilters)
    }
    function handleFilterUpdate(filterId, filterState){
        const newFilters = [... filters]
        const filter = newFilters.find(nf => nf.id === filterId);
        filter.props = filterState
        setFilters(newFilters)
    }

    function handleSaveClick(){
    
        const commonProps = {text: props.textSelection.text, extent:[props.textSelection.startIndex, props.textSelection.endIndex], blockKey:props.textSelection.blockKey, chartId: props.selectedChart.id};
        let dataProps={};
        let brushProps={};
        let rangeField = [];
        let range = [];
        filters.forEach(filter => {
            if (filter.props.features){
                dataProps = {feature:{field:filter.props.field}, values:filter.props.features.map(f=>f.value)}
            }
            if (filter.props.intervalValues){
                rangeField.push(filter.props.field)
                range.push(...filter.props.intervalValues)
            }
        })
        let link = createLink(commonProps, dataProps, brushProps, {rangeField, range});
        //TODO: why we must have a valid field in every selection!
        // if (!link['feature']) link['feature'] = {field: filters[0].props.field}

        const action = createLinks(props.currentDoc.id, [link]);
        console.log('Action', action)
        dispatch(setManualLinkId(action.links[0].id));
        dispatch(setTextSelection(null));
        dispatch(exitManualLinkMode(true));
        dispatch(action);
    }

    console.log('Filters in current state', filters)
    return (
        <React.Fragment>
            <Button onMouseDown={handleAddSelectionBtn}>+ Add Selection</Button>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <div>
                    {filters.length > 0 && filters.map((filter) => (
                        <Filter key={filter.id} 
                            chartProperties={chartProperties} 
                            viewData={props.viewData} 
                            id={filter.id} 
                            onDelete={handleFilterDelete} 
                            onFilterUpdate={handleFilterUpdate}/>
                    ))}
                    </div>
                </Grid>
            </Grid>
            {filters.length > 0 && <Button onMouseDown={handleSaveClick}>Save</Button>}
            {(props.textSelection && showField || props.showSelectedLinkSetting)  && <div className={classes.root}>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="age-native-simple">Axis</InputLabel>
                    <Select
                        native
                        value={axis}
                        onChange={handleAxisChange}
                    >
                        {axisOptions.map(ao => <option key={uniqueId(ao)} value={ao}>{ao}</option>)}
                    </Select>
                    <FormHelperText>Some important helper text</FormHelperText>
                </FormControl>
                {showSlider && <div><Typography id="range-slider" gutterBottom>
                    Interval range
                </Typography>
                <Slider
                    value={value}
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    aria-labelledby="range-slider"
                    // getAriaValueText={valuetext}
                    marks={marks}
                    min={marks[0].value}
                    max={marks[1].value}
                /> </div>}
                <Paper elevation={1}>
                    <ButtonGroup size="small" variant="text" fullWidth aria-label="small button group">
                        <Button onMouseDown={handleAcceptClick}>Save</Button>
                        <Button onMouseDown={handleResetClick}>Cancel</Button>
                    </ButtonGroup>
                </Paper>
            </div>}
            <Snackbar
                open={infoMsg !== null}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                autoHideDuration={5000}
                onClose={() => {
                    setInfoMsg(null);
                }}
                >
                <Alert severity="info">{infoMsg}</Alert>
            </Snackbar>
        </React.Fragment>
    );
}