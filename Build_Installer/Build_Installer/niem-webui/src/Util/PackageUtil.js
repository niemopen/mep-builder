import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import * as session from './SessionVar';
import { getSessionValue, setSessionValue } from './localStorageUtil';
import { getExistingPackageData, UpdateMetadata, UpdateMappingGrid } from '../components/MyHomeTableView';
import { deleteItemFromTree, deleteItemsByFolder, getFilesByLabel, getItemsByFileType, getFilesByTag, artifactTags } from './ArtifactTreeUtil';
import { updateArtifactTreeFileBlobId } from './ArtifactTreeUtil';
import { copySaveFile } from './UploadFileUtil';
import { updateArtifactChecklist } from '../Shared/ArtifactChecklist';
import { updateTranslationStatus } from './TranslationUtil';
import { handleError } from './ErrorHandleUtil';

// deletes file from file collections in mongoDB
export async function deleteItemFileBlob(fileBlobId) {
	const state = store.getState();
	const packageId = state.mpd.packageId;
	await deleteFileApi(fileBlobId, packageId);
}

// deletes single file from db based on fileblobId and packageId
export const deleteFileApi = async (fileBlobId, packageId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.delete(baseURL + 'Files/deleteFile', {
				data: {
					fileId: fileBlobId,
					packageId: packageId,
					auditUser: session.user_id,
				},
			})
			.then((response) => {
				return response.data.data;
			})
			.catch((error) => {
				handleError(error);
			});
	}
};

// this function copies all files in the orginial package's artifactTree and saves them under a new fileBlobId, updating the newly copied package's artifactTree with those new fileBlobIds.
// currently only used when copying a package or migrating
export const updateNewPkgArtifacts = async (newPackageId) => {
	// need to use the new package's package id - this will already have been updated in handleCopyApi() or handleMigration()
	const state = store.getState();
	const copiedPkgPkgId = state.copyMEP.copiedPkgPkgId;
	const migratedPackageId = state.migration.migratedPackageId;

	// determine whether user is copying a package or migrting, based on which variable has been updated
	if (copiedPkgPkgId !== '') {
		newPackageId = copiedPkgPkgId;
	} else {
		newPackageId = migratedPackageId;
	}

	// go through all artifacts and update fileblob ids
	if (newPackageId !== '') {
		// get the lastest version of the new package's artifact tree
		const newPackageData = await getExistingPackageData(newPackageId);
		const newArtifactTree = newPackageData.artifactTree;
		const artifacts = [];

		const loopThrough = (items) => {
			items.forEach((item) => {
				if (item.fileType !== 'folder') {
					artifacts.push(item);
				}

				const children = item.children;
				if (children && children.length > 0) {
					loopThrough(children);
				}
			});
		};

		loopThrough(newArtifactTree);

		for (let i = 0; i < artifacts.length; i++) {
			const artifactObj = artifacts[i];
			const copySaveFileResult = await copySaveFile(artifactObj.fileBlobId, newPackageId); // returns the new fileBlobId
			await updateArtifactTreeFileBlobId(newArtifactTree, artifactObj.nodeId, copySaveFileResult.fileBlobId, false); // update the artifactTree file with the new fileBlobId

			// update artifact tags and redux to reflect needsReview status
			if (copiedPkgPkgId !== '' || migratedPackageId !== '') {
				if (artifactObj.tag === artifactTags.sample) {
					artifactObj.needsReview = true;
					if (!state.artifact.sampleNeedsReview) {
						store.dispatch({ type: actionTypes.SET_SAMPLE_NEEDS_REVIEW, payload: true });
					}
				}
				if (artifactObj.tag === artifactTags.changelog) {
					artifactObj.needsReview = true;
					if (!state.artifact.changelogNeedsReview) {
						store.dispatch({ type: actionTypes.SET_CHANGELOG_NEEDS_REVIEW, payload: true });
					}
				}
				if (artifactObj.tag === artifactTags.readme) {
					artifactObj.needsReview = true;
					if (!state.artifact.readmeNeedsReview) {
						store.dispatch({ type: actionTypes.SET_README_NEEDS_REVIEW, payload: true });
					}
				}
			}
		}
		return newArtifactTree;
	}
};

// this function removes specific artifacts after artifacts have been copied over during the Copy Package workflow (as of NIEM release v3.0 June 2023)
export const removeArtifactsAfterCopy = async (newPackageId, newArtifactTree) => {
	// go through all artifacts and delete unneeded artifacts, updating latestTree along the way
	if (newPackageId !== '') {
		// 1. Empty 'base-xsd' folder
		newArtifactTree = await deleteItemsByFolder('1');

		// 2. Empty 'transforms' folder
		const transformsFiles = getFilesByLabel(newArtifactTree, 'Transforms');
		const trandformsFolderNodeId = transformsFiles[0].nodeId;
		newArtifactTree = await deleteItemsByFolder(trandformsFolderNodeId);

		// 3. Remove JSON-LD files
		const jsonLdFiles = getItemsByFileType(newArtifactTree, 'jsonld');
		const loopThroughForJsonLdFiles = async (items) => {
			for (const item of items) {
				newArtifactTree = await deleteItemFromTree(item.nodeId);

				const children = item.children;
				if (children && children.length > 0) {
					loopThroughForJsonLdFiles(children);
				}
			}
			return newArtifactTree;
		};

		newArtifactTree = await loopThroughForJsonLdFiles(jsonLdFiles);

		// 4. Remove files based on fileTag (subset schema, extension.xsd, mpd/xml-catalog, conformance)
		const removableFileTags = [
			artifactTags.subsetSchema,
			artifactTags.extension,
			artifactTags.catalog,
			artifactTags.conformance,
			artifactTags.wantlist,
		];

		// for each specified tag above, get all files with these tags, go through them and delete them from artifactTree, which also deletes item from db downstream
		const loopThroughForFileTags = (items) => {
			items.forEach(async (tag) => {
				const filesToRemove = getFilesByTag(newArtifactTree, tag);
				const loopThrough = async (items) => {
					for (const item of items) {
						newArtifactTree = await deleteItemFromTree(item.nodeId);
						const children = item.children;
						if (children && children.length > 0) {
							loopThrough(children);
						}
					}

					return newArtifactTree;
				};

				await loopThrough(filesToRemove);
			});

			return newArtifactTree;
		};

		loopThroughForFileTags(removableFileTags);

		// Finally, update ArtifactChecklist as some required artifacts have been deleted - NOTE: orginial checklist flags will remain the same for readme and changelog files)
		for (let i = 0; i < removableFileTags.length; i++) {
			const artifact = removableFileTags[i];
			await updateArtifactChecklist(newPackageId, artifact, false);
		}

		// update isTranslationGeneratedStatus to false in the db and update redux
		await updateTranslationStatus(newPackageId, false);
		return newArtifactTree;
	}
};

export const updateReduxFromPackageData = async (rowData, dispatch, updateMappingGrid = true) => {
	// Make API call to get the existing package data from the local repository
	const existingPackageData = await getExistingPackageData(rowData.PackageId);

	if (existingPackageData) {
		// Update reducer files
		UpdateMetadata(existingPackageData['mpdData'], dispatch);
		dispatch({ type: actionTypes.UPDATE_ARTIFACT_TREE, payload: { treeItems: existingPackageData['artifactTree'] } });
		if (updateMappingGrid) {
			UpdateMappingGrid(existingPackageData['mappingDoc'], dispatch);
		}
	}
};

export const deleteSubsetSchemaFiles = async (packageId) => {
	// Empty 'base-xsd' folder
	await deleteItemsByFolder('1');
	await updateArtifactChecklist(packageId, artifactTags.subsetSchema, false);
};

export const deleteTranslatedFiles = async (packageId, artifactTree) => {
	// Empty 'transforms' folder
	let newArtifactTree = artifactTree;

	const transformsFiles = getFilesByLabel(newArtifactTree, 'Transforms');
	const trandformsFolderNodeId = transformsFiles[0].nodeId;
	newArtifactTree = await deleteItemsByFolder(trandformsFolderNodeId);

	// Remove JSON-LD files
	const jsonLdFiles = getItemsByFileType(newArtifactTree, 'jsonld');
	const loopThroughForJsonLdFiles = async (items) => {
		for (const item of items) {
			newArtifactTree = await deleteItemFromTree(item.nodeId);

			const children = item.children;
			if (children && children.length > 0) {
				loopThroughForJsonLdFiles(children);
			}
		}
		return newArtifactTree;
	};

	newArtifactTree = await loopThroughForJsonLdFiles(jsonLdFiles);

	// update isTranslationGeneratedStatus to false in the db and update redux
	await updateTranslationStatus(packageId, false);

	// update redux files
	store.dispatch({ type: actionTypes.RERENDER_ARTIFACT_TREE });
	setSessionValue(session.unsaved_artifact_tree, { treeItems: newArtifactTree }, actionTypes.UPDATE_ARTIFACT_TREE);
};

export const findPublishedPackagesApi = async () => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'MongoRepo/publishedPackages/', {
				auditUser: getSessionValue(session.user_id),
			})
			.then((response) => {
				return response.data.publishedPackages;
			})
			.catch((error) => {
				handleError(error);
				return [];
			});
	} else {
		return [];
	}
};

export const isDuplicatePublishedPackageName = async (packageName) => {
	// checks if package name is a duplicate of any published package in the db
	const packages = await findPublishedPackagesApi();
	const results = packages.filter((pkg) => pkg.packageName === packageName);

	if (results.length > 0) {
		return true;
	} else {
		return false;
	}
};

export const getSortedMpdDataApi = async () => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// retrieves unpublished and published packages from the DB; splitting them into seperate collections
		return await axios
			.get(baseURL + 'MongoRepo/sortedMpdData/' + getSessionValue(session.user_id))
			.then((response) => {
				return { unpublished: response.data.unpublished, published: response.data.published };
			})
			.catch((error) => {
				handleError(error);
				return { unpublished: [], published: [] };
			});
	} else {
		return { unpublished: [], published: [] };
	}
};

export const refreshMyHomePackages = ({ unpublishedPackages, publishedPackages }) => {
	// refreshes the packages rendered on the home page
	if (unpublishedPackages) {
		// if unpublished packages have been passed in, update redux list
		store.dispatch({ type: actionTypes.UPDATE_UNPUBLISHED_PACKAGES_LIST, payload: unpublishedPackages });
	}
	if (publishedPackages) {
		// if published packages have been passed in, update redux list
		store.dispatch({ type: actionTypes.UPDATE_PUBLISHED_PACKAGES_LIST, payload: publishedPackages });
	}
};
