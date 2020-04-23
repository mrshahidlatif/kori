import { Modifier, EditorState, SelectionState } from "draft-js";
export default (links, editorState, method = "Auto") => {
    links.forEach((link) => {
        editorState = insertLink(link, editorState, method);
    });
    return editorState;
};
export const insertLink = (link, editorState, method = "Auto") => {
    //TODO: remove duplicates
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockEndIndex = currentSelection.getAnchorOffset();
    const start = link.startIndex;
    const end = link.endIndex;
    if (start < 0) start = 0;
    let newContent = currentContent.createEntity(`LINK`, "MUTABLE", {
        ...link,
        method, // do we need to know this?
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
    let newEditorState = EditorState.push(editorState, newContent, "apply-entity");
    let newSelection = newEditorState.getSelection().merge({
        focusOffset: blockEndIndex,
        anchorOffset: blockEndIndex,
    });
    newEditorState = EditorState.moveSelectionToEnd(newEditorState);
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);
    console.log("LAST LINK INDEX", blockEndIndex);
    return newEditorState;
};
