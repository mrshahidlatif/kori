export const UPDATE_EDITOR_STATE = "UPDATE_EDITOR_STATE";

//actions
export const updateEditorState = editorRawState => {
  return { type: UPDATE_EDITOR_STATE, editorRawState };
};

//reducers
export default (state = rawContent, action) => {
  switch (action.type) {
    case UPDATE_EDITOR_STATE:
      return action.editorRawState;
    default:
      return state;
  }
};

const rawContent = {
  blocks: [
    {
      text: "Welcome to GORI. You can compose interactive articles!"
    },
    {
      text:
        "You can add Visualizations to the document by dragging them from the left panel on to the editor!"
    },
    // {
    //   type: "atomic",
    //   text: " ",
    //   entityRanges: [
    //     {
    //       key: "1",
    //       offset: 0
    //     }
    //   ]
    // },
    {
      text: "Type @ to establish a link between text and parts of a chart!"
    }
  ],
  entityMap: {}
};
