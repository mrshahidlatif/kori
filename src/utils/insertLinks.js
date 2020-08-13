import { Modifier, EditorState } from "draft-js";
export default (links, editorState, currentSelection) => {
    links.forEach((link) => {
        editorState = insertLink(link, editorState, currentSelection);
    });
    return editorState;
};
export const insertLink = (link, editorState, currentSelection) => {
    //TODO: remove duplicates
    const currentContent = editorState.getCurrentContent();
    console.log("jcurrent selection", currentSelection);
    currentSelection = currentSelection || editorState.getSelection();
    const blockEndIndex = currentSelection.getAnchorOffset();
    const blockKey = currentSelection.getAnchorKey();
    let start = link.startIndex;
    let end = link.endIndex;
    if (start < 0) start = 0;

    //TODO: properly fix this object not extensible problem!
    link = JSON.parse(JSON.stringify(link));
    link["blockKey"] = blockKey;

    let newContent = currentContent.createEntity(`LINK`, "MUTABLE", {
        ...link,
    });
    const entityKey = newContent.getLastCreatedEntityKey();

    const insertTextSelection = currentSelection.merge({
        anchorOffset: start,
        focusOffset: end,
    });
    newContent = Modifier.replaceText(
        editorState.getCurrentContent(),
        insertTextSelection,
        link.text,
        [], //inline styling
        entityKey
    );
    const caretNewIndex = end > blockEndIndex ? end : blockEndIndex;
    let newEditorState = EditorState.push(editorState, newContent, "apply-entity");
    let newSelection = newEditorState.getSelection().merge({
        focusOffset: caretNewIndex,
        anchorOffset: caretNewIndex,
    });
    newEditorState = EditorState.moveSelectionToEnd(newEditorState);
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);
    return newEditorState;
};
