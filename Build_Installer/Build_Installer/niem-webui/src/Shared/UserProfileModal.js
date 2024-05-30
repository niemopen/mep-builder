import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { Modal, Button, Form, Header, Message, List } from 'semantic-ui-react';
import { updatePasswordById } from '../Util/PasswordUtil';
import { getSessionValue } from '../Util/localStorageUtil';
import * as session from '../Util/SessionVar';
import { handleError, trackedErrorSources } from '../Util/ErrorHandleUtil';

const UserProfileModal = () => {
	const initialForm = {
		firstName: '',
		lastName: '',
		phone: '',
		existingPassword: '',
		newPassword: '',
		confirmPassword: '',
	};

	const initialErrorForm = {
		firstName: false,
		lastName: false,
		phone: false,
		existingPassword: false,
		newPassword: false,
		confirmPassword: false,
	};

	const loggedIn = useSelector((state) => state.session.loggedIn);
	const userEmail = useSelector((state) => state.session.userEmail);
	const userId = useSelector((state) => state.session.userId);
	const isUserProfileModalOpen = useSelector((state) => state.userProfile.isUserProfileModalOpen);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);
	const [isSaveChangesModalOpen, setIsSaveChangesModalOpen] = useState(false);
	const [accountInfoForm, setAccountInfoForm] = useState(initialForm);
	const [errorForm, setErrorForm] = useState(initialErrorForm);
	const [saveClickedOnce, setSaveClickedOnce] = useState(false);
	const [actionMessage, setActionMessage] = useState('');
	const [changesMade, setChangesMade] = useState(false);
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [showPasswordRules, setShowPasswordRules] = useState(false);
	const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState('');
	const [existingPasswordErrorMessage, setExistingPasswordErrorMessage] = useState('');

	// Action Message Values
	const changesSuccessful = 'changesSuccessful';
	const formInvalid = 'formInvalid';
	const errorMessage = 'errorMessage';

	const dispatch = useDispatch();

	// API call to retrieve existing user data based on id
	const getUserInfoApi = useCallback(async () => {
		if (!systemErrorOccurred) {
			return axios
				.get(baseURL + 'User/findUserById/' + userId)
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error, trackedErrorSources.user);
					return false;
				});
		} else {
			return false;
		}
	}, [userId, systemErrorOccurred]);

	// Allows the form fields to already be prepoulated with exising user data after the API call when the modal is opened
	const handlePrePopulateUserInfo = useCallback(async () => {
		if (loggedIn && userEmail.toLowerCase() !== 'sysadmin') {
			const userResult = await getUserInfoApi();
			let user = {};

			if (userResult) {
				let phone = userResult.phone;

				if (userResult.phone === undefined) {
					phone = '';
				}

				// Recieves only first name, last name, email, and phone from the API and stores it in this variable
				user = {
					firstName: userResult.first_name,
					lastName: userResult.last_name,
					email: userResult.email,
					phone: phone,
					// prevent password fields from returning undefined
					existingPassword: initialForm.existingPassword,
					newPassword: initialForm.newPassword,
					confirmPassword: initialForm.confirmPassword,
				};
			} else {
				user = {
					firstName: '',
					lastName: '',
					email: '',
					phone: '',
					existingPassword: '',
					newPassword: '',
					confirmPassword: '',
				};
			}
			setAccountInfoForm(user);
		}
	}, [loggedIn, userEmail, getUserInfoApi, initialForm.confirmPassword, initialForm.existingPassword, initialForm.newPassword]);
	// Stores whatever values are presently in the form at the moment 'Confirm' save changes is clicked

	useEffect(() => {
		let isMounted = true;
		if (isMounted) {
			handlePrePopulateUserInfo();
		}
		return () => {
			isMounted = false; // use effect cleanup to set flag false, if unmounted
		};
	}, [isUserProfileModalOpen, handlePrePopulateUserInfo]);

	// API call to send any changes and update user data
	const updateUserInfoApi = () => {
		if (!systemErrorOccurred) {
			return axios
				.put(baseURL + 'User/updateById/' + userId, {
					userData: {
						first_name: accountInfoForm.firstName,
						last_name: accountInfoForm.lastName,
						phone: accountInfoForm.phone,
					},
					auditUser: getSessionValue(session.user_id),
				})
				.then((response) => {
					if (response.status === 200) {
						setActionMessage(changesSuccessful);
						return true;
					}
				})
				.catch((error) => {
					handleError(error, trackedErrorSources.user);
					setActionMessage(errorMessage);
					return false;
				});
		} else {
			return false;
		}
	};

	const UpdateAccountInfo = () => {
		const updatedUserInfo = {
			firstName: accountInfoForm.firstName,
			lastName: accountInfoForm.lastName,
			email: accountInfoForm.email,
			phone: accountInfoForm.phone,
			existingPassword: accountInfoForm.existingPassword,
			newPassword: accountInfoForm.newPassword,
			confirmPassword: accountInfoForm.confirmPassword,
		};

		setAccountInfoForm(updatedUserInfo);

		handleSaveChanges();
	};

	// Verifies all checks and determines whether the update to the API call can be made and apply changes
	async function handleSaveChanges() {
		// retrieve old password parameters from db
		const userInfo = await getUserInfoApi();
		if (userInfo) {
			const isFormValid = formValidation();
			const updatePasswordResults = await updatePasswordById(userInfo, userId, accountInfoForm.newPassword, accountInfoForm.existingPassword);
			setSaveClickedOnce(true);

			let isSuccess = false;

			// set action messages according to results
			if (updatePasswordResults.message === 'success') {
				dispatch({ type: actionTypes.PASSWORD_EXPIRING_MESSAGE_OPEN, payload: false });
				setActionMessage(changesSuccessful);
			} else if (updatePasswordResults.message === 'error') {
				setActionMessage(errorMessage);
			} else if (updatePasswordResults.message === 'reusedPassword') {
				setErrorForm({ ...errorForm, newPassword: true });
				setNewPasswordErrorMessage('New password is same as the old password. Please try again');
			} else if (updatePasswordResults.message === 'incorrectPassword') {
				setErrorForm({ ...errorForm, existingPassword: true });
				setExistingPasswordErrorMessage('Incorrect Password');
			}

			if (showPasswordForm) {
				// Update info depending on if password form is shown or not
				if (isFormValid) {
					isSuccess = (await updateUserInfoApi()) && updatePasswordResults.boolean;
					setActionMessage(changesSuccessful);
				} else {
					setActionMessage(formInvalid);
				}
			} else {
				if (isFormValid) {
					isSuccess = await updateUserInfoApi();
					setActionMessage(changesSuccessful);
				} else {
					setActionMessage(formInvalid);
				}
			}

			if (isSuccess) {
				resetAccountInfoForm();
			} else {
				setIsSaveChangesModalOpen(false);
				setSaveClickedOnce(false);
				setActionMessage(errorMessage);
			}
		} else {
			setIsSaveChangesModalOpen(false);
			setSaveClickedOnce(false);
			setActionMessage(errorMessage);
		}

		// Allows Action Messages to only be visble for 5 seconds
		const timer = setTimeout(() => {
			setActionMessage('');
		}, 5000);
		return () => clearTimeout(timer);
	}

	const resetAccountInfoForm = () => {
		setIsSaveChangesModalOpen(false);
		setChangesMade(false);
		setSaveClickedOnce(false);
	};

	const handleCancel = () => {
		dispatch({ type: actionTypes.USER_PROFILE_MODAL_OPEN });
		resetAccountInfoForm();
		handlePrePopulateUserInfo();
		setShowPasswordForm(false);
	};

	const formValidation = () => {
		let firstNameValid = accountInfoForm.firstName !== '';
		let lastNameValid = accountInfoForm.lastName !== '';
		// emailValid will always be true because it cannot be changed in the form
		// const emailValid = true;
		let phoneValid = accountInfoForm.phone !== '';
		let existingPasswordValid = accountInfoForm.existingPassword !== '';
		let newPasswordValid = accountInfoForm.newPassword !== '';
		let confirmPasswordValid = accountInfoForm.confirmPassword !== '';

		// Validates phone number with area code
		/* Note: The regex below for the phone number allows the following phone number formats:
			1234567890
			123-456-7890
			(123) 456-7890
			123 456 7890
			123.456.7890
			+91 (123) 456-7890
		*/
		if (!accountInfoForm.phone.match(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)) {
			phoneValid = false;
		}

		/* Note: The regex makes passwords conform to the following format:
			Min length of 8 characters
			At least one special characters (non-alphanumeric characters)
			At least one Uppercase letter
			At least one Lowercase letter
			At least one Number (0-9)
		*/
		const isPassValid = new RegExp(
			/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/])[A-Za-z\d`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]{8,}/,
			'g'
		);

		if (showPasswordForm) {
			// Form validation including password fields

			if (!isPassValid.test(accountInfoForm.newPassword)) {
				setShowPasswordRules(true);
				newPasswordValid = false;
			}

			// Validates password fields match
			if (accountInfoForm.confirmPassword !== accountInfoForm.newPassword) {
				confirmPasswordValid = false;
			}

			const errorFields = {
				firstName: !firstNameValid,
				lastName: !lastNameValid,
				// email: !emailValid,
				phone: !phoneValid,
				existingPassword: !existingPasswordValid,
				newPassword: !newPasswordValid,
				confirmPassword: !confirmPasswordValid,
			};

			setErrorForm(errorFields);
			setExistingPasswordErrorMessage('Existing password required.');
			setNewPasswordErrorMessage('Please enter a valid password.');

			// Validates form field entries
			if (
				firstNameValid &&
				lastNameValid /* && emailValid */ &&
				phoneValid &&
				existingPasswordValid &&
				newPasswordValid &&
				confirmPasswordValid
			) {
				setIsSaveChangesModalOpen(true);
				return true;
			} else {
				return false;
			}
		} else {
			// Form validation excluding password fields

			const errorFields = {
				firstName: !firstNameValid,
				lastName: !lastNameValid,
				// email: !emailValid,
				phone: !phoneValid,
			};

			setErrorForm(errorFields);

			// Validates form field entries
			if (firstNameValid && lastNameValid /* && emailValid */ && phoneValid) {
				setIsSaveChangesModalOpen(true);
				return true;
			} else {
				return false;
			}
		}
	};

	return (
		<>
			<Modal
				open={isUserProfileModalOpen}
				size='small'
				closeIcon
				onClose={() => {
					dispatch({ type: actionTypes.USER_PROFILE_MODAL_OPEN });
					setActionMessage('');
				}}
				closeOnDimmerClick={false}
			>
				<Modal.Header>My Profile</Modal.Header>
				<Modal.Content>
					<Modal.Description>
						<Header>Account Information</Header>
						<Form>
							<Form.Group widths='equal'>
								<Form.Input
									label='First Name'
									required={true}
									value={accountInfoForm.firstName}
									onChange={(e, d) => {
										setChangesMade(true);
										setAccountInfoForm({
											...accountInfoForm,
											firstName: d.value,
										});
										if (saveClickedOnce) {
											formValidation();
										}
									}}
									error={
										errorForm.firstName && {
											content: 'First Name required',
											pointing: 'below',
										}
									}
								/>
								<Form.Input
									label='Last Name'
									required={true}
									value={accountInfoForm.lastName}
									onChange={(e, d) => {
										setChangesMade(true);
										setAccountInfoForm({
											...accountInfoForm,
											lastName: d.value,
										});
										if (saveClickedOnce) {
											formValidation();
										}
									}}
									error={
										errorForm.lastName && {
											content: 'Last Name required',
											pointing: 'below',
										}
									}
								/>
							</Form.Group>
							<Form.Group widths='equal'>
								<Form.Input className='disabledEmailField' label='Email' disabled value={accountInfoForm.email} />
								<Form.Input
									label='Phone'
									placeholder='Phone'
									required={true}
									value={accountInfoForm.phone}
									onChange={(e, d) => {
										setChangesMade(true);
										setAccountInfoForm({
											...accountInfoForm,
											phone: d.value,
										});
										if (saveClickedOnce) {
											formValidation();
										}
									}}
									error={
										errorForm.phone && {
											content: 'Please enter a valid phone number with area code.',
											pointing: 'below',
										}
									}
								/>
							</Form.Group>

							{showPasswordForm ? (
								<>
									<Form.Group>
										<Form.Input
											label='Existing Password'
											placeholder='Password'
											type='password'
											required={true}
											value={accountInfoForm.existingPassword}
											onChange={(e, d) => {
												setChangesMade(true);
												setAccountInfoForm({
													...accountInfoForm,
													existingPassword: d.value,
												});
												if (saveClickedOnce) {
													formValidation();
												}
											}}
											error={
												errorForm.existingPassword && {
													content: existingPasswordErrorMessage,
													pointing: 'below',
												}
											}
										/>
									</Form.Group>
									<Form.Group widths='equal'>
										<Form.Input
											label='New Password'
											placeholder='Password'
											type='password'
											required={true}
											value={accountInfoForm.newPassword}
											onChange={(e, d) => {
												setChangesMade(true);
												setAccountInfoForm({
													...accountInfoForm,
													newPassword: d.value,
												});
												if (saveClickedOnce) {
													formValidation();
												}
											}}
											onFocus={() => {
												setShowPasswordRules(true);
											}}
											onBlur={() => {
												setShowPasswordRules(false);
											}}
											error={
												// check if passwords match, otherwise it's invalid if empty
												(accountInfoForm.confirmPassword !== accountInfoForm.newPassword && {
													content: 'Passwords do not match',
													pointing: 'below',
												}) ||
												(errorForm.newPassword && {
													content: newPasswordErrorMessage,
													pointing: 'below',
												})
											}
										/>
										<Form.Input
											label='Confirm New Password'
											placeholder='Confirm Password'
											type='password'
											required={true}
											value={accountInfoForm.confirmPassword}
											onChange={(e, d) => {
												setChangesMade(true);
												setAccountInfoForm({
													...accountInfoForm,
													confirmPassword: d.value,
												});
												if (saveClickedOnce) {
													formValidation();
												}
											}}
											error={
												// check if passwords match, otherwise it's invalid if empty
												(accountInfoForm.confirmPassword !== accountInfoForm.newPassword && {
													content: 'Passwords do not match',
													pointing: 'below',
												}) ||
												(errorForm.confirmPassword && {
													content: 'Confirm password',
													pointing: 'below',
												})
											}
										/>
									</Form.Group>
								</>
							) : (
								<>
									<Form.Group>
										<Form.Field label='Password' />
									</Form.Group>
									<Form.Group>
										<Form.Field
											className='updatePasswordText'
											label='Update Password'
											onClick={() => {
												setShowPasswordForm(true);
											}}
										/>
									</Form.Group>
								</>
							)}
							{showPasswordRules ? (
								<List className='passwordCriteria'>
									<List.Item>Min length of 8 characters</List.Item>
									<List.Item>At least one special characters (non-alphanumeric characters)</List.Item>
									<List.Item>At least one Uppercase letter</List.Item>
									<List.Item>At least one Lowercase letter</List.Item>
									<List.Item>At least one Number (0-9)</List.Item>
								</List>
							) : null}
						</Form>
					</Modal.Description>
					{/*Success/Error Message Section*/}
					{actionMessage === changesSuccessful ? (
						<Message success>
							<p>Changes saved successfully.</p>
						</Message>
					) : actionMessage === formInvalid ? (
						<Message error>
							<p>
								<b>Invalid Form </b>
								<br />
								Please verify fields are entered correctly.
							</p>
						</Message>
					) : actionMessage === errorMessage ? (
						<Message error>
							<p>
								<b>Action failed</b>
								<br />
								Please try again.
							</p>
						</Message>
					) : null}
				</Modal.Content>
				{/*Modal Button Section*/}
				<Modal.Actions>
					<Button className='secondaryButton' onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						disabled={changesMade ? false : true}
						primary
						onClick={() => {
							formValidation();
						}}
					>
						Save Changes
					</Button>
				</Modal.Actions>
			</Modal>
			{/*Save Changes Modal Section*/}
			<Modal
				open={isSaveChangesModalOpen}
				size='tiny'
				onClose={() => {
					setIsSaveChangesModalOpen(false);
				}}
				closeOnDimmerClick={false}
			>
				<Modal.Header>Save Changes</Modal.Header>
				<Modal.Content>
					<p>Are you sure you want save these changes?</p>
				</Modal.Content>

				<Modal.Actions>
					<Button
						className='secondaryButton'
						onClick={() => {
							setIsSaveChangesModalOpen(false);
						}}
					>
						Cancel
					</Button>
					<Button
						primary
						onClick={() => {
							UpdateAccountInfo();
						}}
					>
						Confirm
					</Button>
				</Modal.Actions>
			</Modal>
		</>
	);
};

export default UserProfileModal;
