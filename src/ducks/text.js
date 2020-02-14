// action types
export const UPDATE_TEXT = "UPDATE_TEXT";

//actions
export const updateText = text => {
  return { type: UPDATE_TEXT, text };
};

//reducers
export default (state = "", action) => {
  switch (action.type) {
    case UPDATE_TEXT:
      return action.text;
    default:
      return state;
  }
};
