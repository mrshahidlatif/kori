import { Modifier, EditorState, ContentState } from "draft-js";

export default (textSelection, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();

    let newContent = currentContent.createEntity(`TEXT_SELECTION`, "MUTABLE", {
        ...textSelection,
    });

    let start = textSelection.startIndex;
    let end = textSelection.endIndex;

    if(textSelection.isBackward){
        start = textSelection.endIndex;
        end = textSelection.startIndex
    }

    const entityKey = newContent.getLastCreatedEntityKey();

    const insertTextSelection = currentSelection.merge({
        anchorOffset:start,
        focusOffset: end,
    });
    newContent = Modifier.replaceText(
        editorState.getCurrentContent(),
        insertTextSelection,
        textSelection.text,
        editorState.getCurrentInlineStyle(), //inline styling
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
