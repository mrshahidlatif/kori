import React from "react";
import { useDispatch } from "react-redux";
// import TextField from '@material-ui/core/TextField';
import ChartGallery from "components/ChartGallery";
import Editor from "components/Editor";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { setViewMode } from "ducks/ui";
import { useEffect } from "react";
import LinkSetting from "components/LinkSetting";
import HelpIcon from '@material-ui/icons/Help';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

export default function Edit(props) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setViewMode(false));
    }, []);

    return (
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <div style={{display:'flex'}}>
                <Typography variant="overline" display="block" gutterBottom>
                    Chart Gallery
                </Typography>
                <Tooltip placement='right-start' title="Drop VegaLite specifications to add charts!">
                    <IconButton style={{marginTop:'-8px'}} size="small" aria-label="help">
                        <HelpIcon />
                    </IconButton>
                </Tooltip>
                </div>
                <ChartGallery />
            </Grid>
            <Grid item xs={8}>
                <Editor />
            </Grid>
            <Grid item xs={2}>
                <LinkSetting />
            </Grid>
        </Grid>
    );
}
