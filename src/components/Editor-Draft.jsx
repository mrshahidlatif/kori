import React, { Fragment, Component } from "react";
import "../css-draftjs/Draft.css";
// import "../css-draftjs/inline-toolbar-plugin.css";
import "../css-draftjs/static-toolbar-plugin.css";
import "../css-draftjs/editorStyles.css";

import { updateEditorState } from "../ducks/editor";
import { addSelectedChart } from "../ducks/ui";

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
      <Chart specs={content.specs} data={content.data} />
    </div>
  );
};

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
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

    console.log("Typed Text in Editor", allText);
  };
  componentDidMount() {
    const rawEditorData = this.props.editor;
    const contentState = convertFromRaw(rawEditorData);
    this.setState({
      editorState: EditorState.createWithContent(contentState)
    });
  }
  render() {
    return (
      <div className="row">
        <div className="col">
          <VisPanel />
        </div>
        <div className="col-10 editor">
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
      </div>
    );
  }

  insertChart = () => {
    const { editorState } = this.state;
    let content = editorState.getCurrentContent();

    //Adding a random chart on button click!
    //Needs to replace with drag and drop feature!
    var chartId = Math.floor(Math.random() * 2) + 1;
    this.props.addSelectedChart(chartId);

    content = content.createEntity("CHART", "IMMUTABLE", {
      content: this.props.charts.byId[chartId]
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
        addSelectedChart
      },
      dispatch
    )
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MyEditor);
