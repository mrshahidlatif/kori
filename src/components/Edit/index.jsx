import React from "react";
import { useDispatch } from "react-redux";
// import TextField from '@material-ui/core/TextField';
import ChartGallery from "components/ChartGallery";
import Editor from "components/Editor";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { setViewMode } from "ducks/ui";
import { useEffect } from "react";

export default function Edit(props) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setViewMode(false));
    }, []);

    return (
        <Grid container spacing={2}>
            <Grid item xs={2}>
                <Typography variant="overline" display="block" gutterBottom>
                    Chart Gallery
                </Typography>
                <ChartGallery />
            </Grid>
            <Grid item xs={8}>
                <Editor />
            </Grid>
        </Grid>
    );
}
