import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import axios from 'axios';
import { baseURL } from './ApiUtil';
import { getSessionValue } from './localStorageUtil';
import * as session from './SessionVar';
import { getArtifactFileBlobId, AddArtifactToTree, updateArtifactTreeFileBlobId, artifactTags } from './ArtifactTreeUtil';
import { handleError, trackedErrorSources } from './ErrorHandleUtil';

const uploadFileRequest = (file, packageId, fileId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		const data = new FormData();
		data.append('file', file);
		data.append('packageId', packageId);
		data.append('fileId', fileId);
		data.append('auditUser', getSessionValue(session.user_id));

		return axios
			.post(baseURL + 'Files/upload', data, {
				headers: {
					'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
				},
			})
			.then((response) => {
				if (response.status === 200) {
					return response.data.fileBlobId;
				} else {
					return false;
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.upload);
				return false;
			});
	} else {
		return false;
	}
};

export async function uploadFile(file, packageId, fileId = null) {
	/* Note of input parameters:
        - file: File or Blob type
        - packageId: PackageId this file will be added to
        - fileId: Optional fileId to overwrite if already exists
    */

	if (file instanceof Blob) {
		const fileBlobId = await uploadFileRequest(file, packageId, fileId);
		if (fileBlobId) {
			return { isSuccess: true, fileBlobId: fileBlobId };
		}
	}

	return false;
}

export async function createUpdateFile(artifactTree, packageId, fileObj, fileName, parentNodeId = null, updateCatalog = true, tag = '') {
	/* This method will create or update a file in the database and artifact tree. The package will be saved via downstream method calls
       Input parameters:
            - artifactTree - the current redux state of the artifact tree
            - packageId - the currently open packageId
            - fileObj - a File type object containing the buffer information of the file
            - fileName - the name of the file, including the extension
            - parentNodeId - if it is known which folder in the artifact tree this item belongs in, then pass in the parentNodeId
            - updateCatalog - this flag is set to true by default. A true value will allow the mpdCatalog document to be updated during the save process. A false value can be given if the mpdcatalog does not need to be updated.
    */

	const fileType = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);

	// check if fileblobId already exists in artifact tree to update
	let fileBlobId = getArtifactFileBlobId(artifactTree, fileName, parentNodeId);
	let upload;
	if (fileBlobId) {
		// update existing file in db
		upload = await uploadFile(fileObj, packageId, fileBlobId);
	} else {
		// add new file in db
		upload = await uploadFile(fileObj, packageId);
		fileBlobId = upload.fileBlobId;
	}

	if (upload.isSuccess) {
		// Add artifact to tree
		const artifact = {
			name: fileName,
			type: fileType,
			fileBlobId: fileBlobId,
			tag: tag,
			needsReview: false,
		};
		const newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, parentNodeId);

		// AddArtifactToTree() would not have updated artifact node if it was a duplicate due to current logic, so forcing it here
		if (newArtifactInfo.isDuplicate) {
			// update artifact tree with fileBlobId
			await updateArtifactTreeFileBlobId(artifactTree, newArtifactInfo.artifactNode, fileBlobId, updateCatalog);
		}

		return { isSuccess: true, fileId: upload.fileBlobId };
	} else return { isSuccess: false, fileId: null };
}

export const retrieveFileRequest = (fileId, encoding = 'base64') => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// encoding = base64, utf-8, etc
		return axios
			.post(baseURL + 'Files/retrieveFile', {
				fileId: fileId,
				encoding: encoding,
				auditUser: getSessionValue(session.user_id),
				packageId: getSessionValue(session.open_package_id),
			})
			.then((response) => {
				const parsed = JSON.parse(response.data.fileData);
				const buff = Buffer.from(parsed.blob, encoding);
				return buff;
			})
			.catch((error) => {
				handleError(error);
				return false;
			});
	} else {
		return false;
	}
};

export async function loadMappingSpreadsheetFile(fileId) {
	return await retrieveFileRequest(fileId);
}

export function getFileInfo(files) {
	const state = store.getState();
	const currentTag = state.upload.artifact.tag;

	if (files && files.length) {
		const fileSize = convertBytesToSizes(files[0].size);
		const name = files[0].name;
		const size = fileSize;
		const type = name.substring(name.lastIndexOf('.') + 1, name.length);
		const fileBlob = files[0];

		const newArtifact = { name: name, size: size, type: type, fileBlob: fileBlob, tag: currentTag, needsReview: false };

		store.dispatch({ type: actionTypes.BROWSE_AND_READ_ARTIFACT, payload: newArtifact });
		store.dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED });

		checkIsValidFileType(state.upload.uploadWorkflow, newArtifact);
	}
}

export const checkIsValidFileType = (uploadWorkflow, artifact) => {
	if (artifact.tag === artifactTags.sample) {
		if (artifact.type === 'xml' || artifact.type === 'json') {
			store.dispatch({ type: actionTypes.UPDATE_IS_VALID_FILE_TYPE, payload: true });
			store.dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: false });
		} else {
			store.dispatch({ type: actionTypes.UPDATE_IS_VALID_FILE_TYPE, payload: false });
			store.dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: true });
		}
	} else if (uploadWorkflow.uploadItem === 'code') {
		// file type check for the Import Code section of the CME builder
		if (artifact.type === 'csv' || artifact.type === 'xlsx') {
			store.dispatch({ type: actionTypes.UPDATE_IS_VALID_FILE_TYPE, payload: true });
			store.dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: false });
		} else {
			store.dispatch({ type: actionTypes.UPDATE_IS_VALID_FILE_TYPE, payload: false });
			store.dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: true });
		}
	} else if (uploadWorkflow.uploadItem === artifactTags.businessRules || artifact.tag === artifactTags.businessRules) {
		if (artifact.type !== 'zip' && artifact.type !== 'exe' && artifact.type !== 'tar') {
			store.dispatch({ type: actionTypes.UPDATE_IS_VALID_FILE_TYPE, payload: true });
			store.dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: false });
		} else {
			store.dispatch({ type: actionTypes.UPDATE_IS_VALID_FILE_TYPE, payload: false });
			store.dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: true });
		}
	} else {
		// file is valid
		store.dispatch({ type: actionTypes.UPDATE_IS_VALID_FILE_TYPE, payload: true });
		store.dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: false });
	}
};

const convertBytesToSizes = (bytes, decimal = 2) => {
	// converting bytes to appropiate size (KB, MB, etc)
	var kilobyte = 1024;
	var megabyte = kilobyte * 1024;
	var gigabyte = megabyte * 1024;
	var terabyte = gigabyte * 1024;

	if (bytes >= 0 && bytes < kilobyte) {
		return bytes + ' B';
	} else if (bytes >= kilobyte && bytes < megabyte) {
		return (bytes / kilobyte).toFixed(decimal) + ' KB';
	} else if (bytes >= megabyte && bytes < gigabyte) {
		return (bytes / megabyte).toFixed(decimal) + ' MB';
	} else if (bytes >= gigabyte && bytes < terabyte) {
		return (bytes / gigabyte).toFixed(decimal) + ' GB';
	} else if (bytes >= terabyte) {
		return (bytes / terabyte).toFixed(decimal) + ' TB';
	} else {
		return bytes + ' B';
	}
};

export const copySaveFile = async (fileId, packageId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// this function copies a file and saves it under a new fileBlobId. The original file remaines unmodified.
		return axios
			.post(baseURL + 'Files/copySaveFile', {
				fileId: fileId,
				packageId: packageId,
				auditUser: session.user_id,
			})
			.then((response) => {
				return response.data.data;
			})
			.catch((error) => {
				handleError(error);
			});
	}
};
