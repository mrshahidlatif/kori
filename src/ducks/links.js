import uniqueId from "utils/uniqueId";
import { createSelector } from "reselect";

// action types
export const CREATE_LINK = "CREATE_LINK";
export const UPDATE_LINK = "UPDATE_LINK";
export const DELETE_LINK = "DELETE_LINK";
export const ACTIVATE_LINK = "ACTIVATE_LINK";
export const DEACTIVATE_LINK = "DEACTIVATE_LINK";
export const CREATE_LINKS = "CREATE_LINKS";
export const CONFIRM_LINK = "CONFIRM_LINK";

export const createLink = (docId, link, attrs = {}) => {
    let linkId = uniqueId("link-");
    attrs = {
        docId,
        timestamp: Date.now(),
        ...link, // chartId, text, etc
        ...attrs, // will override the above properties if any attr is set in attrs
        id: linkId,
    };
    return { type: CREATE_LINK, linkId, attrs };
};

export const createLinks = (docId, links) => {
    return {
        type: CREATE_LINKS,
        links: links.map((link) => ({
            ...link,
            timestamp: Date.now(),
            docId,
            id: uniqueId("link-"),
        })),
    };
};

export const updateLink = (linkId, attrs) => {
    return { type: UPDATE_LINK, linkId, attrs };
};

export const deleteLink = (linkId) => {
    return {
        type: DELETE_LINK,
        linkId,
    };
};

export const activateLink = (linkId) => {
    return {
        type: ACTIVATE_LINK,
        linkId,
    };
};

export const deactivateLink = (linkId) => {
    return {
        type: DEACTIVATE_LINK,
        linkId,
    };
};

export const confirmLink = (linkId) => {
    return {
        type: CONFIRM_LINK,
        linkId,
    };
};

// selectors
export const getLinks = createSelector(
    (state) => state.links,
    (_, docId) => docId,
    (links, docId) => Object.fromEntries(Object.entries(links).filter(([k,v]) => v.docId === docId))
);

// reducers
export default (state = {}, action) => {
    switch (action.type) {
        case CREATE_LINK:
        case UPDATE_LINK:
            return {
                ...state,
                [action.linkId]: {
                    ...(state[action.linkId] || {}),
                    ...action.attrs,
                },
            };
        case CREATE_LINKS:
            return action.links.reduce((state, link) => {
                return {
                    ...state,
                    [link.id]: link,
                };
            }, state);
        case DELETE_LINK: {
            let newState = {
                ...state,
            };
            delete newState[action.linkId];
            return newState;
        }
        case ACTIVATE_LINK:
            return {
                ...state,
                [action.linkId]: {
                    ...state[action.linkId],
                    active: true,
                },
            };
        case DEACTIVATE_LINK:
            return {
                ...state,
                [action.linkId]: {
                    ...state[action.linkId],
                    active: false,
                },
            };
        case CONFIRM_LINK:
            return {
                ...state,
                [action.linkId]: {
                    ...state[action.linkId],
                    isConfirmed: true,
                },
            };
        default:
            return state;
    }
};
