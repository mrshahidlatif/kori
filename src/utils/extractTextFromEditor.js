import nlp from "compromise";

//It returns the desired text along with it's position (startOffset and endOffset) in editor
export default (editorState, type) => {
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();
    const blockKey = currentSelection.getAnchorKey();
    const currentBlock = currentContent.getBlockForKey(blockKey);
    const caretOffset = currentSelection.getAnchorOffset();
    const blockTextBeforeCaret = currentBlock.getText().substr(0, caretOffset);
    const end = currentSelection.getAnchorOffset();
    switch (type) {
        case "WORD":
            const lastWord = blockTextBeforeCaret.split(" ").slice(-1).pop();
            const start = end - lastWord.length;
            return {
                text: lastWord,
                startIndex: start,
                endIndex: end,
            };
            break;
        case "SENTENCE":
            if (blockTextBeforeCaret.charAt(blockTextBeforeCaret.length - 1) === ".") {
                const text = nlp(blockTextBeforeCaret);
                let sentences = text.json().map((o) => o.text);
                const lastSentence = sentences.slice(-1).pop();
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
        default:
            break;
    }
};
