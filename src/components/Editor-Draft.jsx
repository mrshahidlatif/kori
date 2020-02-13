import React, { Fragment, Component } from "react";
import ReactDOM from "react-dom";
import editorStyles from "../editorStyles.css";
import "../Draft.css";

import { updateEditorState } from "../ducks/editor";
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
      <div className={editorStyles.headlineButtonWrapper}>
        <button onClick={this.onClick} className={editorStyles.headlineButton}>
          H
        </button>
      </div>
    );
  }
}

const toolbarPlugin = createToolbarPlugin();
const { Toolbar } = toolbarPlugin;
const plugins = [toolbarPlugin];

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }
  handleEditorChange = editorState => {
    this.setState({ editorState });
    const raw = convertToRaw(editorState.getCurrentContent());
    //Only storing the RAW data of the editor
    this.props.updateEditorState(raw);
    console.log("EDITOR RAW CONTENT", raw);
    console.log("RAW from STORE", this.props.editor.editor);
  };
  componentDidMount() {
    const rawEditorData = this.props.editor.editor;
    if (rawEditorData !== null) {
      const contentState = convertFromRaw(rawEditorData);
      this.setState({
        editorState: EditorState.createWithContent(contentState)
      });
    }
  }

  render() {
    // const { editorState } = this.state;
    return (
      <Fragment>
        <button onClick={this.insertBlock}>Insert block</button>
        <Editor
          editorState={this.state.editorState}
          placeholder="Start composing an interactive article!"
          onChange={this.handleEditorChange}
          blockRendererFn={blockRenderer}
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
      </Fragment>
    );
  }

  insertBlock = () => {
    const { editorState } = this.state;
    console.log("STATE Props", this.props.text.Charts);
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "TEST",
      "MUTABLE",
      { a: "b" }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    console.log("Entity Key", entityKey);
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    });
    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        " "
      )
    });
  };
}
const blockRenderer = contentBlock => {
  const type = contentBlock.getType();
  if (type === "atomic") {
    return {
      component: ChartComponent,
      editable: false
    };
  }
};

const ChartComponent = props => {
  console.log("Chart Props", props);
  return (
    <div style={{ border: "1px solid #f00" }}>
      <Chart />
    </div>
  );
};

//Define the public proptypes of this componenet
Editor.propTypes = {
  editor: PropTypes.object,
  updateEditorState: PropTypes.func
};
const mapStateToProps = (state, ownProps) => {
  console.log("MapStateToProps", state);
  return {
    ...state,
    editor: state
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators(
      {
        updateEditorState
      },
      dispatch
    )
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MyEditor);
