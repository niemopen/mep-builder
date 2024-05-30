import React, { useEffect, useState } from 'react';
import * as actionTypes from '../redux/actions';
import * as key from '../Shared/KVstore';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Icon, Message, Popup } from 'semantic-ui-react';
import LoaderModal from '../Shared/LoaderModal';

const UploadCard = (props) => {
	const artifact = useSelector((state) => state.upload.artifact);
	const packageName = useSelector((state) => state.mpd.packageName);
	const analyzeRequirementsActive = useSelector((state) => state.sidebar.analyzeRequirementsActive);
	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const uploadMessageState = useSelector((state) => state.upload.uploadMessageState);

	const dispatch = useDispatch();

	useEffect(() => {
		// Function as a callback when isLoadingActive is updated. Forces synchronous behavior.
	}, [isLoadingActive]);

	const handleDownloadMappingTemplate = () => {
		// This method should first check if the URL provided by NIEM can be reached to download the most up to date copy of their mapping document template
		// If the URL cannot be reached, the copy saved in this source code is used
		// UPDATE 06/14/2021: the code to check the URL has been commented out because a different template was used to populate our mapping grids.
		// The template used is /mappingTemplate/mapping-spreadsheet-template.xlsx

		// const mappingTemplateURL = 'http://niem.github.io/training/iepd-developer/map-and-model/assets/SampleEmptyMappingDocument.xlsx';
		// const urlExists = require('url-exists');

		setIsLoadingActive(true);
		const element = document.createElement('a');
		element.setAttribute('href', '/mappingTemplate/mapping-spreadsheet-template.xlsx');
		element.setAttribute('download', 'DataMappingTemplate.xlsx');
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		setIsLoadingActive(false);
	};

	return (
		<>
			<LoaderModal active={isLoadingActive} />
			<Card fluid>
				<Card.Content header={props.cardName} textAlign='center' className='uploadCardHeader' />
				<Card.Content textAlign='center'>
					{packageName === '' || packageName == null ? (
						<Message info>
							A
							<Popup inverted position='top left' trigger={<label> {key.packageNameAcronymn} Name </label>} />
							must be entered prior to uploading a document.
						</Message>
					) : uploadMessageState === 'successful' ? (
						<Message success>
							<p>
								<b>{artifact.name}</b> <br />
								was uploaded successfully
							</p>
						</Message>
					) : uploadMessageState === 'unsuccessful' ? (
						<Message error>
							<p>
								<b>Upload Failed</b> <br />
								{artifact.name} failed to upload
							</p>
						</Message>
					) : null}

					<Button
						fluid
						className='primaryButton'
						disabled={packageName === '' || packageName == null}
						onClick={() => {
							dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
							dispatch({
								type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
								payload: { allowUserChoice: true, artifactTag: null, uploadItem: null },
							});
						}}
					>
						<Icon name='plus' />
						Upload New Document
					</Button>

					{analyzeRequirementsActive ? (
						<>
							<br />
							<Button className='primaryButton' fluid onClick={handleDownloadMappingTemplate}>
								<Icon name='download' />
								Download Data Mapping Template
							</Button>
						</>
					) : null}
				</Card.Content>
			</Card>
		</>
	);
};

export default UploadCard;
