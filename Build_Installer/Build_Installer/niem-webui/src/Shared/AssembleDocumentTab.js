import React, { useCallback, useEffect, useState } from 'react';
import { Tab, Form, Button, Message, Menu, Icon, Segment, Header, Dropdown, Grid, Divider, Label } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { getFilesByTag, artifactTags, deleteItemFromTree, getFilesByLabel } from '../Util/ArtifactTreeUtil';
import { retrieveFileRequest } from '../Util/UploadFileUtil';
import { getUserInfoApi, exportFile, goToNextPane, saveFile, getFileTitle } from '../Util/AssembleDocumentTabsUtil';
import { updateArtifactChecklist } from './ArtifactChecklist';
import { isEmailFieldValid, isStringFieldValid } from '../Util/FieldValidationUtil';

const AssembleDocumentTab = () => {
	const ReadMeDefaultText = `A readme should include information that describes the following: \n ● Purpose of the MEP \n ● Scope of its deployment, usage, and information content \n ● Business value and rationale for developing it \n ● Type of information it is intended to exchange, in business terms \n ● Identification (or types) of senders and receivers \n ● Typical interactions between senders, receivers, and systems \n ● References to other documentation within the MEP \n ● Links to external documents that may be needed to understand and implement the MEP`;
	const ChangeLogDefaultText =
		'2021-09-17: Version 2.0 \n\nUpdate to NIEM 5.0 \nRemoved PersonFictionalCharacterIndicator \nRemoved ItemLengthMeasure \nAdded GML objects to sample instance \nAdded PersonDefenestrationIndicator \nAdded ContactEmailID';
	const ConformanceDefaultText =
		'How NIEM conformance was verified: a. Automatic (tool) checks were performed with XML Schema tools identified below. b. Manual (subjective) checks on conformance rules were performed by the author/certifier. c. A general manual (and subjective) cross-check for adherence to conformance rules and quality assurance was performed by a colleague of the author who understands NIEM and XML Schema. d. Business requirements associated with the information exchange defined by this IEPD were verified by the author. \n\nTools employed: a. NIEM Schema Subset Generator (SSGT) (for NIEM 3.0) generated all subset schema documents. b. oXygen XML Developer was used to cross-validate XML schemas and XML instances. c. Xerces 2.7.0-0 was used for cross-validation of XML schemas and XML instances. \n\nResults: a. No known major issues remain. b. All XML artifacts are well-formed and valid. c. Author and SMEs verified that several warnings by tools are not relevant to this IEPD. e. CrashDriver.xsd passes NDR tests for an extension schema f. extension.xsd passes NDR tests for an extension schema g. iepd-catalog.xml is valid against iepd-catalog.xsd for version 5.0';
	const BusinessRulesDefaultText =
		'A person MUST have a last name. \n\nAn activity date must precede an activity end date. \n\nEvery arrest must have a related incident.';

	const dispatch = useDispatch();
	const isPublishImplementActive = useSelector((state) => state.sidebar.publishImplementActive);
	const loggedIn = useSelector((state) => state.session.loggedIn);
	const userEmail = useSelector((state) => state.session.userEmail);
	const userId = useSelector((state) => state.session.userId);
	const packageId = useSelector((state) => state.mpd.packageId);
	const packageName = useSelector((state) => state.mpd.packageName);
	const assembleUploadMessage = useSelector((state) => state.assemble.assembleUploadMessage);

	const [readmeText, setReadmeText] = useState(ReadMeDefaultText);
	const [changelogText, setChangelogText] = useState(ChangeLogDefaultText);
	const [conformanceForm, setConformanceForm] = useState({ uri: '', author: '', email: '', date: '', details: ConformanceDefaultText });
	const [readmeComplete, setReadmeComplete] = useState(false);
	const [changelogComplete, setChangelogComplete] = useState(false);
	const [conformanceComplete, setConformanceComplete] = useState(false);
	const [cantDisplayReadme, setCantDisplayReadme] = useState(false);
	const [cantDisplayChangelog, setCantDisplayChangelog] = useState(false);
	const [cantDisplayConformance, setCantDisplayConformance] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const activePane = useSelector((state) => state.assemble.activePane); // 0 = readme, 1 = changelog, 2 = conformance
	const [checked, setChecked] = useState(false);
	const artifactTree = useSelector((state) => state.artifact.treeItems);
	const [existingReadme, setExistingReadme] = useState(false);
	const [existingChangelog, setExistingChangelog] = useState(false);
	const [existingConformance, setExistingConformance] = useState(false);
	const changelogNeedsReview = useSelector((state) => state.artifact.changelogNeedsReview);
	const readmeNeedsReview = useSelector((state) => state.artifact.readmeNeedsReview);
	const businessRules = useSelector((state) => state.assemble.businessRules);
	const [addRuleActive, setAddRuleActive] = useState(false);
	const [activeBusinessRulesIndex, setActiveBusinessRulesIndex] = useState(0);
	const [enteredNewRuleName, setEnteredNewRuleName] = useState('');
	const [newRuleNameExists, setNewRuleNameExists] = useState(false);
	const [newRuleNameEmpty, setNewRuleNameEmpty] = useState(false);
	const [disableConformanceAssert, setDisableConformanceAssert] = useState(true);

	useEffect(() => {
		if (
			checked === false ||
			!isStringFieldValid(conformanceForm.author) ||
			!isEmailFieldValid(conformanceForm.email) ||
			!isStringFieldValid(conformanceForm.details)
		) {
			setDisableConformanceAssert(true);
		} else {
			setDisableConformanceAssert(false);
		}
	}, [checked, conformanceForm]);

	// Allows the form fields to already be prepoulated with exising user data after the API call when the modal is opened
	const handlePrePopulateUserInfo = useCallback(async () => {
		if (loggedIn && userEmail.toLowerCase() !== 'sysadmin') {
			const userResult = await getUserInfoApi(userId);
			let user = {};
			if (userResult !== false) {
				// Recieves only first name, last name, and email from the API and stores it in this variable
				user = {
					name: userResult.first_name + ' ' + userResult.last_name,
					email: userResult.email,
				};
			} else {
				user = {
					name: '',
					email: '',
				};
			}
			setConformanceForm({ ...conformanceForm, author: user.name, email: user.email });
		}
	}, [loggedIn, userEmail, userId]);

	const getFileContents = useCallback(
		async (tag) => {
			// retrieve and return text contents of .txt files by tag
			const files = getFilesByTag(artifactTree, tag);
			const invalidFile = files.every((file) => {
				return file.fileType !== 'txt';
			});

			if (tag === artifactTags.businessRules) {
				const rulesContents = [];
				for (const file of files) {
					if (file.fileType === 'txt') {
						if (file.fileBlobId) {
							var fileContents = await retrieveFileRequest(file.fileBlobId, 'utf-8');
							rulesContents.push(fileContents);
						}
					} else {
						rulesContents.push('');
					}
				}
				return rulesContents;
			}

			// if file is not a .txt, show that it can't be read and update workflow
			if (invalidFile && files.length > 0) {
				if (tag === artifactTags.readme) {
					setCantDisplayReadme(true);
					setReadmeComplete(true);
				} else if (tag === artifactTags.changelog) {
					setCantDisplayChangelog(true);
					setChangelogComplete(true);
				} else if (tag === artifactTags.conformance) {
					setCantDisplayConformance(true);
					setConformanceComplete(true);
				}
			} else {
				setCantDisplayReadme(false);
				setCantDisplayChangelog(false);
				setCantDisplayConformance(false);

				const file = files.find((file) => file.fileType === 'txt');
				if (files.length > 0 && file.fileBlobId) {
					const fileContents = await retrieveFileRequest(file.fileBlobId, 'utf-8');
					return fileContents;
				}
			}
		},
		[artifactTree]
	);

	const populateBusinessRulesArray = async () => {
		setActiveBusinessRulesIndex(0);
		const businessRulesFiles = getFilesByTag(artifactTree, artifactTags.businessRules);
		const businessRulesObjArray = [];
		const fileContents = await getFileContents(artifactTags.businessRules);
		for (var i = 0; i < businessRulesFiles.length; i++) {
			// assign each file to a menu tab depending on contents
			if (fileContents[i] === '') {
				businessRulesObjArray.push({
					index: i,
					labelName: businessRulesFiles[i].label,
					canDisplay: false,
					contents: '', // actual contents stored in the file
					existing: true,
					complete: true,
					updatedContents: '', // changed when editing
				});
			} else {
				businessRulesObjArray.push({
					index: i,
					labelName: businessRulesFiles[i].label,
					canDisplay: true,
					contents: fileContents[i],
					existing: true,
					complete: true,
					updatedContents: '',
				});
			}
		}
		// if adding a rule, add the empty tab to the end
		if (addRuleActive) {
			businessRulesObjArray.push({
				index: businessRulesObjArray.length,
				labelName: '',
				canDisplay: true,
				contents: '',
				existing: false,
				complete: false,
				updatedContents: '',
			});
		}
		dispatch({ type: actionTypes.UPDATE_BUSINESS_RULES, payload: businessRulesObjArray });
		if (addRuleActive) {
			setActiveBusinessRulesIndex(businessRulesObjArray.length - 1);
		}
	};

	useEffect(() => {
		let isMounted = true;
		if (isMounted) {
			handlePrePopulateUserInfo();
		}
		return () => {
			isMounted = false; // use effect cleanup to set flag false, if unmounted
		};
	}, [handlePrePopulateUserInfo]);

	useEffect(() => {
		// Using Immediately Invoked Function Expression (IIFE) to allow await getFileData to resolve and return data.
		// Without the IIFE, it will return a pending Promise object.
		(async () => {
			if (activePane === 0) {
				const fileContents = await getFileContents(artifactTags.readme);
				// if file is empty leave it as the default text
				if (fileContents) {
					setReadmeText(fileContents);
					setExistingReadme(true);
					setReadmeComplete(true);
				} else {
					setExistingReadme(false);
				}
			} else if (activePane === 1) {
				const fileContents = await getFileContents(artifactTags.changelog);
				if (fileContents) {
					setChangelogText(fileContents);
					setExistingChangelog(true);
					setChangelogComplete(true);
				} else {
					setExistingChangelog(false);
				}
			} else if (activePane === 2) {
				await populateBusinessRulesArray();
			} else if (activePane === 3) {
				const fileContents = await getFileContents(artifactTags.conformance);
				if (fileContents) {
					setConformanceForm({ ...conformanceForm, details: fileContents });
					setExistingConformance(true);
					setConformanceComplete(true);
				} else {
					setExistingConformance(false);
				}
			}
		})();
	}, [activePane, assembleUploadMessage, artifactTree]); // NOTE: Compiler wants more dependencies for this, will break the code without significant changes

	useEffect(() => {
		// show/hide edit button
		if (activePane === 0 && readmeComplete && !cantDisplayReadme && !readmeNeedsReview) {
			setShowEdit(true);
		} else if (activePane === 1 && changelogComplete && !cantDisplayChangelog && !changelogNeedsReview) {
			setShowEdit(true);
		} else if (activePane === 2 && businessRules.length > 0 && businessRules[activeBusinessRulesIndex].complete) {
			setShowEdit(true);
		} else if (activePane === 3 && conformanceComplete && !cantDisplayConformance) {
			setShowEdit(true);
		} else {
			setShowEdit(false);
		}
	}, [
		activePane,
		businessRules,
		activeBusinessRulesIndex,
		readmeComplete,
		changelogComplete,
		conformanceComplete,
		cantDisplayReadme,
		cantDisplayChangelog,
		cantDisplayConformance,
	]);

	useEffect(() => {
		// change which tab shows first based on active page
		if (isPublishImplementActive) {
			dispatch({ type: actionTypes.ACTIVE_PANE, payload: 3 });
		} else {
			dispatch({ type: actionTypes.ACTIVE_PANE, payload: 0 });
		}
	}, [isPublishImplementActive, dispatch]);

	// update business rules menu when starting and finishing the add rule process
	useEffect(() => {
		async function populateRules() {
			await populateBusinessRulesArray();
		}
		populateRules();
	}, [addRuleActive]); // NOTE: Compiler wants populateBusinessRulesArray() as a dependency, will break the code without significant changes

	const handleSubmit = async (tag) => {
		// Saves text content from input to artifact tree and db
		const fileTitle = getFileTitle(artifactTree, tag);

		if (activePane === 0) {
			// submit ReadMe
			const isReadmeSuccess = await saveFile(artifactTree, packageId, readmeText, fileTitle, tag);
			dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'readme_success' });
			setReadmeComplete(true);
			if (isReadmeSuccess) {
				await updateArtifactChecklist(packageId, 'readme', isReadmeSuccess);
			}
			dispatch({ type: actionTypes.SET_README_NEEDS_REVIEW, payload: false });
		} else if (activePane === 1) {
			// submit Changelog
			const date = new Date();
			const formattedDate = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
			let newTree = artifactTree;
			// enforce singleton rule on changelog
			if (existingChangelog) {
				const oldLog = getFilesByTag(artifactTree, artifactTags.changelog);
				newTree = await deleteItemFromTree(oldLog[0].nodeId);
			}

			const isChangelogSuccess = await saveFile(newTree, packageId, changelogText, `changelog_${formattedDate}.txt`, tag);
			dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'changelog_success' });
			setChangelogComplete(true);
			if (isChangelogSuccess) {
				await updateArtifactChecklist(packageId, 'changelog', isChangelogSuccess);
			}
			dispatch({ type: actionTypes.SET_CHANGELOG_NEEDS_REVIEW, payload: false });
		} else if (activePane === 2) {
			// submit Business rules
			var isBusinessRuleSuccess;
			if (addRuleActive) {
				// add a new business rules file
				// homogenize rule name
				const txtFileRegEx = new RegExp(/^(.)*(\.txt){1}$/);
				const ruleNameToUse = txtFileRegEx.test(enteredNewRuleName) ? enteredNewRuleName : enteredNewRuleName + '.txt';
				setAddRuleActive(false);
				isBusinessRuleSuccess = await saveFile(
					artifactTree,
					packageId,
					businessRules[activeBusinessRulesIndex].updatedContents,
					ruleNameToUse,
					artifactTags.businessRules
				);
				setEnteredNewRuleName('');
			} else {
				// update an existing business rules file
				isBusinessRuleSuccess = await saveFile(
					artifactTree,
					packageId,
					businessRules[activeBusinessRulesIndex].updatedContents,
					businessRules[activeBusinessRulesIndex].labelName,
					artifactTags.businessRules
				);
			}

			if (isBusinessRuleSuccess) {
				dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'rules_creation_success' });
			} else {
				dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'rules_creation_unsuccessful' });
			}
		} else if (activePane === 3) {
			// submit Conformance
			const conformanceText = `${conformanceForm.uri} ${conformanceForm.author} ${conformanceForm.email} ${conformanceForm.date} ${conformanceForm.details}`;

			const isConformanceSuccess = await saveFile(artifactTree, packageId, conformanceText, fileTitle, tag);
			dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: 'conformance_success' });
			dispatch({ type: actionTypes.UPDATE_MPD_URI, payload: conformanceForm.uri });
			setConformanceComplete(true);
			if (isConformanceSuccess) {
				await updateArtifactChecklist(packageId, 'conformance', isConformanceSuccess);
			}
		}

		// Allows artifact upload success/failed message to only be visble for 4 seconds
		setTimeout(() => {
			dispatch({ type: actionTypes.ASSEMBLE_UPLOAD_MESSAGE, payload: '' });
		}, 4000);
	};

	const UndreadableFile = ({ tag }) => {
		return (
			<div className='unreadableFile'>
				<p>
					Unable to display file contents. <br />
					To view or edit within the tool, please{' '}
					<span
						className='uploadAssembleLink'
						onClick={() => {
							if (activePane !== 2) {
								exportFile(artifactTree, packageName, packageId, tag, 0);
							} else {
								exportFile(artifactTree, packageName, packageId, tag, activeBusinessRulesIndex);
							}
						}}
					>
						export
					</span>{' '}
					this file, save as a .txt file, and{' '}
					<span
						className='uploadAssembleLink'
						onClick={() => {
							// update uploadWorkflow based on currently active pane
							dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
							if (activePane === 0) {
								dispatch({
									type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
									payload: { allowUserChoice: false, artifactTag: artifactTags.readme, uploadItem: artifactTags.readme },
								});
							} else if (activePane === 1) {
								dispatch({
									type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
									payload: { allowUserChoice: false, artifactTag: artifactTags.changelog, uploadItem: artifactTags.changelog },
								});
							} else if (activePane === 2) {
								dispatch({
									type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
									payload: {
										allowUserChoice: false,
										artifactTag: artifactTags.businessRules,
										uploadItem: artifactTags.businessRules,
									},
								});
							} else if (activePane === 3) {
								dispatch({
									type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
									payload: { allowUserChoice: false, artifactTag: artifactTags.conformance, uploadItem: artifactTags.conformance },
								});
							}
						}}
					>
						upload
					</span>{' '}
					again.
				</p>
			</div>
		);
	};

	const deleteBusinessRuleHandler = (index) => {
		const toDelete = getFilesByLabel(artifactTree, businessRules[index].labelName);
		dispatch({ type: actionTypes.UPDATE_CONFIRM_DELETE_MODE, payload: 'file' });
		dispatch({ type: actionTypes.UPDATE_CONFIRM_ARTIFACT_TO_DELETE, payload: toDelete[0] });
		dispatch({ type: actionTypes.SET_SHOW_CONFIRM_ARTIFACT_DELETE_MODAL, payload: true });
	};

	const checkForDuplicateRuleName = () => {
		// homogenize rule name
		const txtFileRegEx = new RegExp(/^(.)+(\.txt){1}$/);
		const ruleNameToUse = txtFileRegEx.test(enteredNewRuleName) ? enteredNewRuleName : enteredNewRuleName + '.txt';

		// check name against existing rules
		const existingBusinessRules = getFilesByTag(artifactTree, artifactTags.businessRules);
		for (var i = 0; i < existingBusinessRules.length; i++) {
			if (ruleNameToUse === existingBusinessRules[i].label) {
				return true;
			}
		}
		return false;
	};

	const AssembleDocumentDropdownList = (i) => {
		return (
			<Dropdown.Menu>
				<Dropdown.Item
					value={i}
					onClick={(e, { value }) => {
						deleteBusinessRuleHandler(value);
					}}
				>
					Delete
				</Dropdown.Item>
			</Dropdown.Menu>
		);
	};

	const renderBusinessRulesTabs = () => {
		return businessRules.map((rule, i) => {
			return (
				<Menu.Item
					active={activeBusinessRulesIndex === i}
					index={i}
					key={i}
					onClick={(e, { index }) => setActiveBusinessRulesIndex(index)}
					textAlign='left'
				>
					{rule.existing ? (
						<>
							<label>{rule.labelName}</label>
							<Dropdown
								open={false}
								simple
								icon='ellipsis horizontal'
								style={{ float: 'right' }}
								key={i}
								children={AssembleDocumentDropdownList(i)}
							/>
						</>
					) : (
						<>
							<Form>
								<Form.Input
									className='newBusinessRuleInput'
									label='File Name'
									placeholder='example-rule'
									value={enteredNewRuleName}
									fluid
									required
									onChange={(e, { value }) => {
										setEnteredNewRuleName(value);
										if (newRuleNameExists) {
											setNewRuleNameExists(false);
										} else if (newRuleNameEmpty) {
											setNewRuleNameEmpty(false);
										}
									}}
									icon={<Label content='.txt' className='fileTypeInputLabel' />}
									error={
										newRuleNameExists
											? { content: 'A Business Rules file already exists with this name.', pointing: 'above' }
											: newRuleNameEmpty
											? { content: 'Please input a file name. (".txt" is appended automatically)', pointing: 'above' }
											: false
									}
								/>
							</Form>
						</>
					)}
				</Menu.Item>
			);
		});
	};

	// NOTE: The individual panes have to be rendered within in the object or rendering errors will occur
	const panes = [
		{
			menuItem: 'ReadMe',
			render: () => (
				<Tab.Pane>
					<>
						{cantDisplayReadme ? (
							<UndreadableFile tag={artifactTags.readme} />
						) : (
							<>
								{assembleUploadMessage === 'readme_success' ? (
									<Message success header='ReadMe Creation Success' content='Your ReadMe artifact has been successfully created.' />
								) : assembleUploadMessage === 'readme_unsuccessful' ? (
									<Message error header='ReadMe Upload Failed' content='Your Readme artifact failed to upload. Please try again.' />
								) : null}

								<p>
									Please complete this form or{' '}
									<span
										className='uploadAssembleLink'
										onClick={() => {
											dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
											dispatch({
												type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
												payload: {
													allowUserChoice: false,
													artifactTag: artifactTags.readme,
													uploadItem: artifactTags.readme,
												},
											});
										}}
									>
										upload
									</span>{' '}
									a file to generate a ReadMe artifact that will serve as the common starting point and is the required minimum for
									human-readable documentation.
								</p>

								<Form>
									<Form.TextArea
										label='MEP contents, purpose, uses, and definitions'
										style={{ minHeight: 400 }}
										required={true}
										value={readmeText}
										readOnly={readmeComplete && !readmeNeedsReview}
										className={readmeComplete && !readmeNeedsReview ? 'panesReadOnly' : ''}
										onChange={(e, d) => {
											setReadmeText(d.value);
										}}
									/>
								</Form>
							</>
						)}
						<br />
						{existingReadme && !showEdit ? (
							<>
								<Button
									className='primaryButton'
									onClick={() => {
										handleSubmit(artifactTags.readme);
									}}
								>
									Save
								</Button>
								<Button
									className='secondaryButton'
									onClick={() => {
										setShowEdit(true);
										setExistingReadme(true);
										setReadmeComplete(true);
									}}
								>
									Cancel
								</Button>
							</>
						) : readmeComplete ? (
							<Button
								className='primaryButton'
								onClick={() => {
									goToNextPane(activePane, readmeComplete, changelogComplete, isPublishImplementActive);
								}}
							>
								Next <Icon name='caret right' />
							</Button>
						) : (
							<Button
								className='primaryButton'
								onClick={() => {
									handleSubmit(artifactTags.readme);
								}}
							>
								Create
							</Button>
						)}
					</>
				</Tab.Pane>
			),
		},
		{
			menuItem: 'Change Log',
			render: () => (
				<Tab.Pane>
					<>
						{cantDisplayChangelog ? (
							<UndreadableFile tag={artifactTags.changelog} />
						) : (
							<>
								{assembleUploadMessage === 'changelog_success' ? (
									<Message
										success
										header='Change Log Creation Success'
										content='Your Change Log artifact has been successfully created.'
									/>
								) : assembleUploadMessage === 'changelog_unsuccessful' ? (
									<Message
										error
										header='Change Log Upload Failed'
										content='Your Change Log artifact failed to upload. Please try again.'
									/>
								) : null}
								<p>
									Please complete this form or{' '}
									<span
										className='uploadAssembleLink'
										onClick={() => {
											dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
											dispatch({
												type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
												payload: {
													allowUserChoice: false,
													artifactTag: artifactTags.changelog,
													uploadItem: artifactTags.changelog,
												},
											});
										}}
									>
										upload
									</span>{' '}
									a file to log and generate a summary of changes applied to a published MEP since previous versions.
								</p>
								<Form>
									<Form.TextArea
										label='Details and explanation of changes'
										style={{ minHeight: 400 }}
										required
										value={changelogText}
										readOnly={changelogComplete && !changelogNeedsReview}
										className={changelogComplete && !changelogNeedsReview ? 'panesReadOnly' : ''}
										onChange={(e, d) => {
											setChangelogText(d.value);
										}}
									/>
								</Form>
							</>
						)}
						<br />
						{existingChangelog && !showEdit ? (
							<>
								<Button
									className='primaryButton'
									onClick={() => {
										handleSubmit(artifactTags.changelog);
									}}
								>
									Save
								</Button>
								<Button
									className='secondaryButton'
									onClick={() => {
										setShowEdit(true);
										setExistingChangelog(true);
										setChangelogComplete(true);
									}}
								>
									Cancel
								</Button>
							</>
						) : changelogComplete ? (
							<Button
								className='primaryButton'
								onClick={() => {
									goToNextPane(activePane, readmeComplete, changelogComplete, isPublishImplementActive);
								}}
							>
								Next <Icon name='caret right' />
							</Button>
						) : (
							<Button
								className='primaryButton'
								onClick={() => {
									handleSubmit(artifactTags.changelog);
								}}
							>
								Create
							</Button>
						)}
					</>
				</Tab.Pane>
			),
		},
		{
			menuItem: 'Business Rules',
			render: () => (
				<Tab.Pane>
					{businessRules.length < 1 ? (
						<Segment textAlign='center'>
							<Header>You do not currently have Business Rules defined.</Header>
							<p>
								Click the "Add Rule" button and complete the form or{' '}
								<span
									className='uploadAssembleLink'
									onClick={() => {
										dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
										dispatch({
											type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
											payload: {
												allowUserChoice: false,
												artifactTag: artifactTags.businessRules,
												uploadItem: artifactTags.businessRules,
											},
										});
									}}
								>
									upload
								</span>{' '}
								a file to define, confine, or constrain MPDs in your MEP. Most file types are accepted except for .exe, .zip, and
								.tar.
							</p>
							<p>Business Rules Artifacts are not required for publishing.</p>
							<Button className='primaryButton' onClick={(e) => setAddRuleActive(true)} content='Add Rule' icon='plus' />
						</Segment>
					) : (
						<>
							{assembleUploadMessage === 'rules_creation_success' ? (
								<Message
									success
									header='Business Rule Creation Success'
									content='Your Business Rules artifact has been successfully created.'
								/>
							) : assembleUploadMessage === 'rules_upload_unsuccessful' ? (
								<Message
									error
									header='Business Rule Upload Failed'
									content='Your Business Rules artifact failed to upload. Please try again.'
								/>
							) : assembleUploadMessage === 'rules_upload_success' ? (
								<Message
									success
									header='Business Rule Upload Success'
									content='Your Business Rules artifact has been successfully uploaded.'
								/>
							) : assembleUploadMessage === 'rules_creation_unsuccessful' ? (
								<Message
									error
									header='Business Rule Creation Failed'
									content='Your Business Rules artifact failed to save. Please try again.'
								/>
							) : null}
							<Grid>
								<Grid.Row columns={2}>
									<Grid.Column width={13}>
										<p>
											Please complete this form,{' '}
											<span
												className='uploadAssembleLink'
												onClick={() => {
													dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
													dispatch({
														type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
														payload: {
															allowUserChoice: false,
															artifactTag: artifactTags.businessRules,
															uploadItem: artifactTags.businessRules,
														},
													});
												}}
											>
												upload
											</span>{' '}
											a file, or select the "Add" button to define, confine or constrain MPDs in your MEP. Most file types
											accepted except for .exe, .zip, and .tar.
										</p>
									</Grid.Column>
									<Grid.Column width={3}>
										{!addRuleActive ? (
											<Button
												className='primaryButton'
												style={{ float: 'right' }}
												onClick={(e) => {
													setAddRuleActive(true);
													setActiveBusinessRulesIndex(businessRules.length - 1);
												}}
												icon='plus'
												content='Add'
												textAlign='center'
											/>
										) : null}
									</Grid.Column>
								</Grid.Row>
								<Grid.Column width={5}>
									<Menu fluid vertical tabular>
										{renderBusinessRulesTabs()}
									</Menu>
								</Grid.Column>
								<Grid.Column stretched width={11}>
									<span style={{ display: 'flex', 'jusify-content': 'space-between' }}>
										<Header as='h4' textAlign='left' style={{ display: 'inline' }}>
											Business Rules:{' '}
											<strong>
												{businessRules[activeBusinessRulesIndex] && businessRules[activeBusinessRulesIndex].labelName !== ''
													? businessRules[activeBusinessRulesIndex].labelName
													: 'New Rule'}
											</strong>
										</Header>
									</span>
									<Divider hidden />
									{businessRules[activeBusinessRulesIndex].canDisplay ? (
										<Form>
											<Form.TextArea
												label='Business policies and/or procedure statements'
												required
												style={{ minHeight: 325 }}
												value={
													// displays different contents based on whether a rule file is complete; keeps saved contents unedited
													businessRules[activeBusinessRulesIndex].complete
														? businessRules[activeBusinessRulesIndex].contents
														: businessRules[activeBusinessRulesIndex].updatedContents
												}
												placeholder={BusinessRulesDefaultText}
												readOnly={businessRules.length > 0 ? businessRules[activeBusinessRulesIndex].complete : true}
												className={
													businessRules.length > 0 && businessRules[activeBusinessRulesIndex].complete
														? 'panesReadOnly'
														: ''
												}
												onChange={(e, d) => {
													const updatedBusinessRules = businessRules.map((rule) => {
														return rule.index === activeBusinessRulesIndex ? { ...rule, updatedContents: d.value } : rule;
													});
													dispatch({ type: actionTypes.UPDATE_BUSINESS_RULES, payload: updatedBusinessRules });
												}}
											/>
											{businessRules[activeBusinessRulesIndex].complete ? (
												// next button
												<Button
													className='primaryButton'
													onClick={() => {
														goToNextPane(activePane, readmeComplete, changelogComplete, isPublishImplementActive);
													}}
												>
													Next <Icon name='caret right' />
												</Button>
											) : (
												<>
													{!addRuleActive ? (
														<Button
															className='primaryButton'
															onClick={async () => {
																await handleSubmit(artifactTags.businessRules);
																await populateBusinessRulesArray(); // calls populate again because a new rule hasn't been added
															}}
														>
															Save
														</Button>
													) : (
														<Button
															className='primaryButton'
															onClick={async () => {
																const isDuplicateRuleName = checkForDuplicateRuleName();
																if (enteredNewRuleName === '') {
																	// check if entered rule name is empty
																	setNewRuleNameEmpty(true);
																} else if (isDuplicateRuleName) {
																	// check if entered rule name already exists
																	setNewRuleNameExists(true);
																} else {
																	await handleSubmit(artifactTags.businessRules);
																}
															}}
														>
															Create
														</Button>
													)}
													<Button
														className='secondaryButton'
														onClick={() => {
															setEnteredNewRuleName('');
															const updatedBusinessRules = businessRules.map((rule) => {
																return rule.index === activeBusinessRulesIndex && !rule.complete
																	? { ...rule, complete: true }
																	: rule;
															});
															dispatch({ type: actionTypes.UPDATE_BUSINESS_RULES, payload: updatedBusinessRules });
															if (addRuleActive) {
																setAddRuleActive(false);
															}
														}}
													>
														Cancel
													</Button>
												</>
											)}
										</Form>
									) : (
										<UndreadableFile tag={artifactTags.businessRules} />
									)}
								</Grid.Column>
							</Grid>
						</>
					)}
				</Tab.Pane>
			),
		},
		{
			menuItem: (
				<>
					{showEdit ? (
						<Menu.Item
							name='edit'
							position='right'
							onClick={() => {
								if (activePane === 0) {
									setReadmeComplete(false);
								} else if (activePane === 1) {
									setChangelogComplete(false);
								} else if (activePane === 2) {
									const updatedBusinessRules = businessRules.map((rule, i) => {
										return rule.index === activeBusinessRulesIndex && rule.complete
											? { ...rule, complete: false, updatedContents: rule.contents }
											: rule;
									});
									dispatch({ type: actionTypes.UPDATE_BUSINESS_RULES, payload: updatedBusinessRules });
								} else if (activePane === 3) {
									setConformanceComplete(false);
								}
							}}
						>
							<Icon name='pencil' />
							Edit
						</Menu.Item>
					) : null}
				</>
			),
		},
	];

	const conformanceObj = {
		menuItem: 'Conformance Assertion',
		render: () => (
			<Tab.Pane>
				<>
					{cantDisplayConformance ? (
						<UndreadableFile tag={artifactTags.conformance} />
					) : (
						<>
							{assembleUploadMessage === 'conformance_success' ? (
								<Message
									success
									header='Conformance Assertion Creation Success'
									content='Your Conformance Assertion artifact has been successfully created.'
								/>
							) : assembleUploadMessage === 'conformance_unsuccessful' ? (
								<Message
									error
									header='Conformance Assertion Upload Failed'
									content='Your Conformance Assertion artifact failed to upload. Please try again.'
								/>
							) : null}

							<p>
								Please complete this form or{' '}
								<span
									className='uploadAssembleLink'
									onClick={() => {
										dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
										dispatch({
											type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
											payload: {
												allowUserChoice: false,
												artifactTag: artifactTags.conformance,
												uploadItem: artifactTags.conformance,
											},
										});
									}}
								>
									upload
								</span>{' '}
								a file to increase the level of confidence that this MEP was checked for NIEM conformance and quality.
							</p>
							<Form>
								<Form.Group>
									<Form.Input
										label='URI'
										value={conformanceForm.uri}
										readOnly={conformanceComplete}
										className={conformanceComplete ? 'panesReadOnly' : ''}
										onChange={(e, d) => {
											setConformanceForm({ ...conformanceForm, uri: d.value });
										}}
									/>
								</Form.Group>
								<Form.Group>
									<Form.Input
										required
										label='Author'
										value={conformanceForm.author}
										readOnly={conformanceComplete}
										className={conformanceComplete ? 'panesReadOnly' : ''}
										onChange={(e, d) => {
											setConformanceForm({ ...conformanceForm, author: d.value });
										}}
										error={
											!isStringFieldValid(conformanceForm.author) && {
												content: 'Author required',
												pointing: 'below',
											}
										}
									/>
									<Form.Input
										label='Email'
										type='email'
										required
										value={conformanceForm.email}
										readOnly={conformanceComplete}
										className={conformanceComplete ? 'panesReadOnly' : ''}
										onChange={(e, d) => {
											setConformanceForm({ ...conformanceForm, email: d.value });
										}}
										error={
											!isEmailFieldValid(conformanceForm.email) && {
												content: 'Email required',
												pointing: 'below',
											}
										}
									/>
									<Form.Input
										type='date'
										label='Certification Date'
										value={conformanceForm.date}
										readOnly={conformanceComplete}
										className={conformanceComplete ? 'panesReadOnly' : ''}
										onChange={(e, d) => {
											setConformanceForm({ ...conformanceForm, date: d.value });
										}}
									/>
								</Form.Group>
								<Form.TextArea
									required
									label='Details'
									style={{ minHeight: 400 }}
									value={conformanceForm.details}
									readOnly={conformanceComplete}
									className={conformanceComplete ? 'panesReadOnly' : ''}
									onChange={(e, d) => {
										setConformanceForm({ ...conformanceForm, details: d.value });
									}}
									error={
										!isStringFieldValid(conformanceForm.details) && {
											content: 'Details required',
											pointing: 'below',
										}
									}
								/>
								<Form.Checkbox
									required
									label='By checking this box, you assert that this MEP conforms to NIEM specifications and associated rules'
									readOnly={conformanceComplete}
									className={conformanceComplete ? 'panesReadOnly' : ''}
									checked={checked}
									onClick={(e, d) => {
										if (d.checked) {
											setChecked(true);
										} else {
											setChecked(false);
										}
									}}
									error={
										!checked && {
											content: 'Assertion required',
											pointing: 'below',
										}
									}
								/>
							</Form>
						</>
					)}
					<br />
					{existingConformance && !showEdit ? (
						<>
							<Button
								className='primaryButton'
								onClick={() => {
									handleSubmit(artifactTags.conformance);
								}}
							>
								Save
							</Button>
							<Button
								className='secondaryButton'
								onClick={() => {
									setShowEdit(true);
									setExistingConformance(true);
									setConformanceComplete(true);
								}}
							>
								Cancel
							</Button>
						</>
					) : conformanceComplete ? null : (
						<Button
							className='primaryButton'
							disabled={disableConformanceAssert}
							onClick={() => {
								handleSubmit(artifactTags.conformance);
							}}
						>
							Assert
						</Button>
					)}
				</>
			</Tab.Pane>
		),
	};

	const getPanes = () => {
		// Add Conformance render object to panes if Publish & Implement page is active
		// If P&I is not active just return the original panes
		if (isPublishImplementActive) {
			const indexBeforeEditTab = panes.length - 1; // location before the edit Button
			panes.splice(indexBeforeEditTab, 0, conformanceObj);
		}
		return panes;
	};

	return (
		<Tab
			panes={getPanes()}
			activeIndex={activePane}
			onTabChange={(e, { activeIndex }) => {
				dispatch({ type: actionTypes.ACTIVE_PANE, payload: activeIndex });
			}}
		/>
	);
};

export default AssembleDocumentTab;
