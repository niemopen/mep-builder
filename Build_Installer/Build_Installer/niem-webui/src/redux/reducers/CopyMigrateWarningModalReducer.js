import * as actionTypes from '../actions';

const initialState = {
	isCopyMigrateWarningModalOpen: false,
	isOpenedCopiedMigratedMEPModalOpen: false,
	copyMigrateAction: '',
};

function CopyMigrateWarningModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.IS_COPY_MIGRATE_WARNING_MODAL_OPEN:
			return {
				...state,
				isCopyMigrateWarningModalOpen: action.payload,
			};
		case actionTypes.IS_OPENED_COPIED_MIGRATED_MEP_MODAL_OPEN:
			return {
				...state,
				isOpenedCopiedMigratedMEPModalOpen: action.payload,
			};
		case actionTypes.SET_COPY_MIGRATE_ACTION:
			return {
				...state,
				copyMigrateAction: action.payload,
			};
		default:
			return state;
	}
}

export default CopyMigrateWarningModalReducer;
