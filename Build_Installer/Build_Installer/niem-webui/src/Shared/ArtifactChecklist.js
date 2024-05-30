import React, { useState } from 'react';
import { Button, Header, Icon, Step, Modal } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import * as sessionVar from '../Util/SessionVar';
import { useEffect } from 'react';
import { artifactTags, exportArtifactItem } from '../Util/ArtifactTreeUtil';
import { getCatalogName } from '../Util/MPDCatalogUtil';
import { handleSaveClosePackage, handleSavePackage } from '../Util/savePackageUtil';
import { setSessionValue, getSessionValue } from '../Util/localStorageUtil';
import { baseURL } from '../Util/ApiUtil';
import axios from 'axios';
import store from '../redux/store';
import { setActiveSidebarTab } from '../Navigation/LeftNavContent';
import SampleOptionsModal from './SampleOptionsModal';
import { handleError } from '../Util/ErrorHandleUtil';

const updateArtifactChecklistApi = async (packageId, isRequiredArtifactUploaded) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'MongoRepo/updateArtifactChecklist', {
				packageData: {
					packageId: packageId,
					isRequiredArtifactUploaded: JSON.stringify(isRequiredArtifactUploaded),
				},
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				return response;
			})
			.catch((err) => {
				handleError(err);
			});
	}
};

export const getArtifactChecklistApi = async (packageId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.get(baseURL + 'MongoRepo/getArtifactChecklist/' + packageId)
			.then((response) => {
				return response.data.artifactChecklist;
			})
			.catch((err) => {
				handleError(err);
			});
	}
};

export const getArtifactChecklist = async (packageId) => {
	// this function gets the artifact checklist from the db and updates redux
	const artifactChecklist = await getArtifactChecklistApi(packageId);
	const checklist = artifactChecklist.checklist;

	for (let artifact in checklist) {
		store.dispatch({
			type: actionTypes.UPDATE_IS_REQUIRED_ARTIFACT_UPLOADED,
			payload: { requiredArftifact: artifact, isUploaded: checklist[artifact] },
		});
	}

	return artifactChecklist;
};

export const updateArtifactChecklist = async (packageId, artifact, uploadStatus) => {
	// this function updates the artifact checklist in the db and updates redux
	let artifactChecklist = await getArtifactChecklistApi(packageId);

	// update checklist property with new value, ex. artifactChecklist.checklist[changelog] = true
	artifactChecklist.checklist[artifact] = uploadStatus;

	store.dispatch({ type: actionTypes.UPDATE_IS_REQUIRED_ARTIFACT_UPLOADED, payload: { requiredArftifact: artifact, isUploaded: uploadStatus } });
	await updateArtifactChecklistApi(packageId, artifactChecklist.checklist);
};

export const isFileRequiredArtifact = async (packageId, tag, uploadStatus) => {
	// if file is a required artifact update its status in the checklist
	if (
		tag === artifactTags.catalog ||
		tag === artifactTags.readme ||
		tag === artifactTags.changelog ||
		tag === artifactTags.conformance ||
		tag === artifactTags.subsetSchema ||
		tag === artifactTags.sample
	) {
		await updateArtifactChecklist(packageId, tag, uploadStatus);
	}
};

const ArtifactChecklist = () => {
	const initialStatus = {
		subset: true,
		// TODO: With completion of 516, bring this back
		// extension: true,
		catalog: false,
		sample: true,
		readme: false,
		changelog: false,
		conformance: false,
	};

	const dispatch = useDispatch();
	const isPublishImplementActive = useSelector((state) => state.sidebar.publishImplementActive);
	const packageName = useSelector((state) => state.mpd.packageName);
	const packageId = useSelector((state) => state.mpd.packageId);
	const artifactTree = useSelector((state) => state.artifact.treeItems);
	const release = useSelector((state) => state.mpd.release);
	const isRequiredArtifactUploaded = useSelector((state) => state.mpd.isRequiredArtifactUploaded);
	const congratsModalOpen = useSelector((state) => state.publish.congratsModalOpen);
	const isCMEComplete = useSelector((state) => state.cme.isCMEComplete); // TO DO: Update this once the CME Builder is finished
	const [isChecklistComplete, setIsChecklistComplete] = useState(false);
	const [status, setStatus] = useState(initialStatus);
	const [catalogName, setCatalogName] = useState('MPD');
	const changelogNeedsReview = useSelector((state) => state.artifact.changelogNeedsReview);
	const readmeNeedsReview = useSelector((state) => state.artifact.readmeNeedsReview);
	const sampleNeedsReview = useSelector((state) => state.artifact.sampleNeedsReview);

	useEffect(() => {
		// This functionality checks and updates if the checklist is able to proceed
		// This useEffect and the below useEffect are seperated to prevent infinite rendering errors
		const isChecklistComplete = () => {
			const isChecklistIncomplete = Object.values(status).includes(false); // if false values are found will return true, otherwise return false
			if (isChecklistIncomplete) {
				setIsChecklistComplete(false);
			} else {
				setIsChecklistComplete(true);
			}
		};

		isChecklistComplete();

		// grab catalog file name and return the initials
		const fileName = getCatalogName(release);
		const name = fileName.split('-');
		setCatalogName(name[0].toUpperCase());
	}, [release, status]);

	useEffect(() => {
		// This useEffect updates the individual checklist items

		const updateNeedsReviewStatus = () => {
			artifactTree.forEach((artifact) => {
				dispatch({ type: actionTypes.SET_CHANGELOG_NEEDS_REVIEW, payload: false });
				dispatch({ type: actionTypes.SET_README_NEEDS_REVIEW, payload: false });
				dispatch({ type: actionTypes.SET_SAMPLE_NEEDS_REVIEW, payload: false });

				const loopThrough = (artifact) => {
					if (artifact.tag === artifactTags.changelog && artifact.needsReview) {
						dispatch({ type: actionTypes.SET_CHANGELOG_NEEDS_REVIEW, payload: true });
					} else if (artifact.tag === artifactTags.readme && artifact.needsReview) {
						dispatch({ type: actionTypes.SET_README_NEEDS_REVIEW, payload: true });
					} else if (artifact.tag === artifactTags.sample && artifact.needsReview) {
						dispatch({ type: actionTypes.SET_SAMPLE_NEEDS_REVIEW, payload: true });
					}

					artifact.children.forEach((child) => {
						loopThrough(child);
					});
				};

				loopThrough(artifact);
			});
		};

		// Check if the items are uploaded in the Artifact Tree
		const isSubsetSchemaUploaded = isRequiredArtifactUploaded.subset;
		const isCatalogUploaded = isRequiredArtifactUploaded.catalog;
		const isSampleUploaded = isRequiredArtifactUploaded.sample;
		const isReadMeUploaded = isRequiredArtifactUploaded.readme;
		const isChangelogUploaded = isRequiredArtifactUploaded.changelog;
		const isConformanceUploaded = isRequiredArtifactUploaded.conformance;
		// const isExtensionUploaded = false; // TODO: with the completion of 516, bring this back

		const result = {
			subset: isSubsetSchemaUploaded,
			catalog: isCatalogUploaded,
			sample: isSampleUploaded,
			readme: isReadMeUploaded,
			changelog: isChangelogUploaded,
		};

		// Only show Extension Schema checklist item if the CME Builder is compelete.
		// TODO: With the completion of 516, bring this back
		// isCMEComplete ? (result.extension = isExtensionUploaded) : delete result.extension; // TO DO - Repalce this to check if CME file is in the artifact tree once NIEM 413 is complete
		// Only show Conformance Assertion checklist item if on Publish & Implement page.
		isPublishImplementActive ? (result.conformance = isConformanceUploaded) : delete result.conformance;
		updateNeedsReviewStatus();
		setStatus(result);
	}, [artifactTree, isCMEComplete, isPublishImplementActive, catalogName, packageName, isRequiredArtifactUploaded, dispatch]);

	const handlePublish = async () => {
		dispatch({ type: actionTypes.UPDATE_MPD_IS_PUBLISHED, payload: true });
		const creationDate = new Date().toISOString().slice(0, 10);
		dispatch({ type: actionTypes.UPDATE_MPD_CREATION_DATE, payload: creationDate });
		await handleSavePackage(true);
		setSessionValue('publish_congrats_modal_open', true, actionTypes.PUBLISH_CONGRATS_MODAL_OPEN);
	};

	const handleItemClick = (item) => {
		// NOTE for future development:
		// With the completion of NIEM 516, clicking the Extension schema tab should redirect the user to the Build & Validate phase to maintain consistency of the iteractive artifact checklist
		switch (item) {
			case 'schema': {
				setActiveSidebarTab('BuildValidate', dispatch);
				break;
			}
			case 'sample': {
				if (sampleNeedsReview) {
					// open sample modal
					dispatch({ type: actionTypes.SET_SHOW_SAMPLE_OPTIONS_MODAL, payload: true });
				} else {
					// redirect to Analyze Requirements page
					setActiveSidebarTab('AnalyzeRequirements', dispatch);
				}
				break;
			}
			case 'readme': {
				// change menu tab to readme
				dispatch({ type: actionTypes.ACTIVE_PANE, payload: 0 });
				break;
			}
			case 'changelog': {
				// change menu tab to changelog
				dispatch({ type: actionTypes.ACTIVE_PANE, payload: 1 });
				break;
			}
			case 'conformance': {
				// change menu tab to conformance
				dispatch({ type: actionTypes.ACTIVE_PANE, payload: 3 });
				break;
			}
			default: {
				// do nothing
			}
		}
	};

	return (
		<>
			<SampleOptionsModal />
			<Modal open={congratsModalOpen} size='mini'>
				<Modal.Header>CONGRATULATIONS</Modal.Header>
				<Modal.Content>
					<b>{packageName}</b> has been successfully published!
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='primaryButton'
						onClick={() => {
							// export entire artifactTree
							exportArtifactItem(artifactTree, '0', packageName, packageId);
						}}
					>
						Export
					</Button>
					<Button
						className='primaryButton'
						onClick={() => {
							setSessionValue('publish_congrats_modal_open', false, actionTypes.PUBLISH_CONGRATS_MODAL_OPEN);
							handleSaveClosePackage();
						}}
					>
						Go to My Home
					</Button>
				</Modal.Actions>
			</Modal>
			<div>
				<Header size='small'>Required Artifact Checklist</Header>
				<p>Before you are able to publish, all items below must be marked as 'Uploaded' and present in the artifact tree.</p>
				<p>Please click missing item(s) to complete.</p>
			</div>
			<Step.Group vertical size='tiny'>
				<Step completed={status.subset} className={status.subset ? '' : 'checklistWarning'} onClick={() => handleItemClick('schema')}>
					<Icon name='warning sign' color='brown' />
					<Step.Content>
						<Step.Title>NIEM Subset Schema</Step.Title>
						<Step.Description>{status.subset ? 'Uploaded' : 'Missing'}</Step.Description>
					</Step.Content>
				</Step>
				{/* NOTE: With the completion of NIEM 516, this component will be brought back*/}
				{/* {isCMEComplete ? (
					<Step completed={status.extension} className={status.extension ? '' : 'checklistWarning'}>
						<Icon name='warning sign' color='brown' />
						<Step.Content>
							<Step.Title>Extension Schema</Step.Title>
							<Step.Description>{status.extension ? 'Uploaded' : 'Missing'}</Step.Description>
						</Step.Content>
					</Step>
				) : null} */}
				<Step completed={status.catalog} className={status.catalog ? '' : 'checklistWarning'}>
					<Icon name='warning sign' />
					<Step.Content>
						<Step.Title>{catalogName} Catalog</Step.Title>
						<Step.Description>{status.catalog ? 'Uploaded' : 'Missing'}</Step.Description>
					</Step.Content>
				</Step>

				<Step
					completed={!sampleNeedsReview && status.sample}
					className={status.sample && !sampleNeedsReview ? '' : 'checklistWarning'}
					onClick={() => handleItemClick('sample')}
				>
					<Icon name='warning sign' color='brown' />
					<Step.Content>
						<Step.Title>Sample Message</Step.Title>
						<Step.Description>
							{status.sample && sampleNeedsReview ? 'Needs Review' : status.sample && !sampleNeedsReview ? 'Uploaded' : 'Missing'}
						</Step.Description>
					</Step.Content>
				</Step>

				<Step
					completed={!readmeNeedsReview && status.readme}
					className={status.readme && !readmeNeedsReview ? '' : 'checklistWarning'}
					onClick={() => handleItemClick('readme')}
				>
					<Icon name='warning sign' color='brown' />
					<Step.Content>
						<Step.Title>ReadMe</Step.Title>
						<Step.Description>
							{status.readme && readmeNeedsReview ? 'Needs Review' : status.readme && !readmeNeedsReview ? 'Uploaded' : 'Missing'}
						</Step.Description>
					</Step.Content>
				</Step>

				<Step
					completed={!changelogNeedsReview && status.changelog}
					className={!changelogNeedsReview && status.changelog ? '' : 'checklistWarning'}
					onClick={() => handleItemClick('changelog')}
				>
					<Icon name='warning sign' color='brown' />
					<Step.Content>
						<Step.Title>Change Log</Step.Title>
						<Step.Description>
							{status.changelog && changelogNeedsReview
								? 'Needs Review'
								: status.changelog && !changelogNeedsReview
								? 'Uploaded'
								: 'Missing'}
						</Step.Description>
					</Step.Content>
				</Step>
				{isPublishImplementActive ? (
					<Step
						completed={status.conformance}
						className={status.conformance ? '' : 'checklistWarning'}
						onClick={() => handleItemClick('conformance')}
					>
						<Icon name='warning sign' color='brown' />
						<Step.Content>
							<Step.Title>Conformance Assertion</Step.Title>
							<Step.Description>{status.conformance ? 'Uploaded' : 'Missing'}</Step.Description>
						</Step.Content>
					</Step>
				) : null}
			</Step.Group>
			{isPublishImplementActive ? (
				<Button fluid icon disabled={isChecklistComplete ? false : true} className='primaryButton' onClick={handlePublish}>
					Publish
				</Button>
			) : (
				<Button
					icon
					disabled={isChecklistComplete ? false : true}
					className='primaryButton'
					onClick={() => {
						dispatch({ type: actionTypes.UPDATE_PUBLISH_IMPLEMENT_ACTIVE });
					}}
				>
					Proceed to Publish & Implement <Icon name='caret right' />
				</Button>
			)}
		</>
	);
};

export default ArtifactChecklist;
