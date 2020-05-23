import React from "react";
// import { useDispatch, useSelector } from "react-redux";
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
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from "prop-types";


const SUGGESTION_LIMIT = 5;
export default function SuggestionPanel(props) {
  const selection = window.getSelection();
  const pos =
    selection.rangeCount > 0
      ? selection.getRangeAt(0).getBoundingClientRect()
      : null;

  const padding = 10;
  // const filteredSuggestions = useSelector(state=>state.ui.suggestions.listOfFilteredSuggestions);
  // const dispatch = useDispatch();

  // const suggestions = useSelector(state=>state.ui.suggestions);
  // function sendUpdatedEditorStateToEditor(newEditorState, newContent){
  //   props.suggestionCallback(newEditorState, newContent);
  // };

  function handleClick(suggestion, event) {
    console.log("handleClick", suggestion);
    event.preventDefault();
    event.stopPropagation();
    // const text = event.target.textContent;
    // const link = createTextLink(text);
    // dispatch(addTextLink(link));
    // const updatedEditorState = insertSuggestion(// TODO: should move to the editor?
    //   text,
    //   props.suggestionState
    // );
    // props.suggestionCallback(updatedEditorState, text);
    // dispatch(deactivateSuggestions());
    props.onSelected(suggestion);
  }
  // let cursor_position = props.caretPosition;
  // console.log('filteredSuggestions',filteredSuggestions, cursor_position);
  return pos ? (
    <Box
      zIndex="modal"
      left={pos.x + padding}
      top={pos.y + padding}
      className={css.suggestionPanel}
    >
      <Paper>
        <List>
          { // should we rank suggestions?
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
          ))}
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
