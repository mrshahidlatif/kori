import { Modifier, EditorState } from "draft-js";
import getLastTypedWord from "./getLastTypedWord";
export default (links, editorState) => {
    links.forEach((link) => {
        editorState = insertLink(link, editorState);
    });
    return editorState;
};
export const insertLink = (link, editorState) => {

    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const activeBlockKey = currentSelection.getAnchorKey();
    const activeBlockEndIndex = currentSelection.getAnchorOffset();

    let start = link.startIndex;
    let end = link.endIndex;
    if (start < 0) start = 0;

    let newContent = currentContent.createEntity(`LINK`, "MUTABLE", {
        ...link,
    });
    const entityKey = newContent.getLastCreatedEntityKey();

    const insertLinkSelection = currentSelection.merge({
        anchorKey: link.blockKey,
        focusKey: link.blockKey,
        anchorOffset: start,
        focusOffset: end,
    });
    
    const insertSuggestionSelection =  editorState.getSelection().merge({
        anchorOffset: getLastTypedWord(editorState).startIndex
    });

    newContent = Modifier.replaceText(
        editorState.getCurrentContent(),
        link?.trigger === "@" ? insertSuggestionSelection : insertLinkSelection,
        link.text,
        editorState.getCurrentInlineStyle(), //inline styling
        entityKey
    );

    //Stop cursor from jumping to beginning of a line
    const caretPosition = end > activeBlockEndIndex ? end : activeBlockEndIndex;
    let newEditorState = EditorState.push(editorState, newContent, "insert-characters");
    let newSelection = newEditorState.getSelection().merge({
        anchorKey: activeBlockKey,
        focusKey: activeBlockKey,
        focusOffset: caretPosition,
        anchorOffset: caretPosition,
    });
    newEditorState = EditorState.moveSelectionToEnd(newEditorState);
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);
    return newEditorState;
};
