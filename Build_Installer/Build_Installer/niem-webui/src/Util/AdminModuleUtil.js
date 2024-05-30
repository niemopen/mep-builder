import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import * as roles from '../Shared/roles';
import { isStringFieldValid, isEmailFieldValid, isPhoneFieldValid } from './FieldValidationUtil';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { encryptPassword } from '../Util/PasswordUtil';
import { getSessionValue, setLogOut } from './localStorageUtil';
import * as sessionVar from '../Util/SessionVar';
import { handleError, trackedErrorSources } from './ErrorHandleUtil';
import { getUserInfoApi } from './AssembleDocumentTabsUtil';
import { useTimer } from 'react-timer-hook';

// these values provide the headers for the admin module modal. As well as keep track of the workflow type.
const adminWorkflowTypeJSON = {
	approveUser: 'Approve User?',
	denyUser: 'Account Denial Explanation',
	lockAccount: 'Lock Account',
	unlockAccount: 'Unlock Account',
	grantAccess: 'Grant Access?',
	passwordReset: 'Password Reset',
	revokeAccount: 'Revoke Account Access',
};

// constants to use instead of hardcoding text. Useful in if statement checks
export const status = { lock: 'lock', unlock: 'unlock', revoke: 'revoke' };

// Used to dynamically populate edit user status dropdown in Admin Module
export const userStatusArray = [status.lock, status.unlock, status.revoke];

export const adminWorkflowType = JSON.parse(JSON.stringify(adminWorkflowTypeJSON));

export const handleStatusChange = (rowData, statusAction) => {
	store.dispatch({ type: actionTypes.ADMIN_MODULE_UPDATE_CURRENT_ALL_USER_DATA, payload: rowData });
	store.dispatch({ type: actionTypes.ADMIN_MODULE_MODAL_OPEN, payload: true });
	switch (statusAction) {
		case status.lock:
			store.dispatch({
				type: actionTypes.ADMIN_MODULE_UPDATE_WORKFLOW,
				payload: adminWorkflowType.lockAccount,
			});
			break;
		case status.unlock:
			store.dispatch({
				type: actionTypes.ADMIN_MODULE_UPDATE_WORKFLOW,
				payload: adminWorkflowType.unlockAccount,
			});
			break;
		case status.revoke:
			store.dispatch({
				type: actionTypes.ADMIN_MODULE_UPDATE_WORKFLOW,
				payload: adminWorkflowType.revokeAccount,
			});
			break;
		case 'warning sign':
			store.dispatch({
				type: actionTypes.ADMIN_MODULE_UPDATE_WORKFLOW,
				payload: adminWorkflowType.grantAccess,
			});
			break;
		default:
			break;
	}
};

const clearMessagesOnTimer = () => {
	// Allows message to only be visble for 5 seconds
	const timer = setTimeout(() => {
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_EMAIL_EXISTS_ERROR, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_PERMISSION_ERROR, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_DELETE_SELF_ERROR, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_VALIDATION_ERROR, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_FNAME_ERROR, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_LNAME_ERROR, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_ORG_ERROR, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_EMAIL_ERROR, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_PHONE_ERROR, payload: false });
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_ROLE_ERROR, payload: false });
	}, 5000);
	return () => clearTimeout(timer);
};

const isFormValid = (newData) => {
	// Validate fields
	let formValidStatus = { allValid: true };

	// Validate First Name
	if (isStringFieldValid(newData.firstName)) {
		formValidStatus['firstName'] = true;
	} else {
		formValidStatus['firstName'] = false;
		formValidStatus['allValid'] = false;
	}

	// Validate Last Name
	if (isStringFieldValid(newData.lastName)) {
		formValidStatus['lastName'] = true;
	} else {
		formValidStatus['lastName'] = false;
		formValidStatus['allValid'] = false;
	}

	// Validate Organization
	if (isStringFieldValid(newData.organization)) {
		formValidStatus['organization'] = true;
	} else {
		formValidStatus['organization'] = false;
		formValidStatus['allValid'] = false;
	}

	// Validate Email
	if (isEmailFieldValid(newData.email)) {
		formValidStatus['email'] = true;
	} else {
		formValidStatus['email'] = false;
		formValidStatus['allValid'] = false;
	}

	// Validate Phone
	if (isPhoneFieldValid(newData.phone)) {
		formValidStatus['phone'] = true;
	} else {
		formValidStatus['phone'] = false;
		formValidStatus['allValid'] = false;
	}

	// Validate Role.
	if (newData.role !== '' && newData.role !== undefined && newData.role !== null) {
		// From user entry of new role, remove spaces and make lowercase to help with user input validation
		const newRole = newData.role.replace(' ', '').toLowerCase();
		if (newRole !== roles.superAdmin.toLowerCase() && newRole !== roles.admin.toLowerCase() && newRole !== roles.genUser.toLowerCase()) {
			// role does not exist or is SysAdmin
			formValidStatus['role'] = false;
			formValidStatus['allValid'] = false;
		} else {
			formValidStatus['role'] = true;
		}
	} else {
		formValidStatus['role'] = false;
		formValidStatus['allValid'] = false;
	}

	// update validation flags
	store.dispatch({ type: actionTypes.ADMIN_UPDATE_PERMISSION_ERROR, payload: false });
	store.dispatch({ type: actionTypes.ADMIN_UPDATE_VALIDATION_ERROR, payload: !formValidStatus['allValid'] });
	store.dispatch({ type: actionTypes.ADMIN_UPDATE_FNAME_ERROR, payload: !formValidStatus['firstName'] });
	store.dispatch({ type: actionTypes.ADMIN_UPDATE_LNAME_ERROR, payload: !formValidStatus['lastName'] });
	store.dispatch({ type: actionTypes.ADMIN_UPDATE_ORG_ERROR, payload: !formValidStatus['organization'] });
	store.dispatch({ type: actionTypes.ADMIN_UPDATE_EMAIL_ERROR, payload: !formValidStatus['email'] });
	store.dispatch({ type: actionTypes.ADMIN_UPDATE_PHONE_ERROR, payload: !formValidStatus['phone'] });
	store.dispatch({ type: actionTypes.ADMIN_UPDATE_ROLE_ERROR, payload: !formValidStatus['role'] });

	// Return if all fields are valid
	if (formValidStatus['allValid'] === true) {
		return true;
	} else {
		return false;
	}
};

const isPermittedAndValid = (newData, oldData, userPermissions) => {
	if (newData.role !== '' && newData.role !== undefined && newData.role !== null) {
		// From user entry of new role, remove spaces and make lowercase to help with user input validation
		const newRole = newData.role.replace(' ', '').toLowerCase();

		// Validate Permission to edit. Users cannot edit SysAdmin role. Only SuperAdmins can edit SuperAdmin roles
		if (oldData.role === roles.sysAdmin || (newRole === roles.superAdmin.toLowerCase() && !userPermissions.includes('write:editSuperAdmin'))) {
			// user does not have permission to edit
			store.dispatch({ type: actionTypes.ADMIN_UPDATE_PERMISSION_ERROR, payload: true });
			return false;
		}

		return isFormValid(newData);
	} else {
		return isFormValid(newData);
	}
};

export const approvePendingUser = (listOfAllUsers, userData, listOfPendingUsers) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// update front end pending table
		let dataPendingUsersUpdate = [...listOfPendingUsers];
		dataPendingUsersUpdate = dataPendingUsersUpdate.filter((obj) => {
			return obj.userId !== userData.userId;
		});

		store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_PENDING_USERS, payload: dataPendingUsersUpdate });

		// update front end all users table
		let dataAllUsersUpdate = [...listOfAllUsers];
		dataAllUsersUpdate = dataAllUsersUpdate.map((obj) => {
			if (obj.userId === userData.userId) {
				return { ...obj, status: 'unlock' };
			}

			return obj;
		});
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS, payload: dataAllUsersUpdate });

		// update database based on userId
		axios
			.put(baseURL + 'User/updateById/' + userData.userId, {
				userData: {
					account_pending: false,
					account_denied: false,
					account_locked: false,
					account_revoked: false,
					status_change_reason: 'User approved',
					denial_reason: '',
					denial_details: '',
				},
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				if (response.status === 200) {
					store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: true });

					return true;
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.admin);
				store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
				return false;
			});

		clearMessagesOnTimer();
	} else {
		return false;
	}
};

export const denyPendingUser = (listOfAllUsers, userData, listOfPendingUsers, denialReason, denialDetails) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// update front end pending table
		let dataPendingUsersUpdate = [...listOfPendingUsers];
		dataPendingUsersUpdate = dataPendingUsersUpdate.filter((obj) => {
			return obj.userId !== userData.userId;
		});

		store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_PENDING_USERS, payload: dataPendingUsersUpdate });

		// update front end all users table
		let dataAllUsersUpdate = [...listOfAllUsers];
		dataAllUsersUpdate = dataAllUsersUpdate.map((obj) => {
			if (obj.userId === userData.userId) {
				return { ...obj, status: 'warning sign' };
			}

			return obj;
		});
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS, payload: dataAllUsersUpdate });

		// update database based on userId
		axios
			.put(baseURL + 'User/updateById/' + userData.userId, {
				userData: {
					account_pending: false,
					account_denied: true,
					account_locked: true,
					account_revoked: false,
					status_change_reason: 'User denied',
					denial_reason: denialReason,
					denial_details: denialDetails,
				},
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				if (response.status === 200) {
					store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: true });

					return true;
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.admin);
				store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
				return false;
			});

		clearMessagesOnTimer();
	} else {
		return false;
	}
};

export const lockAccount = (userData, listOfAllUsers, lockReason) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// update front end all users table
		let dataAllUsersUpdate = [...listOfAllUsers];
		dataAllUsersUpdate = dataAllUsersUpdate.map((obj) => {
			if (obj.userId === userData.userId) {
				return { ...obj, status: 'lock', status_change_reason: 'Account locked - ' + lockReason };
			}

			return obj;
		});
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS, payload: dataAllUsersUpdate });

		// update database based on userId
		axios
			.put(baseURL + 'User/updateById/' + userData.userId, {
				userData: {
					account_locked: true,
					status_change_reason: 'Account locked - ' + lockReason,
				},
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				if (response.status === 200) {
					store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: true });

					return true;
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.admin);
				store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
				return false;
			});

		clearMessagesOnTimer();
	} else {
		return false;
	}
};

export const unlockAccount = (userData, listOfAllUsers, unlockReason) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// update front end all users table
		let dataAllUsersUpdate = [...listOfAllUsers];
		dataAllUsersUpdate = dataAllUsersUpdate.map((obj) => {
			if (obj.userId === userData.userId) {
				return { ...obj, status: 'unlock', login_attempts: 0, status_change_reason: 'Account unlocked - ' + unlockReason };
			}

			return obj;
		});
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS, payload: dataAllUsersUpdate });

		// update database based on userId
		axios
			.put(baseURL + 'User/updateById/' + userData.userId, {
				userData: {
					account_pending: false,
					account_denied: false,
					account_locked: false,
					account_revoked: false,
					status_change_reason: 'Account unlocked - ' + unlockReason,
					login_attempts: 0,
					denial_reason: '',
					denial_details: '',
				},
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				if (response.status === 200) {
					store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: true });

					return true;
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.admin);
				store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
				return false;
			});

		clearMessagesOnTimer();
	} else {
		return false;
	}
};

export const revokeAccount = (userData, listOfAllUsers, revokeReason) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// update front end all users table
		let dataAllUsersUpdate = [...listOfAllUsers];
		dataAllUsersUpdate = dataAllUsersUpdate.map((obj) => {
			if (obj.userId === userData.userId) {
				return { ...obj, status: 'revoke', status_change_reason: 'Account revoked - ' + revokeReason };
			}

			return obj;
		});
		store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS, payload: dataAllUsersUpdate });

		// NOTE - updating database with revoked status will be handled in NIEM 757
		axios
			.put(baseURL + 'User/updateById/' + userData.userId, {
				userData: {
					account_revoked: true,
					status_change_reason: 'Account revoked - ' + revokeReason,
				},
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: true });
				return true;
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.admin);
				store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
				return false;
			});
		clearMessagesOnTimer();
	} else {
		return false;
	}
};

export async function addUser(newData, listOfAllUsers, userPermissions) {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// check if new email already exists
		if (listOfAllUsers.some((u) => u.email.toLowerCase() === newData.email.toLowerCase())) {
			store.dispatch({ type: actionTypes.ADMIN_UPDATE_EMAIL_EXISTS_ERROR, payload: true });
		} else {
			store.dispatch({ type: actionTypes.ADMIN_UPDATE_EMAIL_EXISTS_ERROR, payload: false });
			const addAllowed = isPermittedAndValid(newData, {}, userPermissions);
			if (addAllowed) {
				// From user entry of new role, remove spaces and make lowercase to help with user input validation
				const newRole = newData.role.replace(' ', '').toLowerCase();

				// Make sure role will go into the DB in the proper textual format
				if (newRole === roles.genUser.toLowerCase()) {
					newData['role'] = roles.genUser;
				} else if (newRole === roles.admin.toLowerCase()) {
					newData['role'] = roles.admin;
				} else if (newRole === roles.superAdmin.toLowerCase()) {
					newData['role'] = roles.superAdmin;
				}

				// get password for this user
				// TODO: Need a user workflow for creating a new password.
				const encryptedPass = await encryptPassword('Password1!');
				const date = new Date();
				const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

				// add user to database and get userId
				const userId = await axios
					.post(baseURL + 'User/create', {
						userData: {
							first_name: newData.firstName,
							last_name: newData.lastName,
							email: newData.email,
							phone: newData.phone,
							user_role: newData.role,
							organization: newData.organization,
							login_attempts: 0,
							salt: encryptedPass.salt,
							hash: encryptedPass.hash,
							password_created: formattedDate,
							account_pending: false,
							account_denied: false,
							account_locked: false,
							account_revoked: false,
							status_change_reason: 'User added by admin',
							forceLogOut: false,
						},
						auditUser: getSessionValue(sessionVar.user_id),
					})
					.then((response) => {
						if (response.status === 200) {
							store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: true });
							return response.data.userId;
						}
					})
					.catch((error) => {
						handleError(error, trackedErrorSources.admin);
						store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
					});

				// update front end table with userId
				newData['userId'] = userId;
				newData['status'] = 'unlock';
				const dataUpdate = [newData, ...listOfAllUsers];
				store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS, payload: dataUpdate });
			}
		}

		clearMessagesOnTimer();
	}
}

export const editUser = (newData, oldData, listOfAllUsers, rowIndex, userPermissions) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		const editAllowed = isPermittedAndValid(newData, oldData, userPermissions);

		// If all fields valid, update table
		if (editAllowed) {
			// From user entry of new role, remove spaces and make lowercase to help with user input validation
			const newRole = newData.role.replace(' ', '').toLowerCase();

			// Make sure role will go into the DB in the proper textual format
			if (newRole === roles.genUser.toLowerCase()) {
				newData['role'] = roles.genUser;
			} else if (newRole === roles.admin.toLowerCase()) {
				newData['role'] = roles.admin;
			} else if (newRole === roles.superAdmin.toLowerCase()) {
				newData['role'] = roles.superAdmin;
			}

			// update front end table
			const dataUpdate = [...listOfAllUsers];
			dataUpdate[rowIndex] = newData;
			store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS, payload: dataUpdate });

			// update database based on userId
			axios
				.put(baseURL + 'User/updateById/' + oldData.userId, {
					userData: {
						first_name: newData.firstName,
						last_name: newData.lastName,
						email: newData.email,
						phone: newData.phone,
						organization: newData.organization,
						user_role: newData.role,
						account_locked: newData.status === 'warning sign' || newData.status === status.lock,
						account_revoked: newData.status === status.revoke,
						status_change_reason: 'User data edited by admin',
					},
					auditUser: getSessionValue(sessionVar.user_id),
				})
				.then(async (response) => {
					if (response.status === 200) {
						store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: true });
						if (newData.role !== oldData.role) {
							// log out user only on successful role change
							await setForceLogOutValue(oldData.userId, true);
						}
						return true;
					}
				})
				.catch((error) => {
					handleError(error, trackedErrorSources.admin);
					store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
					return false;
				});
		}

		clearMessagesOnTimer();
	} else {
		return false;
	}
};

export const deleteUser = async (oldData, listOfAllUsers, rowIndex, userPermissions) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		const userHasPackages = async () => {
			const packages = await getAllUserPackagesApi(oldData.userId);
			if (packages.data.ownedPackages.length > 0) {
				return true;
			} else {
				return false;
			}
		};

		// Validate Permission to edit. Users cannot edit SysAdmin role. Only SuperAdmins can edit SuperAdmin roles
		if (oldData.role === roles.sysAdmin || !userPermissions.includes('write:deleteUsers')) {
			// user does not have permission to edit
			store.dispatch({ type: actionTypes.ADMIN_UPDATE_PERMISSION_ERROR, payload: true });
		} else if (oldData.userId === getSessionValue(sessionVar.user_id)) {
			// user cannot delete themselves
			store.dispatch({ type: actionTypes.ADMIN_UPDATE_DELETE_SELF_ERROR, payload: true });
		} else if (await userHasPackages()) {
			// cannot delete users that have packages
			store.dispatch({ type: actionTypes.ADMIN_UPDATE_DELETE_USER_WITH_PACKAGES_ERROR, payload: true });
		} else {
			// update front end table
			const dataDelete = [...listOfAllUsers];
			dataDelete.splice(rowIndex, 1);
			store.dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS, payload: dataDelete });

			// update database based on userId
			axios
				.delete(baseURL + 'User/deleteById', { data: { userId: oldData.userId, auditUser: getSessionValue(sessionVar.user_id) } })
				.then((response) => {
					if (response.status === 200) {
						store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: true });
						return true;
					} else {
						store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
						return false;
					}
				})
				.catch((error) => {
					handleError(error, trackedErrorSources.admin);
					store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
				});
		}

		clearMessagesOnTimer();
	} else {
		return false;
	}
};

export const getAllUserPackagesApi = async (userId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return await axios
			.get(baseURL + 'mongorepo/packages/' + userId)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				handleError(error);
				return false;
			});
	} else {
		return false;
	}
};

export const getActivityLogApi = async (query) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return await axios
			.post(baseURL + 'Audit/getActivityLog', { auditUser: getSessionValue(sessionVar.user_id), query: query })
			.then((response) => {
				// queried activity log entries fetched, filter further with text input fields (excluding email)
				return response.data;
			})
			.catch((error) => {
				// error occurred during activity log fetch
				handleError(error);
				return false;
			});
	} else {
		return false;
	}
};

export const getUserLastEventApi = async (userId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return await axios
			.post(baseURL + 'Audit/userLastEvent', { auditUser: getSessionValue(sessionVar.user_id), userId: userId })
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				handleError(error);
				return false;
			});
	} else {
		return false;
	}
};

export const getUserLastStatusChangeApi = async (userId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return await axios
			.post(baseURL + 'Audit/userStatusChange', { auditUser: getSessionValue(sessionVar.user_id), userId: userId })
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				handleError(error);
				return false;
			});
	} else {
		return false;
	}
};

export const getErrorLogApi = async (query) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return await axios
			.post(baseURL + 'Error/getErrorLog', { auditUser: getSessionValue(sessionVar.user_id), query: query })
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				// error occurred during error log fetch
				handleError(error);
				return false;
			});
	} else {
		return false;
	}
};

export const setForceLogOutValue = async (userId, bool) => {
	// set the value of forcedLogOut on user
	return await axios
		.put(baseURL + 'User/updateById/' + userId, {
			userData: {
				forceLogOut: bool,
			},
			auditUser: getSessionValue(sessionVar.user_id),
		})
		.catch((error) => handleError(error));
};

export const forceLogOutCheck = async (userId) => {
	// check if user should be forced to log out
	const userData = await getUserInfoApi(userId);
	if (userData.forceLogOut) {
		await setForceLogOutValue(userId, false);
		setLogOut();
	}
};

export const ForceLogOutCheckTimer = (props) => {
	// check user's forceLogOut value perodically
	const interval = 30; // check every 30 seconds
	let time = new Date();
	time.setSeconds(time.getSeconds() + interval);

	const { isRunning, restart } = useTimer({
		expiryTimestamp: time,
		onExpire: () => {
			forceLogOutCheck(props.userId);
		},
	});

	if (isRunning === false || isRunning == null) {
		time = new Date();
		time.setSeconds(time.getSeconds() + interval);
		restart(time);
	}

	return null;
};
