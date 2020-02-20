export const ADD_SELECTED_CHART = "ADD_SELECTED_CHART";
export const UPDATE_CURSOR_POSITION = "UPDATE_CURSOR_POSITION";
export const UPDATE_EDITOR_POSITION = "UPDATE_EDITOR_POSITION";
export const UPDATE_SUGGESTION_LIST = "UPDATE_SUGGESTION_LIST";

export const addSelectedChart = chartId => {
  return { type: ADD_SELECTED_CHART, chartId };
};

export const updateCursorPosition = position => {
  return { type: UPDATE_CURSOR_POSITION, position };
};
export const updateEditorPosition = position => {
  return { type: UPDATE_EDITOR_POSITION, position };
};
export const updateSuggestionList = suggestionList => {
  return { type: UPDATE_SUGGESTION_LIST, suggestionList };
};

//reducers
export default (state = initialUi, action) => {
  switch (action.type) {
    case ADD_SELECTED_CHART:
      return {
        ...state,
        chartsInEditor: state.chartsInEditor.concat(action.chartId)
      };
    case UPDATE_CURSOR_POSITION:
      return {
        ...state,
        cursorPositionInEditor: action.position
      };
    case UPDATE_EDITOR_POSITION:
      return {
        ...state,
        editorPosition: action.position
      };
    case UPDATE_SUGGESTION_LIST:
      return {
        ...state,
        listOfSuggestions: action.suggestionList
      };
    default:
      return state;
  }
};

const initialUi = {
  chartsInEditor: [],
  cursorPositionInEditor: {},
  editorPosition: {},
  listOfSuggestions: []
};
