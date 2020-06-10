export const SET_SELECTED_LINK = "SET_SELECTED_LINK";

export const setSelectedLink = (link) => {
    return { type: SET_SELECTED_LINK, link };
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
        default:
            return state;
    }
};
