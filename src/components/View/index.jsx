import React from "react";
import Editor from "components/Editor";

import Grid from "@material-ui/core/Grid";

export default function Edit(props) {
    return (
        <Grid container spacing={2}>
            <Grid item xs={8}>
                <Editor viewMode={true} />
            </Grid>
        </Grid>
    );
}
