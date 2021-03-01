import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { useEffect } from "react";
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { getChartsInEditor, getCharts } from "ducks/charts";
import { ChartSetting } from "components/ChartSetting";

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
    largeAvatar: {
        width: theme.spacing(7),
        height: theme.spacing(7),
      },
  }));

export default function LinkSetting() {
    const classes = useStyles();
    let { docId } = useParams();
    const doc = useSelector((state) => state.docs[docId]);
    const charts = useSelector((state) => getCharts(state, docId));
    const chartsInEditor = useSelector((state) => getChartsInEditor(state, docId));

    const selectedLink = useSelector((state) => state.ui.selectedLink);
    const textSelection = useSelector((state) => state.ui.textSelection);

    const [selectedChart, setSelectedChart] = useState(null);
    const [collapseChart, setCollapseChart] = useState(false);

    let isRangeLink = false;
    let createNewLink = false;

    if(textSelection) {
        createNewLink = true; 
    }

    if (selectedLink){
        isRangeLink = selectedLink.hasOwnProperty('rangeMin') || selectedLink.hasOwnProperty('rangeMax');
        console.log('Selected Link:', selectedLink);
    }

    function handleChartAvatarClick(chart){
        setSelectedChart(chart);
        setCollapseChart(!collapseChart);   
    }
  
    return createNewLink ? (
        <div className={classes.root}>
            <div className={classes.chartAvatars}>
                {chartsInEditor.map((chart) => (
                    <Avatar key={chart.id} src={chart.thumbnail} variant='rounded' className={classes.largeAvatar} onClick={() => handleChartAvatarClick(chart)} />
                ))}
            </div>
            {selectedChart && collapseChart && <ChartSetting textSelection={textSelection} chart={selectedChart} />}
      </div>
    ): "";
}