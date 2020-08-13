import { Modifier, EditorState, ContentState } from "draft-js";

export default (textSelection, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();

    let newContent = currentContent.createEntity(`TEXT_SELECTION`, "MUTABLE", {
        ...textSelection,
    });

    const entityKey = newContent.getLastCreatedEntityKey();

    const insertTextSelection = currentSelection.merge({
        anchorOffset: textSelection.startIndex,
        focusOffset: textSelection.endIndex,
    });
    newContent = Modifier.replaceText(
        editorState.getCurrentContent(),
        insertTextSelection,
        textSelection.text,
        [], //inline styling
        entityKey
    );
    let newEditorState = EditorState.push(editorState, newContent, "apply-entity");
    let newSelection = newEditorState.getSelection().merge({
        focusOffset: textSelection.endIndex,
        anchorOffset: textSelection.endIndex,
    });
    newEditorState = EditorState.moveSelectionToEnd(newEditorState);
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);
    return newEditorState;
};
