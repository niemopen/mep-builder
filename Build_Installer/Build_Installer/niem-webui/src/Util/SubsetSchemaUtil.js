import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import * as base64 from 'base-64';
import * as dateFormat from 'dateformat';
import { getExportFileData } from './ArtifactTreeUtil';
import { handleError, trackedErrorSources } from './ErrorHandleUtil';

const getSsgtSubsetSchema = (wantlistEncoded, includeDocumentation, includeWantlist, packageId, userId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'SSGT/getSubsetSchema', {
				auditUser: userId,
				packageId: packageId,
				wantlist: wantlistEncoded,
				includeDocumentation: includeDocumentation,
				includeWantlist: includeWantlist,
			})
			.then((response) => {
				store.dispatch({ type: actionTypes.RESET_API_ERROR_DETAILS });
				return response.data;
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.subset);
				return false;
			});
	} else {
		return false;
	}
};

export async function generateSubsetSchema(wantlist, includeDocumentation, includeWantlist, packageId, userId) {
	const wantlistSerialized = wantlist.toString();
	const wantlistEncoded = base64.encode(wantlistSerialized);

	const encodedResponse = await getSsgtSubsetSchema(wantlistEncoded, includeDocumentation, includeWantlist, packageId, userId);

	let result;
	if (encodedResponse) {
		result = true;
	} else {
		result = false;
	}

	// show success message for a limited time
	store.dispatch({ type: actionTypes.SET_SHOW_SUBSET_MESSAGE, payload: true });
	setTimeout(() => {
		store.dispatch({ type: actionTypes.SET_SHOW_SUBSET_MESSAGE, payload: false });
	}, 10 * 1000);

	return result;
}

export async function downloadSubsetSchema(packageId) {
	// the SubsetSchema is everything within the base-xsd/niem folder (nodeId = 1.1)
	return getExportFileData('1.1', packageId).then((result) => {
		if (result.data !== false) {
			// Get filename for download, including date and time in UTC
			const currentDate = dateFormat(new Date(), 'UTC:mm-dd-yyyy HHMM');
			const filename = 'Subset Schema ' + currentDate + '.zip';

			// download data
			const element = document.createElement('a');
			element.setAttribute('href', 'data:text/plain;base64,' + result.data);
			element.setAttribute('download', filename);

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);

			return true;
		} else {
			// Error with data download
			return false;
		}
	});
}
