import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
// import TextField from '@material-ui/core/TextField';
import ChartGallery from 'components/ChartGallery';
import Editor from 'components/Editor';
import {
    useParams
} from "react-router-dom";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {openDoc} from 'ducks/ui';


export default function Edit(props){
    const dispatch = useDispatch();
    let { docId } = useParams();
    

    let currentDocId = useSelector(state=>state.ui.currentDocId);
    console.log('currentDocId',currentDocId)
    if (!currentDocId){// when directly opening the doc using url
        dispatch(openDoc(docId));
    }


    return (
    <Grid container spacing={2} >
        <Grid item xs={4}>
            <Typography variant="overline" display="block" gutterBottom>
                Chart Gallery
            </Typography>
            <ChartGallery/>
        </Grid>
        <Grid item xs={8}>
            {/* <Typography variant="overline" display="block" gutterBottom>
                Document Editor
            </Typography> */}
            {/* <TextField id="standard-basic" size="small" label="Document Title" fullWidth 
                value={doc.title} onChange={handleChange} margin="normal"/> */}
           <Editor/>
        </Grid>
    </Grid>
    )
}