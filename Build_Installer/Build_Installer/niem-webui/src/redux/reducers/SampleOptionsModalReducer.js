import * as actionTypes from '../actions';

const initialState = {
    showSampleOptionsModal: false,
};

const SampleOptionsModalReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.SET_SHOW_SAMPLE_OPTIONS_MODAL:
			return {
				...state,
				showSampleOptionsModal: action.payload,
			};
		default:
			return state;
	}
};

export default SampleOptionsModalReducer;
