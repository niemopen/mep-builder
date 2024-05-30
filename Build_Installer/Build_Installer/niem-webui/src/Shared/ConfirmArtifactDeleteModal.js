import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button } from 'semantic-ui-react';
import * as actionTypes from '../redux/actions';
import { artifactTags, deleteItemFromTree, deleteItemsByFolder, getFilesAll } from '../Util/ArtifactTreeUtil';
import { isFileRequiredArtifact } from '../Shared/ArtifactChecklist';
import { clearValidationResults } from '../Util/ValidationUtil';

const ConfirmArtifactDeleteModal = () => {
	const dispatch = useDispatch();
	const treeItemData = useSelector((state) => state.confirm.artifactToDelete);
	const showConfirmDeleteModal = useSelector((state) => state.confirm.isConfirmArtifactDeleteModalOpen);
	const deleteMode = useSelector((state) => state.confirm.confirmDeleteMode);
	const packageId = useSelector((state) => state.mpd.packageId);

	const handleDeleteArtifactFromTree = async () => {
		if (deleteMode === 'folder') {
			const treeItemfiles = getFilesAll(treeItemData.children); // grab all files from the folder
			await deleteItemsByFolder(treeItemData.nodeId); // delete folder contents
			for (const file of treeItemfiles) {
				await isFileRequiredArtifact(packageId, file.tag, false);
				if (file.tag === artifactTags.sample || file.tag === artifactTags.extension) {
					clearValidationResults();
				}
			}
		} else if (deleteMode === 'file') {
			await deleteItemFromTree(treeItemData.nodeId);
			await isFileRequiredArtifact(packageId, treeItemData.tag, false);
			if (treeItemData.tag === artifactTags.sample || treeItemData.tag === artifactTags.extension) {
				clearValidationResults();
			}
		} else {
			// do nothing
		}
		dispatch({ type: actionTypes.UPDATE_CONFIRM_DELETE_MODE, payload: '' });
		dispatch({ type: actionTypes.UPDATE_CONFIRM_ARTIFACT_TO_DELETE, payload: {} });
		dispatch({ type: actionTypes.SET_SHOW_CONFIRM_ARTIFACT_DELETE_MODAL, payload: false });
	};

	return (
		<Modal open={showConfirmDeleteModal} size='tiny'>
			<Modal.Header>Confirm Delete</Modal.Header>
			<Modal.Content>
				{deleteMode === 'file' ? (
					<p>
						Are you sure you want to permanently delete '<strong>{treeItemData.label}</strong>' from this package?
					</p>
				) : (
					<p>
						Are you sure you want to permanently delete the contents of '<strong>{treeItemData.label}</strong>' from this package?
					</p>
				)}
				<p>This action cannot be undone.</p>
			</Modal.Content>
			<Modal.Actions>
				<Button className='primaryButton' onClick={handleDeleteArtifactFromTree}>
					Confirm
				</Button>
				<Button
					className='secondaryButton'
					onClick={() => {
						dispatch({ type: actionTypes.UPDATE_CONFIRM_DELETE_MODE, payload: '' });
						dispatch({ type: actionTypes.UPDATE_CONFIRM_ARTIFACT_TO_DELETE, payload: {} });
						dispatch({ type: actionTypes.SET_SHOW_CONFIRM_ARTIFACT_DELETE_MODAL, payload: false });
					}}
				>
					Cancel
				</Button>
			</Modal.Actions>
		</Modal>
	);
};

export default ConfirmArtifactDeleteModal;
