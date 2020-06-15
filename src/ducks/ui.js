export const SET_SELECTED_LINK = "SET_SELECTED_LINK";
export const SET_TEXT_SELECTION = "SET_TEXT_SELECTION";
export const SET_MANUAL_LINK_ID = "SET_MANUAL_LINK_ID";

export const setSelectedLink = (link) => {
    return { type: SET_SELECTED_LINK, link };
};
export const setTextSelection = (textSelection) => {
    return { type: SET_TEXT_SELECTION, textSelection };
};
export const setManualLinkId = (linkId) => {
    return { type: SET_MANUAL_LINK_ID, linkId };
};
//reducers
const initialState = {};

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_SELECTED_LINK:
            return {
                ...state,
                selectedLink: action.link,
            };
        case SET_TEXT_SELECTION:
            return {
                ...state,
                textSelection: action.textSelection,
            };
        case SET_MANUAL_LINK_ID:
            return {
                ...state,
                manualLinkId: action.linkId,
            };
        default:
            return state;
    }
};
