import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Button, Modal } from 'semantic-ui-react';
import LoaderModal from '../Shared/LoaderModal';
import { getFilesByLabel, updateArtifactTreeFileBlobId } from '../Util/ArtifactTreeUtil';
import { deleteItemFileBlob } from '../Util/PackageUtil';
import { uploadFile } from '../Util/UploadFileUtil';

const ExistingFileNameModal = () => {
	const dispatch = useDispatch();
	const isModalOpen = useSelector((state) => state.existingFile.isModalOpen);
	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const artifact = useSelector((state) => state.upload.artifact);
	const artifactTree = useSelector((state) => state.artifact.treeItems);
	const packageId = useSelector((state) => state.mpd.packageId);

	const handleOverwriteFile = async () => {
		setIsLoadingActive(true);
		// grab the existing file data, delete its fileblob from the tree, and upload the new file
		const files = getFilesByLabel(artifactTree, artifact.name);
		await deleteItemFileBlob(files[0].fileBlobId);
		const uploadResult = await uploadFile(artifact.fileBlob, packageId);
		if (uploadResult.isSuccess) {
			// after upload, update the fileBlobId in the artifactTree to the new file's fileBlobId
			await updateArtifactTreeFileBlobId(artifactTree, files[0].nodeId, uploadResult.fileBlobId);
		}
		setIsLoadingActive(false);
	};

	return (
		<>
			<LoaderModal active={isLoadingActive} />
			<Modal open={isModalOpen} size='tiny' onClose={() => dispatch({ type: actionTypes.EXISTING_FILE_NAME_MODAL_OPEN, payload: false })}>
				<Modal.Header>File Already Exists</Modal.Header>
				<Modal.Content>
					<p>A file with the same name already exists. Replacing it will overwrite its current contents.</p>
					<p>
						<b>Would you like to replace it?</b>
					</p>
				</Modal.Content>

				<Modal.Actions>
					<Button
						primary
						onClick={async () => {
							await handleOverwriteFile();
							dispatch({ type: actionTypes.EXISTING_FILE_NAME_MODAL_OPEN, payload: false });
						}}
					>
						Yes
					</Button>
					<Button
						onClick={() => {
							dispatch({ type: actionTypes.EXISTING_FILE_NAME_MODAL_OPEN, payload: false });
						}}
					>
						No
					</Button>
				</Modal.Actions>
			</Modal>
		</>
	);
};

export default ExistingFileNameModal;
