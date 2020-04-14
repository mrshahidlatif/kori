
export const OPEN_DOC = "OPEN_DOC";


export const openDoc = (docId)=>{
  return { type: OPEN_DOC, docId };
}


//reducers
const initialState = {
  currentDocId: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_DOC:
      return {
        ...state,
        currentDocId: action.docId
      }
    default:
      return state;
  }
};
