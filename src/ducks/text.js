// action types
export const UPDATE_TEXT = "UPDATE_TEXT";

//actions
export const updateText = text => {
  return { type: UPDATE_TEXT, text };
};

//reducers
export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_TEXT:
      return action.text;
    default:
      return state;
  }
};

var initialState = {
  Text: "Compose an interactive article!",
  Charts: {}
};
