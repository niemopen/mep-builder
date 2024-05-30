import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { handleError } from './ErrorHandleUtil';
import store from '../redux/store';

export const getReleaseProgressStatus = async () => {
	return axios
		.get(baseURL + 'Releases/getReleaseProgressStatus')
		.then((response) => {
			return { label: response.data.status.label, value: response.data.status.totalCompleted, total: response.data.status.totalItems };
		})
		.catch((error) => {
			handleError(error);
		});
};

export const updateReleaseViaNiem = async (userId, currentRelease) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'Releases/updateReleaseViaNiem', {
				userId: userId,
				currentRelease: currentRelease,
			})
			.then((response) => {
				return response.data.result;
			})
			.catch((error) => {
				handleError(error);
			});
	}
};

export const checkAvailableReleases = async () => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.get(baseURL + 'Releases/checkAvailableReleases')
			.then((response) => {
				return response.data.releases.data;
			})
			.catch((error) => {
				handleError(error);
			});
	}
};

export const getLoadedReleases = async () => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.get(baseURL + 'Releases/getLoadedReleases')
			.then((response) => {
				const sortedReleases = response.data.releases;
				return sortedReleases;
			})
			.catch((error) => {
				handleError(error);
			});
	}
};
