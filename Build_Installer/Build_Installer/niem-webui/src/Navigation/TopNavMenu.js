import React, { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import '../styles/App.css';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import * as sessionVar from '../Util/SessionVar';
import { Link } from 'react-router-dom';
import { GetPackageMenuHeight } from '../Util/ElementSizeUtil';
import * as key from '../Shared/KVstore';
import Tooltip from '../Shared/Tooltip.js';
import * as tooltipContent from '../Shared/TooltipContent.js';
import axios from 'axios';
import Timer from '../Util/TimerUtil';
import LoaderModal from '../Shared/LoaderModal';
import ExistingMEPNameModal from '../Shared/ExistingMEPNameModal';
import { baseURL } from '../Util/ApiUtil';
import { Grid, Menu, Button, Icon, Form, Input, Divider, Popup, Checkbox, Header, Message, Dropdown, TextArea } from 'semantic-ui-react';
import UserManagementModal from '../components/UserManagementModal.js';
import RequestAccountModal from '../components/RequestAccountModal.js';
import { setSessionValue, setLogOut, getSessionValue } from '../Util/localStorageUtil';
import MEPSearchBar from '../Shared/MEPSearchBar.js';
import * as role from '../Shared/roles';
import ResetPasswordModal from '../Shared/ResetPasswordModal';
import { handleSavePackage, handleSaveClosePackage, closePackage } from '../Util/savePackageUtil';
import { setActiveTab } from './HeaderNavMenu';
import { setActiveSidebarTab } from '../Navigation/LeftNavContent';
import ModifyArtifactTreeModal from '../Shared/ModifyArtifactTreeModal';
import { updateArtifactTreeLabel } from '../Util/ArtifactTreeUtil';
import ReleaseModal from '../Shared/ReleaseModal';
import { MEPChangeWarningModal, deleteSubsetTranslate } from '../Shared/MEPChangeWarningModal';
import ExistingFileNameModal from '../Shared/ExistingFileNameModal';
import { isDuplicatePublishedPackageName } from '../Util/PackageUtil';
import ConfirmArtifactDeleteModal from '../Shared/ConfirmArtifactDeleteModal';
import OpenedCopiedMigratedMEPModal from '../Shared/OpenedCopiedMigratedMEPModal';
import store from '../redux/store';
import { releaseOptions } from '../App.js';
import { isStringFieldValid } from '../Util/FieldValidationUtil.js';
import { handleError } from '../Util/ErrorHandleUtil.js';
import { setForceLogOutValue } from '../Util/AdminModuleUtil.js';

export const getLatestRelease = async () => {
	// return the last release in the release array
	const state = store.getState();
	const niemReleases = state.data.loadedReleases;
	if (niemReleases) {
		return niemReleases[niemReleases.length - 1];
	}
};

const TopNavMenu = () => {
	const isStandAloneSys = useSelector((state) => state.session.isStandAloneSys);
	const loggedIn = useSelector((state) => state.session.loggedIn);
	const artifactTree = useSelector((state) => state.artifact.treeItems);
	const showMore = useSelector((state) => state.top.showMore);
	const reduxTopNavHeight = useSelector((state) => state.top.topNavHeight);
	const tooltipsDisabled = useSelector((state) => state.top.tooltipsDisabled);
	const tooltipsSwitch = useSelector((state) => state.top.tooltipsSwitch);
	const packageBuilderActive = useSelector((state) => state.header.packageBuilderActive);
	const isAutoSaving = useSelector((state) => state.top.isAutoSaving);
	const isModalOpen = useSelector((state) => state.existing.isModalOpen);
	const isExistingFileModalOpen = useSelector((state) => state.existingFile.isModalOpen);
	const signInError = useSelector((state) => state.top.signInError);
	const passwordExpired = useSelector((state) => state.passwordExpiring.isPasswordExpired);
	const resetPasswordModalOpen = useSelector((state) => state.resetPassword.isResetPasswordModalOpen);
	const isRequiredArtifactUploaded = useSelector((state) => state.mpd.isRequiredArtifactUploaded);
	const isTranslationGenerated = useSelector((state) => state.translate.isTranslationGenerated);
	const isMepNameEditable = useSelector((state) => state.top.isMepNameEditable);

	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const [errorMessage, setErrorMessage] = useState({ header: '', content: '' });
	const [usernameField, setUsernameField] = useState('');
	const [passwordField, setPasswordField] = useState('');
	const [verifiedUserId, setVerifiedUserId] = useState('');

	const passwordExpiredMessage = {
		header: 'Your password has expired',
		content: (
			<p>
				Please{' '}
				<span
					className='updatePasswordLink'
					onClick={() => {
						dispatch({
							type: actionTypes.RESET_SELECTED_USER,
							payload: { selectedUser: verifiedUserId, currentUser: verifiedUserId }, // the selected user and current user will always be the same in this workflow
						});
						dispatch({ type: actionTypes.RESET_PASSWORD_MODAL_OPEN, payload: true });
					}}
				>
					reset password
				</span>{' '}
				or contact your system administrator for assistance: systemadministrator1@contact.com systemadministrator2@contact.com
			</p>
		),
	};

	// mpd catalog data
	const packageName = useSelector((state) => state.mpd.packageName);
	const release = useSelector((state) => state.mpd.release);
	const version = useSelector((state) => state.mpd.version);
	const status = useSelector((state) => state.mpd.status);
	const statusNo = useSelector((state) => state.mpd.statusNo);
	const pointOfContact = useSelector((state) => state.mpd.pointOfContact);
	const email = useSelector((state) => state.mpd.email);
	const description = useSelector((state) => state.mpd.description);
	const organizationName = useSelector((state) => state.mpd.organizationName);
	const organizationType = useSelector((state) => state.mpd.organizationType);
	const coiTags = useSelector((state) => state.mpd.coiTags);
	const exchangeTags = useSelector((state) => state.mpd.exchangeTags);
	const isReleaseLocked = useSelector((state) => state.mpd.isReleaseLocked);
	const loadedReleases = useSelector((state) => state.data.loadedReleases);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);

	const [unconfirmedPackageName, setUnconfirmedPackageName] = useState(packageName);
	const [unconfirmedRelease, setUnconfirmedRelease] = useState('');
	const [statusNoEnabled, setStatusNoEnabled] = useState(false);
	const [isVersionValid, setIsVersionValid] = useState(true);
	const [isVersionChecked, setIsVersionChecked] = useState(true);
	const [isDuplicatePublishedName, setIsDuplicatePublishedName] = useState(false);
	const [isMepNameValid, setIsMepNameValid] = useState(true);
	const [isOrganizationNameValid, setIsOrganizationNameValid] = useState(true);
	const dispatch = useDispatch();

	useEffect(() => {
		// on status change, enable status number field if status is not blank
		if (status !== '') {
			setStatusNoEnabled(true);
		}
	}, [status]);

	useEffect(() => {
		const setDefaultRelease = async () => {
			if (release === '' || release === undefined) {
				// if release was not set, set value to latest release
				const latestRelease = await getLatestRelease();
				setUnconfirmedRelease(latestRelease);
				dispatch({ type: actionTypes.UPDATE_MPD_RELEASE, payload: latestRelease });
			} else {
				// unconfirmedRelease from MPD
				setUnconfirmedRelease(release);
			}
		};

		setDefaultRelease();

		// update unconfirmedPackageName from MPD
		setUnconfirmedPackageName(packageName);
	}, [release, packageName, loadedReleases, dispatch]);

	async function handleFileSaver(overwriteSave = null) {
		setIsLoadingActive(true);
		const isExistingMep = await handleSavePackage(overwriteSave);
		setIsLoadingActive(false);
		return isExistingMep;
	}

	useEffect(async () => {
		// autosaving
		if (isAutoSaving === true) {
			await handleFileSaver(isAutoSaving);
		}

		// Adjusting window size
		var currentHeight = window.innerHeight - GetPackageMenuHeight();

		if (currentHeight !== reduxTopNavHeight) {
			dispatch({ type: actionTypes.UPDATE_TOP_NAV_HEIGHT });
		}
	}, [isAutoSaving, dispatch]);

	useEffect(() => {
		// Toggle between Readonly view of MEP name field and editable MEP name field
		if (isRequiredArtifactUploaded.subset || isTranslationGenerated) {
			dispatch({ type: actionTypes.IS_MEP_NAME_EDITABLE, payload: false });
		} else {
			dispatch({ type: actionTypes.IS_MEP_NAME_EDITABLE, payload: true });
		}
	}, [isRequiredArtifactUploaded, isTranslationGenerated, dispatch]);

	const validateUser = async () => {
		if (!systemErrorOccurred) {
			/* 
				NOTE: 
					Account credentials are encrypted in-flight via HTTPS (in cloud environment & CDF2).
					In a local development, in-flight credentials are not exposed to an environment outside of the local network.
					In a standalone environment, there is only one user, so login doesn't occur.
			*/
			return await axios
				.post(baseURL + 'Auth/login', {
					username: usernameField,
					password: passwordField,
				})
				.then((response) => {
					return response.data;
				})
				.catch((error) => handleError(error));
		}
	};

	const checkVersionNumber = (version) => {
		const versionRegex = new RegExp(/^(\d+.{1})*(\d)+$/);
		setIsVersionChecked(true);
		return versionRegex.test(version);
	};

	const statusChangeHandler = (e, d) => {
		if (d.value === '') {
			setSessionValue(sessionVar.unsaved_status_no, d.value, actionTypes.UPDATE_MPD_STATUS_NO);
			setStatusNoEnabled(false);
		} else {
			if (statusNo === '') {
				setSessionValue(sessionVar.unsaved_status_no, '1', actionTypes.UPDATE_MPD_STATUS_NO);
			}
			setStatusNoEnabled(true);
			// if Status field is changed, and is not blank, reset Status No. field to 0
			setSessionValue(sessionVar.unsaved_status_no, '1', actionTypes.UPDATE_MPD_STATUS_NO);
		}
		setSessionValue(sessionVar.unsaved_status, d.value, actionTypes.UPDATE_MPD_STATUS);
	};

	const versionChangeHandler = (e, d) => {
		// check input for negative, zero, or not a number values (excluding decimals)
		if (d.value.includes('-') || d.value === 0 || d.value === '0' || isNaN(d.value.replaceAll('.', '0'))) {
			setSessionValue(sessionVar.unsaved_version, '1', actionTypes.UPDATE_MPD_VERSION);
		} else {
			setSessionValue(sessionVar.unsaved_version, d.value, actionTypes.UPDATE_MPD_VERSION);
		}
		setIsVersionChecked(false);
		// if error message is currently displaying, clear it on change
		if (!isVersionValid) {
			setIsVersionValid(true);
		}
	};

	const getUserInfo = async (userId) => {
		if (!systemErrorOccurred) {
			return await axios
				.get(baseURL + 'User/findUserById/' + userId)
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error);
				});
		}
	};

	const updateAttempts = async (num, userId, accountLocked = false) => {
		if (!systemErrorOccurred) {
			return await axios
				.put(baseURL + 'User/updateById/' + userId, {
					userData: {
						login_attempts: num,
						account_locked: num >= 5 || accountLocked,
						status_change_reason: num >= 5 || accountLocked ? 'Login attempt limit exceeded' : '',
					},
					auditUser: getSessionValue(sessionVar.user_id),
				})
				.catch((error) => handleError(error));
		}
	};

	const checkIfUserExists = async () => {
		if (!systemErrorOccurred) {
			return await axios
				.get(baseURL + 'User/exists/' + usernameField)
				.then((response) => {
					return response.data.userExists;
				})
				.catch((error) => {
					handleError(error);
					return false;
				});
		} else {
			return false;
		}
	};

	async function handleSignIn() {
		const userExists = await checkIfUserExists();

		//check if user exists before proceeding as to avoid errors
		if (usernameField !== '' && passwordField !== '' && userExists) {
			const { isUserValidated, userId, status } = await validateUser();
			const user = await getUserInfo(userId);
			setVerifiedUserId(userId); // save verified id to prevent bypass on reset password form

			if (!status.isAccountLocked) {
				if (user.login_attempts < 5) {
					if (isUserValidated) {
						setSessionValue(sessionVar.user_id, user._id, actionTypes.UPDATE_USER_ID);
						setSessionValue(sessionVar.is_authenticated, true, actionTypes.UPDATE_LOGGED_IN);
						setSessionValue(sessionVar.user_email, usernameField, actionTypes.UPDATE_USER_EMAIL);
						setSessionValue(sessionVar.user_role, user.user_role, actionTypes.UPDATE_USER_ROLE);

						//checks to see if this is an admin user to display the user account management modal
						if (user.user_role === role.sysAdmin) {
							setLogOut();
							dispatch({ type: actionTypes.USER_MANAGEMENT_MODAL_OPEN });
						}

						// upon login user is notified of password expiring
						if (status.isPasswordExpiring) {
							dispatch({ type: actionTypes.PASSWORD_EXPIRING_MESSAGE_OPEN, payload: true });
						} else {
							dispatch({ type: actionTypes.PASSWORD_EXPIRING_MESSAGE_OPEN, payload: false });
						}

						await setForceLogOutValue(user._id, false); // if user is logging in, no need to force them to log back out
						// reset login attempts back to 0
						await updateAttempts(0, user._id);
						dispatch({ type: actionTypes.SIGN_IN_ERROR, payload: false });
					} else {
						await updateAttempts(user.login_attempts + 1, user._id);
						dispatch({ type: actionTypes.SIGN_IN_ERROR, payload: true });
						setErrorMessage({
							header: 'Invalid Credentials',
							content: 'Login Failed - You have entered an invalid username and/or password. Please try again.',
						});
					}
					dispatch({ type: actionTypes.PASSWORD_EXPIRED, payload: false });
				} else {
					dispatch({ type: actionTypes.SIGN_IN_ERROR, payload: true });
					setErrorMessage({
						header: 'Your account has been locked',
						content:
							'You have exceeded the maximum number of login attempts. Please contact your system administrator for assistance at: \n systemadministrator1@contact.com \n systemadministrator2@contact.com ',
					});
				}
			} else if (status.isPasswordExpired) {
				dispatch({ type: actionTypes.PASSWORD_EXPIRED, payload: true });
				dispatch({ type: actionTypes.SIGN_IN_ERROR, payload: true });
			} else {
				await updateAttempts(user.login_attempts + 1, user._id, true);
				dispatch({ type: actionTypes.SIGN_IN_ERROR, payload: true });
				setErrorMessage({
					header: 'Your account has been locked',
					content:
						'Please contact your system administrator for assistance at: \n systemadministrator1@contact.com \n systemadministrator2@contact.com ',
				});
			}
		} else {
			dispatch({ type: actionTypes.SIGN_IN_ERROR, payload: true });
			setErrorMessage({
				header: 'Invalid Credentials',
				content: 'Login Failed - You have entered an invalid username and/or password. Please try again.',
			});
		}
	}

	const statusOptions = [
		{
			key: '',
			text: '',
			value: '',
		},
		{
			key: 'alpha',
			text: 'alpha',
			value: 'alpha',
		},
		{
			key: 'beta',
			text: 'beta',
			value: 'beta',
		},
		{
			key: 'rc',
			text: 'rc',
			value: 'rc',
		},
		{
			key: 'rev',
			text: 'rev',
			value: 'rev',
		},
	];

	const VersionHeader = () => {
		return (
			<label>
				<Tooltip
					content={tooltipContent.acceptableVersionValues}
					position='left center'
					inverted
					trigger={
						<span>
							<label>
								Version <Icon name='info circle'></Icon>
							</label>
						</span>
					}
				/>
			</label>
		);
	};

	const areRequiredFieldsValid = () => {
		let isValid = true; // default value, will only change if a field is false

		if (!checkVersionNumber(version)) {
			setIsVersionValid(false);
			isValid = false;
		}
		if (!isStringFieldValid(organizationName)) {
			setIsOrganizationNameValid(false);
			isValid = false;
			if (!showMore) {
				// open show more tab
				dispatch({ type: actionTypes.UPDATE_SHOW_MORE });
			}
		} else {
			setIsOrganizationNameValid(true);
		}

		if (!isStringFieldValid(unconfirmedPackageName) || unconfirmedPackageName.includes('.')) {
			isValid = false;
			setIsMepNameValid(false);
		} else {
			setIsMepNameValid(true);
		}

		return isValid;
	};

	/* -------------------------------------- Top Nav Section -------------------------------------- */
	return (
		<div className='topNavMenu'>
			<ExistingFileNameModal open={isExistingFileModalOpen} />
			<ExistingMEPNameModal open={isModalOpen} />
			<LoaderModal active={isLoadingActive} />
			<ModifyArtifactTreeModal />
			<ReleaseModal />
			<MEPChangeWarningModal />
			<ConfirmArtifactDeleteModal />
			<OpenedCopiedMigratedMEPModal />
			<Grid padded id='packageMenu'>
				{isStandAloneSys || (!isStandAloneSys && loggedIn) ? (
					<Menu className='packageMenu-metadata-buttons-row' fluid>
						{packageBuilderActive ? (
							<Menu.Item
								as='a'
								onClick={() => {
									dispatch({ type: actionTypes.UPDATE_SIDEBAR_VISIBLE });
									dispatch({ type: actionTypes.UPDATE_SIDEBAR_WIDTH });
								}}
							>
								<Tooltip
									content={tooltipContent.topNavHamburger}
									position='bottom left'
									trigger={<Icon name='bars' size='large'></Icon>}
								/>
							</Menu.Item>
						) : null}
						{/* ------------------------------ MEP Builder - Metadata Form  ------------------------------ */}
						{packageBuilderActive ? (
							<Grid columns={'three'} className='packageMenu-metadata-forms'>
								{packageName !== '' ? <Timer /> /* Autosaving timer*/ : null}
								<Grid.Column width={2} textAlign='right' id='packageMenu-metadata-column-one'>
									<Grid.Column>
										<Tooltip
											content={[key.packageName, ' Metadata']}
											position='top center'
											trigger={<h3>{key.packageNameAcronymn} Metadata</h3>}
										/>
									</Grid.Column>
									<Grid.Column as='a'>
										{showMore ? (
											<Button
												className='packageMenu-metadata-showmore-button'
												onClick={() => dispatch({ type: actionTypes.UPDATE_SHOW_MORE })}
											>
												<Icon name='chevron up' />
												Show less
											</Button>
										) : (
											<Button
												className='packageMenu-metadata-showmore-button'
												onClick={() => dispatch({ type: actionTypes.UPDATE_SHOW_MORE })}
											>
												<Icon name='chevron down' />
												Show more
											</Button>
										)}
									</Grid.Column>
								</Grid.Column>
								<Grid.Column width={11} id='packageMenu-metadata-column-two'>
									<Form size='tiny'>
										<Form.Group>
											<Form.Field width='sixteen' required={true}>
												<Tooltip
													content={[key.packageName, ' Name']}
													position='top left'
													trigger={<label>{key.packageNameAcronymn} Name</label>}
												/>
												{isMepNameEditable ? (
													// Editable MEP name field
													<Form.Input
														value={unconfirmedPackageName}
														onChange={(e, d) => {
															// If subset schema or translation files are already generated, remove subset schema and translation files on mep name change
															if (isRequiredArtifactUploaded.subset || isTranslationGenerated) {
																deleteSubsetTranslate(true, true);
															}
															setUnconfirmedPackageName(d.value);
															setSessionValue(
																sessionVar.unsaved_package_name,
																d.value,
																actionTypes.UPDATE_MPD_PACKAGE_NAME
															);
															setSessionValue(
																sessionVar.open_package_name,
																d.value,
																actionTypes.UPDATE_MPD_PACKAGE_NAME
															);
															updateArtifactTreeLabel(artifactTree, '0', d.value, true, false);
														}}
														error={
															!isMepNameValid
																? {
																		content: 'MEP Name contains prohibited characters.',
																		pointing: 'above',
																  }
																: isDuplicatePublishedName
																? {
																		content: 'A Published Package with this name already exists.',
																		pointing: 'above',
																  }
																: false
														}
													/>
												) : (
													// Readonly view of MEP name field, onclick displays MEP Change Warning modal
													<Input
														value={unconfirmedPackageName}
														readOnly={true}
														onClick={() => {
															dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_OPEN, payload: true });
															dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_TRIGGER, payload: 'mepName' });
															dispatch({ type: actionTypes.MEP_CONTAINS_SUBSET_TRANSLATION_TEXT_TRUE });
															dispatch({ type: actionTypes.GENERATE_SUBSET_TRANSLATION_TEXT_TRUE });
														}}
													/>
												)}
											</Form.Field>
											<Form.Field width='five' required={true}>
												<label>Release</label>
												<Dropdown
													value={unconfirmedRelease}
													compact
													search
													selection
													disabled={isReleaseLocked}
													options={releaseOptions()}
													onChange={(e, d) => {
														setUnconfirmedRelease(d.value);
														setSessionValue(sessionVar.unsaved_release, d.value, actionTypes.UPDATE_MPD_RELEASE);
													}}
												/>
											</Form.Field>

											<Form.Field
												width='five'
												required={true}
												control={Input}
												label={<VersionHeader />}
												onChange={versionChangeHandler}
												value={version}
												error={
													!isVersionValid
														? {
																content: 'Version Number Invalid',
																pointing: 'above',
														  }
														: false
												}
											/>

											<Form.Select
												value={status}
												fluid
												width='seven'
												label='Status'
												placeholder='Status'
												options={statusOptions}
												onChange={statusChangeHandler}
											/>
											<Form.Field width='five' required={statusNoEnabled}>
												<label>Status No.</label>
												<Input
													disabled={!statusNoEnabled}
													value={statusNo}
													className='numberInput'
													type='number'
													step='1'
													min='1'
													onChange={(e, d) => {
														if (d.value.includes('-') || d.value === '0' || (d.value === '' && statusNoEnabled)) {
															// disallow manual input of invalid numbers
															setSessionValue(sessionVar.unsaved_status_no, '1', actionTypes.UPDATE_MPD_STATUS_NO);
														} else {
															setSessionValue(sessionVar.unsaved_status_no, d.value, actionTypes.UPDATE_MPD_STATUS_NO);
														}
													}}
												/>
											</Form.Field>
											<Form.Input
												defaultValue={pointOfContact}
												width='twelve'
												label='Point of Contact'
												onChange={(e, d) => {
													setSessionValue(sessionVar.unsaved_POC, d.value, actionTypes.UPDATE_MPD_POC);
												}}
											/>
											<Form.Field width='twelve'>
												<label>Email</label>
												<Input
													defaultValue={email}
													type='email'
													onChange={(e, d) => {
														setSessionValue(sessionVar.unsaved_email, d.value, actionTypes.UPDATE_MPD_EMAIL);
													}}
												/>
											</Form.Field>
										</Form.Group>
									</Form>
									{showMore ? (
										<Form size='tiny'>
											<Form.Group>
												<Form.Input
													defaultValue={description}
													width='twelve'
													label='Description'
													onChange={(e, d) => {
														setSessionValue(sessionVar.unsaved_description, d.value, actionTypes.UPDATE_MPD_DESCRIPTION);
													}}
												/>
												<Form.Input
													required={true}
													value={organizationName}
													width='six'
													label='Organization Name'
													onChange={(e, d) => {
														if (isStringFieldValid(organizationName)) {
															setIsOrganizationNameValid(true);
														}
														setSessionValue(
															sessionVar.unsaved_organization,
															d.value,
															actionTypes.UPDATE_MPD_ORGANIZATION_NAME
														);
													}}
													error={
														!isOrganizationNameValid
															? {
																	content: 'Organization Name Invalid',
																	pointing: 'above',
															  }
															: false
													}
												/>
												<Form.Input
													defaultValue={organizationType}
													width='six'
													label='Organization Type'
													onChange={(e, d) => {
														setSessionValue(
															sessionVar.unsaved_organization_type,
															d.value,
															actionTypes.UPDATE_MPD_ORGANIZATION_TYPE
														);
													}}
												/>
												<Tooltip
													content={tooltipContent.multipleEntrySeparation}
													position='bottom center'
													inverted
													trigger={
														<Form.Input
															defaultValue={coiTags}
															width='six'
															label='Communities of Interest'
															control={TextArea}
															rows={1}
															onChange={(e, d) => {
																setSessionValue(
																	sessionVar.unsaved_coi_tags,
																	d.value,
																	actionTypes.UPDATE_MPD_COI_TAGS
																);
															}}
														/>
													}
												/>
												<Tooltip
													content={tooltipContent.multipleEntrySeparation}
													position='bottom center'
													inverted
													trigger={
														<Form.Input
															defaultValue={exchangeTags}
															width='six'
															label='Exchange Partners'
															control={TextArea}
															rows={1}
															onChange={(e, d) => {
																setSessionValue(
																	sessionVar.unsaved_exchange_tags,
																	d.value,
																	actionTypes.UPDATE_MPD_EXCHANGE_TAGS
																);
															}}
														/>
													}
												/>
											</Form.Group>
										</Form>
									) : null}
								</Grid.Column>
								<Grid.Column width={3} id='packageMenu-metadata-column-three'>
									<Button
										className='packageMenu-menu-button primaryButton'
										onClick={async () => {
											const isDuplicatePublishedName = await isDuplicatePublishedPackageName(unconfirmedPackageName);
											setIsDuplicatePublishedName(isDuplicatePublishedName);
											// only proceed if name is not in use by a published package
											if (!isDuplicatePublishedName) {
												// only call release modal if release is not locked
												if (isReleaseLocked) {
													if (!areRequiredFieldsValid()) {
														return;
													}
													handleFileSaver();
													dispatch({ type: actionTypes.RETURN_HOME_ON_SAVE, payload: false });
												} else {
													if (!areRequiredFieldsValid()) {
														return;
													}
													dispatch({ type: actionTypes.RELEASE_MODAL_OPEN, payload: true });
												}
											}
										}}
									>
										Save
									</Button>

									{
										// Created two seperate buttons as the link routing causes issues with the release modal
										// 'as' property changes to prevent redirecting with invalid version number'
										// This results in a slower redirection to myHome when saving & closing with an unchecked version number
										isReleaseLocked ? (
											<Button
												className='packageMenu-menu-button primaryButton'
												as={isVersionChecked && isVersionValid ? Link : null}
												to='/MyHome'
												onClick={async () => {
													setIsLoadingActive(true);
													const isDuplicatePublishedName = await isDuplicatePublishedPackageName(unconfirmedPackageName);
													setIsDuplicatePublishedName(isDuplicatePublishedName);
													// only proceed if name is not in use by a published package
													if (!isDuplicatePublishedName) {
														if (!areRequiredFieldsValid()) {
															return;
														}
														await handleSaveClosePackage();
													}
													setIsLoadingActive(false);
												}}
											>
												Save & Close
											</Button>
										) : (
											<Button
												className='packageMenu-menu-button primaryButton'
												onClick={async () => {
													const isDuplicatePublishedName = await isDuplicatePublishedPackageName(unconfirmedPackageName);
													setIsDuplicatePublishedName(isDuplicatePublishedName);
													// only proceed if name is not in use by a published package
													if (!isDuplicatePublishedName) {
														if (!areRequiredFieldsValid()) {
															return;
														}
														dispatch({ type: actionTypes.RETURN_HOME_ON_SAVE, payload: true });
														dispatch({ type: actionTypes.RELEASE_MODAL_OPEN, payload: true });
													}
												}}
											>
												Save & Close
											</Button>
										)
									}
									<Popup
										header={tooltipsDisabled ? tooltipContent.hintsHeader : null}
										content={tooltipsDisabled ? tooltipContent.hintsOn : tooltipContent.hintsOff}
										position='bottom left'
										mouseEnterDelay={700}
										trigger={
											<Grid className='hintsSwitch'>
												<Grid.Column>
													<Header as='h5'>Hints</Header>
													<Checkbox
														checked={tooltipsSwitch}
														className='hintsSwitch'
														toggle
														onClick={() => dispatch({ type: actionTypes.TOOGLE_TOOLTIPS })}
													/>
												</Grid.Column>
											</Grid>
										}
									/>
								</Grid.Column>
							</Grid>
						) : (
							/* ------------------------------ My Home - Create New MEP and Search ------------------------------ */
							<Grid columns='three'>
								<Grid.Column width={2}>
									<div className='packageMenu-menu-button-set'>
										<Tooltip
											content={['Create New ', key.packageName]}
											position='top right'
											trigger={
												<Button
													className='packageMenu-menu-button primaryButton'
													style={{ whiteSpace: 'noWrap' }}
													as={Link}
													to='/PackageBuilder/EditPackage'
													onClick={() => {
														// clear previously viewed package from session data
														closePackage();
														setActiveTab('PackageBuilder');
														setActiveSidebarTab('CreationGuide', dispatch);
														dispatch({ type: actionTypes.UPDATE_SIDEBAR_WIDTH });
													}}
												>
													<Icon name='plus' size='small'></Icon>Create New {key.packageNameAcronymn}
												</Button>
											}
										/>
									</div>
								</Grid.Column>
								<Grid.Column width={5} id='MEPSearch'>
									<MEPSearchBar />
								</Grid.Column>
							</Grid>
						)}
						{/* <Menu.Item position="right" as="a" id="packageMenu-neimlearn-menuitem">
                                <Icon name="large graduation cap icon"></Icon>
                                NIEM LEARN
                        </Menu.Item> */}
					</Menu>
				) : null}
				{/* -------------------------------------- Homepage / Sign in Section -------------------------------------- */}
				{!isStandAloneSys && !loggedIn ? (
					<>
						<UserManagementModal />
						<Grid columns={2} divided id='signInMenu'>
							<Grid.Column className='signInMenu-col-one' />
							<Grid.Column className='signInMenu-col-two'>
								<h3>Sign In</h3>
								<Menu className='signInMenu-box'>
									<Form onSubmit={handleSignIn} error={signInError}>
										{!passwordExpired ? (
											<Message error header={errorMessage.header} content={errorMessage.content} />
										) : (
											<Message error>
												<Message.Header>{passwordExpiredMessage.header}</Message.Header>
												{passwordExpiredMessage.content}
											</Message>
										)}
										<Form.Input label='Username' onChange={(e, d) => setUsernameField(d.value)} />
										<Form.Input label='Password' type='password' onChange={(e, d) => setPasswordField(d.value)} />
										<Button fluid type='submit' className='primaryButton'>
											Sign In
										</Button>
										Forgot Username / Password?
										<Divider />
										Don't have an account?
										<br />
										<span
											className='createAccountLink'
											onClick={() => {
												dispatch({ type: actionTypes.REQUEST_ACCOUNT_MODAL_OPEN });
											}}
										>
											Create an Account
										</span>
									</Form>
								</Menu>
							</Grid.Column>
						</Grid>
						{/* ------------------ Reset Password Modal Section------------------ */}
						{resetPasswordModalOpen ? <ResetPasswordModal /> : null}

						{/* ------------------ Request an Account Modal Section------------------ */}
						<RequestAccountModal />
					</>
				) : null}
			</Grid>
		</div>
	);
};

export default TopNavMenu;
