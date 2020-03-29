import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import css from "./Suggestion.module.css";
import { addTextLink, deactivateSuggestions } from "../ducks/ui";
import insertSuggestion from "./InsertSuggestion";
import createTextLink from "./CreateTextLink";
import { ListGroup } from "react-bootstrap";
import uuid from "react-uuid";

class Suggestion extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  state = {};
  sendUpdatedEditorStateToEditor = (newEditorState, newContent) => {
    this.props.suggestionCallback(newEditorState, newContent);
  };
  handleClick(event) {
    event.preventDefault();
    const text = event.target.textContent;
    const link = createTextLink(text);
    this.props.addTextLink(link);
    const updatedEditorState = insertSuggestion(
      text,
      this.props.suggestionState
    );
    this.sendUpdatedEditorStateToEditor(updatedEditorState, text);
    this.props.deactivateSuggestions();
  }
  render() {
    let cursor_position = this.props.caretPosition;
    let { isActive, filteredSuggestions } = this.props;
    if (isActive && filteredSuggestions.length > 0) {
      return (
        <div
          style={{
            left: cursor_position === undefined ? 0 : cursor_position.x,
            top: cursor_position === undefined ? 0 : cursor_position.y
          }}
          className={css.suggestionPanel}
        >
          <ListGroup>
            {filteredSuggestions.map(s => (
              <ListGroup.Item
                key={uuid()}
                action
                variant="dark"
                onMouseDown={this.handleClick}
                className={
                  filteredSuggestions.indexOf(s) ===
                  this.props.focussedSuggestionIndex
                    ? "list-group-item-action active dark"
                    : "list-group-item-action"
                }
              >
                {s}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      );
    } else if (isActive && filteredSuggestions.length === 0)
      return (
        <ListGroup
          className={css.suggestionPanel}
          style={{
            left: cursor_position === undefined ? 0 : cursor_position.x,
            top: cursor_position === undefined ? 0 : cursor_position.y
          }}
        >
          <ListGroup.Item variant="dark">No suggestion found!</ListGroup.Item>
        </ListGroup>
      );
    return null;
  }
}

//Define the public proptypes of this componenet
const mapStateToProps = (state, ownProps) => {
  let filteredSuggestions = state.ui.suggestions.listOfFilteredSuggestions;
  let isActive = state.ui.suggestions.isActive;
  return { filteredSuggestions, isActive };
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators({ addTextLink, deactivateSuggestions }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Suggestion);
