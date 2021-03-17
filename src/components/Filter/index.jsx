import React, { useEffect, useState, useRef } from "react";

import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import uniqueId from "utils/uniqueId";
import Slider from '@material-ui/core/Slider';
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "components/Alert";

const useStyles = makeStyles((theme) => ({
    root: {
      width: 300,
    },
  }));

export default function Filter(props) {
    const classes = useStyles();
    const [axis, setAxis] = useState('')
    const [value, setValue] = React.useState(null);
    const [textValue, setTextValue] = React.useState(null);
    const [marks, setMarks] = useState([{value:1900, label:1900}, {value:2000, label:2000}]);
    const [showSlider, setShowSlider]=useState(false);
    const [infoMsg, setInfoMsg] = useState(null);
    const [pointFeatures, setPointFeatures] = useState([])

    const {chartProperties} = props;
    let filterOptions = chartProperties.axes.map(axis => axis?.field);
    const featureFields = [...new Set(chartProperties.features.map((f) => f.field))];
    filterOptions = filterOptions.concat(featureFields);
    filterOptions = [...new Set(filterOptions)];
    
    function handleFilterChange(event){
        const filterField = event.target.value;
        showRightControlsForFilter(filterField);
    }

    function showRightControlsForFilter(filterField) {
        setAxis(filterField);
        const axisObj = getFilterFieldByName(chartProperties.axes, filterField);

        if (!["ordinal", "band", "point"].includes(axisObj?.type)) {
            const min = getMin(props.viewData, filterField);
            const max = getMax(props.viewData, filterField);
            if (min instanceof Date) {
                const newMarks = [{ value: min.getTime(), label: min.toLocaleString() }, { value: max.getTime(), label: max.toLocaleString() }];
                setMarks(newMarks);
                setValue([newMarks[0].value, newMarks[1].value]);
            }
            else {
                const newMarks = [{ value: min, label: min.toLocaleString() }, { value: max, label: max.toLocaleString() }];
                setMarks(newMarks);
                setValue([newMarks[0].value, newMarks[1].value]);
            }
            setTextValue(null);
            setShowSlider(true);
        }
        if (!axisObj || ["ordinal", "band", "point"].includes(axisObj?.type)) {
            let axisFeatures = chartProperties?.features.filter(f => f?.field === filterField);
            setPointFeatures(axisFeatures);
            setValue(null);
            setShowSlider(false);
        }
    }

    function handleSliderChange(event, newValue){
        setValue(newValue);
    }

    function getFilterFieldByName(axes, name){
        //TODO: handle if matches to title or field
        const axisObj = axes.find(a => a?.field === name);
        return axisObj;
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

    function handleTagsChange(event, values){
        if(values) setTextValue(values)
    }

    useEffect(()=>{
        //Send data back to ManualLinkControl component
        props.onFilterUpdate(props.id, {field: axis, intervalValues:value, features:textValue});
    }, [value, textValue])

    useEffect(()=>{
        console.log('Just once, the chart is loaded or chaned.', axis)
        showRightControlsForFilter(filterOptions[0])
    },[])
  
    return (
      <React.Fragment>
        <Grid container spacing={1}>
            <Grid item xs={1}>
                <IconButton aria-label="close" className={classes.margin} size="small">
                    <CloseIcon fontSize="inherit" onMouseDown={() => props.onDelete(props.id)}/>
                </IconButton>
            </Grid>
            <Grid item xs={6}>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="age-native-simple">Field</InputLabel>
                    <Select
                        native
                        value={axis}
                        onChange={handleFilterChange}
                    >
                        {filterOptions.map(o => <option key={uniqueId(o)} value={o}>{o}</option>)}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
        <Grid container spacing={1}>
            <Grid item xs={1}></Grid>
            <Grid item xs={10}>
            {!showSlider && <Autocomplete
                    multiple
                    id="combo-box-demo"
                    options={pointFeatures}
                    getOptionLabel={(option) => option?.value}
                    onChange={handleTagsChange}
                    // style={{ width: 200 }}
                    size="small"
                    renderInput={(params) => <TextField {...params} label="Select Values" variant="outlined" />}
                />}
            </Grid>
        </Grid>
        <Grid container spacing={1}>
            <Grid item xs={1}></Grid>
            <Grid item xs={10}>
                {showSlider &&
                    <Slider
                        value={value}
                        onChange={handleSliderChange}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        marks={marks}
                        min={marks[0]?.value}
                        max={marks[1]?.value}
                    /> }
            </Grid>
      </Grid>
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