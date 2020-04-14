import uniqueId from 'utils/uniqueId';
import barChartSpec from './specs/barchart.json'

// action types
export const CREATE_CHART = 'CREATE_CHART';
export const UPDATE_CHART = 'UPDATE_CHART';
export const DELETE_CHART = 'DELETE_CHART';


// actions
export const createChart = (docId, attrs={}) => {
	let chartId = uniqueId('chart-');
	attrs = {
    docId,
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
export const getCharts = (state)=>{ 
	//TODO: memoization using reselect
	return state.ui.currentDocId? state.docs[state.ui.currentDocId].charts.map(cid=>state.charts[cid]): [];
}

export const getChartsInEditor = (state)=>{ 
	//TODO: memoization using reselect
	return state.ui.currentDocId? state.docs[state.ui.currentDocId].chartsInEditor.map(cid=>state.charts[cid]): [];
}
// reducers
const initialState = {
	'testchart':{
		id:'testchart',
		docId:"testdoc",
		timestamp: Date.now(),
		features:["Apple", "Amazon", "Facebook", "Netflix", "Microsoft", "Samsung", "Twitter", "Linkedin"],
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