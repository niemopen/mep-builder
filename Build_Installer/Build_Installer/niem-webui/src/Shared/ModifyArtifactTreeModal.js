import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Button, Form, Message, Modal } from 'semantic-ui-react';
import { getItemsByFileType, getFolderPath, updateArtifactTreeLabel, AddArtifactToTree, moveItemInTree } from '../Util/ArtifactTreeUtil';
import { isStringFieldValid } from '../Util/FieldValidationUtil';
import { exportArtifactItem } from '../Util/ArtifactTreeUtil';

const ModifyArtifactTreeModal = () => {
	const dispatch = useDispatch();
	const isMyHomeActive = useSelector((state) => state.header.myHomeActive);
	const packageName = useSelector((state) => state.mpd.packageName);
	const packageId = useSelector((state) => state.mpd.packageId);
	const artifactTree = useSelector((state) => state.artifact.treeItems);
	const itemData = useSelector((state) => state.modifyArtifact.itemData);
	const isModalOpen = useSelector((state) => state.modifyArtifact.isModalOpen);
	const workflowType = useSelector((state) => state.modifyArtifact.workflowType);
	const [updatedItemName, setUpdatedItemName] = useState(null);
	const [newFolderName, setNewFolderName] = useState(null);
	const [updatedItemLocation, setUpdatedItemLocation] = useState(null);
	const [availableLocationOptions, setAvailableLocationOptions] = useState(null);
	// flag to determine whether to display a warning message to inform the user that there are no locations available
	const [isNoLocationAvailable, setIsNoLocationAvailable] = useState(false);
	const [isRequiredArtifactUploaded, setIsRequiredArtifactUploaded] = useState({
		subset: false,
		catalog: false,
		sample: false,
		readme: false,
		changelog: false,
		conformance: false,
	});

	useEffect(() => {
		if (isModalOpen && itemData.hasOwnProperty('artifactChecklist')) {
			setIsRequiredArtifactUploaded(itemData.artifactChecklist);
		}
	}, [itemData, isModalOpen]);

	const handleRenameItem = () => {
		updateArtifactTreeLabel(artifactTree, itemData.nodeId, updatedItemName);
	};

	const handleItemNameOnChange = (updatedValue, fileType) => {
		if (fileType === 'folder') {
			setUpdatedItemName(updatedValue);
		} else {
			// include file extension if item is a file instead of a folder
			setUpdatedItemName(updatedValue + '.' + fileType);
		}
	};

	const handleCreateNewFolder = () => {
		AddArtifactToTree(artifactTree, { name: newFolderName, type: 'folder' }, itemData.nodeId);
	};

	const handleExportMEP = () => {
		let treeToExport;
		let packageNameToExport;
		let packageIdToExport;

		// bc exporting from the 'My Home' page and from the 'Artifact Tree' require different values to be passed into exportArtifactItem(), need to determine which to pass based on where the export is occuring
		if (isMyHomeActive) {
			treeToExport = itemData.artifactTree;
			packageNameToExport = itemData.packageName;
			packageIdToExport = itemData.packageId;
		} else {
			treeToExport = artifactTree;
			packageNameToExport = itemData.label;
			packageIdToExport = packageId;
		}

		exportArtifactItem(treeToExport, '0', packageNameToExport, packageIdToExport);
		dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: false });
	};

	const getMoveFolderLocationOptions = () => {
		const items = getItemsByFileType(artifactTree, 'folder');
		const currentFolderPath = getFolderPath(artifactTree, itemData.nodeId);
		// because each folder path ends in "/", we need to remove very last "/" that is returned at the end of the folder path
		let currentItemLocation = currentFolderPath.slice(0, currentFolderPath.indexOf(itemData.label) - 1);
		// in order to match a folder path to the top-level root folder, we need to split currentItemLocation by any reamaining "/" - this puts each folder in the path into an array and strings
		const currentFolderPathSegments = currentItemLocation.split('/');

		// next, check if currentFolderPathSegments array only contains 1 item - if true, this is the top-level root folder
		if (currentFolderPathSegments.length === 1) {
			// then add a "/" to the end of the 1 item's currentItemLocation -  now the top-level root folder's value will match one of the itemText that is returned below
			currentItemLocation = currentItemLocation + '/';
		}

		let locationOptions = [];
		items.forEach((item) => {
			let itemText = getFolderPath(artifactTree, item.nodeId);
			const itemTextSegments = itemText.split('/');

			// only add itemText if it is valid (non empty, etc) && do not include its current location nor its current folder path
			const isValidString = isStringFieldValid(itemText);
			if (isValidString) {
				if (itemText !== currentItemLocation && itemText !== currentFolderPath && !itemTextSegments.includes(itemData.label)) {
					locationOptions.push({ key: item.nodeId, text: itemText, value: itemText });
				}
			}
		});

		// if the locationOptions array is not empty, and availableLocationOptions has not yet been updated with locationOptions, update it.
		if (locationOptions !== 0 && availableLocationOptions === null) {
			setAvailableLocationOptions(locationOptions);
		}

		return locationOptions;
	};

	const handleMoveItem = () => {
		// get the array of locationOptions that is returned from getMoveFolderLocationOptions()
		const locationOptions = getMoveFolderLocationOptions();

		// bc updatedItemLocation only stores the location's folder path value (i.e., /base-xsd/niem), we need to go through the list of locationOptions to find its matching value (option.value).
		locationOptions.forEach((option) => {
			let newParentNodeId = '';

			// the match (option) is storing a key, which is its corresponding nodeId (the new nodeId that the item is being moved to)
			// once the match is found, set the newParentNodeId to that option's key.
			if (option.value === updatedItemLocation) {
				newParentNodeId = option.key;
				// update the items nodeId (this will move the item and its exisiting data to its new location (new nodeId) in the artifact tree)
				moveItemInTree(artifactTree, itemData, newParentNodeId);
			}
		});
	};

	const handleResetWorkflows = () => {
		setUpdatedItemName(null);
		setNewFolderName(null);
		setUpdatedItemLocation(null);
		setAvailableLocationOptions(null);
		setIsNoLocationAvailable(false);
		dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: '' });
	};

	return (
		<Modal
			open={isModalOpen}
			size='mini'
			onClose={() => {
				dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: false });
				dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: '' });
			}}
			closeOnDimmerClick={false}
		>
			<Modal.Header>
				{workflowType === 'renameItem'
					? ['Rename ', "'", itemData.label, "'"]
					: workflowType === 'newFolder'
					? 'Create New Folder'
					: workflowType === 'moveItem'
					? ['Move ', "'", itemData.label, "'"]
					: // 'My Home' page uses packageName, Artifact Tree uses label (different json objs w/different properties)
					workflowType === 'exportMEP' && isMyHomeActive
					? ['Export ', "'", itemData.packageName, "'"]
					: ['Export ', "'", itemData.label, "'"]}
			</Modal.Header>
			<Modal.Content>
				{workflowType === 'renameItem' ? (
					<>
						<Form>
							<label>
								<b>Please enter a new name</b>
							</label>
							<Form.Group inline>
								<Form.Input
									className='updatedItemNameField'
									placeholder='New Name'
									onChange={(e, d) => {
										handleItemNameOnChange(d.value, itemData.fileType);
									}}
									width={16}
								/>
								{itemData.fileType === 'folder' ? null : (
									<Form.Field>
										<label>.{itemData.fileType}</label>
									</Form.Field>
								)}
							</Form.Group>
						</Form>
					</>
				) : workflowType === 'newFolder' ? (
					<>
						<Form>
							<Form.Input
								className='updatedItemNameField'
								label='Folder Name'
								placeholder='Folder Name'
								onChange={(e, d) => {
									setNewFolderName(d.value);
								}}
								value={newFolderName}
							/>
						</Form>
						{newFolderName !== '' && newFolderName !== null ? (
							<>
								<br />
								<p>
									You are creating a <b>{newFolderName}</b> folder inside of '
									<b>{itemData.label === '' || itemData.label === null ? packageName : itemData.label}</b>'.
									<br />
								</p>
							</>
						) : null}
					</>
				) : workflowType === 'moveItem' ? (
					<>
						<Form>
							<Form.Select
								label='Where would you like to move this artifact to?'
								value={updatedItemLocation}
								options={getMoveFolderLocationOptions()}
								onChange={(e, d) => {
									setUpdatedItemLocation(d.value);
								}}
								onClick={() => {
									// if locationOptions returned empty, setting availableLocationOptions empty, there are no locations available to move the target item to
									if (availableLocationOptions.length === 0) {
										// this flag determines whether to display a warning message to inform the user that there are no locations available
										setIsNoLocationAvailable(true);
									} else setIsNoLocationAvailable(false);
								}}
							/>
						</Form>
						{updatedItemLocation !== '' && updatedItemLocation !== null ? (
							<>
								<br />
								<p>
									You are moving '<b>{itemData.label === '' || itemData.label === null ? packageName : itemData.label}</b>' to
									<b> '{updatedItemLocation}'</b>.
									<br />
								</p>
							</>
						) : // display warning message to inform the user that there are no locations available
						isNoLocationAvailable && availableLocationOptions === 0 ? (
							<>
								<Message warning>
									<Message.Header>No Path Available</Message.Header>
									<p>
										Please create a new folder outside of <b>'{itemData.label}'</b> to move this {itemData.fileType} to.
									</p>
								</Message>
							</>
						) : null}
					</>
				) : (
					<>
						<Message warning>
							<Message.Header>MEP Incomplete</Message.Header>
							<p>This MEP does not meet the minimum requirements to be considered complete and ready to export.</p>
						</Message>
						<b>Missing Items:</b>
						<ul>
							{!isRequiredArtifactUploaded.subset ? <li>Subset Schema</li> : null}
							{!isRequiredArtifactUploaded.catalog ? <li>MDP Catalog</li> : null}
							{!isRequiredArtifactUploaded.sample ? <li>Sample Message</li> : null}
							{!isRequiredArtifactUploaded.readme ? <li>Readme</li> : null}
							{!isRequiredArtifactUploaded.changelog ? <li>Change Log</li> : null}
							{!isRequiredArtifactUploaded.conformance ? <li>Conformance Assertion</li> : null}
						</ul>
						<p>
							<b>What would you like to do?</b>
						</p>
					</>
				)}
			</Modal.Content>

			<Modal.Actions>
				<Button
					primary
					content={workflowType !== 'exportMEP' ? 'Save' : 'Export'}
					disabled={
						workflowType === 'renameItem' && updatedItemName !== '' && updatedItemName !== null
							? false
							: workflowType === 'newFolder' && newFolderName !== '' && newFolderName !== null
							? false
							: workflowType === 'moveItem' && updatedItemLocation !== null
							? false
							: workflowType === 'exportMEP'
							? false
							: true
					}
					onClick={() => {
						dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: false });
						workflowType === 'renameItem'
							? handleRenameItem()
							: workflowType === 'newFolder'
							? handleCreateNewFolder()
							: workflowType === 'moveItem'
							? handleMoveItem()
							: handleExportMEP();
						handleResetWorkflows();
					}}
				></Button>
				<Button
					onClick={() => {
						dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: false });
						handleResetWorkflows();
					}}
				>
					Cancel
				</Button>
			</Modal.Actions>
		</Modal>
	);
};

export default ModifyArtifactTreeModal;
