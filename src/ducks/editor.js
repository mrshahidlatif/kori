export const UPDATE_EDITOR_STATE = "UPDATE_EDITOR_STATE";

//actions
export const updateEditorState = editorRawState => {
  return { type: UPDATE_EDITOR_STATE, editorRawState };
};

//reducers
export default (state = {}, action) => {
  switch (action.type) {
    case UPDATE_EDITOR_STATE:
      return action.editorRawState;
    default:
      return state;
  }
};
