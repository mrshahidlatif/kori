export default (editorState) => {
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(blockKey);
    const caretOffset = currentSelection.getAnchorOffset();
    const blockTextBeforeCaret = currentBlock.getText().substr(0, caretOffset);
    const end = currentSelection.getAnchorOffset();

    const lastWord = blockTextBeforeCaret.split(" ").slice(-1).pop();
    const start = end - lastWord.length;
    return {
        text: lastWord,
        startIndex: start,
        endIndex: end,
    };
};
