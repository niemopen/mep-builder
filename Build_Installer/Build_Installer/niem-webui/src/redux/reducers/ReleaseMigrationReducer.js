import * as actionTypes from '../actions';

const initialState = {
	isReleaseMigrationModalOpen: false,
	rowData: {},
	migratedPackageId: '',
};

function ReleaseMigrationReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.RELEASE_MIGRATION_MODAL_OPEN:
			return {
				...state,
				isReleaseMigrationModalOpen: action.payload,
			};
		case actionTypes.ROW_DATA:
			return {
				...state,
				rowData: action.payload,
			};
		case actionTypes.MIGRATED_PACKAGE_ID:
			return {
				...state,
				migratedPackageId: action.payload,
			};
		default:
			return state;
	}
}

export default ReleaseMigrationReducer;
