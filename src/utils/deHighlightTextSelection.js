import { Modifier, EditorState } from "draft-js";

export default (currentSelectionState, editorState) => {
    if (!currentSelectionState) return;
    const currentContentState = editorState.getCurrentContent();

    const newContentState = Modifier.applyEntity(currentContentState, currentSelectionState, null);
    let newEditorState = EditorState.push(editorState, newContentState, "apply-entity");

    const newCaretPosition = Math.max(
        currentSelectionState.getAnchorOffset(),
        currentSelectionState.getFocusOffset()
    );

    const newSelection = newEditorState.getSelection().merge({
        focusOffset: newCaretPosition,
        anchorOffset: newCaretPosition,
    });
    newEditorState = EditorState.moveSelectionToEnd(newEditorState);
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);

    return newEditorState;
};
