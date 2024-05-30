import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { getFilesByTag, exportArtifactItem, artifactTags } from '../Util/ArtifactTreeUtil';
import { createUpdateFile } from '../Util/UploadFileUtil';
import { handleError } from './ErrorHandleUtil';

// API call to retrieve existing user data based on id
export const getUserInfoApi = (userId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.get(baseURL + 'User/findUserById/' + userId)
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

// export file based on tag and grab the first file found
export const exportFile = async (artifactTree, packageName, packageId, tag, index) => {
	const files = getFilesByTag(artifactTree, tag);
	if (files.length > 0) {
		exportArtifactItem(artifactTree, files[index].nodeId, packageName, packageId);
	}
};

// handles which pane to go to next
export const goToNextPane = (activePane, readmeComplete, changelogComplete, isPublishImplementActive) => {
	if (activePane === 2) {
		if (!readmeComplete) {
			store.dispatch({ type: actionTypes.ACTIVE_PANE, payload: 0 });
		} else if (!changelogComplete) {
			store.dispatch({ type: actionTypes.ACTIVE_PANE, payload: 1 });
		} else if (!isPublishImplementActive) {
			store.dispatch({ type: actionTypes.UPDATE_PUBLISH_IMPLEMENT_ACTIVE });
		} else {
			store.dispatch({ type: actionTypes.ACTIVE_PANE, payload: activePane + 1 });
		}
	} else {
		store.dispatch({ type: actionTypes.ACTIVE_PANE, payload: activePane + 1 });
	}
};

// saves text content entered in by the user.
export const saveFile = async (artifactTree, packageId, content, title, tag) => {
	const fileObj = new File([content], title, { type: 'text/plain' });
	const saveResult = await createUpdateFile(artifactTree, packageId, fileObj, title, '7', true, tag);

	if (saveResult.isSuccess) {
		return true;
	} else return false;
};

export const getFileTitle = (artifactTree, tag) => {
	// If user-defined file is uploaded, rename file to that. Otherwise use default name
	const files = getFilesByTag(artifactTree, tag);
	let title = '';
	if (files.length > 0) {
		const fileBasename = files[0].label.substring(0, files[0].label.lastIndexOf('.') + 1);
		title = `${fileBasename}txt`;
	} else {
		if (tag === artifactTags.readme) {
			title = 'readme.txt';
		} else if (tag === artifactTags.conformance) {
			title = 'conformance-assertion.txt';
		}
	}

	return title;
};
