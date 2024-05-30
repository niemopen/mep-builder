import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { setSessionValue, getSessionValue } from '../Util/localStorageUtil';
import * as sessionVar from '../Util/SessionVar';
import { handleSavePackage } from './savePackageUtil';
import { handleError, trackedErrorSources } from './ErrorHandleUtil';

export async function getArtifactTreeFromDB(packageId) {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'ArtifactTree/getArtifactTree/' + packageId, { auditUser: getSessionValue(sessionVar.user_id) })
			.then((response) => {
				return JSON.parse(response.data.data);
			})
			.catch((error) => {
				handleError(error);
			});
	}
}

export async function updateReduxArtifactTreeFromDB(packageId) {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// get artifact tree from db
		const artifactTree = await getArtifactTreeFromDB(packageId);

		// update redux with new artifactTree from DB
		if (artifactTree) {
			setSessionValue(sessionVar.unsaved_artifact_tree, { treeItems: artifactTree }, actionTypes.UPDATE_ARTIFACT_TREE);
			store.dispatch({ type: actionTypes.RERENDER_ARTIFACT_TREE });
		}

		return artifactTree;
	}
}

export async function getExportFileData(nodeId, packageId) {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'MongoRepo/export', {
				packageId: packageId,
				nodeId: nodeId,
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				if (response.status === 200) {
					return { data: JSON.parse(response.data)['blob'], type: JSON.parse(response.data)['type'] };
				} else {
					return { data: false };
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.export);
				return { data: false };
			});
	} else {
		return { data: false };
	}
}

const deleteItemFromTreeApi = async (packageId, nodeId, deleteFileBlob) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		// deletes item from the artifactTree and its fileBlob in the db
		return axios
			.post(baseURL + 'ArtifactTree/deleteItemFromTree', {
				packageId: packageId,
				nodeId: nodeId,
				deleteFileBlob: deleteFileBlob,
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				handleError(error);
			});
	}
};

const deleteItemsByFolderApi = async (packageId, parentNodeID) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'ArtifactTree/deleteItemsByFolder', {
				packageId: packageId,
				parentNodeId: parentNodeID,
				initialTree: getTreeInitialState(),
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				handleError(error);
			});
	}
};

export const getTopmostParentNodeId = (nodeId) => {
	// grabs the topmost parent node id of the item
	let parentNodeId = '';

	if (nodeId.length === 1) {
		parentNodeId = nodeId;
	} else {
		const splitNodeId = nodeId.split('.');
		parentNodeId = splitNodeId[0];
	}

	return parentNodeId;
};

const getNextNodePart = (items) => {
	let nodeParts;
	let nodeMax = 0;

	items.forEach(function (item) {
		nodeParts = item.nodeId.split('.');
		if (parseInt(nodeParts[nodeParts.length - 1]) > parseInt(nodeMax)) {
			nodeMax = nodeParts[nodeParts.length - 1];
		}
	});

	nodeMax = parseInt(nodeMax) + 1;

	return nodeMax + 1;
};

export const getBranchChildren = (artifactTree, parentNodeId) => {
	// This function returns the branch json structure of the children (parent folder not included)
	let branch = [];

	const loopThrough = (items) => {
		items.every((item) => {
			if (item.nodeId === parentNodeId) {
				branch = item.children;
				return false; // break out of .every loop
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}

			return true; // continue through .every loop
		});
	};

	loopThrough(artifactTree);
	return branch;
};

const getBranchChildrenNodeIds = (artifactTree, parentNodeId) => {
	// This getBranchChildrenNodeIds returns the parentNodeID and all its children
	const nodeIds = [];

	const loopThrough = (items) => {
		items.forEach((item) => {
			if (item.nodeId.startsWith(parentNodeId)) {
				nodeIds.push(item.nodeId);
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(artifactTree);

	return nodeIds;
};

const makeBranchVisible = (artifactTree, nodeId, recursive = false) => {
	// This makeBranchVisible function will make a specific artifact node visible in the artifact tree
	/* Note input parameters are:
            - artifactTree (the current artifact tree),
            - nodeID (the specific artifact item that should be made visible)
            - recursive (this is an optional parameter. If received as true, this will make the given node plus all its children visible)
    */
	const loopThrough = (items, nodeBranch) => {
		items.find((item) => {
			if (item.nodeId === nodeBranch) {
				item.isVisible = true;
				return true; //break
			} else if (item.children && item.children.length > 0) {
				loopThrough(item.children, nodeBranch);
			}

			return false; //continue
		});

		store.dispatch({ type: actionTypes.UPDATE_ARTIFACT_NODE, payload: { treeItems: items } });
	};

	if (recursive) {
		// get all nodeIDs in this branch
		const allBranchNodes = getBranchChildrenNodeIds(artifactTree, nodeId);
		allBranchNodes.forEach((node) => {
			loopThrough(artifactTree, node);
		});
	} else {
		loopThrough(artifactTree, nodeId);
	}
};

// get folder path of item's parent folder based on nodeId
export function getFolderPath(artifactTree, nodeId) {
	let folderPath = '';
	let nodeNameLib = {}; // library to store labels for each node so we can build parent folder path
	let parentNodeId = '';
	let packageName = '';
	const files = getFilesByNodeId(artifactTree, '0');

	// if not files are found return function. folderPath will be an empty string.
	if (files.length === 0) {
		return folderPath;
	} else {
		packageName = files[0].label;
	}

	// retrieve the parent Id of item
	if (nodeId.length !== 1) {
		const splitNodeId = nodeId.split('.');
		const removeLastItem = splitNodeId.slice(0, splitNodeId.length - 1);
		parentNodeId = removeLastItem.join('.');
	} else if (nodeId.length === 1 && nodeId !== '0') {
		parentNodeId = '0';
	}
	// Loop through artifactTree and create local folder structure
	const loopThrough = (items) => {
		items.forEach((item) => {
			if (
				// only make folders for items that are not the root, and are marked as visible folders
				item.fileType === 'folder' &&
				item.isVisible === true
			) {
				// add entry into library as {nodeId: label}
				nodeNameLib[item.nodeId] = item.label;
				// start building parent folder path for this branch based on nodeID.
				let parentFolderPath = item.nodeId === '0' ? '' : packageName + '/';
				let nodeParts = item.nodeId.split('.');
				let currentNode = '';
				for (let i = 0; i < nodeParts.length; i++) {
					if (i === 0) {
						currentNode = currentNode + nodeParts[i];
					} else {
						currentNode = currentNode + '.' + nodeParts[i];
					}
					parentFolderPath = parentFolderPath + nodeNameLib[currentNode] + '/';

					// retrieve path name of parent folder and end loop
					if (currentNode === parentNodeId) {
						folderPath = parentFolderPath;
						break;
					}
				}
			}

			// check for children branches
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(artifactTree);

	// the above code built the parent folder path, need to append current label
	const currentItem = getFilesByNodeId(artifactTree, nodeId);
	folderPath = folderPath + currentItem[0].label;

	if (folderPath === packageName) {
		folderPath = folderPath + '/';
	}
	return folderPath;
}

// returns all artifact tree items that are files, not folders
export const getFilesAll = (artifactTree) => {
	const files = [];

	const loopThrough = (items) => {
		items.forEach((item) => {
			if (item.fileType !== 'folder') {
				files.push(item);
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(artifactTree);
	return files;
};

export const getFilesByNodeId = (artifactTree, nodeId) => {
	const files = [];

	const loopThrough = (items) => {
		items.forEach((item) => {
			if (item.nodeId === nodeId) {
				files.push(item);
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(artifactTree);
	return files;
};

export function getFilesByTag(artifactTree, tag) {
	const files = [];

	const loopThrough = (items) => {
		items.forEach((item) => {
			if (item.tag === tag) {
				files.push(item);
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(artifactTree);

	return files;
}

export function getFileNameByTag(artifactTree, tag) {
	const files = getFilesByTag(artifactTree, tag);
	if (files[0]) {
		return files[0].label;
	} else {
		return '';
	}
}

export const getFilesByLabel = (artifactTree, label) => {
	const files = [];

	const loopThrough = (items) => {
		items.forEach((item) => {
			if (label instanceof RegExp) {
				if (label.test(item.label)) {
					files.push(item);
				}
			} else if (item.label === label) {
				files.push(item);
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(artifactTree);

	return files;
};

export function getArtifactFileBlobId(artifactTree, label, parentNodeId = null) {
	// Function Description: Gets a previously known fileBlobId of an artifact node based on label name.
	// Can search only in specific folder if parentNodeId given

	let fileBlobId = null;

	// if parentNodeId is known, get branch children
	let branch;
	if (parentNodeId) {
		branch = getBranchChildren(artifactTree, parentNodeId);
	} else {
		branch = artifactTree;
	}

	// loop through to find the fileBlobId based on label name
	const loopThrough = (items) => {
		items.forEach((item) => {
			if (item.label === label) {
				if (item.fileBlobId) {
					fileBlobId = item.fileBlobId;
				}
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(branch);

	// return fileBlobId, returns null if not exists
	return fileBlobId;
}

export function getItemsByFileType(artifactTree, fileType) {
	const artifacts = [];

	const loopThrough = (items) => {
		items.forEach((item) => {
			if (item.fileType === fileType && item.isVisible === true) {
				artifacts.push(item);
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(artifactTree);

	return artifacts;
}

// deletes item from artifact tree and fileBlob collection in mongoDB - supports deletion of a single file
export const deleteItemFromTree = async (nodeId, deleteFileBlob = true) => {
	// deleteFileBlob if set to true will delete from artifactTree and its fileblob. If set to false will only delete from artifactTree and NOT its fileblob
	const state = store.getState();
	const packageId = state.mpd.packageId;
	await deleteItemFromTreeApi(packageId, nodeId, deleteFileBlob);

	const latestTree = await updateReduxArtifactTreeFromDB(packageId);
	return latestTree;
};

// looks at folder contents and deletes every file from the artfiactTree, also deleting from db downstream
export const deleteItemsByFolder = async (parentNodeID) => {
	const state = store.getState();
	const packageId = state.mpd.packageId;

	await deleteItemsByFolderApi(packageId, parentNodeID);

	const latestTree = await updateReduxArtifactTreeFromDB(packageId);
	return latestTree;
};

// this function handles the moving of an item in the artifact tree, by making a copy in its new location and deleting the original, as well as updating its nodeId
export async function moveItemInTree(artifactTree, movedItem, parentNodeId, updateCatalog = true, savePackage = true) {
	const currentNodeId = movedItem.nodeId;

	// go through the artfiact tree and look through every item
	const loopThrough = (items) => {
		items.every(async (item) => {
			// find the item that has the same nodeId as the moving item's nodeId - this is the item we want
			if (item.nodeId === currentNodeId) {
				// create a new artifact obj using the moving item's data
				const artifact = {
					name: item.label,
					type: item.fileType,
					fileBlobId: item.fileBlobId,
					tag: item.tag,
					isVisible: true,
					children: item.children,
				};

				// create a new version of the tree (sans the moved item)
				// delete item from tree without deleting its fileBlob
				const latestTree = await deleteItemFromTree(currentNodeId, false);
				// then add the new artifact obj to the tree utilizing the latest version of the tree
				await AddArtifactToTree(latestTree, artifact, parentNodeId);
				return false; // break out of .every loop
			}

			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
			return true; // continue through .every loop
		});
	};

	loopThrough(artifactTree);

	// update redux files
	store.dispatch({ type: actionTypes.RERENDER_ARTIFACT_TREE });
	setSessionValue(sessionVar.unsaved_artifact_tree, { treeItems: artifactTree }, actionTypes.UPDATE_ARTIFACT_TREE);

	// update artifact Tree in DB
	if (savePackage) {
		// update artifact Tree in DB
		await handleSavePackage(true, updateCatalog);
	}
}

export async function updateArtifactTreeFileBlobId(artifactTree, nodeId, fileBlobId, updateCatalog = true) {
	const loopThrough = (items) => {
		items.forEach((item) => {
			if (item.nodeId === nodeId) {
				item['fileBlobId'] = fileBlobId;
				item['needsReview'] = false;
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(artifactTree);

	// update redux files
	setSessionValue(sessionVar.unsaved_artifact_tree, { treeItems: artifactTree }, actionTypes.UPDATE_ARTIFACT_TREE);

	// update artifact Tree in DB
	await handleSavePackage(true, updateCatalog);
}

export async function updateArtifactTreeLabel(artifactTree, nodeId, label, updateCatalog = true, savePackage = true) {
	const loopThrough = (items) => {
		items.forEach((item) => {
			if (item.nodeId === nodeId) {
				item['label'] = label;
			}
			const children = item.children;
			if (children && children.length > 0) {
				loopThrough(children);
			}
		});
	};

	loopThrough(artifactTree);

	// update redux files
	setSessionValue(sessionVar.unsaved_artifact_tree, { treeItems: artifactTree }, actionTypes.UPDATE_ARTIFACT_TREE);
	store.dispatch({ type: actionTypes.RERENDER_ARTIFACT_TREE });

	if (savePackage) {
		// update artifact Tree in DB
		await handleSavePackage(true, updateCatalog);
	}
}

export async function AddArtifactToTree(items, artifact, parentNodeId) {
	// This AddArtifactToTree function returns if the Artifact was added/uploaded to the tree or not
	/* Note input parameters are:
            - items (the current artifact tree),
            - artifact (the artifact item that needs to be added to the tree)
            - partentNodeId (the nodeId of the parent folder where the artifact needs to be added to)
    */
	let isDuplicate = false; // We will not add artifact to tree if it is a duplicate
	let nextNode; // This will be the nodeID of the new artifact

	// creating a loopThrough function that will search for the parentNodeId (folder) and can be recursively called for each child branch found
	const loopThroughToFindParentFolder = (items) => {
		items.map((item) => {
			// Loop through the items of the artifact tree, if the nodeID matches the target parentNodeId (aka folder), continue with code to add artifact to tree. Otherwise, skip this node.
			if (item.nodeId === parentNodeId) {
				// If found the target parentNodeId (The folder we want to add the artifact)
				// First check all the current children of this folder to see if an artifact with the same file name already exists
				item.children.filter(function (itemData) {
					if (itemData.label === artifact.name) {
						// artifact already exists (will not be added to artifact tree)
						isDuplicate = true;
						nextNode = itemData.nodeId; // will return currentNodeId
					}

					return 0;
				});
				// if item is not a duplicate filename, proceed with adding it to tree
				if (!isDuplicate) {
					// get the new nodeId that will be used for this artifact
					if (parentNodeId === '0') {
						nextNode = getNextNodePart(item.children).toString();
					} else {
						nextNode = parentNodeId.toString() + '.' + getNextNodePart(item.children).toString();
					}

					// adding the artifact to the parentNode in the artifact tree
					item.children.push({
						key: nextNode,
						nodeId: nextNode,
						label: artifact.name,
						fileType: artifact.type,
						fileBlobId: artifact.fileBlobId,
						tag: artifact.tag,
						isVisible: true,
						// if the item has children, include its children. Otherwise, leave children empty
						children: artifact.children ? artifact.children : [],
					});
				}
				return false;
			} else if (item.children && item.children.length > 0) {
				// Else, if this item does not match the target parentNodeId, check if this item has children and recursively loop through to also check them for the target parentNodeId
				loopThroughToFindParentFolder(item.children);
			}
			return 0;
		});
	};

	// initially call loopThrough function
	loopThroughToFindParentFolder(items);

	if (!isDuplicate) {
		// turn on isVisible flags for this node (in case it was not visible by default)
		makeBranchVisible(items, parentNodeId);

		// update redux files
		setSessionValue(sessionVar.unsaved_artifact_tree, { treeItems: items }, actionTypes.UPDATE_ARTIFACT_TREE);
		store.dispatch({ type: actionTypes.RERENDER_ARTIFACT_TREE });

		// update artifact Tree in DB
		await handleSavePackage(true);
	}

	// finally, return if this artifact was added to the tree or not
	return { isDuplicate: isDuplicate, artifactNode: nextNode };
}

export async function exportArtifactItem(artifactTree, nodeId, packageName, packageId) {
	const nodeParts = nodeId.split('.');
	let currentNode = '';
	let nodeLabel = '';

	if (nodeId !== '0' || nodeId !== 0) {
		// this means it's NOT a MEP, it's an artifact - either a folder or a file
		nodeParts.forEach((node) => {
			if (currentNode.length === 0) {
				currentNode = node;
			} else {
				currentNode = currentNode + '.' + node;
			}
			const file = getFilesByNodeId(artifactTree, currentNode);
			nodeLabel = file[0].label;
		});
	} else {
		// nodeID IS 0, so it's a MEP
		nodeLabel = packageName;
	}

	// get file from DB
	const fileDataBlob = await getExportFileData(nodeId, packageId);

	if (fileDataBlob.data !== false) {
		// download data
		const element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;base64,' + fileDataBlob.data);
		if (fileDataBlob.type === 'zip') {
			nodeLabel = nodeLabel + '.zip';
		}
		element.setAttribute('download', nodeLabel);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);

		return true;
	} else {
		// Error with data download
		alert('There was an issue exporting this file.');
		return false;
	}
}

export function getTreeInitialState() {
	return [
		{
			nodeId: '0',
			label: '',
			fileType: 'folder',
			isVisible: true,
			children: [
				{
					nodeId: '1',
					label: 'base-xsd',
					fileType: 'folder',
					isVisible: true,
					children: [
						{
							nodeId: '1.1',
							label: 'niem',
							fileType: 'folder',
							isVisible: true,
							children: [],
						},
						{
							nodeId: '1.3',
							label: 'extension',
							fileType: 'folder',
							isVisible: true,
							children: [],
						},
					],
				},
				{
					nodeId: '2',
					label: 'constraint-xsd',
					fileType: 'folder',
					isVisible: false,
					children: [],
				},
				{
					nodeId: '3',
					label: 'exi-xsd',
					fileType: 'folder',
					isVisible: false,
					children: [],
				},
				{
					nodeId: '4',
					label: 'schematron',
					fileType: 'folder',
					isVisible: false,
					children: [],
				},
				{
					nodeId: '5',
					label: 'iep-sample',
					fileType: 'folder',
					isVisible: true,
					children: [],
				},
				{
					nodeId: '6',
					label: 'application-info',
					fileType: 'folder',
					isVisible: false,
					children: [],
				},
				{
					nodeId: '7',
					label: 'documentation',
					fileType: 'folder',
					isVisible: false,
					children: [],
				},
				{
					nodeId: '8',
					label: 'Transforms',
					fileType: 'folder',
					isVisible: false,
					children: [],
				},
			],
		},
	];
}

export function resetArtifactTree() {
	const resetItems = getTreeInitialState();
	store.dispatch({ type: actionTypes.UPDATE_ARTIFACT_TREE, payload: { treeItems: resetItems } });
}

// List of artifact tree tags
export const artifactTags = {
	catalog: 'catalog',
	readme: 'readme',
	changelog: 'changelog',
	conformance: 'conformance',
	extension: 'extension',
	wantlist: 'Wantlist',
	subsetSchema: 'subset',
	mappingSpreadsheet: 'Mapping Spreadsheet',
	sample: 'sample',
	businessRules: 'Business Rules',
};
