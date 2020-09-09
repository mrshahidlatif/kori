export const SET_SELECTED_LINK = "SET_SELECTED_LINK";
export const SET_TEXT_SELECTION = "SET_TEXT_SELECTION";
export const SET_MANUAL_LINK_ID = "SET_MANUAL_LINK_ID";
export const EXIT_MANUAL_LINK_MODE = "EXIT_MANUAL_LINK_MODE";
export const SET_CURRENT_DOC_ID = "SET_CURRENT_DOC_ID";
export const SET_VIEW_MODE = "SET_VIEW_MODE";
export const LINK_ACTIVE_NO_AUTO_TRIGGER = "LINK_ACTIVE_NO_AUTO_TRIGGER";

export const setSelectedLink = (link) => {
    return { type: SET_SELECTED_LINK, link };
};
export const setTextSelection = (textSelection) => {
    return { type: SET_TEXT_SELECTION, textSelection };
};
export const setManualLinkId = (linkId) => {
    return { type: SET_MANUAL_LINK_ID, linkId };
};
export const exitManualLinkMode = (exit) => {
    return { type: EXIT_MANUAL_LINK_MODE, exit };
};

export const SetCurrentDocId = (docId) => {
    return { type: SET_CURRENT_DOC_ID, docId };
};
export const setViewMode = (val) => {
    return { type: SET_VIEW_MODE, val };
};
export const setLinkActiveNoAutoTrigger = (val) => {
    return { type: LINK_ACTIVE_NO_AUTO_TRIGGER, val };
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
        case EXIT_MANUAL_LINK_MODE:
            return {
                ...state,
                exitManualLink: action.exit,
            };
        case SET_CURRENT_DOC_ID:
            return {
                ...state,
                currentDocId: action.docId,
            };
        case SET_VIEW_MODE:
            return { ...state, viewMode: action.val };
        case LINK_ACTIVE_NO_AUTO_TRIGGER:
            return { ...state, linkActiveNoAutoTrigger: action.val };
        default:
            return state;
    }
};
