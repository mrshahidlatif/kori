import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import css from "./Suggestion.module.css";
import { addTextLink, deactivateSuggestions } from "../ducks/ui";
import insertSuggestion from "./InsertSuggestion";
import createTextLink from "./CreateTextLink";

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
    const text = event.target.textContent;
    const link = createTextLink(text);
    this.props.addTextLink(link);
    // this.insertTextLinkToEditor(text);
    const updatedEditorState = insertSuggestion(
      text,
      this.props.suggestionState
    );
    this.sendUpdatedEditorStateToEditor(updatedEditorState);
    //deactivating the suggestions panels
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
          <ul className={"list-group"}>
            {filteredSuggestions.map(s => (
              <button
                onClick={this.handleClick}
                type="button"
                className={
                  filteredSuggestions.indexOf(s) ===
                  this.props.focussedSuggestionIndex
                    ? "list-group-item list-group-item-action active"
                    : "list-group-item list-group-item-action"
                }
              >
                {s}
              </button>
            ))}
          </ul>
        </div>
      );
    }
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
