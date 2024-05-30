import * as actionTypes from '../actions';

const initialState = {
	isModalOpen: false,
};

function ExistingFileNameModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.EXISTING_FILE_NAME_MODAL_OPEN:
			return {
				...state,
				isModalOpen: action.payload,
			};
		default:
			return state;
	}
}

export default ExistingFileNameModalReducer;
