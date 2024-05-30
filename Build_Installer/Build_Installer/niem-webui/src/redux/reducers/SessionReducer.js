import * as actionTypes from '../actions';
import * as roles from '../../Shared/roles';

const initialState = {
	isStandAloneSys: '',
	userEmail: '',
	userId: '',
	userPermissions: roles.userGeneral.permissions,
	loggedIn: false,
	forceBrowserRefresh: false,
	isLogOutActive: false,
};

const SessionReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_STANDALONE:
			return {
				...state,
				isStandAloneSys: action.payload,
			};
		case actionTypes.UPDATE_LOGGED_IN:
			return {
				...state,
				loggedIn: action.payload,
			};
		case actionTypes.UPDATE_USER_EMAIL:
			return {
				...state,
				userEmail: action.payload,
			};
		case actionTypes.UPDATE_USER_ID:
			return {
				...state,
				userId: action.payload,
			};
		case actionTypes.UPDATE_USER_ROLE:
			switch (action.payload) {
				case roles.sysAdmin:
					return {
						...state,
						userPermissions: roles.userSysAdmin.permissions,
					};
				case roles.superAdmin:
					return {
						...state,
						userPermissions: roles.userSuperAdmin.permissions,
					};
				case roles.admin:
					return {
						...state,
						userPermissions: roles.userAdmin.permissions,
					};
				case roles.genUser:
					return {
						...state,
						userPermissions: roles.userGeneral.permissions,
					};
				default:
					return state;
			}
		case actionTypes.FORCE_BROWSER_REFRESH:
			return {
				...state,
				forceBrowserRefresh: action.payload,
			};
		case actionTypes.IS_LOG_OUT_ACTIVE:
			return {
				...state,
				isLogOutActive: action.payload,
			};
		default:
			return state;
	}
};

export default SessionReducer;
