//https://github.com/facebook/draft-js/issues/442#issuecomment-223816158
//TODO: Maybe follow the next comment (on the above) and use getContentStateFragment function!

export default (contentState, selection, blockDelimiter) => {
    let start = 0;
    let end = 0;
    blockDelimiter = blockDelimiter || "\n";
    var startKey = selection.getStartKey();
    var endKey = selection.getEndKey();
    var blocks = contentState.getBlockMap();

    var lastWasEnd = false;
    var selectedBlock = blocks
        .skipUntil(function (block) {
            return block.getKey() === startKey;
        })
        .takeUntil(function (block) {
            var result = lastWasEnd;

            if (block.getKey() === endKey) {
                lastWasEnd = true;
            }

            return result;
        });

    const text = selectedBlock
        .map(function (block) {
            var key = block.getKey();
            var text = block.getText();

            start = 0;
            end = text.length;

            if (key === startKey) {
                start = selection.getStartOffset();
            }
            if (key === endKey) {
                end = selection.getEndOffset();
            }
            text = text.slice(start, end);
            return text;
        })
        .join(blockDelimiter);
    return start !== end ? { text: text, startIndex: start, endIndex: end } : null;
};
