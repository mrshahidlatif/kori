import React, { Fragment } from "react";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import { useSelector, useDispatch } from "react-redux";
import { updateDoc } from "ducks/docs";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        marginBottom: theme.spacing(3),
    },
    // menuButton: {
    //   marginRight: theme.spacing(2),
    // },
    title: {
        flexGrow: 1,
    },
}));

export default function () {
    const classes = useStyles();
    const dispatch = useDispatch();
    const docId = useSelector((state) => state.ui.currentDocId);
    const doc = useSelector((state) => state.docs[docId]);

    function handleChange(e) {
        dispatch(updateDoc(docId, { title: e.target.value }));
    }
    return (
        <AppBar className={classes.root} position="static" color="inherit">
            <Toolbar variant="dense">
                {/* <Button  color="inherit" component={RouterLink} to="/docs">
        <Typography variant="h6" className={classes.title}>
        GORI
          </Typography>
        </Button> */}
                <Link
                    variant="h6"
                    className={classes.title}
                    underline="none"
                    color="inherit"
                    component={RouterLink}
                    to="/"
                >
                    GORI
                </Link>
                {/* <Typography variant="h6" className={classes.title} >

          
          </Typography> */}
                {docId && (
                    <TextField
                        value={doc.title}
                        onChange={handleChange}
                        size="small"
                        fullWidth
                        margin="dense"
                        variant="filled"
                        style={{ marginLeft: "100px", marginRight: "20px" }}
                        label="Document Title"
                    />
                )}
                <Button color="inherit" component={RouterLink} to="/docs">
                    Docs
                </Button>

                {docId && (
                    <Fragment>
                        <span style={{ marginLeft: "10px", marginRight: "10px" }}> | </span>
                        <Button color="inherit" component={RouterLink} to={`/docs/${docId}`}>
                            Edit
                        </Button>
                        <Button color="inherit" component={RouterLink} to={`/docs/${docId}/view`}>
                            View
                        </Button>
                    </Fragment>
                )}
            </Toolbar>
        </AppBar>
    );
}
