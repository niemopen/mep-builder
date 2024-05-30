import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal } from 'semantic-ui-react';
import * as actionTypes from '../redux/actions';
import { deleteSubsetSchemaFiles, deleteTranslatedFiles } from '../Util/PackageUtil';
import store from '../redux/store';

export const deleteSubsetTranslate = async (deleteSubset = true, deleteTranslate = false) => {
	const state = store.getState();
	const packageId = state.mpd.packageId;

	if (deleteSubset) {
		await deleteSubsetSchemaFiles(packageId);
	}

	if (deleteTranslate) {
		const state = store.getState(); // grab updated state
		await deleteTranslatedFiles(packageId, state.artifact.treeItems);
	}

	store.dispatch({ type: actionTypes.RERENDER_ARTIFACT_TREE });
};

export const MEPChangeWarningModal = () => {
	const mepChangeWarningModalOpen = useSelector((state) => state.mepChangeWarning.mepChangeWarningModalOpen);
	const modalTrigger = useSelector((state) => state.mepChangeWarning.modalTrigger);
	const mepContainsDefaultText = useSelector((state) => state.mepChangeWarning.mepContainsDefaultText);
	const mepContainsSubsetText = useSelector((state) => state.mepChangeWarning.mepContainsSubsetText);
	const mepContainsSubsetTranslationText = useSelector((state) => state.mepChangeWarning.mepContainsSubsetTranslationText);
	const mepContainsTranslationText = useSelector((state) => state.mepChangeWarning.mepContainsTranslationText);
	const generateSubsetText = useSelector((state) => state.mepChangeWarning.generateSubsetText);
	const generateSubsetTranslationText = useSelector((state) => state.mepChangeWarning.generateSubsetTranslationText);
	const generateTranslationText = useSelector((state) => state.mepChangeWarning.generateTranslationText);
	const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

	const dispatch = useDispatch();

	const renderMepContainsDefaultText = <p>If you wish to proceed, further changes to the following:</p>;

	const renderMepContainsSubsetText = (
		<>
			<p>
				This MEP contains a <b>Subset Schema.</b>
			</p>
			<p>Changes to the following:</p>
		</>
	);
	const renderMepContainsSubsetAndTranslationText = (
		<>
			<p>
				This MEP contains a <b>Subset Schema and Translations.</b>
			</p>
			<p>Changes to the following:</p>
		</>
	);

	const renderMepContainsTranslationText = (
		<>
			<p>
				This MEP contains <b>Translations.</b>
			</p>
			<p>Changes to the following:</p>
		</>
	);
	const renderGenerateSubsetText = (
		<p>
			Will result in the automatic removal of your <b>Subset Schema,</b> requiring you to generate a new one before publishing.
		</p>
	);
	const renderGenerateSusbsetAndTranslationText = (
		<p>
			Will result in the automatic removal of your <b>Subset Schema and any existing Translations,</b> requiring you to generate a new Subset
			Schema and translate formats again before publishing.
		</p>
	);

	const renderGenerateTranslationText = (
		<p>
			Will result in the automatic removal of your <b>existing translations,</b> requiring you to translate formats again.
		</p>
	);

	const handleOk = () => {
		if (modalTrigger === 'subset') {
			dispatch({ type: actionTypes.GENERATE_SUBSET_SCHEMA_ACTIVE, payload: true });
		} else if (modalTrigger === 'translate') {
			dispatch({ type: actionTypes.GENERATE_TRANSLATION_ACTIVE, payload: true });
		} else if (modalTrigger === 'mepName') {
			dispatch({ type: actionTypes.IS_MEP_NAME_EDITABLE, payload: true });
		} else if (modalTrigger === 'cme') {
			dispatch({ type: actionTypes.UPDATE_CME_BUILDER_MODAL_OPEN, payload: true });
		}

		dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_OPEN, payload: false });
	};

	return (
		<Modal size='tiny' open={mepChangeWarningModalOpen} closeOnDimmerClick={false}>
			<Modal.Header>Please Note</Modal.Header>
			<Modal.Content>
				<Modal.Description>
					{mepContainsDefaultText
						? renderMepContainsDefaultText
						: mepContainsSubsetText
						? renderMepContainsSubsetText
						: mepContainsSubsetTranslationText
						? renderMepContainsSubsetAndTranslationText
						: mepContainsTranslationText
						? renderMepContainsTranslationText
						: renderMepContainsDefaultText}
					<ul>
						<li>MEP Name</li>
						<li>Map & Model Spreadsheet</li>
						{mepContainsTranslationText ? <li>Custom Model Extensions</li> : null}
					</ul>
					{generateSubsetText
						? renderGenerateSubsetText
						: generateSubsetTranslationText
						? renderGenerateSusbsetAndTranslationText
						: generateTranslationText
						? renderGenerateTranslationText
						: null}
					{showAdditionalInfo ? (
						<>
							<p>
								Subset Schemas are generated based on the current state of your package at the time of generation. Changes after
								generation will cause your Schema to be inaccurate.
							</p>
							<p>
								To ensure your package is built and published with accurate artifacts, we remove this existing artifact to allow you
								to generate a new one that contains the most current version of your data.
							</p>
							<p className='additionalInfoLink' onClick={() => setShowAdditionalInfo(false)}>
								Hide additional information
							</p>
						</>
					) : (
						<p className='additionalInfoLink' onClick={() => setShowAdditionalInfo(true)}>
							View additional information
						</p>
					)}
				</Modal.Description>
			</Modal.Content>
			<Modal.Actions>
				<Button
					className='primaryButton'
					onClick={() => {
						handleOk();
					}}
				>
					Ok
				</Button>
			</Modal.Actions>
		</Modal>
	);
};
