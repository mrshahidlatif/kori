export default (editorState) => {
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(blockKey);
    const blockTextBeforeCaret = currentBlock.getText();

    return blockTextBeforeCaret;
};
