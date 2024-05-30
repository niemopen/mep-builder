import * as actionTypes from '../actions';

const initialState = {
	isPasswordExpiringMessageOpen: false,
	isPasswordExpired: false,
};

function PasswordExpiringMessageReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.PASSWORD_EXPIRING_MESSAGE_OPEN:
			return {
				...state,
				isPasswordExpiringMessageOpen: action.payload,
			};
		case actionTypes.PASSWORD_EXPIRED:
			return {
				...state,
				isPasswordExpired: action.payload,
			};
		default:
			return state;
	}
}

export default PasswordExpiringMessageReducer;
