import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import * as actionTypes from '../redux/actions';
import LoaderModal from './LoaderModal';
import BrowseArtifact from './BrowseArtifact';
import { Modal, Button, Container, Icon, Divider, Grid, Dropdown, Message } from 'semantic-ui-react';
import { AddArtifactToTree, updateArtifactTreeFileBlobId, artifactTags } from '../Util/ArtifactTreeUtil';
import { getFileInfo, uploadFile, createUpdateFile, checkIsValidFileType } from '../Util/UploadFileUtil';
import { getCatalogName } from '../Util/MPDCatalogUtil';
import { updateArtifactChecklist } from './ArtifactChecklist';
import codeListExample from '../images/CME-Builder-CodeListFile-Example.png';
import { clearValidationResults } from '../Util/ValidationUtil';

const UploadModal = () => {
	const uploadModalOpen = useSelector((state) => state.upload.uploadModalOpen);
	const packageId = useSelector((state) => state.mpd.packageId);
	const packageName = useSelector((state) => state.mpd.packageName);
	const release = useSelector((state) => state.mpd.release);
	const catalogName = getCatalogName(release);
	const artifact = useSelector((state) => state.upload.artifact);
	const artifactUploadingActive = useSelector((state) => state.upload.artifactUploadingActive);
	const artifactTree = useSelector((state) => state.artifact.treeItems);
	const nodeId = useSelector((state) => state.upload.nodeId);
	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const isUploadDisabled = useSelector((state) => state.upload.isUploadDisabled);
	const uploadWorkflow = useSelector((state) => state.upload.uploadWorkflow);
	const isValidFileType = useSelector((state) => state.upload.isValidFileType);
	const isCMEBuilderModalOpen = useSelector((state) => state.cme.isCMEBuilderModalOpen);
	const dispatch = useDispatch();

	useEffect(() => {
		// Function as a callback when isLoadingActive is updated. Forces synchronous behavior.
	}, [isLoadingActive]);

	const handleUploadFileSort = async () => {
		let newArtifactInfo;
		setIsLoadingActive(true);
		if (nodeId !== '' && nodeId != null) {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, nodeId);
		} else if (artifact.name.includes('xml-catalog.xml')) {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, '1'); // root/base-xsd/
		} else if (artifact.name.includes('wantlist.xml')) {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, '1.1'); // root/base-xsd/niem
		} else if (artifact.name.includes('structures.xsd')) {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, '1.2'); // root/base-xsd/niem-custom
		} else if (
			artifact.name.includes('query.xsd') ||
			artifact.name.includes('response.xsd') ||
			artifact.name.includes('extension1.xsd') ||
			artifact.name.includes('extension2.xsd')
		) {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, '1.3'); // root/base-xsd/extension
		} else if (artifact.name.includes('gml.xsd') || artifact.name.includes('xs.xsd')) {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, '3'); // root/exi-xsd
		} else if (artifact.name.includes('business-rules1.sch') || artifact.name.includes('business-rules2.sch')) {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, '4'); // root/schematron
		} else if (
			artifact.name.includes(packageName + '.xml') ||
			artifact.name.includes('query.xml') ||
			artifact.name.includes('request.xml') ||
			artifact.tag === artifactTags.sample
		) {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, '5'); // root/iep-sample
		} else if (artifact.name.includes(catalogName)) {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, '0'); // root/
			//Commenting out the below statement to preserve its logic for future use. Because of NIEM 166, this logic is no longer needed, but may prove useful for future tasks/tickets. //
			// } else if (artifact.tag !== '' && artifact.tag != null) {
			// 	AddArtifactToTree(artifactTree, artifact, '7'); // root/documentation/
		} else {
			newArtifactInfo = await AddArtifactToTree(artifactTree, artifact, '7'); // root/documentation/
		}

		setIsLoadingActive(false);
		dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_NODE_ID, payload: '' });
		dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
		dispatch({
			type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
			payload: { allowUserChoice: true, artifactTag: null, uploadItem: null },
		}); // return to default
		dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: true });

		return newArtifactInfo;
	};

	const handleCustomUpload = async () => {
		// this function is used to handle custom upload workflows

		if (uploadWorkflow.uploadItem === artifactTags.readme) {
			// handle upload of ReadMe on Assemble Document Tabs
			const readmeResult = await createUpdateFile(artifactTree, packageId, artifact.fileBlob, artifact.name, '7', true, artifactTags.readme);
			dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'readme_success' });
			if (readmeResult.isSuccess) {
				await updateArtifactChecklist(packageId, 'readme', readmeResult.isSuccess);
			}
		} else if (uploadWorkflow.uploadItem === artifactTags.changelog) {
			// handle upload of Change Log on Assemble Document Tabs
			const changelogResult = await createUpdateFile(
				artifactTree,
				packageId,
				artifact.fileBlob,
				artifact.name,
				'7',
				true,
				artifactTags.changelog
			);
			dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'changelog_success' });
			if (changelogResult.isSuccess) {
				await updateArtifactChecklist(packageId, 'changelog', changelogResult.isSuccess);
			}
		} else if (uploadWorkflow.uploadItem === artifactTags.conformance) {
			// handle upload of Conformance Assertion on Publish Implement Tabs
			const conformanceResult = await createUpdateFile(
				artifactTree,
				packageId,
				artifact.fileBlob,
				artifact.name,
				'7',
				true,
				artifactTags.conformance
			);
			dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'conformance_success' });
			if (conformanceResult.isSuccess) {
				await updateArtifactChecklist(packageId, 'conformance', conformanceResult.isSuccess);
			}
		} else if (uploadWorkflow.uploadItem === 'code') {
			const codeImportResult = await createUpdateFile(artifactTree, packageId, artifact.fileBlob, artifact.name, '7', true, 'Other');

			if (codeImportResult.isSuccess) {
				dispatch({ type: actionTypes.CODE_IMPORT_FILE_DATA, payload: { fileId: codeImportResult.fileId, fileName: artifact.name } });
			}
		} else if (uploadWorkflow.uploadItem === artifactTags.businessRules) {
			const businessRulesResult = await createUpdateFile(
				artifactTree,
				packageId,
				artifact.fileBlob,
				artifact.name,
				'7',
				true,
				artifactTags.businessRules
			);
			if (businessRulesResult.isSuccess) {
				dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'rules_upload_success' });
			} else {
				dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'rules_upload_unsuccessful' });
			}
		} // addtional upload workflows can be added here

		// return redux variables back to default
		dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_NODE_ID, payload: '' });
		dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
		dispatch({
			type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
			payload: { allowUserChoice: true, artifactTag: null, uploadItem: null },
		});
		dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: true });
	};

	async function handleUpload() {
		if (uploadWorkflow.uploadItem !== null) {
			UpdateArtifactTag(uploadWorkflow.artifactTag);
			handleCustomUpload();
		} else {
			const newArtifactInfo = await handleUploadFileSort();
			let uploadResult = false;

			if (newArtifactInfo.artifactNode && !newArtifactInfo.isDuplicate) {
				uploadResult = await uploadFile(artifact.fileBlob, packageId);
			}
			if (newArtifactInfo.isDuplicate) {
				dispatch({ type: actionTypes.EXISTING_FILE_NAME_MODAL_OPEN, payload: true });
			} else if (!uploadResult.isSuccess) {
				dispatch({ type: actionTypes.UPDATE_UPLOAD_MESSAGE_STATE, payload: 'unsuccessful' });
			} else {
				// update the redux and db upon a success upload of a required artifact
				if (artifact.tag === artifactTags.readme) {
					await updateArtifactChecklist(packageId, 'readme', true);
				} else if (artifact.tag === artifactTags.changelog) {
					await updateArtifactChecklist(packageId, 'changelog', true);
				} else if (artifact.tag === artifactTags.conformance) {
					await updateArtifactChecklist(packageId, 'conformance', true);
				} else if (artifact.tag === artifactTags.subsetSchema) {
					await updateArtifactChecklist(packageId, 'subset', true);
				} else if (artifact.tag === artifactTags.sample) {
					await updateArtifactChecklist(packageId, 'sample', true);
					clearValidationResults();
				}

				// update artifact tree with fileBlobId
				await updateArtifactTreeFileBlobId(artifactTree, newArtifactInfo.artifactNode, uploadResult.fileBlobId);
				dispatch({ type: actionTypes.UPDATE_UPLOAD_MESSAGE_STATE, payload: 'successful' });
			}
		}

		// Allows artifact upload success/failed message to only be visble for 4 seconds, then clears artifact info
		setTimeout(() => {
			dispatch({ type: actionTypes.UPDATE_UPLOAD_MESSAGE_STATE, payload: '' });
			dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: '' });
			dispatch({ type: actionTypes.RESET_ARTIFACT });
		}, 4000);
	}

	const UpdateArtifactTag = (tag) => {
		const name = artifact.name;
		const size = artifact.size;
		const type = artifact.type;
		const fileBlob = artifact.fileBlob;

		const updatedArtifact = { name: name, size: size, type: type, fileBlob: fileBlob, tag: tag, needsReview: false };

		dispatch({ type: actionTypes.UPDATE_ARTIFACT_TAG, payload: updatedArtifact });

		checkIsValidFileType(uploadWorkflow, updatedArtifact);
	};

	const artifactTypeOptions = [
		{
			key: 'Business Rules',
			text: 'Business Rules',
			value: artifactTags.businessRules,
		},
		{
			key: 'Catalog File',
			text: 'Catalog File',
			value: 'Catalog File',
		},
		{
			key: 'Change Log',
			text: 'Change Log',
			value: 'Change Log',
		},
		{
			key: 'Conformance Assertion',
			text: 'Conformance Assertion',
			value: 'Conformance Assertion',
		},
		{
			key: 'Distribution Statement',
			text: 'Distribution Statement',
			value: 'Distribution Statement',
		},
		{
			key: 'Mapping Spreadsheet',
			text: 'Mapping Spreadsheet',
			value: 'Mapping Spreadsheet',
		},
		{
			key: 'NIEM Ext Schema',
			text: 'NIEM Ext Schema',
			value: artifactTags.extension,
		},
		{
			key: 'NIEM Schema Subset',
			text: 'NIEM Schema Subset',
			value: 'NIEM Schema Subset',
		},
		{
			key: 'ReadMe',
			text: 'ReadMe',
			value: 'ReadMe',
		},
		{
			key: 'Sample File',
			text: 'Sample File',
			value: artifactTags.sample,
		},
		{
			key: 'Scenario Planning Diagram',
			text: 'Scenario Planning Diagram',
			value: 'Scenario Planning Diagram',
		},
		{
			key: 'Other',
			text: 'Other',
			value: 'Other',
		},
	];

	// sort artifact options in alphabetical order
	artifactTypeOptions.sort((a, b) => {
		let aText = a.text.toLowerCase();
		let bText = b.text.toLowerCase();

		if (aText < bText) {
			return -1;
		}

		if (aText > bText) {
			return 1;
		}
		return 0;
	});

	// Logic needed to support React's Drag and Drop Dropzone //
	const onDrop = useCallback((acceptedFiles) => {
		getFileInfo(acceptedFiles);
	}, []);
	const { getRootProps, isDragActive } = useDropzone({ onDrop });

	return (
		<Modal open={uploadModalOpen} size='small' id='uploadModal'>
			<Modal.Content>
				<LoaderModal active={isLoadingActive} />
				{isCMEBuilderModalOpen ? (
					<>
						<p className='cmeBuilderCodeImport'>
							To ensure an accurate import, the Custom Model Extension Builder requires your imported Code List to be structured as
							pictured below:
						</p>
						<img
							src={codeListExample}
							alt='NIEM Code List Example. Row1 ColumnA: codeKey, Row1 ColumnB: codeValue, Row1 ColumnC: codeType, Row2 ColumnA: key1, Row2 ColumnB: value1, Row2 ColumnC: codeType' // removed the word "Image" from the text as it produced a warning in the dev console
							className='cme-codeListExample-img'
						/>
						<br />
						<p className='cmeBuilderCodeImport'>
							To download a standardized Code List template, please click&nbsp;
							<a
								// template used to create CME Builder Code List
								download='CodeListTemplate.xlsx'
								href='/CodeListTemplate.xlsx'
								id='downloadCodeListTemplate'
								style={{ textDecoration: 'underline' }}
							>
								here
							</a>
							.
						</p>
					</>
				) : null}
				<Container className='uploadModal' textAlign='center' fluid>
					<div {...getRootProps()}>
						{isDragActive ? (
							<div>
								<Icon name='cloud upload' className='UploadIcon' size='huge' />
								<p>Drop the files here ...</p>
							</div>
						) : (
							<div>
								<Icon name='cloud upload' className='UploadIcon' size='huge' />
								<p>Drag & drop or browse to upload</p>
								<BrowseArtifact />
							</div>
						)}
					</div>
				</Container>
				{artifactUploadingActive ? (
					<>
						<Divider />
						<Grid columns={uploadWorkflow.allowUserChoice ? '2' : '1'} className='uploadModal-uploading-file'>
							<Grid.Row>
								<Grid.Column> Artifact Name </Grid.Column>
								{uploadWorkflow.allowUserChoice ? <Grid.Column> Artifact Type </Grid.Column> : null}
							</Grid.Row>
							<Grid.Row>
								<Grid.Column verticalAlign='middle'>
									<Icon name='file alternate outline' />
									{artifact.name} {artifact.size}
									<br />
									{/* TODO: show file upload progress */}
									{isValidFileType ? (
										<>
											Completed <Icon name='check' color='green' />
										</>
									) : (
										<>
											File Unsupported <Icon name='times' color='red' />
										</>
									)}
								</Grid.Column>
								{uploadWorkflow.allowUserChoice ? (
									<Grid.Column>
										<Dropdown
											placeholder='Select Type'
											fluid
											selection
											options={artifactTypeOptions}
											onChange={(e, d) => UpdateArtifactTag(d.value)}
										/>
									</Grid.Column>
								) : null}
							</Grid.Row>
						</Grid>
					</>
				) : null}
				{isCMEBuilderModalOpen ? (
					<Message warning>
						Please be advised that Code Lists structured differently than the example provided above may result in some or all of your
						items not importing.
					</Message>
				) : null}
			</Modal.Content>
			{artifactUploadingActive && !isValidFileType ? (
				<Message attached error>
					<Message.Header>File type is not supported</Message.Header>
					{artifact.tag === artifactTags.sample ? (
						<Message.Content>
							You have selected an unsupported file type. Please select a <b>.xml</b> or <b>.json</b> file to proceed.
						</Message.Content>
					) : artifact.tag === artifactTags.businessRules || uploadWorkflow.artifactTag === artifactTags.businessRules ? (
						<Message.Content>
							The selected artifact type cannot be in the extensions <strong>.exe</strong>, <strong>.zip</strong>, and{' '}
							<strong>.tar</strong>. Upload a different file.
						</Message.Content>
					) : (
						// is a 'code' file
						<Message.Content>
							You have selected an unsupported file type. Please select a <b>.xlsx</b> or <b>.csv</b> file to proceed.
						</Message.Content>
					)}
				</Message>
			) : null}
			<Modal.Actions>
				<Button
					className='primaryButton'
					disabled={isUploadDisabled}
					onClick={() => {
						handleUpload();
					}}
				>
					{isCMEBuilderModalOpen ? 'Import' : 'Upload'}
				</Button>
				<Button
					className='secondaryButton'
					onClick={() => {
						dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
						dispatch({
							type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
							payload: { allowUserChoice: true, artifactTag: null, uploadItem: null },
						}); // return to default
						dispatch({ type: actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED, payload: true });
						dispatch({ type: actionTypes.UPDATE_CME_BUILDER_RESET_CODELIST_MODAL_OPEN, paylod: false });
						// clear upload artifact info
						dispatch({ type: actionTypes.RESET_ARTIFACT });
					}}
				>
					Cancel
				</Button>
			</Modal.Actions>
		</Modal>
	);
};

export default UploadModal;
