import axios from 'axios';
import { baseURL } from './ApiUtil';
import { setSessionValue, getSessionValue } from './localStorageUtil';
import * as sessionVar from './SessionVar';
import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import { setActiveTab } from '../Navigation/HeaderNavMenu';
import { resetArtifactTree } from './ArtifactTreeUtil';
import { clearUnsavedData } from './localStorageUtil';
import { UpdateMPDCatalog } from './MPDCatalogUtil';
import { resetMappingGrid } from './MappingDocumentUtil';
import { clearValidationResults } from './ValidationUtil';
import { handleError } from './ErrorHandleUtil';

export const closePackage = () => {
	store.dispatch({
		type: actionTypes.UPDATE_OVERWRITE_SAVE,
		payload: false,
	});
	store.dispatch({ type: actionTypes.RESET_MPD_CATALOG_FORM });
	store.dispatch({ type: actionTypes.RESET_CME_BUILDER });
	store.dispatch({ type: actionTypes.IS_TRANSLATION_GENERATED, payload: false });
	resetArtifactTree();
	resetMappingGrid();
	setActiveTab('MyHome');
	clearUnsavedData();
	setSessionValue(sessionVar.open_package_id, '', actionTypes.UPDATE_MPD_PACKAGE_ID);
	setSessionValue(sessionVar.open_package_name, '', actionTypes.UPDATE_MPD_PACKAGE_NAME);
	store.dispatch({ type: actionTypes.RETURN_HOME_ON_SAVE, payload: false });
};

export const checkIfDuplicatePackageNameExists = async (openPackageName, openPackageId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.get(baseURL + 'MongoRepo/mpdData/' + getSessionValue(sessionVar.user_id))
			.then((response) => {
				let packageNameExists = false;
				let existingPackageId = '';

				response.data.forEach((row) => {
					if (openPackageName === row.PackageName) {
						packageNameExists = true;
						if (openPackageId !== row.PackageId) {
							existingPackageId = row.PackageId;
						}
					}
				});

				return { packageNameExists, existingPackageId };
			})
			.catch((error) => handleError(error));
	} else {
		return { packageNameExists: true, existingPackageId: '' };
	}
};

export async function handleSavePackage(overwriteSave = null, updateCatalog = true) {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// save under the correct userId, prevents package from changing ownership
		let userId = '';
		if (state.mpd.packageOwnerId === state.session.userId || state.mpd.packageOwnerId === '') {
			userId = state.session.userId;
		} else {
			userId = state.mpd.packageOwnerId;
		}
		const artifactTree = state.artifact.treeItems;
		const mappingDocument = state.mappingDoc;

		if (overwriteSave === null) {
			overwriteSave = state.existing.overwriteSave;
		}

		// mpd catalog data
		const packageId = state.mpd.packageId;
		const packageName = state.mpd.packageName;
		const release = state.mpd.release;
		const version = state.mpd.version;
		const status = state.mpd.status;
		const statusNo = state.mpd.statusNo;
		const pointOfContact = state.mpd.pointOfContact;
		const email = state.mpd.email;
		const description = state.mpd.description;
		const organizationName = state.mpd.organizationName;
		const organizationType = state.mpd.organizationType;
		const coiTags = state.mpd.coiTags;
		const exchangeTags = state.mpd.exchangeTags;
		const uri = state.mpd.uri;
		const creationDate = state.mpd.creationDate;
		const format = state.mpd.format;
		const isReleaseLocked = state.mpd.isReleaseLocked;
		const isRequiredArtifactUploaded = state.mpd.isRequiredArtifactUploaded;
		const cmeData = state.cme.cmeData;
		const isPublished = state.mpd.isPublished;
		const isCopiedPackage = state.mpd.isCopiedPackage;
		const isMigratedPackage = state.mpd.isMigratedPackage;
		const isTranslationGenerated = state.translate.isTranslationGenerated;
		const validationArtifacts = state.mpd.validationArtifacts;
		const showValidationResults = state.mpd.showValidationResults;

		// mapping documents
		const propertySheet = state.mappingDoc.propertySheet;
		const typeSheet = state.mappingDoc.typeSheet;
		const typeHasPropertySheet = state.mappingDoc.typeHasPropertySheet;
		const codesFacetsSheet = state.mappingDoc.codesFacetsSheet;
		const namespaceSheet = state.mappingDoc.namespaceSheet;
		const localTerminologySheet = state.mappingDoc.localTerminologySheet;
		const typeUnionSheet = state.mappingDoc.typeUnionSheet;
		const metadataSheet = state.mappingDoc.metadataSheet;

		// only save if packageName is populated
		if (packageName !== '' && packageName != null) {
			// now check if package name currently exists
			const { packageNameExists: fileNameExists, existingPackageId } = await checkIfDuplicatePackageNameExists(packageName, packageId);
			if (!fileNameExists || overwriteSave) {
				// track which package is opened
				setSessionValue(sessionVar.open_package_name, packageName);

				// save to database and get returned packageId
				const returnedPackageId = await axios
					.post(baseURL + 'MongoRepo/savePackage', {
						packageData: {
							packageId: packageId,
							userId: userId,
							packageName: packageName,
							niemRelease: release,
							version: version,
							status: status,
							statusNo: statusNo,
							poc: pointOfContact,
							pocEmail: email,
							description: description,
							orgName: organizationName,
							orgType: organizationType,
							coiTags: coiTags,
							exchangeTags: exchangeTags,
							format: format,
							isReleaseLocked: isReleaseLocked,
							isRequiredArtifactUploaded: JSON.stringify(isRequiredArtifactUploaded),
							cmeData: JSON.stringify(cmeData),
							artifactTree: JSON.stringify(artifactTree),
							mappingDoc: JSON.stringify(mappingDocument),
							isPublished: isPublished,
							isCopiedPackage: isCopiedPackage,
							isMigratedPackage: isMigratedPackage,
							isTranslationGenerated: isTranslationGenerated,
							validationArtifacts: validationArtifacts,
							showValidationResults: showValidationResults,
						},
						auditUser: getSessionValue(sessionVar.user_id),
					})
					.then((response) => {
						return response.data.packageId;
					})
					.catch((error) => handleError(error));

				if (returnedPackageId) {
					setSessionValue(sessionVar.open_package_id, returnedPackageId, actionTypes.UPDATE_MPD_PACKAGE_ID);
					if (returnedPackageId !== packageId) {
						// clear validation results if a new package is created during the save process
						clearValidationResults();
					}

					axios.post(baseURL + 'MongoRepo/saveComponents', {
						componentData: {
							packageId: returnedPackageId,
							propertySheet: propertySheet,
							typeSheet: typeSheet,
							typeHasPropertySheet: typeHasPropertySheet,
							codesFacetsSheet: codesFacetsSheet,
							namespaceSheet: namespaceSheet,
							localTerminologySheet: localTerminologySheet,
							typeUnionSheet: typeUnionSheet,
							metadataSheet: metadataSheet,
						},
						auditUser: getSessionValue(sessionVar.user_id),
					});

					if (updateCatalog) {
						// update catalog xml
						const mpdData = {
							root: {
								PackageId: returnedPackageId,
								UserId: userId,
								PackageName: packageName,
								Release: release,
								Version: version,
								Status: status,
								StatusNo: statusNo,
								PointOfContact: pointOfContact,
								Email: email,
								Description: description,
								OrganizationName: organizationName,
								OrganizationType: organizationType,
								COITags: coiTags,
								ExchangeTags: exchangeTags,
								URI: uri,
								CreationDate: creationDate,
								Format: format,
								isReleaseLocked: isReleaseLocked,
								isPublished: isPublished,
							},
						};
						await UpdateMPDCatalog(artifactTree, mpdData, returnedPackageId);
					}
				}

				// reset to false, so if user attemps MEP name change again, the warning modal will show
				store.dispatch({ type: actionTypes.IS_MEP_NAME_EDITABLE, payload: false });
				// clear temporary data from session store
				clearUnsavedData();
				return false;
			} else {
				store.dispatch({ type: actionTypes.UPDATE_DUPLICATE_PACKAGE_ID, payload: existingPackageId });
				store.dispatch({ type: actionTypes.EXISTING_MEP_NAME_MODAL_OPEN, payload: true });
				// clear temporary data from session store
				clearUnsavedData();
				return true;
			}
		}

		store.dispatch({ type: actionTypes.UPDATE_IS_AUTO_SAVING, payload: false });
	}
}

export const handleSaveClosePackage = async (overwriteSave = null) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		store.dispatch({ type: actionTypes.RETURN_HOME_ON_SAVE, payload: true });
		const isExistingMep = await handleSavePackage(overwriteSave);
		// only clear and return to home if it's not an Existing MEP. Otherwise, the Existing MEP Modal will be called first to confirm save and close
		if (isExistingMep === false) {
			closePackage();
		}
	}
};
