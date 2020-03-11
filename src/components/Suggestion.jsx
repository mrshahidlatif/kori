import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import css from "./Suggestion.module.css";
import {
  addTextLink,
  deactivateSuggestions,
  updateCurrentTextLink
} from "../ducks/ui";
import { EditorState, Modifier } from "draft-js";

class Suggestion extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  state = {};
  sendUpdatedEditorStateToEditor = (newEditorState, newContent) => {
    this.props.suggestionCallback(newEditorState, newContent);
  };

  insertTextLinkToEditor(text) {
    const editorState = this.props.suggestionState;
    const currentContent = editorState.getCurrentContent(),
      currentSelection = editorState.getSelection();
    const end = currentSelection.getAnchorOffset();

    const anchorKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(anchorKey);
    const blockText = currentBlock.getText();
    const start = blockText.substring(0, end).lastIndexOf("@");

    const insertTextSelection = currentSelection.merge({
      anchorOffset: start,
      focusOffset: end
    });

    const newContent = Modifier.replaceText(
      currentContent,
      insertTextSelection,
      "@" + text + " "
    );
    const newEditorState = EditorState.push(
      editorState,
      newContent,
      "insert-characters"
    );

    const updatedEditorState = EditorState.forceSelection(
      newEditorState,
      newContent.getSelectionAfter()
    );
    this.sendUpdatedEditorStateToEditor(updatedEditorState, newContent);
  }
  handleClick(event) {
    var text = event.target.textContent;

    // this.props.updateCurrentTextLink(text);
    //Types of possible links: point, multipoint, group, range, series
    //TODO: Replace this logic with the suggestion functionality
    //The following logic is just to text various link types for generalizing vega signals
    //create and store the link
    var data = text;
    var type = "point";
    var chartId = 4;

    if (text == "M") {
      data = ["A", "B"];
      type = "multipoint";
    } else if (text == "R") {
      data = [50, 100];
      type = "range";
    } else if (text == "S") {
      data = 1;
      chartId = 3;
      type = "point";
    }

    let link = {
      linkId: text,
      data: data,
      chartId: chartId,
      active: false,
      type: type
    };
    this.props.addTextLink(link);
    this.insertTextLinkToEditor(text);
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
                class="list-group-item list-group-item-action"
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
    ...bindActionCreators(
      { addTextLink, deactivateSuggestions, updateCurrentTextLink },
      dispatch
    )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Suggestion);
