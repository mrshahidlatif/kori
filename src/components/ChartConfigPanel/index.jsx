import React, { useState } from "react";
import css from "./index.module.css";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MenuItem from '@material-ui/core/MenuItem';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { updateChart } from 'ducks/charts';


export default function ChartConfigPanel(props) {
    const dispatch = useDispatch();
    const channelOptions = {
        opacity: { active: 1.0, inactive: 0.1 },
        fill: { active: '#1f77b4', inactive: '#c7c7c7' }
    }
    const colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5',
        '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
    const highlight = props.chart.highlight;
    const [active, setActive] = useState(highlight.active); // necessary for handling intermediate changes
    const [inactive, setInactive] = useState(highlight.inactive); // to prevent constant flickering chart updates
    function handleChannelChange(event) {
        // setChannel(event.target.value);
        const channel = event.target.value;

        if (channel !== highlight.channel) {
            const option = channelOptions[channel];
            setActive(option.active);
            setInactive(option.inactive);
            dispatch(updateChart(props.chart.id, { highlight: { channel, ...channelOptions[channel] } }));
        }
    }
    function handleActiveChange(event, newValue) {
        setActive(newValue);
    }
    function handleInactiveChange(event, newValue) {
        setInactive(newValue);
    }
    function handleActiveChangeCommitted(event, newValue) {
        setActive(newValue);
        dispatch(updateChart(props.chart.id, { highlight: { ...highlight, active: newValue } }));

    }
    function handleInactiveChangeCommitted(event, newValue) {
        setInactive(newValue);
        dispatch(updateChart(props.chart.id, { highlight: { ...highlight, inactive: newValue } }));
    }
    return (
        <Box
            zIndex="modal"
            className={css.panel}
            top={50}
            left={'50%'}
            onMouseDown={e => e.stopPropagation()}
        >
            <Box component={Paper} p={2}>
                <Grid container direction="column" spacing={2}>
                    <Grid item>
                        <Typography gutterBottom>
                            Highlight Option
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="caption">
                            Channel
                        </Typography>
                        <Box>
                            <Select
                                value={highlight.channel}
                                onChange={handleChannelChange}
                            >
                                {Object.keys(channelOptions).map(option =>
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                )}

                            </Select>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Typography variant="caption">
                            Active
                        </Typography>
                        {(highlight.channel === 'opacity') ?

                            <Slider
                                value={active}
                                aria-labelledby="discrete-slider"
                                valueLabelDisplay="auto"
                                min={0.0}
                                max={1.0}
                                step={0.05}
                                onChange={handleActiveChange}
                                onChangeCommitted={handleActiveChangeCommitted}
                            /> :
                            <Box className={css.picker}>
                            {colors.map(color=><Box className={css.color} bgcolor={color} border={color===active?1:0}
                                onMouseUp={e=>handleActiveChangeCommitted(e, color)}/>)}
                            </Box>
                        }
                        <Typography variant="caption">
                            Inactive
                        </Typography>
                        {(highlight.channel === 'opacity') ?
                            <Slider
                                value={inactive}
                                aria-labelledby="discrete-slider"
                                valueLabelDisplay="auto"
                                min={0.0}
                                max={1.0}
                                step={0.05}
                                onChange={handleInactiveChange}
                                onChangeCommitted={handleInactiveChangeCommitted}
                            /> :
                            <Box className={css.picker}>
                            {colors.map(color=><Box className={css.color} bgcolor={color} border={color===inactive?1:0}
                                onMouseUp={e=>handleInactiveChangeCommitted(e, color)}/>)}
                            </Box>
                        }
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}

ChartConfigPanel.propTypes = {
    chart: PropTypes.object,
    onUpdated: PropTypes.func,
};
