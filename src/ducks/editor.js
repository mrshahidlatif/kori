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
      text: "I'm just a doc you can edit me."
    },
    {
      text: "But you can also draw!!!"
    },
    {
      type: "atomic",
      text: " ",
      entityRanges: [
        {
          key: "1",
          offset: 0
        }
      ]
    },
    {
      text: "Press the button in the top right to insert a new sticky note"
    }
  ],
  entityMap: {
    "1": {
      type: "Chart",
      mutability: "IMMUTABLE",
      data: {
        content: ""
      }
    }
  }
};
