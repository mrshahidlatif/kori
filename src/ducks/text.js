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
  Charts: {
    ChartID: "001",
    spec: {
      description: "A simple bar chart with embedded data.",
      mark: "bar",
      encoding: {
        x: { field: "a", type: "ordinal" },
        y: { field: "b", type: "quantitative" }
      }
    },
    barData: {
      values: [
        { a: "A", b: 20 },
        { a: "B", b: 34 },
        { a: "C", b: 55 },
        { a: "D", b: 19 },
        { a: "E", b: 40 },
        { a: "F", b: 34 },
        { a: "G", b: 91 },
        { a: "H", b: 78 },
        { a: "I", b: 25 }
      ]
    }
  }
};
