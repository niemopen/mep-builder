import { React, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Button, Modal, Form, Message, List } from 'semantic-ui-react';
import { encryptPassword, updatePasswordById } from '../Util/PasswordUtil';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { useEffect } from 'react';
import store from '../redux/store';
import * as session from '../Util/SessionVar';
import { getSessionValue } from '../Util/localStorageUtil';
import { handleError, trackedErrorSources } from '../Util/ErrorHandleUtil';

const ResetPasswordModal = (props) => {
	const initialForm = {
		existingPassword: '',
		newPassword: '',
		confirmPassword: '',
	};

	const initialErrorForm = {
		existingPassword: false,
		newPassword: false,
		confirmPassword: false,
	};

	const dispatch = useDispatch();
	const resetPasswordModalOpen = useSelector((state) => state.resetPassword.isResetPasswordModalOpen);
	const selectedUser = useSelector((state) => state.resetPassword.selectedUser);
	const currentUser = useSelector((state) => state.resetPassword.currentUser);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);
	const [resetPasswordForm, setResetPasswordForm] = useState(initialForm);
	const [errorForm, setErrorForm] = useState(initialErrorForm);
	const [resetClickedOnce, setResetClickedOnce] = useState(false);
	const [actionMessage, setActionMessage] = useState('');
	const [changesMade, setChangesMade] = useState({
		existingPassword: false,
		newPassword: false,
		confirmPassword: false,
	});
	const [showPasswordRules, setShowPasswordRules] = useState(false);
	const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState('');
	const [existingPasswordErrorMessage, setExistingPasswordErrorMessage] = useState('');
	const [adminResetWorkflow, setAdminResetWorkflow] = useState(false);
	const [notifyAdminModal, setNotifyAdminModal] = useState(false);

	// Action Message Values
	const changesSuccessful = 'changesSuccessful';
	const formInvalid = 'formInvalid';
	const formErrorMessage = 'formErrorMessage';
	const invalidPassword = 'invalidPassword';
	const passwordMismatch = 'passwordMismatch';

	useEffect(() => {
		if (currentUser.toLowerCase() === selectedUser.toLowerCase()) {
			setAdminResetWorkflow(false);
			setChangesMade({ ...changesMade, existingPassword: true });
		} else {
			setChangesMade({ ...changesMade, existingPassword: true });
			setAdminResetWorkflow(true);
		}
	}, [resetPasswordModalOpen]); // perform check only when the modal is opened
	// NOTE: Compiler wants changesMade, currentUser, and selectedUser as dependencies, this will break the code.

	const getUserInfoById = (userId) => {
		if (!systemErrorOccurred) {
			return axios
				.get(baseURL + 'User/findUserById/' + userId)
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error);
				});
		}
	};

	// Verifies all checks and determines whether the update to the API call can be made and apply changes
	const handleAdminResetPassword = async () => {
		if (!systemErrorOccurred) {
			const encryptedPass = await encryptPassword(resetPasswordForm.newPassword);
			const tempExpiration = 90 - 2; // set the password to expire within 2 days of current date. Passwords expire at 90 days.
			const date = new Date();
			date.setDate(date.getDate() - tempExpiration);
			const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

			return axios
				.put(baseURL + 'User/updateById/' + selectedUser, {
					userData: {
						salt: encryptedPass.salt,
						hash: encryptedPass.hash,
						password_created: formattedDate,
						account_locked: false,
						login_attempts: 0,
						status_change_reason: 'Password reset',
					},
					auditUser: getSessionValue(session.user_id),
				})
				.then((response) => {
					if (response.status === 200) {
						store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: true });
						setActionMessage(changesSuccessful);
						setNotifyAdminModal(true);
						return response.data.userId;
					}
				})
				.catch((error) => {
					handleError(error, trackedErrorSources.admin);
					setNotifyAdminModal(false);
					store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
				});
		} else {
			setNotifyAdminModal(false);
			store.dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false });
		}
	};

	const handleResetPassword = async () => {
		const userInfo = await getUserInfoById(selectedUser);
		const isFormValid = formValidation();
		const updatePasswordResults = await updatePasswordById(
			userInfo,
			selectedUser,
			resetPasswordForm.newPassword,
			resetPasswordForm.existingPassword
		);
		setResetClickedOnce(true);

		let isSuccess = false;

		// set action messages according to results
		if (updatePasswordResults.message === 'success') {
			dispatch({ type: actionTypes.PASSWORD_EXPIRING_MESSAGE_OPEN, payload: false });
			dispatch({ type: actionTypes.PASSWORD_EXPIRED, payload: false });
			dispatch({ type: actionTypes.SIGN_IN_ERROR, payload: false });
			setActionMessage(changesSuccessful);
		} else if (updatePasswordResults.message === 'error') {
			setActionMessage(formErrorMessage);
		} else if (updatePasswordResults.message === 'reusedPassword') {
			setErrorForm({ ...errorForm, newPassword: true });
			setNewPasswordErrorMessage('New password is same as the old password. Please try again');
		} else if (updatePasswordResults.message === 'incorrectPassword') {
			setErrorForm({ ...errorForm, existingPassword: true });
			setExistingPasswordErrorMessage('Incorrect Password');
		}

		if (isFormValid) {
			isSuccess = updatePasswordResults.boolean;
		}

		if (isSuccess) {
			resetResetForm();
		} else {
			setResetClickedOnce(false);
		}

		// Allows Action Messages to only be visble for 5 seconds
		const timer = setTimeout(() => {
			setActionMessage('timeout');
		}, 5000);
		return () => clearTimeout(timer);
	};

	const resetResetForm = () => {
		setResetPasswordForm(initialForm);
		setErrorForm(initialErrorForm);
		setChangesMade({
			existingPassword: false,
			newPassword: false,
			confirmPassword: false,
		});
		setResetClickedOnce(false);
	};

	const handleCancel = () => {
		resetResetForm();
		dispatch({ type: actionTypes.RESET_PASSWORD_MODAL_OPEN, payload: false });
	};

	const formValidation = () => {
		let existingPasswordValid = resetPasswordForm.existingPassword !== '';
		let newPasswordValid = resetPasswordForm.newPassword !== '';
		let confirmPasswordValid = resetPasswordForm.confirmPassword !== '';

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

		if (!isPassValid.test(resetPasswordForm.newPassword)) {
			setShowPasswordRules(true);
			newPasswordValid = false;
		}

		// Validates password fields match
		if (resetPasswordForm.confirmPassword !== resetPasswordForm.newPassword) {
			confirmPasswordValid = false;
			setActionMessage(passwordMismatch);
		}

		const errorFields = {
			existingPassword: !existingPasswordValid,
			newPassword: !newPasswordValid,
			confirmPassword: !confirmPasswordValid,
		};

		setErrorForm(errorFields);
		setExistingPasswordErrorMessage('Existing password required.');
		setNewPasswordErrorMessage('Please enter a valid password.');

		// Validates form field entries
		if (existingPasswordValid && newPasswordValid && confirmPasswordValid) {
			return true;
		} else {
			return false;
		}
	};

	return (
		<>
			<Modal
				open={notifyAdminModal}
				size='small'
				closeIcon
				onClose={() => {
					resetResetForm();
					setActionMessage('');
					setNotifyAdminModal(false);
					dispatch({ type: actionTypes.RESET_PASSWORD_MODAL_OPEN, payload: false });
					dispatch({ type: actionTypes.RESET_SELECTED_USER, payload: { selectedUser: '', currentUser: '' } }); // remove user information
				}}
				closeOnDimmerClick={false}
			>
				<Modal.Content>
					<Message info>
						<p>
							Provide the temporary password to the user and with a notification that the user must reset their password by logging in
							with this credential before it expires in 48 hours.
						</p>
					</Message>
				</Modal.Content>
			</Modal>
			<Modal
				open={resetPasswordModalOpen}
				size='small'
				closeIcon
				onClose={() => {
					resetResetForm();
					setActionMessage('');
					setNotifyAdminModal(false);
					dispatch({ type: actionTypes.RESET_PASSWORD_MODAL_OPEN, payload: false });
					dispatch({ type: actionTypes.RESET_SELECTED_USER, payload: { selectedUser: '', currentUser: '' } }); // remove user information
				}}
				closeOnDimmerClick={false}
			>
				<Modal.Header>Reset Password</Modal.Header>
				<Modal.Content>
					<Modal.Description>
						<Form>
							{adminResetWorkflow ? null : (
								<Form.Group>
									<Form.Input
										label='Existing Password'
										placeholder='Password'
										type='password'
										required={true}
										value={resetPasswordForm.existingPassword}
										onChange={(e, d) => {
											setChangesMade({
												...changesMade,
												existingPassword: true,
											});
											setResetPasswordForm({
												...resetPasswordForm,
												existingPassword: d.value,
											});
											if (d.value === '') {
												setChangesMade({
													...changesMade,
													existingPassword: false,
												});
											}
											if (resetClickedOnce) {
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
							)}
							<Form.Group widths='equal'>
								<Form.Input
									label='New Password'
									placeholder='Password'
									type='password'
									required={true}
									value={resetPasswordForm.newPassword}
									onChange={(e, d) => {
										setChangesMade({ ...changesMade, newPassword: true });
										setResetPasswordForm({
											...resetPasswordForm,
											newPassword: d.value,
										});
										if (d.value === '') {
											setChangesMade({ ...changesMade, newPassword: false });
										}
										if (resetClickedOnce) {
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
										errorForm.newPassword && {
											content: newPasswordErrorMessage,
											pointing: 'below',
										}
									}
								/>
								<Form.Input
									label='Confirm New Password'
									placeholder='Confirm Password'
									type='password'
									required={true}
									value={resetPasswordForm.confirmPassword}
									onChange={(e, d) => {
										setChangesMade({
											...changesMade,
											confirmPassword: true,
										});
										setResetPasswordForm({
											...resetPasswordForm,
											confirmPassword: d.value,
										});
										if (d.value === '') {
											setChangesMade({ ...changesMade, confirmPassword: false });
										}
										if (resetClickedOnce) {
											formValidation();
										}
									}}
									error={
										// check if passwords match, otherwise it's invalid if empty
										(resetPasswordForm.confirmPassword !== resetPasswordForm.newPassword && {
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
							{showPasswordRules ? (
								<List>
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
							<p>Your password was updated successfully.</p>
						</Message>
					) : actionMessage === invalidPassword ? (
						<Message error>
							<p>Please enter the correct password.</p>
						</Message>
					) : actionMessage === passwordMismatch ? (
						<Message error>
							<p>Please ensure that passwords match.</p>
						</Message>
					) : actionMessage === formInvalid ? (
						<Message error>
							<p>
								<b>Invalid Form </b>
								<br />
								Please verify fields are entered correctly.
							</p>
						</Message>
					) : actionMessage === formErrorMessage ? (
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
						disabled={changesMade.existingPassword && changesMade.newPassword && changesMade.confirmPassword ? false : true}
						primary
						onClick={() => {
							adminResetWorkflow ? handleAdminResetPassword() : handleResetPassword();
						}}
					>
						Reset
					</Button>
				</Modal.Actions>
			</Modal>
		</>
	);
};

export default ResetPasswordModal;
