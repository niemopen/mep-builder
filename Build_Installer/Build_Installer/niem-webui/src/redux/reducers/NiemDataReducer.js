import * as actionTypes from '../actions';

const initialState = {
	isNiemDataLoading: false,
	loadedReleases: [],
};

function NiemDataReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.IS_NIEM_DATA_LOADING:
			return {
				...state,
				isNiemDataLoading: action.payload,
			};
		case actionTypes.LOADED_RELEASES:
			return {
				...state,
				loadedReleases: action.payload,
			};
		default:
			return state;
	}
}

export default NiemDataReducer;
