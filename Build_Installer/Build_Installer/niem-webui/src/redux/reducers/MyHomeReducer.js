import * as actionTypes from '../actions';

const initialState = {
	isFormatTranslationComplete: '',
	translatedPackageName: '',
	isPublishedMEPDeletionComplete: '',
	deletedUnpublishedPackageName: '',
	deletedPublishedPackageName: '',
	refreshPackages: false,
	myHomeLoaderActive: false,
	isViewPublishedMEPsMessageOpen: false,
};

function MyHomeReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.UPDATE_TRANSLATION_COMPLETION_STATUS:
			return {
				...state,
				isFormatTranslationComplete: action.payload,
			};
		case actionTypes.TRANSLATED_PACKAGE_NAME:
			return {
				...state,
				translatedPackageName: action.payload,
			};
		case actionTypes.UPDATE_PUBLISHED_MEP_DELETION_STATUS:
			return {
				...state,
				isPublishedMEPDeletionComplete: action.payload,
			};
		case actionTypes.DELETED_PUBLISHED_PACKAGE_NAME:
			return {
				...state,
				deletedPublishedPackageName: action.payload,
			};
		case actionTypes.DELETED_UNPUBLISHED_PACKAGE_NAME:
			return {
				...state,
				deletedUnpublishedPackageName: action.payload,
			};
		case actionTypes.REFRESH_PACKAGES:
			return {
				...state,
				refreshPackages: action.payload,
			};
		case actionTypes.MY_HOME_LOADER_ACTIVE:
			return {
				...state,
				myHomeLoaderActive: action.payload,
			};
		case actionTypes.SET_IS_VIEW_PUBLISHED_MEP_MESSAGE_OPEN:
			return {
				...state,
				isViewPublishedMEPsMessageOpen: action.payload,
			};
		default:
			return state;
	}
}

export default MyHomeReducer;
