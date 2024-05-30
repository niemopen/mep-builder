import * as actionTypes from '../actions';

const initialState = {
	// All User Table States
	showUpdateSuccessMessage: false,
	listOfAllUsers: [],
	listOfPendingUsers: [],
	permissionError: false,
	deleteSelfError: false,
	deleteWithPackages: false,
	validationError: false,
	emailExists: false,
	fNameError: false,
	lNameError: false,
	orgError: false,
	emailError: false,
	phoneError: false,
	roleError: false,

	// modal states
	workflowType: '',
	pendingUserData: {},
	currentAllUserData: {},
	adminModuleModalOpen: false,
};

function AdminModuleReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE:
			return {
				...state,
				showUpdateSuccessMessage: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS:
			return {
				...state,
				listOfAllUsers: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_LIST_OF_PENDING_USERS:
			return {
				...state,
				listOfPendingUsers: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_PERMISSION_ERROR:
			return {
				...state,
				permissionError: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_DELETE_SELF_ERROR:
			return {
				...state,
				deleteSelfError: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_DELETE_USER_WITH_PACKAGES_ERROR:
			return {
				...state,
				deleteWithPackages: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_VALIDATION_ERROR:
			return {
				...state,
				validationError: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_EMAIL_EXISTS_ERROR:
			return {
				...state,
				emailExists: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_FNAME_ERROR:
			return {
				...state,
				fNameError: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_LNAME_ERROR:
			return {
				...state,
				lNameError: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_ORG_ERROR:
			return {
				...state,
				orgError: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_EMAIL_ERROR:
			return {
				...state,
				emailError: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_PHONE_ERROR:
			return {
				...state,
				phoneError: action.payload,
			};
		case actionTypes.ADMIN_UPDATE_ROLE_ERROR:
			return {
				...state,
				roleError: action.payload,
			};
		case actionTypes.ADMIN_MODULE_MODAL_OPEN:
			return {
				...state,
				adminModuleModalOpen: action.payload,
			};
		case actionTypes.ADMIN_MODULE_UPDATE_PENDING_USER_DATA:
			return {
				...state,
				pendingUserData: action.payload,
			};
		case actionTypes.ADMIN_MODULE_UPDATE_CURRENT_ALL_USER_DATA:
			return {
				...state,
				currentAllUserData: action.payload,
			};
		case actionTypes.ADMIN_MODULE_UPDATE_WORKFLOW:
			return {
				...state,
				workflowType: action.payload,
			};
		default:
			return state;
	}
}

export default AdminModuleReducer;
