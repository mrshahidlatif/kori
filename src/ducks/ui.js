export const ADD_SELECTED_CHART = "ADD_SELECTED_CHART";
export const UPDATE_CURSOR_POSITION = "UPDATE_CURSOR_POSITION";
export const UPDATE_EDITOR_POSITION = "UPDATE_EDITOR_POSITION";
export const UPDATE_SUGGESTION_LIST = "UPDATE_SUGGESTION_LIST";
export const ADD_TEXT_LINK = "ADD_TEXT_LINK";
export const ACTIVATE_TEXT_LINK = "ACTIVATE_TEXT_LINK";
export const DEACTIVATE_TEXT_LINK = "DEACTIVATE_TEXT_LINK";

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
export const addTextLink = textLink => {
  return { type: ADD_TEXT_LINK, textLink };
};
export const activateTextLink = textLink => {
  return { type: ACTIVATE_TEXT_LINK, textLink };
};
export const deactivateTextLink = textLink => {
  return { type: DEACTIVATE_TEXT_LINK, textLink };
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
    case ADD_TEXT_LINK:
      return {
        ...state,
        links: {
          ...state.links,
          [action.textLink.linkId]: action.textLink
        }
      };
    case ACTIVATE_TEXT_LINK:
      return {
        ...state,
        links: {
          ...state.links,
          [action.textLink]: {
            ...state.links[action.textLink],
            active: true
          }
        }
      };
    case DEACTIVATE_TEXT_LINK:
      return {
        ...state,
        links: {
          ...state.links,
          [action.textLink]: {
            ...state.links[action.textLink],
            active: false
          }
        }
      };
    default:
      return state;
  }
};

const initialUi = {
  chartsInEditor: [],
  cursorPositionInEditor: {},
  editorPosition: {},
  listOfSuggestions: [],
  links: {}
};
