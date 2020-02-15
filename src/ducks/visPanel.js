export const UPDATE_CHARTS = "UPDATE_CHARTS";

//actions
export const updateCharts = charts => {
  return { type: UPDATE_CHARTS, charts };
};

//reducers
export default (state = {}, action) => {
  switch (action.type) {
    case UPDATE_CHARTS:
      return action.charts;
    default:
      return state;
  }
};
