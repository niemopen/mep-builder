import axios from 'axios';
import { baseURL } from './ApiUtil';
import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import * as sessionVar from '../Util/SessionVar';
import { getSessionValue } from '../Util/localStorageUtil';
import { handleError, trackedErrorSources } from './ErrorHandleUtil';

export const translateToJsonLd = (packageId, userId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'Files/translateToJsonLd', {
				packageId: packageId,
				auditUser: userId,
			})
			.then((response) => {
				if (response.status === 200) {
					return true;
				} else {
					return false;
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.translate);
				return false;
			});
	} else {
		return false;
	}
};

export const translateViaCMF = (type, packageId, userId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'Files/translateViaCMF', {
				translateType: type,
				packageId: packageId,
				auditUser: userId,
			})
			.then((response) => {
				if (response.status === 200) {
					return true;
				} else {
					return false;
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.translate);
				return false;
			});
	} else {
		return false;
	}
};

const getTranslationStatusApi = async (packageId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.get(baseURL + 'MongoRepo/getTranslationGenerationStatus/' + packageId)
			.then((response) => {
				return response.data.isTranslationGenerated;
			})
			.catch((err) => {
				handleError(err);
			});
	}
};

const updateTranslationStatusApi = async (packageId, isTranslationGenerated) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.patch(baseURL + 'MongoRepo/updateTranslationGenerationStatus', {
				packageData: {
					packageId: packageId,
					isTranslationGenerated: isTranslationGenerated,
				},
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				return response;
			})
			.catch((err) => {
				handleError(err);
			});
	}
};

export const isTranslationGenerated = async (packageId) => {
	// this function gets the isTranslationGenerated from the db and updates redux
	const isTranslationGenerated = await getTranslationStatusApi(packageId);
	store.dispatch({ type: actionTypes.IS_TRANSLATION_GENERATED, payload: isTranslationGenerated });
	return isTranslationGenerated;
};

export const updateTranslationStatus = async (packageId, isTranslationGenerated) => {
	// this function updates the isTranslationGenerated in the db and updates redux
	store.dispatch({ type: actionTypes.IS_TRANSLATION_GENERATED, payload: isTranslationGenerated });
	await updateTranslationStatusApi(packageId, isTranslationGenerated);
};
