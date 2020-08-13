import { Modifier, EditorState, ContentState } from "draft-js";

export default (currentSelectionState, editorState) => {
    var currentContentState = editorState.getCurrentContent();

    var newContentState = Modifier.applyEntity(currentContentState, currentSelectionState, null);
    var newEditorState = EditorState.push(editorState, newContentState, "apply-entity");

    newEditorState = EditorState.moveSelectionToEnd(newEditorState);
    // newEditorState = EditorState.forceSelection(newEditorState, editorState.getSelection());
    return newEditorState;
};
