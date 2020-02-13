export const UPDATE_EDITOR_STATE = "UPDATE-EDITOR-STATE";

//actions
export const updateEditorState = editorState => {
  return { type: UPDATE_EDITOR_STATE, editorState };
};

//reducers
export default (state = {}, action) => {
  switch (action.type) {
    case UPDATE_EDITOR_STATE:
      return action.editorState;
    default:
      return state;
  }
};
