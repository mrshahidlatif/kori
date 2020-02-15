export const UPDATE_SELECTED_CHART = "UPDATE_SELECTED_CHART";

//actions
export const updateSelectedChart = selectedChart => {
  return { type: UPDATE_SELECTED_CHART, selectedChart };
};

//reducers
export default (state = {}, action) => {
  switch (action.type) {
    case UPDATE_SELECTED_CHART:
      return action.selectedChart;
    default:
      return state;
  }
};
