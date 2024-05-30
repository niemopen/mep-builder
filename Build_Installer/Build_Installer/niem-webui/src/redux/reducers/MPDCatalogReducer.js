import * as actionTypes from '../actions';

const initialState = {
	packageOwnerId: '',
	packageId: '',
	packageName: '',
	release: '',
	version: '1',
	status: '',
	statusNo: '',
	pointOfContact: '',
	email: '',
	description: '',
	organizationName: '',
	organizationType: '',
	format: 'XML',
	coiTags: '',
	exchangeTags: '',
	uri: '',
	creationDate: '',
	isReleaseLocked: false,
	isRequiredArtifactUploaded: {
		subset: false,
		catalog: false,
		sample: false,
		readme: false,
		changelog: false,
		conformance: false,
		// TO DO: add extension once required
	},
	isPublished: false,
	validationArtifacts: [{ labelName: '', validatorKey: '', isPass: false, validationResults: {} }],
	showValidationResults: false,
	isCopiedPackage: false,
	isMigratedPackage: false,
};

const MPDCatalogReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_PACKAGE_OWNER_ID:
			return {
				...state,
				packageOwnerId: action.payload,
			};
		case actionTypes.UPDATE_MPD_PACKAGE_ID:
			return {
				...state,
				packageId: action.payload,
			};
		case actionTypes.UPDATE_MPD_PACKAGE_NAME:
			return {
				...state,
				packageName: action.payload,
			};
		case actionTypes.UPDATE_MPD_RELEASE:
			return {
				...state,
				release: action.payload,
			};
		case actionTypes.UPDATE_MPD_VERSION:
			return {
				...state,
				version: action.payload,
			};
		case actionTypes.UPDATE_MPD_STATUS:
			return {
				...state,
				status: action.payload,
			};
		case actionTypes.UPDATE_MPD_STATUS_NO:
			return {
				...state,
				statusNo: action.payload,
			};
		case actionTypes.UPDATE_MPD_POC:
			return {
				...state,
				pointOfContact: action.payload,
			};
		case actionTypes.UPDATE_MPD_EMAIL:
			return {
				...state,
				email: action.payload,
			};
		case actionTypes.UPDATE_MPD_DESCRIPTION:
			return {
				...state,
				description: action.payload,
			};
		case actionTypes.UPDATE_MPD_ORGANIZATION_NAME:
			return {
				...state,
				organizationName: action.payload,
			};
		case actionTypes.UPDATE_MPD_ORGANIZATION_TYPE:
			return {
				...state,
				organizationType: action.payload,
			};
		case actionTypes.UPDATE_MPD_FORMAT:
			return {
				...state,
				format: action.payload,
			};
		case actionTypes.UPDATE_MPD_COI_TAGS:
			return {
				...state,
				coiTags: action.payload,
			};
		case actionTypes.UPDATE_MPD_EXCHANGE_TAGS:
			return {
				...state,
				exchangeTags: action.payload,
			};
		case actionTypes.UPDATE_MPD_URI:
			return {
				...state,
				uri: action.payload,
			};
		case actionTypes.UPDATE_MPD_CREATION_DATE:
			return {
				...state,
				creationDate: action.payload,
			};
		case actionTypes.UPDATE_MPD_RELEASE_LOCKED:
			return {
				...state,
				isReleaseLocked: action.payload,
			};
		case actionTypes.UPDATE_IS_REQUIRED_ARTIFACT_UPLOADED:
			return {
				...state,
				isRequiredArtifactUploaded: {
					...state.isRequiredArtifactUploaded,
					[action.payload.requiredArftifact]: action.payload.isUploaded,
				},
			};
		case actionTypes.UPDATE_MPD_IS_PUBLISHED:
			return {
				...state,
				isPublished: action.payload,
			};
		case actionTypes.SET_SHOW_VALIDATION_RESULTS:
			return {
				...state,
				showValidationResults: action.payload,
			};
		case actionTypes.UPDATE_VALIDATION_ARTIFACTS:
			return {
				...state,
				validationArtifacts: action.payload,
			};
		case actionTypes.RESET_VALIDATION_ARTIFACTS:
			return {
				...state,
				validationArtifacts: [{ labelName: '', validatorKey: '', isPass: false, validationResults: {} }],
			};
		case actionTypes.UPDATE_MPD_IS_COPIED_PACKAGE:
			return {
				...state,
				isCopiedPackage: action.payload,
			};
		case actionTypes.UPDATE_MPD_IS_MIGRATED_PACKAGE:
			return {
				...state,
				isMigratedPackage: action.payload,
			};
		case actionTypes.RESET_MPD_CATALOG_FORM:
			return initialState;
		default:
			return state;
	}
};

export default MPDCatalogReducer;
