import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Button, Grid, Container, List, Segment, Accordion, Divider, Radio, Message, Checkbox, Popup } from 'semantic-ui-react';
import { generateWantlist } from '../Util/WantlistUtil';
import { generateSubsetSchema, downloadSubsetSchema } from '../Util/SubsetSchemaUtil';
import LoaderModal from '../Shared/LoaderModal';
import * as key from '../Shared/KVstore';
import { handleSavePackage } from '../Util/savePackageUtil';
import CMEBuilderModal from '../Shared/CMEBuilderModal';
import { updateArtifactChecklist } from '../Shared/ArtifactChecklist';
import TranslateList from '../Shared/TranslateList';
import ArtifactValidator from './ArtifactValidator';
import { updateReduxArtifactTreeFromDB } from '../Util/ArtifactTreeUtil';
import ApiErrorNotification from '../Shared/ApiErrorNotification';
import { trackedErrorSources } from '../Util/ErrorHandleUtil';
import Tooltip from '../Shared/Tooltip.js';
import * as tooltipContent from '../Shared/TooltipContent.js';

const BuildValidate = () => {
	const userId = useSelector((state) => state.session.userId);
	const packageId = useSelector((state) => state.mpd.packageId);
	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const wantlistEmpty = useSelector((state) => state.build.wantlistEmpty);
	const ssgtWantlistError = useSelector((state) => state.build.ssgtWantlistError);
	const [nillableDefault, setNillableDefault] = useState('true');
	const infoAccordionOpen = useSelector((state) => state.build.infoAccordionOpen);
	const release = useSelector((state) => state.mpd.release);
	const propertySheet = useSelector((state) => state.mappingDoc.propertySheet);
	const typeSheet = useSelector((state) => state.mappingDoc.typeSheet);
	const [includeDocumentation, setIncludeDocumentation] = useState(false);
	const [downloadStatusMessage, setDownloadStatusMessage] = useState('');
	const [isFormatListVisible, setIsFormatListVisible] = useState(false);
	const formatTranslationMessage = useSelector((state) => state.build.translateMessage);
	const isExtensionSchemaGenerated = useSelector((state) => state.cme.isExtensionSchemaGenerated);
	const generateSubsetSchemaActive = useSelector((state) => state.build.generateSubsetSchemaActive);
	const isTranslationGenerated = useSelector((state) => state.translate.isTranslationGenerated);
	const mepChangeWarningModalOpen = useSelector((state) => state.mepChangeWarning.mepChangeWarningModalOpen);
	const showSubsetMessage = useSelector((state) => state.build.showSubsetMessage);
	const isRequiredArtifactUploaded = useSelector((state) => state.mpd.isRequiredArtifactUploaded);
	const apiErrorDetails = useSelector((state) => state.error.apiErrorDetails);
	const subsetGenerated = isRequiredArtifactUploaded.subset;

	const dispatch = useDispatch();

	const handleGenerateSubsetSchema = useCallback(async () => {
		setIsLoadingActive(true);

		// Generate Wantlist
		const wantlistGenerated = await generateWantlist(propertySheet, typeSheet, release, nillableDefault);

		// Generate Subset Schema
		if (wantlistGenerated !== false && !wantlistEmpty) {
			// save package, will udpate Artifact Tree in DB
			await handleSavePackage(true);

			// setting 'include wantlist' to true always since we are always saving wantlist to local repo
			const result = await generateSubsetSchema(wantlistGenerated, includeDocumentation, true, packageId, userId);

			if (result !== false) {
				await updateArtifactChecklist(packageId, 'subset', true);
			}
		}

		await updateReduxArtifactTreeFromDB(packageId);
		setIsLoadingActive(false);
		dispatch({ type: actionTypes.GENERATE_SUBSET_SCHEMA_ACTIVE, payload: false });
	}, [dispatch, includeDocumentation, nillableDefault, packageId, propertySheet, release, typeSheet, userId, wantlistEmpty]);

	useEffect(() => {
		if (generateSubsetSchemaActive) {
			const generate = async () => {
				await handleGenerateSubsetSchema();
			};
			generate();
		}
	}, [generateSubsetSchemaActive, handleGenerateSubsetSchema]);

	async function handleDownloadSubsetSchema() {
		setIsLoadingActive(true);
		const isSuccess = await downloadSubsetSchema(packageId);
		if (isSuccess === false) {
			// Show download unsuccessfull message
			setDownloadStatusMessage('fail');
		} else {
			// Show download successful message
			setDownloadStatusMessage('success');
		}

		setIsLoadingActive(false);

		// Allows download message to only be visble for 5 seconds
		const timer = setTimeout(() => {
			setDownloadStatusMessage('');
		}, 5000);
		return () => clearTimeout(timer);
	}

	const showMoreLessInfo = [
		{
			active: infoAccordionOpen,
			title: infoAccordionOpen ? 'Show Less' : 'Show More',
			content: [
				<Grid.Row>
					<Segment>
						<Grid columns='two' divided>
							<Grid.Column>
								<h3>
									Now that the NIEM elements have been selected, the next step is to create the schemas and artifacts that meet NIEM
									standards.
								</h3>
							</Grid.Column>
							<Grid.Column>
								<List bulleted>
									<List.Item>Generate a wantlist</List.Item>
									<List.Item>Generate a Subset Schema</List.Item>
									<List.Item>Build Custom Model Extensions</List.Item>
									<List.Item>Validate package artifacts for conformance</List.Item>
								</List>
							</Grid.Column>
						</Grid>
					</Segment>
					<Divider hidden />
				</Grid.Row>,
				<p>In this phase, the wantlist and Subset Schema will be generated together and added to the {key.packageName} Artifacts.</p>,
			],
		},
	];

	return (
		<>
			<LoaderModal active={isLoadingActive} />
			<CMEBuilderModal />
			<Grid className='contentPage' columns='two'>
				<Grid.Column width='4'>
					{wantlistEmpty && !ssgtWantlistError ? (
						<>
							<Grid.Row>
								<Message
									warning
									header='Generated an Empty Wantlist'
									content='You attempted to generate a wantlist that does not contain any elements. Please return to the Map and Model phase to map Properties and/or Types before proceeding.'
								/>
							</Grid.Row>
							<br />
						</>
					) : apiErrorDetails.errorSource === trackedErrorSources.subset || apiErrorDetails.errorSource === trackedErrorSources.wantlist ? (
						<Grid.Row>
							<ApiErrorNotification />
						</Grid.Row>
					) : subsetGenerated && showSubsetMessage ? (
						<>
							<Grid.Row>
								<Message
									success
									header='Subset Schema Successfully Completed'
									content={
										'Your Subset Schema has successfully been completed and added to the ' +
										key.packageName +
										' Artifacts tree in the sidebar. Please remember to save your work.'
									}
								/>
							</Grid.Row>
							<br />
						</>
					) : null}
					{formatTranslationMessage === 'success' ? (
						<>
							<Message
								success
								header='Format Translation Completed'
								content={
									'Your Format Translation has been successfully completed and added to the ' +
									key.packageName +
									' Artifacts tree in the sidebar. Please remember to save your work.'
								}
							/>
						</>
					) : apiErrorDetails.errorSource === trackedErrorSources.translate ? (
						<ApiErrorNotification />
					) : null}
					<Grid.Row className='buildValidateOptions'>Nillable Default Value:</Grid.Row>
					<Grid.Row className='buildValidateOptions' columns='two'>
						<Radio
							label='True'
							name='nillableDefaultRadio'
							value='true'
							checked={nillableDefault === 'true'}
							onChange={() => setNillableDefault('true')}
						/>
						<Radio
							label='False'
							name='nillableDefaultRadio'
							value='false'
							checked={nillableDefault === 'false'}
							onChange={() => setNillableDefault('false')}
						/>
					</Grid.Row>
					<Grid.Row className='buildValidateOptions'>
						<Checkbox label='Include Documentation' defaultChecked onChange={(e, d) => setIncludeDocumentation(d.checked)} />
					</Grid.Row>
					<Grid.Row>
						<br />
						{isExtensionSchemaGenerated === 'success' ? (
							<>
								<Message
									success
									header='Extension Schema Completed'
									content={
										'Your Extension Schema has successfully been completed and added to the ' +
										key.packageName +
										' Artifacts tree in the sidebar. Please remember to save your work.'
									}
								/>
							</>
						) : isExtensionSchemaGenerated === 'fail' ? (
							<>
								<Message
									error
									header='Extension Schema Not Completed'
									content='Your Extension Schema was unsuccessful. Please try again.'
								/>
							</>
						) : null}
						<Button
							className='primaryButton'
							fluid
							onClick={() => {
								dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_OPEN, payload: true });
								dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_TRIGGER, payload: 'subset' });
								dispatch({ type: actionTypes.MEP_CONTAINS_DEFAULT_TEXT_TRUE });
								dispatch({ type: actionTypes.GENERATE_SUBSET_TEXT_TRUE });
							}}
						>
							Generate Subset Schema
						</Button>
						<br />
						{subsetGenerated ? (
							<Button
								className='primaryButton'
								fluid
								onClick={() => {
									if (isTranslationGenerated) {
										dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_OPEN, payload: true });
										dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_TRIGGER, payload: 'cme' });
										dispatch({ type: actionTypes.MEP_CONTAINS_TRANSLATION_TEXT_TRUE });
										dispatch({ type: actionTypes.GENERATE_TRANSLATION_TEXT_TRUE });
									} else {
										dispatch({ type: actionTypes.UPDATE_CME_BUILDER_MODAL_OPEN, payload: true });
									}
								}}
							>
								Build Custom Model Extensions
							</Button>
						) : (
							<Tooltip
								content={tooltipContent.cmeDisabledMessage}
								position='right center'
								trigger={
									<Button className='primaryButton disabledButton disabledButtonMatch' fluid>
										Build Custom Model Extensions
									</Button>
								}
							/>
						)}
						<br />
						<Popup
							open={isFormatListVisible}
							basic
							position='bottom right'
							style={mepChangeWarningModalOpen ? { padding: '0' } : null} // prevent the list from displaying over MEP Change Warning Modal
							trigger={
								<Button
									disabled={!subsetGenerated}
									className='primaryButton'
									fluid
									onClick={() => {
										setIsFormatListVisible(!isFormatListVisible);
									}}
								>
									Translate Format
								</Button>
							}
						>
							<TranslateList
								sourceComponent='BuildValidate'
								packageId={packageId}
								loadingStateChanger={setIsLoadingActive}
								listVisibleChanger={setIsFormatListVisible}
							/>
						</Popup>
						{downloadStatusMessage === 'success' ? (
							<>
								<Message
									success
									header='Subset Schema Download Success'
									content={'Your Subset Schema has successfully been downloaded.'}
								/>
							</>
						) : downloadStatusMessage === 'fail' ? (
							<>
								<Message error header='Subset Schema Download Failed' content={'There was an error downloading the Subset Schema.'} />
							</>
						) : null}

						<br />

						<Button disabled={!subsetGenerated} className='primaryButton' fluid onClick={handleDownloadSubsetSchema}>
							Download Subset Schema
						</Button>
					</Grid.Row>
				</Grid.Column>
				<Grid.Column width='12'>
					<Grid className='infoBox'>
						<Grid.Row>
							<Grid.Column width='10'>
								<h2>Build and Validate</h2>
							</Grid.Column>
						</Grid.Row>
						<Grid.Row>
							<Grid.Column>
								<Accordion
									as={Container}
									panels={showMoreLessInfo}
									onClick={() =>
										dispatch({
											type: actionTypes.BUILD_INFO_BANNER_SHOW_LESS,
										})
									}
								></Accordion>
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Grid.Column>
				<Grid.Row>
					<Segment>
						<ArtifactValidator subsetSchemaGenerated={subsetGenerated} />
					</Segment>
				</Grid.Row>
			</Grid>
		</>
	);
};

export default BuildValidate;
