import { Modifier, EditorState} from 'draft-js'
export default (links, editorState, method="Auto")=>{
  links.forEach(link=>{
    editorState = insertLink(link, editorState, method)
  });
  return editorState;
}
export const insertLink = (link, editorState, method="Auto")=>{
    //TODO: BUGFIX: Doesn't work as expected when block starts with a link or when the link contains one character

    //TODO: prevent duplicate
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(blockKey);
    const end = currentSelection.getAnchorOffset();
    let start = end - link.text.length;
    if (start < 0) start = 0;
    let newContent = currentContent.createEntity(`LINK`, "MUTABLE", {
        ...link,
        method // do we need to know this?
    });
    const entityKey = newContent.getLastCreatedEntityKey();

    console.log('start, end', start, end, link.text);
    const insertTextSelection = currentSelection.merge({
      anchorOffset: start,
      focusOffset: end
    });
    newContent = Modifier.replaceText(
      editorState.getCurrentContent(),
      insertTextSelection,
      link.text,
      [], //inline styling
      entityKey
    );
    //add a white space after the entity
    //Recommendation by Draftjs community!
    const blockSize = currentBlock.getLength();
    if (blockSize === end) {
      newContent = Modifier.insertText(
        newContent,
        newContent.getSelectionAfter(),
        " "
      );
    }
    const newEditorState = EditorState.push(
      editorState,
      newContent,
      "apply-entity"
    );
    return newEditorState;
  }