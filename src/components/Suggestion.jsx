import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import css from "./Suggestion.module.css";

class Suggestion extends Component {
  constructor(props) {
    super(props);
  }
  state = { listOfSuggestions: [] };

  // getAllChartsFeatures(chartsInEditorIds) {
  //   var allFeatures = [];
  //   chartsInEditorIds.forEach(id => {
  //     var features = this.parseChartForFeatures(id);
  //     allFeatures = allFeatures.concat(features);
  //   });
  //   return allFeatures;
  // }
  render() {
    var editor_position = this.props.ui.editorPosition;
    var cursor_position = this.props.ui.cursorPositionInEditor;
    if (this.props.ui.listOfSuggestions != undefined) {
      return (
        <div
          style={{
            left: cursor_position.x,
            top: cursor_position.y
          }}
          className={css.suggestionPanel}
        >
          <ul className={"list-group"}>
            {this.props.ui.listOfSuggestions.map(s => (
              <button
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
    ...bindActionCreators({}, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Suggestion);
