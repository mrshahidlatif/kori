import uniqueId from "utils/uniqueId";
import barChartSpec from "./specs/barchart.json";
import barChartLiteSpec from "./specs/barChartLite.json";
import { createSelector } from "reselect";

// action types
export const CREATE_CHART = "CREATE_CHART";
export const UPDATE_CHART = "UPDATE_CHART";
export const DELETE_CHART = "DELETE_CHART";

// actions
export const createChart = (docId, spec, liteSpec, attrs = {}) => {
    let chartId = uniqueId("chart-");
    attrs = {
        docId,
        spec,
        liteSpec,
        timestamp: Date.now(),
        highlight: { channel: "opacity", active: 1.0, inactive: 0.1 },
        ...attrs,
        id: chartId,
    };
    return { type: CREATE_CHART, chartId, attrs };
};

export const updateChart = (chartId, attrs) => {
    return { type: UPDATE_CHART, chartId, attrs };
};

export const deleteChart = (chartId, attrs) => {
    return {
        type: DELETE_CHART,
        chartId,
        attrs,
    };
};
// selectors
export const getCharts = createSelector(
    (state) => state.docs,
    (state) => state.charts,
    (_, docId) => docId,
    (docs, charts, docId) => docs[docId].charts.map((cid) => charts[cid])
);

export const getChartsInEditor = createSelector(
    (state) => state.docs,
    (state) => state.charts,
    (_, docId) => docId,
    (docs, charts, docId) => docs[docId].chartsInEditor.map((cid) => charts[cid])
);
// reducers
const initialState = {
    testchart: {
        id: "testchart",
        docId: "testdoc",
        timestamp: Date.now(),
        thumbnail:
            "data:image/png;base64,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",
        highlight: { channel: "opacity", active: 1.0, inactive: 0.1 },
        properties: {
            axes: [
                {
                    name: "x",
                    field: "category",
                    data: "data_0",
                    type: "ordinal",
                    title: "category",
                },
                { name: "y", field: "amount", data: "data_0", type: "linear", title: "amount" },
            ],
            features: [
                { value: "Apple", type: "string", field: "category", data: "data_0" },
                { value: "Amazon", type: "string", field: "category", data: "data_0" },
                { value: "Facebook", type: "string", field: "category", data: "data_0" },
                { value: "Netflix", type: "string", field: "category", data: "data_0" },
                { value: "Microsoft", type: "string", field: "category", data: "data_0" },
                { value: "Samsung", type: "string", field: "category", data: "data_0" },
                { value: "Twitter", type: "string", field: "category", data: "data_0" },
                { value: "Linkedin", type: "string", field: "category", data: "data_0" },
            ],
        },
        spec: barChartSpec,
        liteSpec: barChartLiteSpec,
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CREATE_CHART:
        case UPDATE_CHART:
            return {
                ...state,
                [action.chartId]: {
                    ...(state[action.chartId] || {}),
                    ...action.attrs,
                },
            };
        case DELETE_CHART: {
            let newState = {
                ...state,
            };
            delete newState[action.chartId];
            return newState;
        }

        default:
            return state;
    }
};
