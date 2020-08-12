import uniqueId from "utils/uniqueId";
import { CREATE_CHART, DELETE_CHART } from "ducks/charts";
// action types
export const CREATE_DOC = "CREATE_DOC";
export const UPDATE_DOC = "UPDATE_DOC";
export const DELETE_DOC = "DELETE_DOC";

export const UPDATE_EDITOR_STATE = "UPDATE_EDITOR_STATE";
export const UPDATE_CHARTS_IN_EDITOR = "UPDATE_CHARTS_IN_EDITOR";

// actions
export const createDoc = (attrs = {}) => {
    let docId = uniqueId();
    attrs = {
        title: "Untitled",
        editorRawState: null,
        timestamp: Date.now(),
        sentences: [],
        charts: [],
        chartsInEditor: [],
        ...attrs,
        id: docId,
    };
    return { type: CREATE_DOC, docId, attrs };
};

export const updateDoc = (docId, attrs) => {
    return { type: UPDATE_DOC, docId, attrs };
};

export const deleteDoc = (docId) => {
    return {
        type: DELETE_DOC,
        docId,
    };
};

export const updateChartsInEditor = (docId, charts) => {
    return { type: UPDATE_CHARTS_IN_EDITOR, docId, charts };
};

// selectors

// reducers

const initialState = {
    testdoc: {
        id: "testdoc",
        title: "Testing...",
        timestamp: Date.now(),
        charts: ["testchart"],
        chartsInEditor: [],
        sentences: [],
        editorRawState: {
            blocks: [
                {
                    key: "8i090",
                    text: "Welcome to Vis-Text Editor",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [
                        {
                            offset: 0,
                            length: 26,
                            style: "BOLD",
                        },
                    ],
                    entityRanges: [],
                    data: {},
                },
                {
                    key: "42ncd",
                    text: "Here you can compose interactive articles",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [
                        {
                            offset: 0,
                            length: 42,
                            style: "UNDERLINE",
                        },
                    ],
                    entityRanges: [],
                    data: {},
                },
                {
                    key: "327r6",
                    text:
                        "Start dragging the chart from Chart Gallery to the editor and start creating! ;)",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [
                        {
                            offset: 0,
                            length: 81,
                            style: "ITALIC",
                        },
                    ],
                    entityRanges: [],
                    data: {},
                },
            ],
            entityMap: {},
        },
    },
};
export default (state = initialState, action) => {
    switch (action.type) {
        case CREATE_DOC:
        case UPDATE_DOC:
            return {
                ...state,
                [action.docId]: {
                    ...(state[action.docId] || {}),
                    ...action.attrs,
                },
            };
        case DELETE_DOC: {
            let newState = {
                ...state,
            };
            delete newState[action.docId];
            return newState;
        }
        case CREATE_CHART:
            return {
                ...state,
                [action.attrs.docId]: {
                    ...state[action.attrs.docId],
                    charts: state[action.attrs.docId].charts.concat(action.chartId),
                },
            };
        case DELETE_CHART:
            return {
                ...state,
                [action.attrs.docId]: {
                    ...state[action.attrs.docId],
                    charts: state[action.attrs.docId].charts.filter(
                        (cid) => cid !== action.chartId
                    ),
                },
            };

        case UPDATE_CHARTS_IN_EDITOR:
            return {
                ...state,
                [action.docId]: {
                    ...state[action.docId],
                    chartsInEditor: action.charts,
                },
            };
        case UPDATE_EDITOR_STATE:
            return {
                ...state,
                [action.docId]: {
                    ...state[action.docId],
                    editorRawState: action.editorRawState,
                },
            };
        default:
            return state;
    }
};
