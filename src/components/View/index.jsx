import React from "react";
import { useDispatch } from "react-redux";
import Viewer from "components/Viewer";

import Grid from "@material-ui/core/Grid";
import { setViewMode } from "ducks/ui";

export default function View(props) {
    console.log("Viewer Mode Active!!!");

    const dispatch = useDispatch();
    dispatch(setViewMode(true));

    return (
        <Grid container spacing={2}>
            <Grid item xs={8}>
                <Viewer viewMode={true} />
            </Grid>
        </Grid>
    );
}
