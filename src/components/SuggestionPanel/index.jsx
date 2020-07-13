import React from "react";
import { useDispatch, useSelector } from "react-redux";
import css from "./index.module.css";
// import { addTextLink, deactivateSuggestions } from "../ducks/ui";
// import insertSuggestion from "utils/insertSuggestion";
// import createTextLink from "utils/createTextLink";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import PropTypes from "prop-types";

import { setTextSelection } from "ducks/ui";

const SUGGESTION_LIMIT = 5;
export default function SuggestionPanel(props) {
    const dispatch = useDispatch();
    const selection = window.getSelection();
    const pos = selection.rangeCount > 0 ? selection.getRangeAt(0).getBoundingClientRect() : null;

    const padding = 10;

    function handleClick(suggestion, event) {
        event.preventDefault();
        event.stopPropagation();
        props.onSelected(suggestion);
    }

    function handleCreateLink() {
        dispatch(setTextSelection(props.textSelection));
        props.onCreateLinkSelect();
    }
    return pos ? (
        <Box
            zIndex="modal"
            left={pos.x + padding}
            top={pos.y + padding}
            className={css.suggestionPanel}
        >
            <Paper>
                <ListItem key={"visLink"} button dense onMouseDown={handleCreateLink}>
                    <ListItemAvatar>
                        <Avatar alt="chart" src={process.env.PUBLIC_URL + "/" + "linkIcon.png"} />
                    </ListItemAvatar>
                    Create a link
                </ListItem>
                <List>
                    {
                        // should we rank suggestions

                        props.suggestions.slice(0, SUGGESTION_LIMIT).map((suggestion, i) => (
                            <ListItem
                                key={i}
                                button
                                dense
                                onMouseDown={handleClick.bind(null, suggestion)}
                            >
                                <ListItemAvatar>
                                    <Avatar alt="chart" src={suggestion.thumbnail} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={suggestion.text}
                                    secondary={
                                        <Typography component="span" variant="caption">
                                            {suggestion.chartId}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))
                    }
                </List>
            </Paper>
        </Box>
    ) : (
        ""
    );
}

SuggestionPanel.propTypes = {
    suggestions: PropTypes.array,
    onSelected: PropTypes.func,
};
