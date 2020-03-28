export const ADD_SELECTED_CHART = "ADD_SELECTED_CHART";
export const UPDATE_SUGGESTION_LIST = "UPDATE_SUGGESTION_LIST";
export const ADD_TEXT_LINK = "ADD_TEXT_LINK";
export const ACTIVATE_TEXT_LINK = "ACTIVATE_TEXT_LINK";
export const DEACTIVATE_TEXT_LINK = "DEACTIVATE_TEXT_LINK";
export const ACTIVATE_SUGGESTIONS = "ACTIVATE_SUGGESTIONS";
export const ACTIVATE_POTENTIAL_LINK_CONTROLS =
  "ACTIVATE_POTENTIAL_LINK_CONTROLS";
export const DEACTIVATE_POTENTIAL_LINK_CONTROLS =
  "DEACTIVATE_POTENTIAL_LINK_CONTROLS";
export const DEACTIVATE_SUGGESTIONS = "DEACTIVATE_SUGGESTIONS";
export const UPDATE_FILTERED_SUGGESTIONS = "UPDATE_FILTERED_SUGGESTIONS";
export const UPDATE_SELECTED_POTENTIAL_LINK_INFO =
  "UPDATE_SELECTED_POTENTIAL_LINK_INFO";

export const addSelectedChart = chartId => {
  return { type: ADD_SELECTED_CHART, chartId };
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
export const updateFilteredSuggestions = filteredSuggestions => {
  return { type: UPDATE_FILTERED_SUGGESTIONS, filteredSuggestions };
};
export const activatePotentialLinkControls = () => {
  return { type: ACTIVATE_POTENTIAL_LINK_CONTROLS };
};
export const deactivatePotentialLinkControls = () => {
  return { type: DEACTIVATE_POTENTIAL_LINK_CONTROLS };
};
export const updateSelectedPotentialLinkInfo = info => {
  return { type: UPDATE_SELECTED_POTENTIAL_LINK_INFO, info };
};

//reducers
export default (state = initialUi, action) => {
  switch (action.type) {
    case ADD_SELECTED_CHART:
      return {
        ...state,
        chartsInEditor: action.chartId
      };
    case UPDATE_SUGGESTION_LIST:
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          listOfSuggestions: action.suggestionList
          // listOfSuggestions: state.suggestions.listOfSuggestions.concat(
          //   action.suggestionList
          //)
        }
      };
    case UPDATE_FILTERED_SUGGESTIONS:
      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          listOfFilteredSuggestions: action.filteredSuggestions
          // listOfSuggestions: state.suggestions.listOfSuggestions.concat(
          //   action.suggestionList
          //)
        }
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
    case ACTIVATE_POTENTIAL_LINK_CONTROLS:
      return {
        ...state,
        potentialLink: {
          ...state.potentialLink,
          showPotentialLinkControls: true
        }
      };
    case DEACTIVATE_POTENTIAL_LINK_CONTROLS:
      return {
        ...state,
        potentialLink: {
          ...state.potentialLink,
          showPotentialLinkControls: false
        }
      };
    case UPDATE_SELECTED_POTENTIAL_LINK_INFO:
      return {
        ...state,
        potentialLink: {
          ...state.potentialLink,
          info: action.info
        }
      };
    default:
      return state;
  }
};

const initialUi = {
  chartsInEditor: [],
  suggestions: {
    listOfSuggestions: [
      "50To100",
      "OrangeSeries",
      "1",
      "2",
      "3",
      "0",
      "OrangeLine",
      "Apple"
    ],
    listOfFilteredSuggestions: [],
    isActive: false
  },
  links: {},
  potentialLink: { showPotentialLinkControls: false, info: {} }
};
