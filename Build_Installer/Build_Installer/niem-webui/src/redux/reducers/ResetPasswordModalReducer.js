import * as actionTypes from '../actions';

const initialState = {
	isResetPasswordModalOpen: false,
	selectedUser: '',
	currentUser: '',
};

function ResetPasswordModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.RESET_PASSWORD_MODAL_OPEN:
			return {
				...state,
				isResetPasswordModalOpen: action.payload,
			};
		case actionTypes.RESET_SELECTED_USER:
			return {
				...state,
				selectedUser: action.payload.selectedUser,
				currentUser: action.payload.currentUser,
			};
		default:
			return state;
	}
}

export default ResetPasswordModalReducer;
