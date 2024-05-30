import React, { useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import * as key from '../Shared/KVstore';
import * as actionTypes from '../redux/actions';
import ToggleIcon from '../Shared/ToggleIcon.js';
import ArtifactTree from '../Shared/ArtifactTree';
import Tooltip from '../Shared/Tooltip.js';
import * as tooltipContent from '../Shared/TooltipContent.js';

import { Divider, Grid, Menu, Icon, Accordion } from 'semantic-ui-react';

import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

const artifactChecklistName = 'Artifact / Checklist';
const artifactEditorName = 'Artifact Editor';
const documentCenterName = 'Document Center';
const validationStatusName = 'Validation Status';
const peerReviewStatusName = 'Peer Review Status';
const elementsMappingName = 'Elements / Mapping';

export const setActiveSidebarTab = (tab, dispatch) => {
	switch (tab) {
		case 'CreationGuide':
			dispatch({ type: actionTypes.UPDATE_CREATION_GUIDE_ACTIVE });
			break;
		case 'ScenarioPlanning':
			dispatch({ type: actionTypes.UPDATE_SCENARIO_PLANNING_ACTIVE });
			break;
		case 'AnalyzeRequirements':
			dispatch({ type: actionTypes.UPDATE_ANALYZE_REQUIREMENTS_ACTIVE });
			break;
		case 'MapModel':
			dispatch({ type: actionTypes.UPDATE_MAP_MODEL_ACTIVE });
			break;
		case 'BuildValidate':
			dispatch({ type: actionTypes.UPDATE_BUILD_VALIDATE_ACTIVE });
			break;
		case 'AssembleDocument':
			dispatch({ type: actionTypes.UPDATE_ASSEMBLE_DOCUMENT_ACTIVE });
			break;
		case 'PublishImplement':
			dispatch({ type: actionTypes.UPDATE_PUBLISH_IMPLEMENT_ACTIVE });
			break;
		default:
			break;
	}
};

const LeftNavContent = () => {
	const creationGuideActive = useSelector((state) => state.sidebar.creationGuideActive);
	const scenarioPlanningActive = useSelector((state) => state.sidebar.scenarioPlanningActive);
	const analyzeRequirementsActive = useSelector((state) => state.sidebar.analyzeRequirementsActive);
	const mapModelActive = useSelector((state) => state.sidebar.mapModelActive);
	const buildValidateActive = useSelector((state) => state.sidebar.buildValidateActive);
	const assembleDocumentActive = useSelector((state) => state.sidebar.assembleDocumentActive);
	const publishImplementActive = useSelector((state) => state.sidebar.publishImplementActive);
	const dispatch = useDispatch();

	const [lifecycleActive, setLifecycleActive] = useState(true);
	const [iepdAccordActive, setIepdAccordActive] = useState(false);
	const [artifactTreeActive, setArtifactTreeActive] = useState(false);
	const [artifactChecklistToggle, setArtifactChecklistToggle] = useState(true);
	const [artifactEditorToggle, setArtifactEditorToggle] = useState(true);
	const [documentCenterToggle, setDocumentCenterToggle] = useState(true);
	const [validationStatusToggle, setValidationStatusToggle] = useState(true);
	const [peerReviewToggle, setPeerReviewToggle] = useState(true);
	const [elementsToggle, setElementsToggle] = useState(true);

	const handleToggleClick = (s) => {
		switch (s) {
			case artifactChecklistName:
				setArtifactChecklistToggle(!artifactChecklistToggle);
				break;
			case artifactEditorName:
				setArtifactEditorToggle(!artifactEditorToggle);
				break;
			case documentCenterName:
				setDocumentCenterToggle(!documentCenterToggle);
				break;
			case validationStatusName:
				setValidationStatusToggle(!validationStatusToggle);
				break;
			case peerReviewStatusName:
				setPeerReviewToggle(!peerReviewToggle);
				break;
			case elementsMappingName:
				setElementsToggle(!elementsToggle);
				break;
			default:
				break;
		}
	};

	return (
		<>
			<Menu.Item 
				id="sidebarCreationGuideMenu"
				as={Link}
				to='/PackageBuilder/EditPackage'
				active={creationGuideActive}
				onClick={() => setActiveSidebarTab('CreationGuide', dispatch)}
				>
				<Tooltip
					content={tooltipContent.packageCreationGuide}
					position='right center'
					trigger={<div>{key.packageName} Creation Guide</div>}
				/>
			</Menu.Item>

			<Divider />

			<Accordion as={Menu} fluid vertical id='lifecycleAccordion'>
				<Menu.Item>
					<Accordion.Title
						active={lifecycleActive}
						content={
							<Grid columns='2'>
								<Grid.Row>
									<Grid.Column width={1}>
										<Icon name='recycle' />
									</Grid.Column>
									<Tooltip
										content={tooltipContent.lifecyclePhases}
										position='right center'
										trigger={<Grid.Column width={11}>Lifecycle Phases</Grid.Column>}
									/>
								</Grid.Row>
							</Grid>
						}
						onClick={() => setLifecycleActive(!lifecycleActive)}
						index={0}
					/>
					<Accordion.Content
						active={lifecycleActive}
						content={
							<div id='lifecycleAccordionContent'>
								<Menu.Item
									as={Link}
									to='/PackageBuilder/ScenarioPlanning'
									active={scenarioPlanningActive}
									onClick={() => setActiveSidebarTab('ScenarioPlanning', dispatch)}
								>
									<Tooltip content={tooltipContent.scenarioPlanning} position='right center' trigger={<p>Scenario Planning</p>} />
								</Menu.Item>
								<Menu.Item
									as={Link}
									to='/PackageBuilder/AnalyzeRequirements'
									active={analyzeRequirementsActive}
									onClick={() => setActiveSidebarTab('AnalyzeRequirements', dispatch)}
								>
									<Tooltip
										content={tooltipContent.analyzeRequirements}
										position='right center'
										trigger={<p>Analyze Requirements</p>}
									/>
								</Menu.Item>
								<Menu.Item
									as={Link}
									to='/PackageBuilder/MapModel'
									active={mapModelActive}
									onClick={() => setActiveSidebarTab('MapModel', dispatch)}
								>
									<Tooltip content={tooltipContent.mapModel} position='right center' trigger={<p>Map & Model</p>} />
								</Menu.Item>
								<Menu.Item
									as={Link}
									to='/PackageBuilder/BuildValidate'
									active={buildValidateActive}
									onClick={() => setActiveSidebarTab('BuildValidate', dispatch)}
								>
									<Tooltip content={tooltipContent.buildValidate} position='right center' trigger={<p>Build & Validate</p>} />
								</Menu.Item>
								<Menu.Item
									as={Link}
									to='/PackageBuilder/AssembleDocument'
									active={assembleDocumentActive}
									onClick={() => setActiveSidebarTab('AssembleDocument', dispatch)}
								>
									<Tooltip content={tooltipContent.assembleDocument} position='right center' trigger={<p>Assemble & Document</p>} />
								</Menu.Item>
								<Menu.Item
									as={Link}
									to='/PackageBuilder/PublishImplement'
									active={publishImplementActive}
									onClick={() => setActiveSidebarTab('PublishImplement', dispatch)}
								>
									<Tooltip content={tooltipContent.publishImplement} position='right center' trigger={<p>Publish & Implement</p>} />
								</Menu.Item>
							</div>
						}
					/>
				</Menu.Item>
			</Accordion>

			<Divider />

			<Accordion as={Menu} fluid vertical id='artifactTreeAccordion'>
				<Menu.Item>
					<Accordion.Title
						active={artifactTreeActive}
						content={
							<Grid columns='2'>
								<Grid.Row>
									<Grid.Column width={1}>
										<Icon name='folder open' />
									</Grid.Column>
									<Tooltip
										content={tooltipContent.packageArtifacts}
										position='right center'
										trigger={<Grid.Column width={11}>{key.packageName} Artifacts</Grid.Column>}
									/>
								</Grid.Row>
							</Grid>
						}
						onClick={() => setArtifactTreeActive(!artifactTreeActive)}
						index={0}
					/>
					<Accordion.Content
						active={artifactTreeActive}
						content={
							<div id='artifactTreeAccordionContent'>
								<ArtifactTree />
							</div>
						}
					/>
				</Menu.Item>
			</Accordion>

			<Divider />

			<Accordion as={Menu} fluid vertical id='iepdAccordion'>
				<Menu.Item>
					<Accordion.Title
						active={iepdAccordActive}
						content={
							<Grid columns='2'>
								<Grid.Row id='iepdAccordionRow'>
									<Grid.Column width={1}>
										<Icon name='wrench' />
									</Grid.Column>
									<Tooltip
										content={tooltipContent.packageBuildComponents}
										position='right center'
										trigger={<Grid.Column width={11}>{key.packageName} Build Components</Grid.Column>}
									/>
								</Grid.Row>
							</Grid>
						}
						onClick={() => setIepdAccordActive(!iepdAccordActive)}
						index={0}
					/>
					<Accordion.Content
						active={iepdAccordActive}
						content={
							<div id='iepdAccordContent'>
								<Tooltip
									// NOTE - Update or remove Functionality Unavailable once functionality is implemented
									content={tooltipContent.functionalityUnavailable}
									position='right center'
									trigger={
										<Menu.Item as='a'>
											<Grid columns='3'>
												<Grid.Row>
													<Grid.Column width={1}>
														<Icon name='clipboard list' />
													</Grid.Column>
													<Grid.Column width={11}>{artifactChecklistName}</Grid.Column>
													<Grid.Column width={1} onClick={() => handleToggleClick(artifactChecklistName)}>
														<ToggleIcon isOn={artifactChecklistToggle} link={true} />
													</Grid.Column>
												</Grid.Row>
											</Grid>
										</Menu.Item>
									}
								/>
								<Tooltip
									// NOTE - Update or remove Functionality Unavailable once functionality is implemented
									content={tooltipContent.functionalityUnavailable}
									position='right center'
									trigger={
										<Menu.Item as='a'>
											<Grid columns='3'>
												<Grid.Row>
													<Grid.Column width={1}>
														<Icon name='pencil' />
													</Grid.Column>
													<Grid.Column width={11}>{artifactEditorName}</Grid.Column>
													<Grid.Column width={1} onClick={() => handleToggleClick(artifactEditorName)}>
														<ToggleIcon isOn={artifactEditorToggle} link={true} />
													</Grid.Column>
												</Grid.Row>
											</Grid>
										</Menu.Item>
									}
								/>
								<Tooltip
									// NOTE - Update or remove Functionality Unavailable once functionality is implemented
									content={tooltipContent.functionalityUnavailable}
									position='right center'
									trigger={
										<Menu.Item as='a'>
											<Grid columns='3'>
												<Grid.Row>
													<Grid.Column width={1}>
														<Icon name='file' />
													</Grid.Column>
													<Grid.Column width={11}>{documentCenterName}</Grid.Column>
													<Grid.Column width={1} onClick={() => handleToggleClick(documentCenterName)}>
														<ToggleIcon isOn={documentCenterToggle} link={true} />
													</Grid.Column>
												</Grid.Row>
											</Grid>
										</Menu.Item>
									}
								/>
								<Tooltip
									// NOTE - Update or remove Functionality Unavailable once functionality is implemented
									content={tooltipContent.functionalityUnavailable}
									position='right center'
									trigger={
										<Menu.Item as='a'>
											<Grid columns='3'>
												<Grid.Row>
													<Grid.Column width={1}>
														<Icon name='check circle outline' />
													</Grid.Column>
													<Grid.Column width={11}>{validationStatusName}</Grid.Column>
													<Grid.Column width={1} onClick={() => handleToggleClick(validationStatusName)}>
														<ToggleIcon isOn={validationStatusToggle} link={true} />
													</Grid.Column>
												</Grid.Row>
											</Grid>
										</Menu.Item>
									}
								/>
								<Tooltip
									// NOTE - Update or remove Functionality Unavailable once functionality is implemented
									content={tooltipContent.functionalityUnavailable}
									position='right center'
									trigger={
										<Menu.Item as='a'>
											<Grid columns='3'>
												<Grid.Row>
													<Grid.Column width={1}>
														<Icon name='commenting' />
													</Grid.Column>
													<Grid.Column width={11}>{peerReviewStatusName}</Grid.Column>
													<Grid.Column width={1} onClick={() => handleToggleClick(peerReviewStatusName)}>
														<ToggleIcon isOn={peerReviewToggle} link={true} />
													</Grid.Column>
												</Grid.Row>
											</Grid>
										</Menu.Item>
									}
								/>
								<Tooltip
									// NOTE - Update or remove Functionality Unavailable once functionality is implemented
									content={tooltipContent.functionalityUnavailable}
									position='right center'
									trigger={
										<Menu.Item as='a'>
											<Grid columns='3'>
												<Grid.Row>
													<Grid.Column width={1}>
														<Icon name='table' />
													</Grid.Column>
													<Grid.Column width={11}>{elementsMappingName}</Grid.Column>
													<Grid.Column width={1} onClick={() => handleToggleClick(elementsMappingName)}>
														<ToggleIcon isOn={elementsToggle} link={true} />
													</Grid.Column>
												</Grid.Row>
											</Grid>
										</Menu.Item>
									}
								/>
							</div>
						}
					/>
				</Menu.Item>
			</Accordion>
		</>
	);
};

export default LeftNavContent;
