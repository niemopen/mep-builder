import store from '../redux/store';
import * as httpStatus from 'http-status';
import * as actionTypes from '../redux/actions';
import { baseURL } from './ApiUtil';
import axios from 'axios';
import { getSessionValue } from './localStorageUtil';
import * as sessionVar from '../Util/SessionVar';

export const trackedErrorSources = {
	admin: 'admin',
	cme: 'CME',
	export: 'export',
	generic: 'generic',
	ssgt: 'ssgt',
	subset: 'subset',
	system: 'system',
	transfer: 'transfer',
	translate: 'translate',
	upload: 'upload',
	user: 'user',
	wantlist: 'wantlist',
};

async function handleErrorApi(error) {
	const data = {
		errorData: error,
		auditUser: getSessionValue(sessionVar.user_id),
	};

	const loggedError = await axios.post(baseURL + 'Error/log', data).catch(async (err) => {
		if (!err.response.data.errorId) {
			// for possibility of unlogged error coming from backend
			return await axios.post(baseURL + 'Error/log', { ...data, errorData: err }).catch((loggedError) => {
				return loggedError;
			});
		} else {
			return err;
		}
	});

	return loggedError;
}

export const handleError = async (errorResponse, source = trackedErrorSources.generic) => {
	var loggedError;
	var errorSource = source;

	/**
	 * If API/DB cannot be reached:
	 * 	- Show System Notification message
	 * 	- Pause execution of any further API calls
	 * 	- Log error to the console
	 */
	if (!!errorResponse.code && (errorResponse.code === 'ERR_NETWORK' || errorResponse.code === 'ERR_CONNECTION_REFUSED')) {
		// since API can't be reached, do not attempt to log the error to the DB and populate error details without errorID
		const errorId = undefined;
		const errorStatus = errorResponse.code;
		const errorMessage = JSON.stringify(errorResponse, null, 2);
		errorSource = trackedErrorSources.system;
		store.dispatch({
			type: actionTypes.UPDATE_API_ERROR_DETAILS,
			payload: { errorId: errorId, errorStatus: errorStatus, errorSource: errorSource, errorSummary: undefined, errorMessage: errorMessage },
		});
		console.error('Error: ', errorResponse);
		store.dispatch({ type: actionTypes.UPDATE_API_ERROR_DETAILS_MODAL_OPEN, payload: true });
		return;
	}

	// if error not logged in DB; log it
	if (!errorResponse.response.data.errorId) {
		loggedError = await handleErrorApi(errorResponse);
	} else {
		loggedError = errorResponse;
	}

	// populate data required for Api Error Details
	const errorId = loggedError.response.data.errorId;
	const errorStatus = loggedError.response.data.errorStatus;
	const errorMessage =
		typeof loggedError.response.data.errorMessage === 'object'
			? JSON.stringify(loggedError.response.data.errorMessage, null, 2)
			: loggedError.response.data.errorMessage;

	// send API error details to redux
	store.dispatch({
		type: actionTypes.UPDATE_API_ERROR_DETAILS,
		payload: {
			errorId: errorId,
			errorSource: errorSource,
			errorSummary: `${errorStatus} ${httpStatus[errorStatus]}`,
			errorMessage: errorMessage,
		},
	});

	if (errorSource === trackedErrorSources.generic) {
		store.dispatch({ type: actionTypes.UPDATE_API_ERROR_DETAILS_MODAL_OPEN, payload: true });
	}

	// log the error to the console
	console.error('Error: ', loggedError);
	if (errorSource === trackedErrorSources.upload) {
		// open modal on failed file upload
		store.dispatch({ type: actionTypes.UPDATE_API_ERROR_DETAILS_MODAL_OPEN, payload: true });
	}
};
