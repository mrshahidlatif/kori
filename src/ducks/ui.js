export const ADD_SELECTED_CHART = "ADD_SELECTED_CHART";
export const UPDATE_CURSOR_POSITION = "UPDATE_CURSOR_POSITION";
export const UPDATE_EDITOR_POSITION = "UPDATE_EDITOR_POSITION";
export const UPDATE_SUGGESTION_LIST = "UPDATE_SUGGESTION_LIST";
export const ADD_TEXT_LINK = "ADD_TEXT_LINK";
export const ACTIVATE_TEXT_LINK = "ACTIVATE_TEXT_LINK";
export const DEACTIVATE_TEXT_LINK = "DEACTIVATE_TEXT_LINK";
export const ACTIVATE_SUGGESTIONS = "ACTIVATE_SUGGESTIONS";
export const DEACTIVATE_SUGGESTIONS = "DEACTIVATE_SUGGESTIONS";
export const UPDATE_CURRENT_TEXT_LINK = "UPDATE_CURRENT_TEXT_LINK";
export const CLEAR_CURRENT_TEXT_LINK = "CLEAR_CURRENT_TEXT_LINK";

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

export const activateSuggestions = () => {
  return { type: ACTIVATE_SUGGESTIONS };
};
export const deactivateSuggestions = () => {
  return { type: DEACTIVATE_SUGGESTIONS };
};
export const updateCurrentTextLink = textLink => {
  return { type: UPDATE_CURRENT_TEXT_LINK, textLink };
};
export const clearCurrentTextLink = () => {
  return { type: CLEAR_CURRENT_TEXT_LINK };
};

//reducers
export default (state = initialUi, action) => {
  switch (action.type) {
    case ADD_SELECTED_CHART:
      return {
        ...state,
        chartsInEditor: action.chartId
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
    case ACTIVATE_SUGGESTIONS:
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          isActive: true
        }
      };
    case DEACTIVATE_SUGGESTIONS:
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          isActive: false
        }
      };
    case UPDATE_CURRENT_TEXT_LINK:
      return {
        ...state,
        currentLink: action.textLink
      };
    case CLEAR_CURRENT_TEXT_LINK:
      return {
        ...state,
        currentLink: ""
      };

    default:
      return state;
  }
};

const initialUi = {
  chartsInEditor: [],
  cursorPositionInEditor: {},
  editorPosition: {},
  suggestions: {
    listOfSuggestions: ["A", "B", "R", "M", "S"],
    isActive: false
  },
  links: {},
  currentLink: ""
};
