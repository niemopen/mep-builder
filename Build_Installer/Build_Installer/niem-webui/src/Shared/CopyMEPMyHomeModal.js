import { React, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Button, Modal, Form, Message } from 'semantic-ui-react';
import { handleSaveClosePackage, handleSavePackage } from '../Util/savePackageUtil';
import { updateNewPkgArtifacts, removeArtifactsAfterCopy, isDuplicatePublishedPackageName } from '../Util/PackageUtil';
import { updateReduxFromPackageData } from '../Util/PackageUtil';
import { handleOpenPackage } from '../components/MyHomeTableView';
import LoaderModal from './LoaderModal';
import store from '../redux/store';
import * as tooltipContent from './TooltipContent';

const CopyMEPModal = () => {
	const dispatch = useDispatch();
	const isCopyMEPModalOpen = useSelector((state) => state.copyMEP.isCopyMEPModalOpen);
	const isExistingMEPNameModalOpen = useSelector((state) => state.existing.isModalOpen);
	const itemData = useSelector((state) => state.modifyArtifact.itemData); // package TO BE COPIED's contents
	const [newPackageName, setNewPackageName] = useState(''); // stores user inputted name in name field
	const [isNameSameAsOriginal, setIsNameSameAsOriginal] = useState(false); // flag used to ensure the new package's name is different from the package they are copying's name
	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const [isDuplicatePublishedName, setIsDuplicatePublishedName] = useState(false);
	const artifactTree = useSelector((state) => state.artifact.treeItems);
	const userId = useSelector((state) => state.session.userId);

	// used to set the value of the default name field and to get a list of all user's packages - runs each time the 'Copy MEP' modal opens
	useEffect(() => {
		let isMounted = true;
		if (isMounted) {
			let defaultName = ['Copy of ' + itemData.PackageName];
			setNewPackageName(defaultName.toString());
			setIsDuplicatePublishedName(false); // clear any error messages on modal open
		}

		return () => {
			isMounted = false; // use effect cleanup to set flag false, if unmounted
		};
	}, [isCopyMEPModalOpen, itemData.PackageName]);

	// opens package selected to copy, copies data, removes unneeded files, preserving the orginial and saving the newly copied version
	async function handleCopyApi() {
		setIsLoadingActive(true);

		// save and close any open package
		await handleSaveClosePackage(true);

		// open the package to be copied to update any session and redux values appropriately, staying on My Home page
		await handleOpenPackage(itemData, dispatch);

		// update redux with original package data
		await updateReduxFromPackageData(itemData, dispatch);

		// clear out unneeded metadata (as of NIEM release v3.0 June 2023)
		dispatch({ type: actionTypes.UPDATE_MPD_VERSION, payload: '1' });
		dispatch({ type: actionTypes.UPDATE_MPD_STATUS, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_STATUS_NO, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_POC, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_EMAIL, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_FORMAT, payload: 'XML' });
		dispatch({ type: actionTypes.UPDATE_MPD_ORGANIZATION_NAME, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_ORGANIZATION_TYPE, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_COI_TAGS, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_EXCHANGE_TAGS, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_URI, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_CREATION_DATE, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_RELEASE_LOCKED, payload: true });
		dispatch({ type: actionTypes.UPDATE_MPD_IS_PUBLISHED, payload: false });
		dispatch({ type: actionTypes.UPDATE_MPD_IS_COPIED_PACKAGE, payload: true });
		// NOTE - as needs arise, add/remove any metadata values that need to be cleared out or copied over

		// clear out package id to allow a new package to be created and update name with desired package name
		dispatch({ type: actionTypes.UPDATE_MPD_PACKAGE_ID, payload: '' });
		dispatch({ type: actionTypes.UPDATE_MPD_PACKAGE_NAME, payload: newPackageName });

		// update packageOwnerId to current user
		dispatch({ type: actionTypes.UPDATE_PACKAGE_OWNER_ID, payload: userId });

		// create/save the newly copied package
		await handleSavePackage(false, false); // set to false to prevent the original mpd-catalog from being overwritten

		// get the lastest state of packageId (this has been updated with a new packageId via handleSavePackage())
		const state = store.getState(); // called after previous functions to get the latest state
		const newPackageId = state.mpd.packageId;
		dispatch({ type: actionTypes.UPDATE_COPIED_PACKAGE_ID, payload: state.mpd.packageId });

		let newArtifactTree = artifactTree;

		// copies artifacts and updates them with new fileblob IDs
		newArtifactTree = await updateNewPkgArtifacts(newPackageId);
		await handleSavePackage(true, true);

		// remove unndeed artifacts
		await removeArtifactsAfterCopy(newPackageId, newArtifactTree);

		await handleSaveClosePackage(true);

		dispatch({ type: actionTypes.REFRESH_PACKAGES, payload: true }); // forces My Home packages to refresh to display newly added packages
		resetModal();
		setIsLoadingActive(false);
	}

	const resetModal = () => {
		dispatch({ type: actionTypes.IS_COPY_MEP_MODAL_OPEN, payload: false });
		setNewPackageName('');
		setIsNameSameAsOriginal(false);
		setIsDuplicatePublishedName(false);
	};

	return (
		<>
			<Modal
				open={isCopyMEPModalOpen && !isExistingMEPNameModalOpen} // this is to prevent double stacking of modals after save on copy/migrate w/ open package
				size='mini'
				onClose={() => {
					dispatch({ type: actionTypes.IS_COPY_MEP_MODAL_OPEN, payload: false });
				}}
			>
				<Modal.Header>Copy '{itemData.PackageName}'</Modal.Header>
				<LoaderModal active={isLoadingActive} text={'Copying files...'} />

				<Modal.Content>
					<>
						<Form>
							<Form.Input
								className='updatedItemNameField'
								label='What would you like to name this new MEP?'
								placeholder='Folder Name'
								value={newPackageName}
								onChange={(e, d) => {
									setNewPackageName(d.value);
								}}
								error={
									isDuplicatePublishedName
										? {
												content: 'This name is already in use by a Published Package. Please enter a new name.',
												pointing: 'above',
										  }
										: false
								}
							/>
						</Form>
						<Message info className='copyModalInfoMessage'>
							<Message.Header as='h6'>{tooltipContent.removingArtifactsMessageHeader}</Message.Header>
							<Message.Content>{tooltipContent.removingArtifactsMessageContent}</Message.Content>
						</Message>
						{isNameSameAsOriginal ? (
							<Message error>
								<Message.Header>Cannot use the same name</Message.Header>
								<p>Please enter a name different from the MEP you are attempting to copy.</p>
							</Message>
						) : null}
						{/* if package is published, display message to users */}
						{itemData.isPublished ? (
							<Message info>
								<Message.Header>Please Note</Message.Header>
								<p>
									You are attempting to copy a published MEP. Once saved, the new MEP will be added to your existing
									Open/Unpublished MEPs.
								</p>
							</Message>
						) : null}
					</>
				</Modal.Content>

				<Modal.Actions>
					<Button className='secondaryButton' onClick={() => resetModal()}>
						Cancel
					</Button>
					<Button
						className='primaryButton'
						type='submit'
						onClick={async () => {
							const isDuplicatePublishedName = await isDuplicatePublishedPackageName(newPackageName);
							setIsDuplicatePublishedName(isDuplicatePublishedName);
							// only proceed if name is not in use by a published package
							if (!isDuplicatePublishedName) {
								// if user inputted name is the same as the package to be copied's name, update flag to display "same name" error message
								if (newPackageName === itemData.PackageName) {
									setIsNameSameAsOriginal(true);
								} else {
									// otherwise, allow copy
									await handleCopyApi();
								}
							}
						}}
					>
						Save
					</Button>
				</Modal.Actions>
			</Modal>
		</>
	);
};

export default CopyMEPModal;
