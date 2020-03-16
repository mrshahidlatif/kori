import { EditorState, Modifier } from "draft-js";

const insertSuggestion = (suggestionText, editorState) => {
  const currentContent = editorState.getCurrentContent(),
    currentSelection = editorState.getSelection();
  const end = currentSelection.getAnchorOffset();

  const anchorKey = currentSelection.getAnchorKey();
  const currentBlock = currentContent.getBlockForKey(anchorKey);
  const blockText = currentBlock.getText();
  const start = blockText.substring(0, end).lastIndexOf("@");

  const insertTextSelection = currentSelection.merge({
    anchorOffset: start,
    focusOffset: end
  });

  const newContent = Modifier.replaceText(
    currentContent,
    insertTextSelection,
    "@" + suggestionText + " "
  );
  console.log("new content", newContent);
  const newEditorState = EditorState.push(
    editorState,
    newContent,
    "insert-characters"
  );

  const updatedEditorState = EditorState.forceSelection(
    newEditorState,
    newContent.getSelectionAfter()
  );
  return updatedEditorState;
};

export default insertSuggestion;
