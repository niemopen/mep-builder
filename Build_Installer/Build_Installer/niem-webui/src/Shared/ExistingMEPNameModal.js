import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as key from '../Shared/KVstore';
import * as actionTypes from '../redux/actions';
import { Button, Modal } from 'semantic-ui-react';
import Draggable from 'react-draggable';
import LoaderModal from '../Shared/LoaderModal';
import { handleSavePackage, handleSaveClosePackage } from '../Util/savePackageUtil';
import { deletePackageApiDB } from '../components/MyHomeCardView';

const ExistingMEPNameModal = () => {
	const dispatch = useDispatch();
	const isModalOpen = useSelector((state) => state.existing.isModalOpen);
	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const returnHomeOnSave = useSelector((state) => state.existing.returnHomeOnSave);
	const duplicatePackageId = useSelector((state) => state.existing.duplicatePackageId);

	async function handleFileSaver() {
		setIsLoadingActive(true);
		await handleSavePackage(true);
		setIsLoadingActive(false);
	}

	const deletePackage = async (packageId) => {
		const deleteSuccess = await deletePackageApiDB(packageId);
		return deleteSuccess;
	};

	return (
		<>
			<LoaderModal active={isLoadingActive} />
			<Draggable handle='#draggable-modal-title'>
				<Modal
					open={isModalOpen}
					size='tiny'
					onClose={() => dispatch({ type: actionTypes.EXISTING_MEP_NAME_MODAL_OPEN, payload: false })}
					aria-labelledby='draggable-modal-title'
				>
					<Modal.Header style={{ cursor: 'move' }} id='draggable-modal-title'>
						{key.packageName} Already Exists
					</Modal.Header>
					<Modal.Content>
						<p>A {key.packageNameAcronymn} with the same name already exists. Replacing it will overwrite its current contents.</p>
						<p>
							<b>Would you like to replace it?</b>
						</p>
					</Modal.Content>

					<Modal.Actions>
						<Button
							primary
							onClick={() => {
								if (duplicatePackageId !== '') {
									deletePackage(duplicatePackageId);
								}
								dispatch({ type: actionTypes.UPDATE_DUPLICATE_PACKAGE_ID, payload: '' });
								if (returnHomeOnSave) {
									handleSaveClosePackage(true);
								} else {
									handleFileSaver();
									// resetting overwrite value after save
									dispatch({
										type: actionTypes.UPDATE_OVERWRITE_SAVE,
										payload: false,
									});
								}
								dispatch({ type: actionTypes.EXISTING_MEP_NAME_MODAL_OPEN, payload: false });
							}}
						>
							Yes
						</Button>
						<Button
							onClick={() => {
								dispatch({ type: actionTypes.EXISTING_MEP_NAME_MODAL_OPEN, payload: false });
								dispatch({ type: actionTypes.UPDATE_OVERWRITE_SAVE, payload: false });
							}}
						>
							No
						</Button>
					</Modal.Actions>
				</Modal>
			</Draggable>
		</>
	);
};

export default ExistingMEPNameModal;
