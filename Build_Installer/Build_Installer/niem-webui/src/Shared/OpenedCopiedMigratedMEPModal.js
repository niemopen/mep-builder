import React from 'react';
import { Button, Modal, List } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../redux/actions';
import * as tooltipContent from './TooltipContent';

const OpenedCopiedMigratedMEPModal = () => {
	const isOpenedCopiedMigratedMEPModalOpen = useSelector((state) => state.copyMigrateWarning.isOpenedCopiedMigratedMEPModalOpen);
	const isCopiedPackage = useSelector((state) => state.mpd.isCopiedPackage);
	const isMigratedPackage = useSelector((state) => state.mpd.isMigratedPackage);
	const dispatch = useDispatch();

	return (
		<Modal open={isOpenedCopiedMigratedMEPModalOpen} size='mini'>
			<Modal.Header>{tooltipContent.removingArtifactsMessageHeader}</Modal.Header>
			<Modal.Content>
				<p>
					<strong>
						{isCopiedPackage
							? 'This package was copied from an existing package.'
							: isMigratedPackage
							? 'This package was created as a result of a migration.'
							: ''}
					</strong>
				</p>
				<p>
					To ensure your new package is built with the most accurate artifacts, the following artifacts were not copied and will need to be
					generated before publishing (if applicable):
				</p>
				<List bulleted className='notCopiedArtifactsList'>
					<List.Item>Subset Schema</List.Item>
					<List.Item>MPD Catalog</List.Item>
					<List.Item>Conformance Assertion</List.Item>
					<List.Item>Wantlist</List.Item>
					<List.Item>Translations</List.Item>
				</List>
				<p>The following artifacts were copied but need review (if applicable):</p>
				<List bulleted className='notCopiedArtifactsList'>
					<List.Item>ReadMe</List.Item>
					<List.Item>ChangeLog</List.Item>
					<List.Item>Sample Message</List.Item>
				</List>
			</Modal.Content>
			<Modal.Actions>
				<Button
					className='primaryButton'
					onClick={() => dispatch({ type: actionTypes.IS_OPENED_COPIED_MIGRATED_MEP_MODAL_OPEN, payload: false })}
				>
					OK
				</Button>
			</Modal.Actions>
		</Modal>
	);
};

export default OpenedCopiedMigratedMEPModal;
