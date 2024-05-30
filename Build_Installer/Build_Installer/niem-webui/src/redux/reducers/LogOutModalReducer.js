import * as actionTypes from '../actions';

const initialState = {
	isModalOpen: false,
};

function LogOutModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.LOG_OUT_MODAL_OPEN:
			return {
				...state,
				isModalOpen: !state.isModalOpen,
			};
		default:
			return state;
	}
}

export default LogOutModalReducer;
