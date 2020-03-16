import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import css from "./Suggestion.module.css";
import { addTextLink, deactivateSuggestions } from "../ducks/ui";
import { EditorState, Modifier } from "draft-js";
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
    var editor_position = this.props.ui.editorPosition;
    var cursor_position = this.props.ui.cursorPositionInEditor;
    if (
      this.props.ui.suggestions.isActive &&
      this.props.ui.suggestions.listOfSuggestions != undefined
    ) {
      return (
        <div
          style={{
            left: cursor_position.x,
            top: cursor_position.y
          }}
          className={css.suggestionPanel}
        >
          <ul className={"list-group"}>
            {this.props.ui.suggestions.listOfSuggestions.map(s => (
              <button
                onClick={this.handleClick}
                type="button"
                className={
                  this.props.ui.suggestions.listOfSuggestions.indexOf(s) ==
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
  return state;
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators({ addTextLink, deactivateSuggestions }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Suggestion);
