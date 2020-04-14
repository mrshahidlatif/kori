export default (editorState)=>{
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(blockKey);
    const caretOffset = currentSelection.getAnchorOffset();
    const blockTextBeforeCaret = currentBlock.getText().substr(0, caretOffset);
    const lastWord = blockTextBeforeCaret.split(" ").slice(-1).pop();
    return lastWord;
};