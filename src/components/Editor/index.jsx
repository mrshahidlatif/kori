import React, { Fragment, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import {
    EditorState,
    AtomicBlockUtils,
    RichUtils,
    convertToRaw,
    convertFromRaw,
    Modifier,
    ContentState,
} from "draft-js";

import DraftEditor from "draft-js-plugins-editor";

import css from "./index.module.css";

import EditorToolbar, { EditorPlugins } from "components/EditorToolbar";

import SuggestionPanel from "components/SuggestionPanel";
import PotentialLinkControls from "components/PotentialLinkControls";

import { updateDoc, updateChartsInEditor } from "ducks/docs";
import { createLinks, createLink, deleteLink, getLinks } from "ducks/links";
import { getChartsInEditor, getCharts } from "ducks/charts";
import { setSelectedLink, setManualLinkId, exitManualLinkMode, setTextSelection } from "ducks/ui";

import editorDecorators from "utils/editorDecorators";
import findSuggestions from "utils/findSuggestions";
import searchLinks from "utils/searchLinks";
import insertLinks from "utils/insertLinks";
import getLastTypedWord from "utils/getLastTypedWord";
import getTextSelection from "utils/getTextSelection";
import highlightTextSelection from "utils/highlightTextSelection";
import deHighlightTextSelection from "utils/deHighlightTextSelection";
import getBlockText from "utils/getBlockText";
import filterAlreadyConfirmedLinksInEditor from "utils/filterAlreadyConfirmedLinksInEditor";
import nlp from "compromise";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "components/Alert";
import createLinkObject from "utils/createLink"

const AUTOMATIC_SUGGESTION_TIMEOUT = 5000;

export default function Editor(props) {
    const dispatch = useDispatch();
    let { docId } = useParams();
    const doc = useSelector((state) => state.docs[docId]);
    const charts = useSelector((state) => getCharts(state, docId));
    const storedEditorState = useSelector((state) => state.docs[docId].editorRawState);
    const chartsInEditor = useSelector((state) => getChartsInEditor(state, docId));
    const selectedLink = useSelector((state) => state.ui.selectedLink);
    const allLinks = useSelector((state) => getLinks(state,docId));
    const exitManualLink = useSelector((state) => state.ui.exitManualLink);
    const manualLinkId = useSelector((state) => state.ui.manualLinkId);
    const linkActiveNoAutoTrigger = useSelector((state) => state.ui.linkActiveNoAutoTrigger);
    const textSelectionInStore = useSelector((state) => state.ui.textSelection);

    const [tempTextSelection, setTempTextSelection] = useState(textSelectionInStore);
    const editorEl = useRef(null); //https://reactjs.org/docs/hooks-reference.html#useref
    const [suggestions, setSuggestions] = useState([]);
    const alreadySearchedSentences = useSelector((state) => state.docs[docId].searchedSentences);

    const contentState =
        storedEditorState === null
            ? EditorState.createEmpty().getCurrentContent()
            : convertFromRaw(storedEditorState);
    const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState));
    const [currentSelectionState, setCurrentSelectionState] = useState(null);
    const [currentBlock, setCurrentBlock] = useState(null);
    const [infoMsg, setInfoMsg] = useState(null);
    const [autoLinksToInsert, setAutoLinksToInsert] = useState([]);

    let interval = useRef();
    const startTimer = () => {
        interval = setInterval(() => {
            console.log("Checking for autosuggestions every:", AUTOMATIC_SUGGESTION_TIMEOUT);
            if (editorEl?.current?.props?.editorState)
                setCurrentBlock(getBlockText(editorEl.current.props.editorState));
        }, AUTOMATIC_SUGGESTION_TIMEOUT);
        return () => clearInterval(interval.current);
    };

    useEffect(() => {
        dispatch(exitManualLinkMode(false));
        setCurrentSelectionState(null);
        dispatch(setTextSelection(null));
        dispatch(setManualLinkId(null));
        startTimer();
        return () => clearInterval(interval.current);
    }, []);

    useEffect(() => {
        if (exitManualLink) {
            setEditorState(deHighlightTextSelection(currentSelectionState, editorState));
            editorEl.current.focus();
            dispatch(exitManualLinkMode(false));
            setCurrentSelectionState(null);
            //Quick and dirty fix! //Clearing Chart Selections
            window.dispatchEvent(new KeyboardEvent("keypress", { key: "a" }));
        }
    }, [exitManualLink]);

    useEffect(() => {
        if (exitManualLink && allLinks[manualLinkId] === undefined) {
            //clear selection in case no brushing and pressing 'Accept'
            setEditorState(deHighlightTextSelection(currentSelectionState, editorState));
            setCurrentSelectionState(null);
        }
        if (allLinks[manualLinkId]) {
            setEditorState(
                insertLinks([allLinks[manualLinkId]], editorState, currentSelectionState)
            );
            dispatch(setManualLinkId(null));
            setCurrentSelectionState(null);
            //Quick and dirty fix! //Clearing Chart Selections
            window.dispatchEvent(new KeyboardEvent("keypress", { key: "a" }));
        }
    }, [manualLinkId, exitManualLink]);

    useEffect(() => {
        const editorRawState = convertToRaw(editorState.getCurrentContent());
        dispatch(updateDoc(doc.id, { editorRawState }));
    }, [editorState]);

    useEffect(()=> {
        const entityMap = convertToRaw(editorState.getCurrentContent()).entityMap;
        let linkIdsToKeep = [];
        Object.keys(entityMap).forEach(function(key) {
            if(entityMap[key].type === "LINK"){
                if(allLinks[entityMap[key].data.id]){
                    linkIdsToKeep.push(entityMap[key].data.id);
                }
            }     
        });
        Object.keys(allLinks).forEach(function(key){
            if (!linkIdsToKeep.includes(key)){
                dispatch(deleteLink(key));
            }
        });

    },[Object.keys(convertToRaw(editorState.getCurrentContent()).entityMap).length]);

    useEffect(() => {
        const asyncExec = async () => {
            if (currentBlock !== null) {
                const blockText = currentBlock.blockText;
                if (linkActiveNoAutoTrigger) return;
                if (selectedLink) return;
                if (tempTextSelection || tempTextSelection == "INVALID") return;
                const sentences = await nlp(blockText).sentences().json();
                let allLinksInCurrentBlockText = [];
                let searchedSentences = [];
                for (let i = 0; i < sentences.length; i++) {
                    const { text } = sentences[i];
                    if (!text.includes(".")) continue;
                    if (alreadySearchedSentences?.includes(text)) continue;
                    searchedSentences.push(text);

                    const sentenceObject = {
                        text: text,
                        startIndex: blockText.indexOf(text),
                        endIndex: blockText.indexOf(text) + text.length,
                    };
                    if (chartsInEditor.length === 0) return;
                    const links = await searchLinks(sentenceObject.text, sentenceObject.startIndex, chartsInEditor, currentBlock.blockKey);
                    allLinksInCurrentBlockText = allLinksInCurrentBlockText.concat(links);
                }
                dispatch(
                    updateDoc(doc.id, {
                        searchedSentences: alreadySearchedSentences?.concat(searchedSentences),
                    })
                );
                if (allLinksInCurrentBlockText.length > 0) {
                    const rawEditorState = convertToRaw(editorState.getCurrentContent());
                    allLinksInCurrentBlockText = filterAlreadyConfirmedLinksInEditor(
                        rawEditorState,
                        allLinksInCurrentBlockText,
                        blockText
                    );
                    if (allLinksInCurrentBlockText.length > 0) {
                        // Remove duplicates if any
                        // TODO: Check why backend send duplicates in the first place
                        const seen = new Set();
                        allLinksInCurrentBlockText = allLinksInCurrentBlockText.filter(el => {
                            const duplicate = seen.has(el.startIndex);
                            seen.add(el.startIndex);
                            return !duplicate;
                          });
                        setAutoLinksToInsert(allLinksInCurrentBlockText);
                    }
                }
                setCurrentBlock(null);
            }
        };
        asyncExec();
    }, [currentBlock]);

    function handleEditorChange(editorState) {
        setEditorState(editorState);
        if(autoLinksToInsert.length>0){
            const action = createLinks(doc.id, autoLinksToInsert);
            console.log('LInks to be added', action)
            setEditorState(insertLinks(action.links, editorState));
            dispatch(action);

            setAutoLinksToInsert([]);
        }

        const editorRawState = convertToRaw(editorState.getCurrentContent());
        const lastTypedWord = getLastTypedWord(editorState);

        const allText = editorState.getCurrentContent().getPlainText(" ").trim();
        const updatedSearchedSentences = alreadySearchedSentences?.filter(
            (alreadySearchedSentence) => allText.includes(alreadySearchedSentence)
        );
        dispatch(
            updateDoc(doc.id, {
                searchedSentences: updatedSearchedSentences,
            })
        );

        //Enable SuggestionMenu on @
        if (lastTypedWord.text.startsWith("@")) {
            const suggestions = findSuggestions(
                chartsInEditor,
                lastTypedWord.text.slice(1),
                lastTypedWord.startIndex
            );

            setSuggestions(suggestions);
        } else {
            setSuggestions([]);
        }
        // TODO: see if we can catch an event for adding or removing a chart.
        // Updating charts in store when a chart is added to or removed from document
        const entityMap = editorRawState.entityMap;
        const numCharts = Object.keys(entityMap).length;
        if (numCharts !== chartsInEditor.length) {
            const ids = Object.values(entityMap).reduce((acc, entity) => {
                if (entity.type === "CHART") {
                    acc.push(entity.data.id);
                }
                return acc;
            }, []);
            dispatch(updateChartsInEditor(doc.id, ids));
        }
       
        const currentSelection = editorState.getSelection();
        const caretPosition = currentSelection.getAnchorOffset();
        const activeBlockKey = currentSelection.getAnchorKey();
        //Hide the link accept/delete button when cursor not in link range
        //TODO: what if selection spans more than one block?
        if (selectedLink && activeBlockKey) {
            if (
                activeBlockKey !== selectedLink.blockKey ||
                caretPosition < selectedLink.startIndex ||
                caretPosition > selectedLink.endIndex
            ) {
                dispatch(setSelectedLink(null));
            }
        }
        let textSelection = getTextSelection(
            editorState.getCurrentContent(),
            currentSelection,
            " " //delimiter
        );
  
        //Hide the floating controls when no text is selected
        setTempTextSelection(textSelection);

        //search for suggestions on text selection
        if (textSelection && textSelection != "INVALID") {
            const suggestions = findSuggestions(
                chartsInEditor,
                textSelection.text.trim(),
                textSelection.startIndex
            );
            suggestions.length !== 0
                ? setSuggestions(suggestions)
                : setSuggestions([{ text: "NoLinkFound!" }]);
        }

        const block = editorState.getCurrentContent().getBlockForKey(activeBlockKey);
        if (
            block.getType() === "unstyled" &&
            !exitManualLink &&
            currentSelectionState &&
            !tempTextSelection
        ) {
            dispatch(exitManualLinkMode(true));
            dispatch(setTextSelection(null));
        }
    }

    function handleKeyCommand(command) {
        // handle common key bindings (e.g., bold, italic, etc.)
        const newEditorState = RichUtils.handleKeyCommand(editorState, command);
        if (newEditorState) {
            setEditorState(newEditorState);
            return "handled";
        }
        return "not-handled";
    }
    function handleTab(e) {
        e.preventDefault();
        e.stopPropagation();
        setCurrentBlock(getBlockText(editorState));
        return "handled";
    }

    function handleDragOver(e) {
        // may need to throttle for performance
        e.preventDefault();
        e.stopPropagation();
        editorEl.current.focus();
        // e.persist(); //conflict with asynchronous setTimeout in throuttle:
        //https://stackoverflow.com/questions/38142880/react-js-throttle-mousemove-event-keep-throwing-event-persist-error
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const chartId = e.dataTransfer.getData("chartId");
        const chart = charts.find((d) => d.id === chartId);
        const exists = chartsInEditor.find((d) => d.id === chartId);
        if (chart && !exists) {
            insertChart(chart);
            e.dataTransfer.clearData();
        }
    }

    function insertChart(chart) {
        let contentState = editorState.getCurrentContent();

        contentState = contentState.createEntity("CHART", "IMMUTABLE", {
            id: chart.id, // wil get chart info from store
        });
        const entityKey = contentState.getLastCreatedEntityKey();
        const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, " ");
        setEditorState(newEditorState);
    }
    function handleBlur() {
        setSuggestions([]);
    }
    function handleSuggestionSelected(suggestion) {
        const commonProps = {text:suggestion.text, extent:[suggestion.startIndex, suggestion.startIndex + suggestion.text.length], blockKey:editorState.getSelection().getAnchorKey(), chartId: suggestion.chartId};
        const link = createLinkObject(commonProps,{ feature: suggestion.feature, values: [isNaN(Number(suggestion.text)) ? suggestion.text : Number(suggestion.text)]},{},'@');
        const action = createLink(doc.id, link); // need ids
        const newEditorState = insertLinks([action.attrs], editorState);
        dispatch(action);

        setSuggestions([]);
        setEditorState(newEditorState);
    }
    function handleCreateLinkSelect() {
        dispatch(exitManualLinkMode(false));
        setCurrentSelectionState(editorState.getSelection());
        setEditorState(highlightTextSelection(tempTextSelection, editorState));
        setInfoMsg(
            "Click on any chart avatar to begin linking!"
        );
    }

    function handleLinkDiscard(link) {
        //TODO: Some code is similar to insertLinks.js. Consider refactoring!
        const currentSelection = editorState.getSelection();
        let newContent = ContentState.createFromText("");
        const updateLinkExtent = getUpdatedLinkExtent(editorState);
        const insertTextSelection = currentSelection.merge({
            anchorOffset: updateLinkExtent.offset,
            focusOffset: updateLinkExtent.offset + updateLinkExtent.length,
        });
        newContent = Modifier.replaceText(
            editorState.getCurrentContent(),
            insertTextSelection,
            link.text,
            editorState.getCurrentInlineStyle(), //inline styling
        );
        let newEditorState = EditorState.push(editorState, newContent, "apply-entity");
        let newSelection = newEditorState.getSelection().merge({
            focusOffset: link.endIndex,
            anchorOffset: link.endIndex,
        });
        newEditorState = EditorState.moveSelectionToEnd(newEditorState);
        newEditorState = EditorState.forceSelection(newEditorState, newSelection);
        setEditorState(newEditorState);

        dispatch(deleteLink(link.id));
    }
    function getUpdatedLinkExtent(editorState){
        const editorRawState = convertToRaw(editorState.getCurrentContent());
        const currentSelection = editorState.getSelection();
        const BlkKey = currentSelection.getAnchorKey();
        const activeBlock = editorRawState.blocks.find(({key})=>key === BlkKey);
        const caretPosition = currentSelection.getAnchorOffset();
        const updateLinkExtent = activeBlock.entityRanges.find(er => (caretPosition >= er.offset && caretPosition <= er.offset + er.length));
        return updateLinkExtent; 
    }
    function handleLinkAccept(link) {
        const updateLinkExtent = getUpdatedLinkExtent(editorState);
        const confirmedLink = JSON.parse(JSON.stringify(link));
        confirmedLink.startIndex = updateLinkExtent.offset; 
        confirmedLink.endIndex = updateLinkExtent.offset + updateLinkExtent.length;
        confirmedLink.isConfirmed = true;
        setEditorState(insertLinks([confirmedLink], editorState));
    }
    function handlePastedText(text){
        //immediatly search for suggestions in pasted text
        //TODO: for now it only searches for links in the first pargraph immediately
        setCurrentBlock({blockText: text.split("\n")[0], blockKey:getBlockText(editorState).blockKey});
        return "not-handled";
    }

    return (
        <Fragment>
            {<EditorToolbar />}
            <div className={css.editor} onDragOver={handleDragOver} onDrop={handleDrop}>
                <DraftEditor
                    editorState={editorState}
                    plugins={EditorPlugins}
                    onChange={handleEditorChange}
                    onBlur={handleBlur}
                    handleKeyCommand={handleKeyCommand}
                    handlePastedText={handlePastedText}
                    stripPastedStyles={true}
                    decorators={editorDecorators}
                    ref={editorEl}
                    onTab={handleTab}
                    stripPastedStyles={true}
                />
            </div>
            {suggestions.length >= 1 && chartsInEditor.length > 0 && (
                <SuggestionPanel
                    suggestions={suggestions.filter((s) => s.text !== "NoLinkFound!")}
                    textSelection={tempTextSelection}
                    onSelected={handleSuggestionSelected}
                    onCreateLinkSelect={handleCreateLinkSelect}
                />
            )}
            <PotentialLinkControls
                textSelection={tempTextSelection}
                selectedLink={selectedLink}
                onDiscard={handleLinkDiscard}
                onAccept={handleLinkAccept}
            />
            <Snackbar
                open={infoMsg !== null}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                autoHideDuration={5000}
                onClose={() => {
                    setInfoMsg(null);
                }}
            >
                <Alert severity="info">{infoMsg}</Alert>
            </Snackbar>
        </Fragment>
    );
}

//Define the public proptypes of this componenet
Editor.propTypes = {
    editor: PropTypes.object,
    updateEditorState: PropTypes.func,
    addSelectedChart: PropTypes.func,
};
