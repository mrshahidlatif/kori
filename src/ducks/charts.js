import uniqueId from 'utils/uniqueId';
import barChartSpec from './specs/barchart.json'
import { createSelector } from 'reselect'

// action types
export const CREATE_CHART = 'CREATE_CHART';
export const UPDATE_CHART = 'UPDATE_CHART';
export const DELETE_CHART = 'DELETE_CHART';


// actions
export const createChart = (docId, spec, attrs={}) => {
	let chartId = uniqueId('chart-');
	attrs = {
	docId,
	spec,
    timestamp: Date.now(),
    ...attrs,
	id:chartId
	};
	return {type: CREATE_CHART, chartId, attrs};
};

export const updateChart = (chartId, attrs) => {
	return {type: UPDATE_CHART, chartId, attrs};
};

export const deleteChart = (chartId) =>{
	return {
		type: DELETE_CHART,
		chartId
	};
};
// selectors
export const getCharts = createSelector(
	state=>state.docs,
	state=>state.charts,
	(_, docId)=>docId,
	(docs, charts, docId)=>docs[docId].charts.map(cid=>charts[cid])
)

export const getChartsInEditor = createSelector(
	state=>state.docs,
	state=>state.charts,
	(_, docId)=>docId,
	(docs, charts, docId)=>docs[docId].chartsInEditor.map(cid=>charts[cid])
)
// reducers
const initialState = {
	'testchart':{
		id:'testchart',
		docId:"testdoc",
		timestamp: Date.now(),
		features:[{value: "Apple", type: "string", field: "category", data: "data_0"},{value: "Amazon", type: "string", field: "category", data: "data_0"}
		,{value: "Facebook", type: "string", field: "category", data: "data_0"}
		,{value: "Netflix", type: "string", field: "category", data: "data_0"}
		,{value: "Microsoft", type: "string", field: "category", data: "data_0"}
		,{value: "Samsung", type: "string", field: "category", data: "data_0"}
		,{value: "Twitter", type: "string", field: "category", data: "data_0"}
		,{value: "Linkedin", type: "string", field: "category", data: "data_0"}],
		spec:barChartSpec
	}
}


export default  (state = initialState, action)=>{
	switch (action.type) {

		case CREATE_CHART:
		case UPDATE_CHART:
			return {
				...state,
				[action.chartId]:{
					...(state[action.chartId]||{}),
					...action.attrs
				}
			};
		case DELETE_CHART:{
			let newState = {
				...state
			};
			delete newState[action.chartId];
			return newState;
		}
		
		default:
			return state;

	}
};