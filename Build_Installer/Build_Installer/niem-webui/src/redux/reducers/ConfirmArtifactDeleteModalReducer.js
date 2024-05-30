import * as actionTypes from '../actions';

const initialState = {
	isConfirmArtifactDeleteModalOpen: false,
	artifactToDelete: {},
	confirmDeleteMode: '',
};

export const ConfirmArtifactDeleteModalReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.SET_SHOW_CONFIRM_ARTIFACT_DELETE_MODAL:
			return {
				...state,
				isConfirmArtifactDeleteModalOpen: action.payload,
			};
		case actionTypes.UPDATE_CONFIRM_ARTIFACT_TO_DELETE:
			return {
				...state,
				artifactToDelete: action.payload,
			};
		case actionTypes.UPDATE_CONFIRM_DELETE_MODE:
			return {
				...state,
				confirmDeleteMode: action.payload,
			};
		default:
			return state;
	}
};

export default ConfirmArtifactDeleteModalReducer;
