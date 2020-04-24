import nlp from "compromise";
//It returns the desired text along with it's position (startOffset and endOffset) in editor
export default (editorState) => {
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(blockKey);
    const caretOffset = currentSelection.getAnchorOffset();
    const blockTextBeforeCaret = currentBlock.getText().substr(0, caretOffset);
    const end = currentSelection.getAnchorOffset();
    if (blockTextBeforeCaret.charAt(blockTextBeforeCaret.length - 1) === ".") {
        const lastSentence = nlp(blockTextBeforeCaret).sentences().slice(-1).text();
        const start = end - lastSentence.length;
        if (lastSentence.indexOf(".") > -1)
            return {
                text: lastSentence,
                startIndex: start,
                endIndex: end,
            };
        else return null;
    }
    return null;
};
