import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { Modal, Button, Form, Header, Message, List } from 'semantic-ui-react';
import { setLogOut } from '../Util/localStorageUtil';
import { setActiveTab } from '../Navigation/HeaderNavMenu';
import { encryptPassword } from '../Util/PasswordUtil';
import { sysAdmin, superAdmin } from '../Shared/roles';
import { handleError, trackedErrorSources } from '../Util/ErrorHandleUtil';

const UserManagementModal = () => {
	const initialForm = {
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
	};

	const initialErrorForm = {
		firstName: false,
		lastName: false,
		email: false,
		phone: false,
		password: false,
		confirmPassword: false,
	};

	const isUserManagementModalOpen = useSelector((state) => state.userManagement.isUserManagementModalOpen);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);
	const [addUserForm, setAddUserForm] = useState(initialForm);
	const [errorForm, setErrorForm] = useState(initialErrorForm);
	const [addClickedOnce, setAddClickedOnce] = useState(false);
	const [actionMessage, setActionMessage] = useState('');
	const [showPasswordRules, setShowPasswordRules] = useState(false);

	// Action Message Values
	const addSuccessful = 'addSuccessful';
	const deleteSuccessful = 'deleteSuccessful';
	const duplicateUser = 'duplicateUser';
	const formInvalid = 'formInvalid';
	const errorMessage = 'errorMessage';

	const dispatch = useDispatch();

	const formatCurrentDate = () => {
		const date = new Date();
		const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
		return formattedDate;
	};

	const addUsersApi = async () => {
		if (!systemErrorOccurred) {
			const encryptedPass = await encryptPassword(addUserForm.password);
			const currentDate = formatCurrentDate();
			return axios
				.post(baseURL + 'User/create', {
					userData: {
						first_name: addUserForm.firstName,
						last_name: addUserForm.lastName,
						email: addUserForm.email,
						phone: addUserForm.phone,
						user_role: superAdmin, // this modal will only create SuperAdmins
						login_attempts: 0,
						salt: encryptedPass.salt,
						hash: encryptedPass.hash,
						password_created: currentDate,
						account_pending: false,
						account_denied: false,
						account_locked: false,
						account_revoked: false,
						status_change_reason: '',
						forceLogOut: false,
					},
					auditUser: sysAdmin,
				})
				.then((response) => {
					if (response.status === 200) {
						setActionMessage(addSuccessful);
						return true;
					}
				})
				.catch((error) => {
					if (error.response.status === 409) {
						// User already exists
						console.log(error);
						setActionMessage(duplicateUser);
						return false;
					} else {
						handleError(error, trackedErrorSources.user);
						setActionMessage(errorMessage);
						return false;
					}
				});
		} else {
			return false;
		}
	};

	const formValidation = () => {
		let firstNameValid = addUserForm.firstName !== '';
		let lastNameValid = addUserForm.lastName !== '';
		let emailValid = addUserForm.email !== '';
		let phoneValid = addUserForm.phone !== '';
		let passwordValid = addUserForm.password !== '';
		let confirmPasswordValid = addUserForm.confirmPassword !== '' && addUserForm.confirmPassword === addUserForm.password;

		// Validates email address
		if (addUserForm.email.indexOf('@') === -1 || addUserForm.email.indexOf('.') === -1) {
			emailValid = false;
		}

		// Validates phone number with area code
		/* Note: The regex below for the phone number allows the following phone number formats:
            1234567890
            123-456-7890
            (123) 456-7890
            123 456 7890
            123.456.7890
		    +91 (123) 456-7890
        */
		if (!addUserForm.phone.match(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)) {
			phoneValid = false;
		}

		const isPassValid = new RegExp(
			/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/])[A-Za-z\d`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]{8,}/,
			'g'
		);

		if (!isPassValid.test(addUserForm.password)) {
			setShowPasswordRules(true);
			passwordValid = false;
		}

		// Validates password fields match
		if (addUserForm.confirmPassword !== addUserForm.password) {
			confirmPasswordValid = false;
		}

		const errorFields = {
			firstName: !firstNameValid,
			lastName: !lastNameValid,
			email: !emailValid,
			phone: !phoneValid,
			password: !passwordValid,
			confirmPassword: !confirmPasswordValid,
		};

		setErrorForm(errorFields);

		// Validates form field entries
		if (firstNameValid && lastNameValid && emailValid && phoneValid && passwordValid && confirmPasswordValid) {
			return true;
		} else {
			return false;
		}
	};

	async function handleAddUser() {
		const isFormValid = formValidation();
		setAddClickedOnce(true);

		let isSuccess = false;

		if (isFormValid) {
			isSuccess = await addUsersApi();
		} else {
			setActionMessage(formInvalid);
		}

		if (isSuccess) {
			resetUserMangementFields();
		}

		// Allows User Added/Action failed message to only be visble for 5 seconds
		const timer = setTimeout(() => {
			setActionMessage('');
		}, 5000);
		return () => clearTimeout(timer);
	}

	const resetUserMangementFields = () => {
		setAddUserForm(initialForm);
		setErrorForm(initialErrorForm);
		setAddClickedOnce(false);
	};

	return (
		<>
			<Modal
				open={isUserManagementModalOpen}
				size='small'
				closeIcon
				onClose={() => {
					dispatch({ type: actionTypes.USER_MANAGEMENT_MODAL_OPEN });
					resetUserMangementFields();
					setActionMessage('');
					setLogOut(dispatch);
					setActiveTab('MyHome');
				}}
				closeOnDimmerClick={false}
			>
				<Modal.Header>{sysAdmin} User Management</Modal.Header>
				<Modal.Content>
					<Modal.Description>
						{/*Add New User Setion*/}
						<Header>Add New {superAdmin}</Header>
						<Form>
							<Form.Group widths='equal'>
								<Form.Input
									label='First Name'
									placeholder='First Name'
									required={true}
									value={addUserForm.firstName}
									onChange={(e, d) => {
										setAddUserForm({
											...addUserForm,
											firstName: d.value,
										});
										if (addClickedOnce) {
											formValidation();
										}
									}}
									error={
										errorForm.firstName &&
										addClickedOnce && {
											content: 'First Name required',
											pointing: 'below',
										}
									}
								/>
								<Form.Input
									label='Last Name'
									placeholder='Last Name'
									required={true}
									value={addUserForm.lastName}
									onChange={(e, d) => {
										setAddUserForm({
											...addUserForm,
											lastName: d.value,
										});
										if (addClickedOnce) {
											formValidation();
										}
									}}
									error={
										errorForm.lastName &&
										addClickedOnce && {
											content: 'Last Name required',
											pointing: 'below',
										}
									}
								/>
							</Form.Group>
							<Form.Group widths='equal'>
								<Form.Input
									label='Email'
									placeholder='Email'
									required={true}
									value={addUserForm.email}
									onChange={(e, d) => {
										setAddUserForm({
											...addUserForm,
											email: d.value,
										});
										if (addClickedOnce) {
											formValidation();
										}
									}}
									error={
										errorForm.email &&
										addClickedOnce && {
											content: 'Please enter a valid email address',
											pointing: 'below',
										}
									}
								/>
								<Form.Input
									label='Phone'
									placeholder='Phone'
									required={true}
									value={addUserForm.phone}
									onChange={(e, d) => {
										setAddUserForm({
											...addUserForm,
											phone: d.value,
										});
										if (addClickedOnce) {
											formValidation();
										}
									}}
									error={
										errorForm.phone &&
										addClickedOnce && {
											content: 'Please enter a valid phone number with area code.',
											pointing: 'below',
										}
									}
								/>
							</Form.Group>
							<Form.Group widths='equal'>
								<Form.Input
									label='Password'
									placeholder='Password'
									type='password'
									required={true}
									value={addUserForm.password}
									onChange={(e, d) => {
										setAddUserForm({
											...addUserForm,
											password: d.value,
										});
										if (addClickedOnce) {
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
										(addUserForm.confirmPassword !== addUserForm.password &&
											addClickedOnce && {
												content: 'Passwords do not match',
												pointing: 'below',
											}) ||
										(errorForm.password &&
											addClickedOnce && {
												content: 'Please enter a valid password',
												pointing: 'below',
											})
									}
								/>
								<Form.Input
									label='Confirm Password'
									placeholder='Confirm Password'
									type='password'
									required={true}
									value={addUserForm.confirmPassword}
									onChange={(e, d) => {
										setAddUserForm({
											...addUserForm,
											confirmPassword: d.value,
										});
										if (addClickedOnce) {
											formValidation();
										}
									}}
									error={
										// invalid if empty. passwords dont match otherwise
										(addUserForm.confirmPassword !== addUserForm.password &&
											addClickedOnce && {
												content: 'Passwords do not match',
												pointing: 'below',
											}) ||
										(addUserForm.confirmPassword === '' &&
											addClickedOnce && {
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
						<Button
							className='primaryButton'
							onClick={() => {
								handleAddUser();
							}}
						>
							Add
						</Button>
					</Modal.Description>
					{/*Add/Delete User Message Section*/}
					{actionMessage === addSuccessful ? (
						<Message success>User successfully added.</Message>
					) : actionMessage === deleteSuccessful ? (
						<Message success>User(s) successfully removed.</Message>
					) : actionMessage === duplicateUser && addClickedOnce ? (
						<Message error>
							<p>
								<b>User Already Exists</b>
								<br />A user with the email '{addUserForm.email}' already exists.
							</p>
						</Message>
					) : actionMessage === formInvalid && addClickedOnce ? (
						<Message error>
							<p>
								<b>Invalid Form </b>
								<br />
								Please verify fields are entered correctly.
							</p>
						</Message>
					) : actionMessage === errorMessage && addClickedOnce ? (
						<Message error>
							<p>
								<b>Action failed</b>
								<br />
								Please try again.
							</p>
						</Message>
					) : null}
				</Modal.Content>
			</Modal>
		</>
	);
};

export default UserManagementModal;
