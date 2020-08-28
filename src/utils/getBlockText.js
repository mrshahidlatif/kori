export default (editorState) => {
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(blockKey);
    const blockText = currentBlock.getText();

    return blockText;
};
