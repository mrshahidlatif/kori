import React, { Fragment, Component } from "react";
import "../css-draftjs/Draft.css"; //this should be imported from node modules
import "../css-draftjs/static-toolbar-plugin.css";
import "../css-draftjs/alignment-tool-plugin.css";
import "../css-draftjs/focus-plugin.css";
import "../css-draftjs/editorStyles.css";
import FuzzySet from "fuzzyset.js";

import { updateEditorState } from "../ducks/editor";
import insertSuggestion from "./InsertSuggestion";
import updateChartSpecsWithSignals from "../utils/addSignalToChartSpecs";
import extractChartFeatures from "../utils/extractChartFeatures";
import {
  addSelectedChart,
  updateSuggestionList,
  deactivateSuggestions,
  addTextLink
} from "../ducks/ui";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";

import {
  EditorState,
  Modifier,
  AtomicBlockUtils,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
  Entity
} from "draft-js";
import Editor, { composeDecorators } from "draft-js-plugins-editor";
import createToolbarPlugin, { Separator } from "draft-js-static-toolbar-plugin";
import createAlignmentPlugin from "draft-js-alignment-plugin";
import createFocusPlugin from "draft-js-focus-plugin";
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
import LinkText from "./LinkText";
import decorateComponentWithProps from "../utils/decorate_component_with_props";
import createTextLink from "./CreateTextLink";
import Link from "./ManualLink";
import AutoLink from "./AutoLink";
import throttle from 'utils/throttle';
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
        ))}3
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
const focusPlugin = createFocusPlugin();
const alignmentPlugin = createAlignmentPlugin();
const { AlignmentTool } = alignmentPlugin;
const { Toolbar } = toolbarPlugin;
const decorator = composeDecorators(
  alignmentPlugin.decorator,
  focusPlugin.decorator
);

const ChartBlock = ({
  block, // eslint-disable-line no-unused-vars
  blockProps, // eslint-disable-line no-unused-vars
  customStyleMap, // eslint-disable-line no-unused-vars
  customStyleFn, // eslint-disable-line no-unused-vars
  decorator, // eslint-disable-line no-unused-vars
  forceSelection, // eslint-disable-line no-unused-vars
  offsetKey, // eslint-disable-line no-unused-vars
  selection, // eslint-disable-line no-unused-vars
  tree, // eslint-disable-line no-unused-vars
  contentState, // eslint-disable-line no-unused-vars
  style,
  blockProps: { content },
  ...elementProps
}) => {
  return (
    //TODO: BUG: Text Wrap controls doesn't work as expected! perhaps the problem is with the css files and styles!
    //TODO: Make the width of this div fit to the contents. At the moment it is hard-coded!
    <div
      {...elementProps}
      style={{ maxWidth: 500, backgroundColor: "none", ...style }}
    >
      <Chart id={content.id} specs={content.chartData} />
    </div>
  );
};

//Alignment controls for the charts in document
const createChartBlockPlugin = (config = {}) => {
  const component = config.decorator
    ? config.decorator(ChartBlock)
    : ChartBlock;
  return {
    blockRendererFn: (block, { getEditorState }) => {
      if (block.getType() === "atomic") {
        const contentState = getEditorState().getCurrentContent();
        const entity = contentState.getEntity(block.getEntityAt(0));

        const type = entity.getType();
        if (type === "CHART") {
          return {
            component,
            editable: false
          };
        }
      }
      return null;
    }
  };
};

const chartBlockPlugin = createChartBlockPlugin({ decorator });
const plugins = [focusPlugin, alignmentPlugin, chartBlockPlugin, toolbarPlugin];

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    const compositeDecorator = new CompositeDecorator([
      {
        strategy: handleStrategy,
        component: LinkText // decorateComponentWithProps(LinkText, EditorState)
      },
      {
        strategy: findLinkEntities,
        component: Link
      },
      {
        strategy: findAutoLinkEntities,
        component: AutoLink
      }
    ]);
    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
      caretPosition: {},
      focussedSuggestionIndex: 0,
      lastTypedWord: "",
      numberOfChartsInEditor: 0
    };
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.onDownArrow = this.onDownArrow.bind(this);
    this.onUpArrow = this.onUpArrow.bind(this);
    this.handleReturn = this.handleReturn.bind(this);
    this.onTab = this.onTab.bind(this);
    this.onEscape = this.onEscape.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragOverThrottled = throttle(this.handleDragOverThrottled.bind(this));//this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }
  callbackFunction = (newEditorState, newContent) => {
    this.setState({ editorState: newEditorState });
  };
  handleEditorChange = editorState => {
    this.setState({ editorState: editorState });
    const rawContent = convertToRaw(editorState.getCurrentContent());
    //Only storing the RAW data of the editor
    //TODO: PERFORMANCE: Do not push data to store on each key store: It is slowing down the whole thing!
    this.props.updateEditorState(rawContent);

    const blocks = rawContent.blocks;

    //AUTOMATIC LINKING WHEN THE USER IS TYPING
    //Get the last word user typed before pressing the space
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(blockKey);
    const caretOffset = currentSelection.getAnchorOffset();
    let blockTextBeforeCaret = currentBlock.getText().substr(0, caretOffset);
    let lastWord = blockTextBeforeCaret.split(" ").slice(-2)[0];

    //check if the word exists in list of suggestions
    //Condition [blockTextBeforeCaret.split(" ").length > 1] waits for the space key to run the auto-link code!
    if (
      this.props.ui.suggestions.listOfSuggestions && this.props.ui.suggestions.listOfSuggestions.length > 0 &&
      blockTextBeforeCaret.split(" ").length > 1
    ) {
      const suggestionList = this.props.ui.suggestions.listOfSuggestions;
      let fs = FuzzySet(suggestionList);
      let closestSuggestion =
        fs.get(lastWord, "", 0.7).length > 0
          ? fs.get(lastWord, "", 0.7)[0][1]
          : lastWord;
      if (
        suggestionList.indexOf(closestSuggestion) !== -1 &&
        lastWord !== this.state.lastTypedWord
      ) {
        this.insertAutomaticLink(lastWord);
        this.setState({ lastTypedWord: lastWord });
      }
    }
    //Updating charts in store when a chart is added to or removed from document
    let updatedNumberOfCharts = Object.keys(rawContent.entityMap).length;
    if (updatedNumberOfCharts !== this.state.numberOfChartsInEditor) {
      var ids = [];
      Object.keys(rawContent.entityMap).map(function(key) {
        if (rawContent.entityMap[key].type === "CHART") {
          var id = rawContent.entityMap[key].data.content.id;
          ids.push(id);
        }
      }, this);
      this.props.addSelectedChart(ids);
      this.setState({ numberOfChartsInEditor: updatedNumberOfCharts });
    }

    //Computing the position of cursor relative to viewport for showing suggestions
    //https://github.com/facebook/draft-js/issues/45
    const selection = window.getSelection();
    let caretPosition = this.getCaretPosition(selection);
    if (caretPosition !== null) {
      this.setState({ caretPosition: caretPosition });
    }
  };
  getCaretPosition(selection) {
    if (selection.anchorNode === null) return;
    let range = selection.getRangeAt(0);
    let cursorPosition = range.getBoundingClientRect();
    cursorPosition = JSON.parse(JSON.stringify(cursorPosition));
    //https://github.com/facebook/draft-js/blob/master/src/component/selection/getVisibleSelectionRect.js
    // When a re-render leads to a node being removed, the DOM selection will
    // temporarily be placed on an ancestor node, which leads to an invalid
    // bounding rect. Discard this state.
    if (
      cursorPosition.top === 0 &&
      cursorPosition.right === 0 &&
      cursorPosition.bottom === 0 &&
      cursorPosition.left === 0
    ) {
      return null;
    }
    return cursorPosition;
  }
  onUpArrow(keyboardEvent) {
    keyboardEvent.preventDefault();

    if (this.state.focussedSuggestionIndex - 1 < 0) {
      this.setState({
        focussedSuggestionIndex:
          this.props.ui.suggestions.listOfFilteredSuggestions.length - 1
      });
    } else {
      this.setState({
        focussedSuggestionIndex:
          (this.state.focussedSuggestionIndex - 1) %
          this.props.ui.suggestions.listOfFilteredSuggestions.length
      });
    }
  }

  onDownArrow(keyboardEvent) {
    keyboardEvent.preventDefault();
    this.setState({
      focussedSuggestionIndex:
        (this.state.focussedSuggestionIndex + 1) %
        this.props.ui.suggestions.listOfFilteredSuggestions.length
    });
  }
  handleReturn() {
    //TODO: Fix this! It is not working at the moment!
    return true;
  }

  onTab(keyboardEvent) {
    keyboardEvent.preventDefault();
    const suggestionText = this.props.ui.suggestions.listOfFilteredSuggestions[
      this.state.focussedSuggestionIndex
    ];
    const newEditorState = insertSuggestion(
      suggestionText,
      this.state.editorState
    );
    this.setState({
      editorState: newEditorState,
      lastTypedWord: suggestionText
    });
    this.props.deactivateSuggestions();

    const link = createTextLink(suggestionText);
    this.props.addTextLink(link);
  }
  onEscape(keyboardEvent) {
    keyboardEvent && keyboardEvent.preventDefault();
    this.props.deactivateSuggestions();
  }

  onBlur() {
    //TODO: BUG The following logic doesn't work well with the click on suggestion item. Probably because that is implemented in a different Component
    // this.props.deactivateSuggestions();
  }

  onFocus() {}
  insertAutomaticLink(text) {
    //TODO: BUGFIX: Doesn't work as expected when block starts with a link or when the link contains one character
    const { editorState } = this.state;
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(blockKey);
    const end = currentSelection.getAnchorOffset();
    let start = end - text.length;
    if (start < 0) start = 0;
    const entityKey = Entity.create("Auto-Link", "MUTABLE", "");

    const insertTextSelection = currentSelection.merge({
      anchorOffset: start,
      focusOffset: end
    });
    let newContent = Modifier.replaceText(
      editorState.getCurrentContent(),
      insertTextSelection,
      text,
      [], //inline styling
      entityKey
    );
    //add a white space after the entity
    //Recommendation by Draftjs community!
    const blockSize = editorState
      .getCurrentContent()
      .getBlockForKey(blockKey)
      .getLength();
    if (blockSize === end) {
      newContent = Modifier.insertText(
        newContent,
        newContent.getSelectionAfter(),
        " "
      );
    }
    const newEditorState = EditorState.push(
      editorState,
      newContent,
      "insert-auto-link"
    );
    this.setState({
      editorState: newEditorState
    });
    const link = createTextLink(
      text,
      this.props.ui.suggestions.listOfSuggestions
    );
    this.props.addTextLink(link);
  }

  componentDidMount() {
    const rawEditorData = this.props.editor;
    const contentState = convertFromRaw(rawEditorData);
    this.setState({
      editorState: EditorState.createWithContent(contentState),
      lastTypedWord: ""
    });

    let editorNode = document.getElementById("mainEditor");
    let editorPosition = editorNode.getBoundingClientRect();
    editorPosition = JSON.parse(JSON.stringify(editorPosition));
  }
  handleDragOver(e){// may need to throttle for performance
    e.preventDefault();
    e.stopPropagation();
    e.persist();//conflict with asynchronous setTimeout in throuttle:
    //https://stackoverflow.com/questions/38142880/react-js-throttle-mousemove-event-keep-throwing-event-persist-error 
    this.handleDragOverThrottled(e);
  }
  handleDragOverThrottled(e){
    // e.dataTransfer.dropEffect = "copy";
    // console.log('mouse', this.state.editorState.getSelection());
    this.editor.focus();

    // let editorState = EditorState.moveSelectionToEnd(this.state.editorState);//.getSelection();
    // this.setState({
    //   editorState
    // });
    
    // console.log('dragging chart over', e, e.dataTransfer.getData('chartId'));
  }
  handleDrop(e){
    e.preventDefault();
    e.stopPropagation();
    let chartId = e.dataTransfer.getData('chartId');
    if (chartId){
      console.log('handleDrop, chartId', chartId);
      this.insertChart(chartId);
      e.dataTransfer.clearData();
    }
  }
  render() {
    const additionalProps = (() => {
      if (this.props.ui.suggestions.isActive) {
        return {
          onDownArrow: this.onDownArrow,
          onUpArrow: this.onUpArrow,
          handleReturn: this.handleReturn,
          onEscape: this.onEscape,
          onBlur: this.onBlur,
          onFocus: this.onFocus,
          onTab: this.onTab
        };
      } else {
        return {
          onDownArrow: undefined,
          onUpArrow: undefined,
          handleReturn: undefined,
          onEscape: undefined,
          onTab: undefined,
          onBlur: this.onBlur,
          onFocus: this.onFocus
        };
      }
    })();
    return (
      <div className="row">
        <div className="col-3">
          <VisPanel />
          {/* <button
            className={"btn btn-primary btn-lg"}
            onClick={this.insertChart}
          >
            Add VIS
          </button> */}
        </div>
        <div className="col-9 editor" id="mainEditor"
            onDragOver = {this.handleDragOver}
            onDrop={this.handleDrop}>
          <Editor

            editorState={this.state.editorState}
            placeholder="Start composing an interactive article!"
            onChange={this.handleEditorChange}
            stripPastedStyles={true}
            blockRendererFn={this.blockRendererFn}
            plugins={plugins}
            {...additionalProps}
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
          <AlignmentTool />
        </div>
        <Suggestion
          suggestionCallback={this.callbackFunction}
          suggestionState={this.state.editorState}
          focussedSuggestionIndex={this.state.focussedSuggestionIndex}
          caretPosition={this.state.caretPosition}
        />
      </div>
    );
  }
  insertChart = (chartId) => {
    const { editorState } = this.state;
    let content = editorState.getCurrentContent();

    //Adding a random chart on button click!
    //TODO: Needs to replace with drag and drop feature!
    // var chartId = Math.floor(Math.random() * (4 - 3 + 1) + 3);
    // let chartId = 5;
    let chart = this.props.charts.byId[chartId];
    let chartFeatures = extractChartFeatures(chart);
    this.props.updateSuggestionList(chartFeatures);
    let editorChartId = "e" + chartId; //appending an e to distinguish it from the one in VisPanel

    //Update Chart Specs with Signal Information
    let newChartSpecs = updateChartSpecsWithSignals(
      this.props.charts.byId[chartId].specs,
      this.props.charts.byId[chartId].type
    );

    content = content.createEntity("CHART", "IMMUTABLE", {
      content: {
        chartData: newChartSpecs,
        id: editorChartId
      }
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
          editable: false,
          props: {
            data: this.props.charts.byId,
            ...entityData
          }
        };
      }
    }
  };
}

/**
 * Super simple decorators for handles and hashtags, for demonstration
 * purposes only. Don't reuse these regexes.
 */
//TODO: REGEX needs to be improved and crafted to our use case!
const HANDLE_REGEX = /\@[\w]+/g;

function handleStrategy(contentBlock, callback, contentState) {
  findWithRegex(HANDLE_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "Link"
    );
  }, callback);
}
function findAutoLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "Auto-Link"
    );
  }, callback);
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
        updateSuggestionList,
        deactivateSuggestions,
        addTextLink
      },
      dispatch
    )
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MyEditor);
