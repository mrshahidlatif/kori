import { Modifier, EditorState } from "draft-js";
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
    const blockEndIndex = currentSelection.getAnchorOffset();

    let start = link.startIndex;
    let end = link.endIndex;
    if (start < 0) start = 0;

    let newContent = currentContent.createEntity(`LINK`, "MUTABLE", {
        ...link,
    });
    const entityKey = newContent.getLastCreatedEntityKey();
    const insertTextSelection = currentSelection.merge({
        anchorKey: link.blockKey,
        focusKey: link.blockKey,
        anchorOffset: start,
        focusOffset: end,
    });
    newContent = Modifier.replaceText(
        editorState.getCurrentContent(),
        insertTextSelection,
        link.text,
        editorState.getCurrentInlineStyle(), //inline styling
        entityKey
    );

    //Stop cursor from jumping to beginning of a line
    const caretNewIndex = end > blockEndIndex ? end : blockEndIndex;
    let newEditorState = EditorState.push(editorState, newContent, "apply-entity");
    let newSelection = newEditorState.getSelection().merge({
        anchorKey: activeBlockKey,
        focusKey: activeBlockKey,
        focusOffset: caretNewIndex,
        anchorOffset: caretNewIndex,
    });
    newEditorState = EditorState.moveSelectionToEnd(newEditorState);
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);
    return newEditorState;
};
