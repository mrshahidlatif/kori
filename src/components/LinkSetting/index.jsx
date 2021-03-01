import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import TextField from '@material-ui/core/TextField';

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { useEffect } from "react";
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
      width: 300,
    },
  });

function valuetext(value) {
    return `${value}°C`;
}

export default function LinkSetting() {
    const classes = useStyles();
    const selectedLink = useSelector((state) => state.ui.selectedLink);
    const [value, setValue] = useState([20, 37]);
    const [marks, setMarks] = useState([{value:1, label:1}, {value:100, label:100}]);
    let isRangeLink = false;
    // let marks = [{value:1, label:1}, {value:100, label:100}];

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };


    if (selectedLink){
        isRangeLink = selectedLink.hasOwnProperty('rangeMin') || selectedLink.hasOwnProperty('rangeMax');
        console.log('Selected Link:', selectedLink, marks);
    }

    useEffect(() => {
        //Range Link Settings
        console.log('Link Changed...!')
        if(isRangeLink){
            setMarks([
                {
                value: selectedLink.rangeMin,
                label: selectedLink.rangeMin,
                },
                {
                value: selectedLink.rangeMax,
                label: selectedLink.rangeMax,
                },
            ]);
            setValue([selectedLink.rangeMin, selectedLink.rangeMax]);
        }
    }, [selectedLink]);

    
  
    return (
        <div className={classes.root}>
            <Typography id="range-slider" gutterBottom>
                Interval range
            </Typography>
            {isRangeLink && <Slider
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={valuetext}
                marks={marks}
            />}
      </div>
    );
}
