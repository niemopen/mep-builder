import axios from 'axios';
import { baseURL } from './ApiUtil';
import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import { artifactTags, getFilesByTag, getFilesByLabel, getFilesByNodeId } from './ArtifactTreeUtil';
import * as JSZip from 'jszip';
import { handleSavePackage } from './savePackageUtil';
import { handleError } from './ErrorHandleUtil';

const validationEndpoints = {
	messageSpecification: 'GTRIAPI/validation/message-specification',
	messageCatalog: 'GTRIAPI/validation/message-catalog',
	schemaNDR: 'GTRIAPI/validation/schemas/ndr',
	schemaXML: 'GTRIAPI/validation/schemas/xml',
	cmfXML: 'GTRIAPI/validation/cmf/xml',
	instanceJSON: 'GTRIAPI/validation/instances/json',
	instanceXML: 'GTRIAPI/validation/instances/xml',
};

const handleValidationApi = async (artifact) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		const userId = state.session.userId;
		const packageId = state.mpd.packageId;
		const packageName = state.mpd.packageName;
		const artifactTree = state.artifact.treeItems;

		switch (artifact.validatorKey) {
			case validationEndpoints.messageSpecification:
			case validationEndpoints.schemaNDR:
			case validationEndpoints.schemaXML:
				return await axios
					.post(baseURL + artifact.validatorKey, {
						packageId: packageId,
						auditUser: userId,
					})
					.then((response) => {
						return response.data;
					})
					.catch((error) => {
						handleError(error);
						return error.response.data;
					});
			case validationEndpoints.messageCatalog:
			case validationEndpoints.cmfXML:
				return await axios
					.post(baseURL + artifact.validatorKey, {
						fileBlobId: artifact.file.fileBlobId,
						auditUser: userId,
					})
					.then((response) => {
						return response.data;
					})
					.catch((error) => {
						handleError(error);
						return error.response.data;
					});
			case validationEndpoints.instanceXML:
				return await axios
					.post(baseURL + artifact.validatorKey, {
						packageId: packageId,
						fileBlobId: artifact.file.fileBlobId,
						auditUser: userId,
					})
					.then((response) => {
						return response.data;
					})
					.catch((error) => {
						handleError(error);
						return error.response.data;
					});
			case validationEndpoints.instanceJSON:
				const schemaFile = getFilesByLabel(artifactTree, packageName + '.schema.json');
				if (!schemaFile[0]) {
					return {
						errorId: null,
						errorStatus: 500,
						errorMessage:
							'Internal Server Error - Schema not found to validate this instance file. Try translating the package to JSON Schema.',
					};
				}

				return await axios
					.post(baseURL + artifact.validatorKey, {
						fileBlobId: artifact.file.fileBlobId,
						schemaFileBlobId: schemaFile[0].fileBlobId,
						auditUser: userId,
					})
					.then((response) => {
						return response.data;
					})
					.catch((error) => {
						handleError(error);
						return error.response.data;
					});
			default:
				return {};
		}
	} else {
		return {};
	}
};

// This method gathers files required for validation from the artifact tree and parses them into usable validation artifacts
const populateFilesForValidation = (artifactTree) => {
	const state = store.getState();
	const packageName = state.mpd.packageName;
	const samples = getFilesByTag(artifactTree, artifactTags.sample);
	const baseXSD = getFilesByNodeId(artifactTree, '1');
	const catalog = getFilesByTag(artifactTree, artifactTags.catalog);
	const transforms = getFilesByNodeId(artifactTree, '8');
	const files = [...samples, ...transforms[0].children, ...catalog];
	const artifacts = [];

	// Add validation artifacts to collection
	let schemaXML = {
		labelName: 'Schema XML',
		isPass: false,
		validatorKey: validationEndpoints.schemaXML,
		validationResults: {},
		file: baseXSD,
	};
	artifacts.push(schemaXML);

	let schemaNDR = {
		labelName: 'Schema NDR',
		isPass: false,
		validatorKey: validationEndpoints.schemaNDR,
		validationResults: {},
		file: baseXSD,
	};
	artifacts.push(schemaNDR);

	files.forEach((file) => {
		if (file.tag === artifactTags.sample) {
			let sampleArtifact = {
				labelName: file.label + ' Instance',
				isPass: false,
				validatorKey:
					file.fileType === 'xml' ? validationEndpoints.instanceXML : file.fileType === 'json' ? validationEndpoints.instanceJSON : '',
				validationResults: {},
				file: file,
			};
			artifacts.push(sampleArtifact);
		} else if (file.label.substring(file.label.length - 7) === 'cmf.xml') {
			let cmfArtifact = {
				labelName: file.label,
				isPass: false,
				validatorKey: validationEndpoints.cmfXML,
				validationResults: {},
				file: file,
			};
			artifacts.push(cmfArtifact);
		} else if (file.tag === artifactTags.catalog) {
			let catalogArtifact = {
				labelName: file.label,
				isPass: false,
				validatorKey: validationEndpoints.messageCatalog,
				validationResults: {},
				file: file,
			};
			artifacts.push(catalogArtifact);
		}
	});

	const packageLabel = {
		labelName: packageName,
		isPass: false,
		validatorKey: validationEndpoints.messageSpecification,
		validationResults: {},
	};
	artifacts.push(packageLabel);

	return artifacts;
};

export const clearValidationResults = () => {
	// Used to hide validaton results when user changes package contents. Requiring them to revalidate
	store.dispatch({ type: actionTypes.SET_SHOW_VALIDATION_RESULTS, payload: false });
	store.dispatch({ type: actionTypes.RESET_VALIDATION_ARTIFACTS });
};

// This method populates the list of artifacts to validate and validates them, updating the redux and session values in the process.
export async function handleValidation(artifactTree) {
	store.dispatch({ type: actionTypes.IS_VALIDATION_DATA_LOADING, payload: true });

	const toValidate = populateFilesForValidation(artifactTree);

	for (var i in toValidate) {
		let artifact = toValidate[i];
		let results = await handleValidationApi(artifact);
		if (results.errors !== undefined && results.errors === 0) {
			toValidate[i].isPass = true;
		}
		toValidate[i].validationResults = results;
	}

	store.dispatch({ type: actionTypes.UPDATE_VALIDATION_ARTIFACTS, payload: toValidate });
	store.dispatch({ type: actionTypes.SET_SHOW_VALIDATION_RESULTS, payload: true });
	store.dispatch({ type: actionTypes.IS_VALIDATION_DATA_LOADING, payload: false });
	await handleSavePackage(true);
}

export const handleDownloadResults = async () => {
	const state = store.getState();
	const validationArtifacts = state.mpd.validationArtifacts;
	const zip = new JSZip();

	validationArtifacts.forEach((artifact) => {
		// parse validation Results into json file
		let datastr = JSON.stringify(artifact.validationResults);
		let label = artifact.labelName;
		if (label.includes('.')) {
			var [beforeDot, afterDot] = label.split('.');
			if (afterDot.includes('Instance')) {
				label = beforeDot + '_Instance';
			} else if (afterDot.includes('NDR')) {
				label = beforeDot + '_NDR_Conformance';
			} else if (afterDot.includes('XML')) {
				label = beforeDot + '_XML_Schema';
			} else {
				label = beforeDot;
			}
		}
		// add JSON file into zip object
		zip.file(`${label}_results.json`, datastr);
	});

	// generate the .zip and export it
	await zip.generateAsync({ type: 'base64' }).then(function (base64) {
		const element = document.createElement('a');
		element.setAttribute('href', 'data:application/zip;base64,' + base64);
		element.setAttribute('download', 'results.zip');
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	});
};
