export const UPDATE_CHARTS = "UPDATE_CHARTS";

//actions
export const updateCharts = charts => {
  return { type: UPDATE_CHARTS, charts };
};

//reducers

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CHARTS:
      return action.charts;
    default:
      return state;
  }
};

const initialState = {
  byId: {
    1: {
      specs: {
        width: 100,
        height: 50,
        mark: "bar",
        encoding: {
          x: { field: "a", type: "ordinal" },
          y: { field: "b", type: "quantitative" }
        },
        data: { name: "table" } // note: vega-lite data attribute is a plain object instead of an array
      },
      data: {
        table: [
          { a: "A", b: 28 },
          { a: "B", b: 55 },
          { a: "C", b: 43 },
          { a: "D", b: 91 },
          { a: "E", b: 81 },
          { a: "F", b: 53 },
          { a: "G", b: 19 },
          { a: "H", b: 87 },
          { a: "I", b: 52 }
        ]
      }
    },
    2: {
      specs: {
        width: 100,
        height: 50,
        mark: "line",
        encoding: {
          x: { field: "a", type: "ordinal" },
          y: { field: "b", type: "quantitative" }
        },
        data: { name: "table" } // note: vega-lite data attribute is a plain object instead of an array
      },
      data: {
        table: [
          { a: "A", b: 28 },
          { a: "B", b: 55 },
          { a: "C", b: 43 },
          { a: "D", b: 91 },
          { a: "E", b: 81 },
          { a: "F", b: 53 },
          { a: "G", b: 19 },
          { a: "H", b: 87 },
          { a: "I", b: 52 }
        ]
      }
    }
  },
  allIds: [1, 2]
};
