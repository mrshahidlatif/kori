import React, { Fragment, Component } from "react";
import "../css-draftjs/Draft.css";
// import "../css-draftjs/inline-toolbar-plugin.css";
import "../css-draftjs/static-toolbar-plugin.css";
import "../css-draftjs/editorStyles.css";

import { updateEditorState } from "../ducks/editor";
import {
  addSelectedChart,
  updateCursorPosition,
  updateEditorPosition,
  updateSuggestionList
} from "../ducks/ui";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

import {
  EditorState,
  EditorBlock,
  AtomicBlockUtils,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  ContentState
} from "draft-js";
import Editor, { createEditorStateWithText } from "draft-js-plugins-editor";
import createToolbarPlugin, { Separator } from "draft-js-static-toolbar-plugin";
import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton
} from "draft-js-buttons";
import Chart from "./Chart";
import VisPanel from "./VisPanel";
import Suggestion from "./Suggestion";

class HeadlinesPicker extends Component {
  componentDidMount() {
    setTimeout(() => {
      window.addEventListener("click", this.onWindowClick);
    });
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.onWindowClick);
  }

  onWindowClick = () =>
    // Call `onOverrideContent` again with `undefined`
    // so the toolbar can show its regular content again.
    this.props.onOverrideContent(undefined);

  render() {
    const buttons = [HeadlineOneButton, HeadlineTwoButton, HeadlineThreeButton];
    return (
      <div>
        {buttons.map((
          Button,
          i // eslint-disable-next-line
        ) => (
          <Button key={i} {...this.props} />
        ))}
      </div>
    );
  }
}

class HeadlinesButton extends Component {
  onClick = () =>
    // A button can call `onOverrideContent` to replace the content
    // of the toolbar. This can be useful for displaying sub
    // menus or requesting additional information from the user.
    this.props.onOverrideContent(HeadlinesPicker);

  render() {
    return (
      <div className="headlineButtonWrapper">
        <button onClick={this.onClick} className="headlineButton">
          H
        </button>
      </div>
    );
  }
}
const toolbarPlugin = createToolbarPlugin();
const { Toolbar } = toolbarPlugin;
const plugins = [toolbarPlugin];

const ChartBlock = ({
  contentState,
  block,
  blockProps: { content },
  ...rest
}) => {
  return (
    <div>
      <Chart specs={content.chartData.specs} data={content.chartData.data} />
    </div>
  );
};

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      cursorPositionInEditor: {},
      editorPosition: {}
    };
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }
  handleEditorChange = editorState => {
    this.setState({ editorState });
    const rawContent = convertToRaw(editorState.getCurrentContent());
    //Only storing the RAW data of the editor

    this.props.updateEditorState(rawContent);

    const blocks = rawContent.blocks;
    const allText = blocks
      .map(block => (!block.text.trim() && "\n") || block.text)
      .join("\n");

    // console.log("Typed Text in Editor", allText);
    var allFeatures = [];
    if (
      Object.keys(rawContent.entityMap).length !=
        Object.keys(this.props.editor.entityMap).length &&
      Object.keys(rawContent.entityMap).length > 0
    ) {
      //get chart features and update them in the Redux Store
      Object.keys(rawContent.entityMap).map(function(key) {
        var id = rawContent.entityMap[key].data.content.id;

        var featuers = this.parseChartForFeatures(id);

        allFeatures = allFeatures.concat(featuers);
      }, this);
      this.props.updateSuggestionList(allFeatures);
    } else if (Object.keys(rawContent.entityMap).length == 0) {
      this.props.updateSuggestionList();
    }

    //Computing the position of cursor relative to viewport for showing suggestions
    //https://github.com/facebook/draft-js/issues/45

    var selectionState = editorState.getSelection();
    var anchorKey = selectionState.getAnchorKey();
    var currentContent = editorState.getCurrentContent();
    var currentContentBlock = currentContent.getBlockForKey(anchorKey);
    var start = selectionState.getStartOffset();
    var end = selectionState.getEndOffset();
    var selectedText = currentContentBlock.getText().slice(start, end);
    if (start > 0) {
      var selection = window.getSelection();
      if (selection.anchorNode == null) return;
      var range = selection.getRangeAt(0);
      var cursorPosition = range.getBoundingClientRect();
      cursorPosition = JSON.parse(JSON.stringify(cursorPosition));
      this.setState({ cursorPositionInEditor: cursorPosition });
      this.props.updateCursorPosition(cursorPosition);
    }
  };
  componentDidMount() {
    const rawEditorData = this.props.editor;
    const contentState = convertFromRaw(rawEditorData);
    this.setState({
      editorState: EditorState.createWithContent(contentState)
    });

    var editorNode = document.getElementById("mainEditor");
    var editorPosition = editorNode.getBoundingClientRect();
    editorPosition = JSON.parse(JSON.stringify(editorPosition));
    this.setState({ editorPosition: editorPosition });
    this.props.updateEditorPosition(editorPosition);
  }
  render() {
    return (
      <div className="row">
        <div className="col">
          <VisPanel />
        </div>
        <div className="col-10 editor" id="mainEditor">
          <Editor
            editorState={this.state.editorState}
            placeholder="Start composing an interactive article!"
            onChange={this.handleEditorChange}
            blockRendererFn={this.blockRendererFn}
            plugins={plugins}
            ref={element => {
              this.editor = element;
            }}
          />
          <Toolbar>
            {// may be use React.Fragment instead of div to improve perfomance after React 16
            externalProps => (
              <div>
                <BoldButton {...externalProps} />
                <ItalicButton {...externalProps} />
                <UnderlineButton {...externalProps} />
                <CodeButton {...externalProps} />
                <Separator {...externalProps} />
                <HeadlinesButton {...externalProps} />
                <UnorderedListButton {...externalProps} />
                <OrderedListButton {...externalProps} />
                <BlockquoteButton {...externalProps} />
                <CodeBlockButton {...externalProps} />
              </div>
            )}
          </Toolbar>
        </div>
        <button onClick={this.insertChart}>Add VIS</button>
        <Suggestion />
      </div>
    );
  }
  //Parsing ChartInEditor for extracting chart features from vegalite specs
  parseChartForFeatures = chartId => {
    let chart = this.props.charts.byId[chartId];
    let encodings = chart.specs.encoding;
    let data = chart.Data;
    var features = [];
    //Extract dimensions from Vega Specifications
    Object.keys(encodings).forEach(function(key) {
      //   console.log(key, encodings[key].field);
      features.push(encodings[key].field);
    });
    return features;
  };

  insertChart = () => {
    const { editorState } = this.state;
    let content = editorState.getCurrentContent();

    //Adding a random chart on button click!
    //Needs to replace with drag and drop feature!
    var chartId = Math.floor(Math.random() * 2) + 1;
    this.props.addSelectedChart(chartId);

    content = content.createEntity("CHART", "IMMUTABLE", {
      content: { chartData: this.props.charts.byId[chartId], id: chartId }
    });
    const entityKey = content.getLastCreatedEntityKey();
    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        " "
      )
    });
  };
  blockRendererFn = block => {
    const { editorState } = this.state;
    const content = editorState.getCurrentContent();

    if (block.getType() === "atomic") {
      const entityKey = block.getEntityAt(0);
      const entity = content.getEntity(entityKey);
      const entityData = entity.getData() || { content: "" };

      if (entity != null && entity.getType() === "CHART") {
        return {
          component: ChartBlock,
          props: {
            data: this.props.charts.byId,
            ...entityData
          }
        };
      }
    }
  };
}
//Define the public proptypes of this componenet
Editor.propTypes = {
  editor: PropTypes.object,
  updateEditorState: PropTypes.func,
  addSelectedChart: PropTypes.func
};
const mapStateToProps = (state, ownProps) => {
  return state;
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators(
      {
        updateEditorState,
        addSelectedChart,
        updateCursorPosition,
        updateEditorPosition,
        updateSuggestionList
      },
      dispatch
    )
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MyEditor);
