import * as actionTypes from '../actions';

const initialState = {
	isUserManagementModalOpen: false,
};

function UserManagementModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.USER_MANAGEMENT_MODAL_OPEN:
			return {
				...state,
				isUserManagementModalOpen: !state.isUserManagementModalOpen,
			};
		default:
			return state;
	}
}

export default UserManagementModalReducer;
