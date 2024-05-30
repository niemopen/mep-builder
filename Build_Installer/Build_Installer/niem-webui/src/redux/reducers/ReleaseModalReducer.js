import * as actionTypes from '../actions';

const initialState = {
	isReleaseModalOpen: false,
};

function ReleaseModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.RELEASE_MODAL_OPEN:
			return {
				...state,
				isReleaseModalOpen: action.payload,
			};
		default:
			return state;
	}
}

export default ReleaseModalReducer;
