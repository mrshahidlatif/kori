export default (rawEditorState) => {
    let entityMap = { ...rawEditorState.entityMap };
    Object.keys(entityMap).forEach(function (key) {
        if (entityMap[key].type === "LINK") {
            if (!entityMap[key].data.isConfirmed) delete entityMap[key];
        }
    });
    const newRawEditorState = { blocks: rawEditorState.blocks, entityMap: entityMap };
    return newRawEditorState;
};
