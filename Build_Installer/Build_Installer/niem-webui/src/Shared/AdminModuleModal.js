import { React, useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Button, Modal, Form, Message } from 'semantic-ui-react';
import {
	adminWorkflowType,
	approvePendingUser,
	denyPendingUser,
	getUserLastEventApi,
	getUserLastStatusChangeApi,
	lockAccount,
	revokeAccount,
	unlockAccount,
} from '../Util/AdminModuleUtil';
import { isStringFieldValid } from '../Util/FieldValidationUtil';
import ResetPasswordModal from './ResetPasswordModal';

const AdminModuleModal = () => {
	const dispatch = useDispatch();
	const adminModuleModalOpen = useSelector((state) => state.admin.adminModuleModalOpen);
	const listOfAllUsers = useSelector((state) => state.admin.listOfAllUsers);
	const listOfPendingUsers = useSelector((state) => state.admin.listOfPendingUsers);
	const pendingUserData = useSelector((state) => state.admin.pendingUserData);
	const currentAllUserData = useSelector((state) => state.admin.currentAllUserData);
	const currentWorkflowType = useSelector((state) => state.admin.workflowType);
	const [denialReason, setDenialReason] = useState('');
	const [denialDetails, setDenialDetails] = useState('');
	const [statusChangeReasonInput, setStatusChangeReasonInput] = useState('');
	const [reasonError, setReasonError] = useState(false);
	const [detailsError, setDetailsError] = useState(false);
	const [statusChangeError, setStatusChangeError] = useState(false);
	const [userName, setUserName] = useState('');
	const [recentActivity, setRecentActivity] = useState({
		eventDate: '',
		actionType: '',
		collection: '',
		denialDetails: '',
		denialReason: '',
		statusChangeDate: '',
		statusChangeReason: '',
		eventAdmin: '',
	});

	const getUserLastEvent = useCallback(
		async (userId) => {
			const activityLogResult = await getUserLastEventApi(userId);
			return activityLogResult;
		},
		[currentAllUserData]
	);

	const getUserLastStatusChange = useCallback(
		async (userId) => {
			const activityLogResult = await getUserLastStatusChangeApi(userId);
			return activityLogResult;
		},
		[currentAllUserData]
	);

	useEffect(() => {
		// only set name when data is loaded into object to prevent rendering errors
		async function getRecentActivity(rowData) {
			const userLastEvent = await getUserLastEvent(rowData.userId);
			const userLastStatusChange = await getUserLastStatusChange(rowData.userId);
			setRecentActivity({
				eventDate: userLastEvent.event_date ? new Date(Date.parse(userLastEvent.event_date)).toUTCString() : '',
				actionType: userLastEvent.event_type ? userLastEvent.event_type : '',
				collection: userLastEvent.collection_name ? userLastEvent.collection_name : '',
				statusChangeDate: userLastStatusChange.event_date ? new Date(Date.parse(userLastStatusChange.event_date)).toUTCString() : '',
				statusChangeReason: rowData.status_change_reason ? rowData.status_change_reason : '',
				denialDetails: rowData.denialDetails ? rowData.denialDetails : '',
				denialReason: rowData.denialReason ? rowData.denialReason : '',
			});
		}

		if (Object.hasOwn(currentAllUserData, 'rowData')) {
			setUserName(`${currentAllUserData.rowData.firstName} ${currentAllUserData.rowData.lastName}`);
			getRecentActivity(currentAllUserData.rowData);
		}
	}, [currentAllUserData, pendingUserData, getUserLastStatusChange, getUserLastEvent]);

	const accountDenialReasons = [
		{
			key: '',
			text: '',
			value: '',
		},
		{
			key: 'Unable to Verify Identity',
			text: 'Unable to Verify Identity',
			value: 'Unable to Verify Identity',
		},
		{
			key: 'Invalid Information',
			text: 'Invalid Information',
			value: 'Invalid Information',
		},
		{
			key: 'Duplicate Account',
			text: 'Duplicate Account',
			value: 'Duplicate Account',
		},
		{
			key: 'Other',
			text: 'Other',
			value: 'Other',
		},
	];

	const handleDenyPendingUser = () => {
		if (isStringFieldValid(denialReason)) {
			setReasonError(false);
		} else {
			setReasonError(true);
		}

		if (isStringFieldValid(denialDetails)) {
			setDetailsError(false);
		} else {
			setDetailsError(true);
		}

		if (isStringFieldValid(denialReason) && isStringFieldValid(denialDetails)) {
			denyPendingUser(listOfAllUsers, pendingUserData, listOfPendingUsers, denialReason, denialDetails);
			setDenialReason('');
			setDenialDetails('');
			setReasonError(false);
			setDetailsError(false);
		}
	};

	async function handleModalActions() {
		var errorOccurred;
		switch (currentWorkflowType) {
			case adminWorkflowType.approveUser:
				approvePendingUser(listOfAllUsers, pendingUserData, listOfPendingUsers);
				break;
			case adminWorkflowType.denyUser:
				handleDenyPendingUser();
				break;
			case adminWorkflowType.lockAccount:
				if (isStringFieldValid(statusChangeReasonInput)) {
					lockAccount(currentAllUserData.rowData, listOfAllUsers, statusChangeReasonInput);
					setStatusChangeReasonInput('');
				} else {
					errorOccurred = true;
					setStatusChangeError(errorOccurred);
				}
				break;
			case adminWorkflowType.unlockAccount:
				if (isStringFieldValid(statusChangeReasonInput)) {
					unlockAccount(currentAllUserData.rowData, listOfAllUsers, statusChangeReasonInput);
					setStatusChangeReasonInput('');
				} else {
					errorOccurred = true;
					setStatusChangeError(errorOccurred);
				}
				break;
			case adminWorkflowType.revokeAccount:
				if (isStringFieldValid(statusChangeReasonInput)) {
					revokeAccount(currentAllUserData.rowData, listOfAllUsers, statusChangeReasonInput);
					setStatusChangeReasonInput('');
				} else {
					errorOccurred = true;
					setStatusChangeError(errorOccurred);
				}
				break;
			case adminWorkflowType.grantAccess:
				unlockAccount(currentAllUserData.rowData, listOfAllUsers);
				break;
			default:
				break;
		}

		if (currentWorkflowType === adminWorkflowType.denyUser && isStringFieldValid(denialReason) && isStringFieldValid(denialDetails)) {
			dispatch({ type: actionTypes.ADMIN_MODULE_MODAL_OPEN, payload: false });
		} else if (
			(currentWorkflowType === adminWorkflowType.lockAccount || currentWorkflowType === adminWorkflowType.unlockAccount) &&
			!errorOccurred
		) {
			dispatch({ type: actionTypes.ADMIN_MODULE_MODAL_OPEN, payload: false });
		} else if (
			currentWorkflowType !== adminWorkflowType.denyUser &&
			currentWorkflowType !== adminWorkflowType.lockAccount &&
			currentWorkflowType !== adminWorkflowType.unlockAccount
		) {
			dispatch({ type: actionTypes.ADMIN_MODULE_MODAL_OPEN, payload: false });
		}
	}

	return currentWorkflowType === adminWorkflowType.passwordReset ? (
		<ResetPasswordModal />
	) : (
		<Modal
			open={adminModuleModalOpen}
			size='tiny'
			onClose={() => {
				dispatch({ type: actionTypes.ADMIN_MODULE_MODAL_OPEN, payload: false });
			}}
			closeOnDimmerClick={false}
		>
			{/* // ------- Modal Header ------- // */}
			<Modal.Header>
				{currentWorkflowType === adminWorkflowType.approveUser
					? adminWorkflowType.approveUser
					: currentWorkflowType === adminWorkflowType.denyUser
					? adminWorkflowType.denyUser
					: currentWorkflowType === adminWorkflowType.lockAccount
					? `${adminWorkflowType.lockAccount} - ${userName}`
					: currentWorkflowType === adminWorkflowType.unlockAccount
					? `${adminWorkflowType.unlockAccount} - ${userName}`
					: currentWorkflowType === adminWorkflowType.revokeAccount
					? `${adminWorkflowType.revokeAccount} - ${userName}`
					: currentWorkflowType === adminWorkflowType.grantAccess
					? adminWorkflowType.grantAccess
					: currentWorkflowType === adminWorkflowType.passwordReset
					? adminWorkflowType.passwordReset
					: null}
			</Modal.Header>
			{/* // ------- Modal Content ------- // */}
			<Modal.Content style={{ paddingBottom: '1px' }}>
				<Message>
					<Message.Header style={{ marginBottom: '0.5em' }}>Recent Activity</Message.Header>
					<Message.Content>
						{currentWorkflowType === adminWorkflowType.revokeAccount && !!recentActivity.eventDate ? (
							<strong>{recentActivity.eventDate}</strong>
						) : (currentWorkflowType === adminWorkflowType.unlockAccount || currentWorkflowType === adminWorkflowType.lockAccount) &&
						  !!recentActivity.statusChangeDate ? (
							<strong>{recentActivity.statusChangeDate}</strong>
						) : null}
						{currentWorkflowType === adminWorkflowType.revokeAccount && !!recentActivity.actionType && !!recentActivity.collection ? (
							<div>
								Performed a{recentActivity.actionType === 'update' ? 'n' : ''} <strong>{recentActivity.actionType}</strong> action in
								the <strong>{recentActivity.collection}</strong> collection
							</div>
						) : (currentWorkflowType === adminWorkflowType.unlockAccount || currentWorkflowType === adminWorkflowType.lockAccount) &&
						  !!recentActivity.statusChangeReason ? (
							<div>{recentActivity.statusChangeReason}</div>
						) : (
							<div>No recent activity found.</div>
						)}
					</Message.Content>
				</Message>
				{currentWorkflowType === adminWorkflowType.approveUser ? (
					<p>Are you sure you wish to approve this user account?</p>
				) : currentWorkflowType === adminWorkflowType.denyUser ? (
					<>
						<Form>
							<p>Please provide a reason for account denial.</p>
							<Form.Dropdown
								label='Select Reason'
								fluid
								selection
								required
								options={accountDenialReasons}
								onChange={(e, d) => setDenialReason(d.value)}
								error={
									reasonError && {
										content: 'Required Field',
										pointing: 'below',
									}
								}
							/>
							<Form.TextArea
								label='Details'
								required
								onChange={(e, d) => setDenialDetails(d.value)}
								error={
									detailsError && {
										content: 'Required Field',
										pointing: 'below',
									}
								}
							/>
						</Form>
					</>
				) : currentWorkflowType === adminWorkflowType.lockAccount ? (
					<p>Please provide an explanation for locking this account.</p>
				) : currentWorkflowType === adminWorkflowType.unlockAccount ? (
					<p>Please provide an explanation for unlocking this account.</p>
				) : currentWorkflowType === adminWorkflowType.revokeAccount ? (
					<p>
						Please provide an explanation for <b>revoking account access</b> for this user.
					</p>
				) : currentWorkflowType === adminWorkflowType.grantAccess ? (
					<p>Account access for this user was previously denied. Are you sure you wish to grant access?</p>
				) : null}
			</Modal.Content>
			{currentWorkflowType === adminWorkflowType.lockAccount ||
			currentWorkflowType === adminWorkflowType.unlockAccount ||
			currentWorkflowType === adminWorkflowType.revokeAccount ||
			currentWorkflowType === adminWorkflowType.grantAccess ? (
				<Modal.Content style={{ paddingTop: '0.5em' }}>
					{currentWorkflowType === adminWorkflowType.grantAccess ? (
						<>
							<p>Reason: {currentAllUserData.denialReason}</p>
							<p>Details: {currentAllUserData.denialDetails}</p>
						</>
					) : null}
					<Form>
						<Form.Field
							className='statusChangeTextInput'
							control='textarea'
							required
							error={
								statusChangeError && {
									content: 'Required Field',
									pointing: 'below',
								}
							}
							label='Description'
							onChange={(e, d) => {
								setStatusChangeReasonInput(e.target.value);
								setStatusChangeError(false);
							}}
						/>
					</Form>
					<br />
					{currentWorkflowType === adminWorkflowType.revokeAccount ? (
						<Message info style={{ marginTop: '1px' }}>
							<Message.Header>Please Note</Message.Header>
							<p>
								Account data will <b>not</b> be deleted. However, this user will no longer be able to log into their account until it
								is unlocked.
							</p>
						</Message>
					) : null}
					{currentWorkflowType === adminWorkflowType.lockAccount ? (
						<p>
							Are you sure you wish to <b>lock</b> this account?
						</p>
					) : currentWorkflowType === adminWorkflowType.unlockAccount ? (
						<p>
							Are you sure you wish to <b>unlock</b> this account and allow this user account access?
						</p>
					) : currentWorkflowType === adminWorkflowType.revokeAccount ? (
						<p>
							Are you sure you wish to <b>revoke account access</b> for this user?
						</p>
					) : null}
				</Modal.Content>
			) : null}

			{/* // ------- Modal Buttons ------- // */}
			<Modal.Actions>
				<Button
					className='primaryButton'
					disabled={
						currentWorkflowType === adminWorkflowType.denyUser
							? !isStringFieldValid(denialDetails)
							: currentWorkflowType === adminWorkflowType.approveUser
							? false
							: !isStringFieldValid(statusChangeReasonInput)
					}
					onClick={handleModalActions}
				>
					{currentWorkflowType === adminWorkflowType.denyUser
						? 'Deny'
						: currentWorkflowType === adminWorkflowType.lockAccount
						? 'Yes, lock'
						: currentWorkflowType === adminWorkflowType.unlockAccount
						? 'Yes, unlock'
						: currentWorkflowType === adminWorkflowType.revokeAccount
						? 'Yes, revoke'
						: 'Yes'}
				</Button>
				<Button
					className='secondaryButton'
					onClick={() => {
						dispatch({ type: actionTypes.ADMIN_MODULE_MODAL_OPEN, payload: false });
					}}
				>
					{currentWorkflowType === adminWorkflowType.denyUser ? 'Cancel' : 'No, cancel'}
				</Button>
			</Modal.Actions>
		</Modal>
	);
};

export default AdminModuleModal;
