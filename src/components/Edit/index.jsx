import React from 'react';
// import TextField from '@material-ui/core/TextField';
import ChartGallery from 'components/ChartGallery';
import Editor from 'components/Editor';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';


export default function Edit(props){

    return (
    <Grid container spacing={2} >
        <Grid item xs={4}>
            <Typography variant="overline" display="block" gutterBottom>
                Chart Gallery
            </Typography>
            <ChartGallery/>
        </Grid>
        <Grid item xs={8}>
           <Editor/>
        </Grid>
    </Grid>
    )
}