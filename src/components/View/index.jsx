import React from "react";
import Viewer from "components/Viewer";

import Grid from "@material-ui/core/Grid";

export default function Edit(props) {
    return (
        <Grid container spacing={2}>
            <Grid item xs={8}>
                <Viewer viewMode={true} />
            </Grid>
        </Grid>
    );
}
