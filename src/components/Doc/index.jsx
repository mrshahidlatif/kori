import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import { Link as RouterLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { createDoc } from "ducks/docs";
import { SetCurrentDocId } from "ducks/ui";

const useStyles = makeStyles((theme) => ({
    button: {
        width: "100%",
        padding: theme.spacing(1),
        margin: theme.spacing(1),
    },
    paper: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: theme.palette.text.secondary,
        height: theme.spacing(16),
        width: "100%",
    },
}));

function Doc(props) {
    const classes = useStyles();
    const dispatch = useDispatch();

    function handleClick() {
        dispatch(SetCurrentDocId(props.docId));
    }

    return (
        <Button
            className={classes.button}
            component={RouterLink}
            to={`/docs/${props.docId}`}
            onClick={handleClick}
        >
            <Paper className={classes.paper} elevation={2}>
                {props.doc.title}
                <div></div>
            </Paper>
        </Button>
    );
}

export default Doc;
