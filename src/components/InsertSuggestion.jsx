import { EditorState, Modifier, Entity } from "draft-js";

const insertSuggestion = (suggestionText, editorState) => {
  const entityKey = Entity.create("Link", "MUTABLE", "");

  const currentContent = editorState.getCurrentContent(),
    currentSelection = editorState.getSelection(),
    end = currentSelection.getAnchorOffset();

  const anchorKey = currentSelection.getAnchorKey();
  const currentBlock = currentContent.getBlockForKey(anchorKey);
  const blockText = currentBlock.getText();
  const start = blockText.substring(0, end).lastIndexOf("@");

  const insertTextSelection = currentSelection.merge({
    anchorOffset: start,
    focusOffset: end
  });

  let newContent = Modifier.replaceText(
    editorState.getCurrentContent(),
    insertTextSelection,
    suggestionText,
    ["BOLD"],
    entityKey
  );

  //add a white space after the entity
  //Recommendation by Draftjs community!
  const blockKey = insertTextSelection.getAnchorKey();
  const blockSize = editorState
    .getCurrentContent()
    .getBlockForKey(blockKey)
    .getLength();
  if (blockSize === end) {
    newContent = Modifier.insertText(
      newContent,
      newContent.getSelectionAfter(),
      " "
    );
  }

  // const newContent = Modifier.replaceText(
  //   currentContent,
  //   insertTextSelection,
  //   "@" + suggestionText + " "
  // );

  const newEditorState = EditorState.push(
    editorState,
    newContent,
    "insert-link"
  );

  const updatedEditorState = EditorState.forceSelection(
    newEditorState,
    newContent.getSelectionAfter()
  );
  return updatedEditorState;
};

export default insertSuggestion;
