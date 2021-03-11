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
import TextField from '@material-ui/core/TextField';

import { setTextSelection, showLinkSettingFor } from "ducks/ui";
import { createLinks, updateLink } from "ducks/links";
import { setManualLinkId, exitManualLinkMode } from "ducks/ui";
import createLink from "utils/createLink"


const useStyles = makeStyles((theme) => ({
    root: {
      width: 300,
    },
  }));

export default function EditLinkSetting(props) {
    const dispatch = useDispatch();
    const classes = useStyles();
    let linkToUpdate = useSelector((state)=> state.ui.showLinkSettingFor);

    const [value, setValue] = useState([20, 37]);
    const [marks, setMarks] = useState([{value:1900, label:1900}, {value:2000, label:2000}]);
    const [axis, setAxis] = useState('');
    const [link, setLink]=useState(null);
    const [showSlider, setShowSlider]=useState(false);
    const [stringValues, setStringValues] = useState('Hello');
    

    const chartProperties = props.selectedChart.properties;
    let axisOptions = chartProperties.axes.map(axis => axis?.field);
    const featureFields = [...new Set(chartProperties.features.map((f) => f.field))];
    axisOptions = axisOptions.concat(featureFields);
    axisOptions = [...new Set(axisOptions)];

    const handleAxisChange = (event) => {
    }

    const handleChange = (event, newValue) => {
        // setValue(newValue);
        //TODO: send to createLink() for updating link
        // link['rangeField'] = {field:axis}
        // link['rangeMin'] = newValue[0];
        // link['rangeMax'] = newValue[1];
        // setLink(link);
      };
  
    function handleResetClick(event) {
    }
    function handleUpdateClick(event) {
        console.log('link to update', linkToUpdate, stringValues.toString().split('\n'));
        const data = stringValues.toString().split('\n');
        const action = updateLink(linkToUpdate.id, {data});
        dispatch(action);

        dispatch(showLinkSettingFor(null));
    }
    function handleTextChange(event){
        setStringValues(event.target.value);
        console.log(stringValues);
    }

    useEffect(()=>{
        setAxis(props.showLinkSettingFor?.feature?.field);

        if(!["ordinal", "band", "point", "string"].includes(props.showLinkSettingFor?.feature?.type)){
            //Handle interval links
            setShowSlider(true);
        }
        else{
            console.log('Link props updated.....', props.showLinkSettingFor.data)
            setStringValues(props.showLinkSettingFor.data);
        }
        
    },[props.showLinkSettingFor])
        

    return (
        <React.Fragment>
            {props.showLinkSettingFor  && <div className={classes.root}>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="age-native-simple">Link Field</InputLabel>
                    <Select
                        native
                        value={axis}
                        onChange={handleAxisChange}
                    >
                        {axisOptions.map(ao => <option key={uniqueId(ao)} value={ao}>{ao}</option>)}
                    </Select>
                    <FormHelperText>Some important helper text</FormHelperText>
                </FormControl>
                <FormControl fullWidth className={classes.margin}>
                    <TextField
                        id="standard-multiline-flexible"
                        label="Link Data"
                        multiline
                        rowsMax={4}
                        value={stringValues}
                        onChange={handleTextChange}
                        />
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
                        <Button onMouseDown={handleUpdateClick}>Update</Button>
                        <Button onMouseDown={handleResetClick}>Cancel</Button>
                    </ButtonGroup>
                </Paper>
            </div>}
        </React.Fragment>
    );
}