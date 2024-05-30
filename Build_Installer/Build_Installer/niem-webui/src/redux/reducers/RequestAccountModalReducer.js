import * as actionTypes from '../actions';

const initialState = {
	isRequestAccountModalOpen: false,
};

function RequestAccountModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.REQUEST_ACCOUNT_MODAL_OPEN:
			return {
				...state,
				isRequestAccountModalOpen: !state.isRequestAccountModalOpen,
			};
		default:
			return state;
	}
}

export default RequestAccountModalReducer;
