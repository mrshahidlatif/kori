export default (rawEditorState, allLinksInCurrentBlockText) => {
    const entityMap = { ...rawEditorState.entityMap };
    allLinksInCurrentBlockText = allLinksInCurrentBlockText.filter((linkInCurrentBlockText) => {
        let shouldKeep = true;
        Object.keys(entityMap).forEach(function (key) {
            if (entityMap[key].type === "LINK") {
                if (
                    entityMap[key].data.isConfirmed &&
                    entityMap[key].data.text === linkInCurrentBlockText.text
                ) {
                    shouldKeep = false;
                }
            }
        });
        return shouldKeep;
    });
    return allLinksInCurrentBlockText;
};
