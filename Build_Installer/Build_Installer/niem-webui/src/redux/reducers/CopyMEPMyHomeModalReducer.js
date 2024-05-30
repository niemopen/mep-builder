import * as actionTypes from '../actions';

const initialState = {
	isCopyMEPModalOpen: false,
	copiedPkgPkgId: '',
};

function CopyMEPFromMyHomeReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.IS_COPY_MEP_MODAL_OPEN:
			return {
				...state,
				isCopyMEPModalOpen: action.payload,
			};
		case actionTypes.UPDATE_COPIED_PACKAGE_ID:
			return {
				...state,
				copiedPkgPkgId: action.payload,
			};
		default:
			return state;
	}
}

export default CopyMEPFromMyHomeReducer;
