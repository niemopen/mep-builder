import * as actionTypes from '../actions';

const initialState = {
	isUserProfileModalOpen: false,
};

function UserProfileModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.USER_PROFILE_MODAL_OPEN:
			return {
				...state,
				isUserProfileModalOpen: !state.isUserProfileModalOpen,
			};
		default:
			return state;
	}
}

export default UserProfileModalReducer;
