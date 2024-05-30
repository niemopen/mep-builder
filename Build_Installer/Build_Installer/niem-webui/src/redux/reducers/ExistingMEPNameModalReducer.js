import * as actionTypes from '../actions';

const initialState = {
	isModalOpen: false,
	overwriteSave: false,
	returnHomeOnSave: false,
	duplicatePackageId: '',
};

function ExistingMEPNameModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.EXISTING_MEP_NAME_MODAL_OPEN:
			return {
				...state,
				isModalOpen: action.payload,
			};
		case actionTypes.UPDATE_OVERWRITE_SAVE:
			return {
				...state,
				overwriteSave: action.payload,
			};
		case actionTypes.RETURN_HOME_ON_SAVE:
			return {
				...state,
				returnHomeOnSave: action.payload,
			};
		case actionTypes.UPDATE_DUPLICATE_PACKAGE_ID:
			return {
				...state,
				duplicatePackageId: action.payload,
			};
		default:
			return state;
	}
}

export default ExistingMEPNameModalReducer;
