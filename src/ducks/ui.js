export const ADD_SELECTED_CHART = "ADD_SELECTED_CHART";

export const addSelectedChart = chartId => {
  return { type: ADD_SELECTED_CHART, chartId };
};

//reducers
export default (state = initialUi, action) => {
  switch (action.type) {
    case ADD_SELECTED_CHART:
      // return action.chartId;
      console.log("STATE in UI", state);
      return {
        ...state,
        chartsInEditor: state.chartsInEditor.concat(action.chartId)
      };
    default:
      return state;
  }
};

const initialUi = {
  chartsInEditor: []
};
