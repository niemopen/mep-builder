import { Modal, Button, Container } from 'semantic-ui-react';
import { handleSaveClosePackage } from '../Util/savePackageUtil';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../redux/actions';

const CopyMigrateWarningModal = () => {
	const dispatch = useDispatch();
	const openPackageName = useSelector((state) => state.mpd.packageName);
	const isCopyMigrateWarningModalOpen = useSelector((state) => state.copyMigrateWarning.isCopyMigrateWarningModalOpen);
	const copyMigrateAction = useSelector((state) => state.copyMigrateWarning.copyMigrateAction);

	const handleProceed = async () => {
		// save and close open package and proceed with copying/migrating
		dispatch({ type: actionTypes.IS_COPY_MIGRATE_WARNING_MODAL_OPEN, payload: false });
		await handleSaveClosePackage();
		if (copyMigrateAction === 'copy') {
			dispatch({ type: actionTypes.IS_COPY_MEP_MODAL_OPEN, payload: true });
		} else if (copyMigrateAction === 'migrate') {
			dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: true });
		}
	};

	const handleCancel = () => {
		// stop the copying/migrating process
		dispatch({ type: actionTypes.IS_COPY_MIGRATE_WARNING_MODAL_OPEN, payload: false });
		dispatch({ type: actionTypes.SET_COPY_MIGRATE_ACTION, payload: '' });
	};

	return (
		<Modal open={isCopyMigrateWarningModalOpen} size='mini'>
			<Modal.Header>Close Open MEP</Modal.Header>
			<Modal.Content>
				<Container>
					'<strong>{openPackageName}</strong>' is currently open on the MEP Builder page.
				</Container>
				&nbsp;
				<Container>
					Proceeding will save and close '<strong>{openPackageName}</strong>'.
				</Container>
				&nbsp;
				<Container>
					<strong>What would you like to do?</strong>
				</Container>
			</Modal.Content>
			<Modal.Actions>
				<Button className='secondaryButton' onClick={handleCancel}>
					Cancel
				</Button>
				<Button className='primaryButton' onClick={handleProceed}>
					Proceed
				</Button>
			</Modal.Actions>
		</Modal>
	);
};

export default CopyMigrateWarningModal;
