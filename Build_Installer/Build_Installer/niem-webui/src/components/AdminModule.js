import { React, useCallback, useEffect, useState } from 'react';
import { Button, Table, Icon, Message, Tab, Label, Card, Grid, Modal, Dropdown } from 'semantic-ui-react';
import MaterialTable, { MTableToolbar } from 'material-table';
import { TableIcons } from '../Shared/MaterialTableGridSettings';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import AdminModuleModal from '../Shared/AdminModuleModal';
import AccessControl from '../Shared/AccessControl';
import { editUser, deleteUser, addUser, handleStatusChange, getAllUserPackagesApi, status, userStatusArray } from '../Util/AdminModuleUtil';
import { adminWorkflowType } from '../Util/AdminModuleUtil';
import Tooltip from '../Shared/Tooltip.js';
import * as tooltipContent from '../Shared/TooltipContent.js';
import * as roles from '../Shared/roles';
import { sysAdmin, superAdmin } from '../Shared/roles';
import ProgressBarModal from '../Shared/ProgressBarModal';
import { getLatestRelease } from '../Navigation/TopNavMenu';
import { updateReleaseViaNiem, checkAvailableReleases, getReleaseProgressStatus, getLoadedReleases } from '../Util/LoadNiemDataUtil.js';
import TransferPackagesModal from '../Shared/TransferPackagesModal.js';
import ApiErrorNotification from '../Shared/ApiErrorNotification.js';
import { isStringFieldValid } from '../Util/FieldValidationUtil.js';
import LoaderModal from '../Shared/LoaderModal.js';
import { handleError, trackedErrorSources } from '../Util/ErrorHandleUtil.js';
import AuditLogs from './AuditLogs.js';

const AdminModule = () => {
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.session.userId);
	const userPermissions = useSelector((state) => state.session.userPermissions);
	const showUpdateSuccessMessage = useSelector((state) => state.admin.showUpdateSuccessMessage);
	const listOfAllUsers = useSelector((state) => state.admin.listOfAllUsers);
	const listOfPendingUsers = useSelector((state) => state.admin.listOfPendingUsers);
	const permissionError = useSelector((state) => state.admin.permissionError);
	const deleteSelfError = useSelector((state) => state.admin.deleteSelfError);
	const deleteWithPackages = useSelector((state) => state.admin.deleteWithPackages);
	const validationError = useSelector((state) => state.admin.validationError);
	const emailExists = useSelector((state) => state.admin.emailExists);
	const fNameError = useSelector((state) => state.admin.fNameError);
	const lNameError = useSelector((state) => state.admin.lNameError);
	const orgError = useSelector((state) => state.admin.orgError);
	const emailError = useSelector((state) => state.admin.emailError);
	const phoneError = useSelector((state) => state.admin.phoneError);
	const roleError = useSelector((state) => state.admin.roleError);
	const loadedReleases = useSelector((state) => state.data.loadedReleases);
	const transferedPackageCount = useSelector((state) => state.transfer.transferedPackageCount);
	const apiErrorDetails = useSelector((state) => state.error.apiErrorDetails);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);
	const [isUpdateNiemReleaseModalOpen, setIsUpdateNiemReleaseModalOpen] = useState(false);
	const [showUpdateAvailableCard, setShowUpdateAvailableCard] = useState(false);
	const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
	const [currentRelease, setCurrentRelease] = useState('');
	const [latestRelease, setLatestRelease] = useState('');
	const [progressActive, setProgressActive] = useState(false);
	const [packagesCountByUser, setPackagesCountByUser] = useState({});
	const [label, setLabel] = useState('Loading NIEM data... ');
	const [value, setValue] = useState(0);
	const [total, setTotal] = useState(0);
	const [isLoadingActive, setIsLoadingActive] = useState(false);

	useEffect(() => {
		const setDefaultRelease = async () => {
			const release = await getLatestRelease();
			setCurrentRelease(release);
		};

		setDefaultRelease();
	}, [loadedReleases]);

	useEffect(() => {
		if (progressActive === true) {
			const timer = setInterval(async () => {
				// Retrieve Release loading status
				const status = await getReleaseProgressStatus();
				setLabel(status.label);
				setValue(status.value);
				setTotal(status.total);
			}, 5000); // check db every 5 secs

			return () => clearInterval(timer);
		} else {
			// reset values back to default
			setLabel('Loading NIEM data... ');
			setValue(0);
			setTotal(0);
		}
	}, [progressActive]);

	useEffect(async () => {
		// NOTE: Compiler warning here for potential race condition
		if (listOfAllUsers.length > 0) {
			// iterate through the list of users, mapping their userId to the number of pacakges they own
			setIsLoadingActive(true);
			const packagesCountPerUser = {};
			for (const user of listOfAllUsers) {
				// fetch list of user-owned packages
				const response = await getAllUserPackagesApi(user.userId);
				if (response) {
					const userOwnedPackages = response.data.ownedPackages;
					// map the number of packages to the userId of the current user
					packagesCountPerUser[`${user.userId}`] = userOwnedPackages.length;
				} else {
					// error case defaults to 0 to avoid crashing
					packagesCountPerUser[`${user.userId}`] = 0;
				}
			}
			setPackagesCountByUser(packagesCountPerUser);
			setIsLoadingActive(false);
		}
	}, [listOfAllUsers, transferedPackageCount]);

	const getAllUsersApi = () => {
		if (!systemErrorOccurred) {
			return axios
				.get(baseURL + 'User/' + userId)
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error);
				});
		}
	};

	const getAllUsers = useCallback(async () => {
		const users = await getAllUsersApi();
		const userRow = [];

		if (users) {
			// For each user, grab attributes and add to the userRow array
			users.forEach((user, i) => {
				userRow.push({
					key: i,
					userId: user._id,
					firstName: user.first_name,
					lastName: user.last_name,
					organization: user.organization,
					email: user.email,
					phone: user.phone,
					role: user.user_role,
					status: user.account_revoked
						? status.revoke
						: user.account_denied
						? 'warning sign'
						: user.account_locked
						? status.lock
						: status.unlock,
					denialReason: user.denial_reason,
					denialDetails: user.denial_details,
					status_change_reason: user.status_change_reason,
				});
			});
		}

		dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_ALL_USERS, payload: userRow });
	}, [dispatch, userId]);

	const getPendingUsersApi = () => {
		if (!systemErrorOccurred) {
			return axios
				.get(baseURL + 'User/pending/' + userId)
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error);
				});
		}
	};

	const getPendingUsers = useCallback(async () => {
		const users = await getPendingUsersApi();
		const userRow = [];

		if (users) {
			// For each user, grab attributes and add to the userRow array
			users.forEach((user, i) => {
				userRow.push({
					key: i,
					userId: user._id,
					firstName: user.first_name,
					lastName: user.last_name,
					organization: user.organization,
					email: user.email,
					phone: user.phone,
					role: user.user_role,
					status: user.account_denied ? 'warning sign' : user.account_locked ? 'lock' : 'unlock',
				});
			});
		}

		dispatch({ type: actionTypes.ADMIN_UPDATE_LIST_OF_PENDING_USERS, payload: userRow });
	}, [dispatch, userId]);

	useEffect(() => {
		let isMounted = true;
		if (isMounted) {
			getAllUsers();
			getPendingUsers();
		}
		return () => {
			isMounted = false; // use effect cleanup to set flag false, if unmounted
		};
	}, [getAllUsers, getPendingUsers, userId]); // dependencies changed in NIEM 633, should still run on page load as function reference values are set on first load

	const renderPendingUsersRows = () => {
		return listOfPendingUsers.map((row, i) => {
			return (
				<Table.Row key={i}>
					<Table.Cell>{row.firstName}</Table.Cell>
					<Table.Cell>{row.lastName}</Table.Cell>
					<Table.Cell>{row.organization}</Table.Cell>
					<Table.Cell>{row.email}</Table.Cell>
					<Table.Cell>{row.phone} </Table.Cell>
					<Table.Cell textAlign='center'>
						<Icon
							name='check'
							color='green'
							size='large'
							onClick={() => {
								dispatch({ type: actionTypes.ADMIN_MODULE_UPDATE_PENDING_USER_DATA, payload: row });
								dispatch({ type: actionTypes.ADMIN_MODULE_MODAL_OPEN, payload: true });
								dispatch({ type: actionTypes.ADMIN_MODULE_UPDATE_WORKFLOW, payload: adminWorkflowType.approveUser });
							}}
						/>
					</Table.Cell>
					<Table.Cell textAlign='center'>
						<Icon
							name='close'
							color='red'
							size='large'
							onClick={() => {
								dispatch({ type: actionTypes.ADMIN_MODULE_UPDATE_PENDING_USER_DATA, payload: row });
								dispatch({ type: actionTypes.ADMIN_MODULE_MODAL_OPEN, payload: true });
								dispatch({ type: actionTypes.ADMIN_MODULE_UPDATE_WORKFLOW, payload: adminWorkflowType.denyUser });
							}}
						/>
					</Table.Cell>
				</Table.Row>
			);
		});
	};

	const accessToResetModal = (selectedUserId) => {
		dispatch({ type: actionTypes.RESET_PASSWORD_MODAL_OPEN, payload: true });
		dispatch({
			type: actionTypes.RESET_SELECTED_USER,
			payload: { selectedUser: selectedUserId, currentUser: userId },
		});
		dispatch({
			type: actionTypes.ADMIN_MODULE_UPDATE_WORKFLOW,
			payload: adminWorkflowType.passwordReset,
		});
	};

	const UpdateNiemReleaseModal = () => {
		return (
			<Modal open={isUpdateNiemReleaseModalOpen} size='mini'>
				<Modal.Header>Update NIEMOpen Release</Modal.Header>
				<Modal.Content>
					<Modal.Description>
						<p>
							You are about to update the MEP Builder from NIEMOpen release <b>{currentRelease}</b> to <b>{latestRelease}</b>.
						</p>
						<p>
							<b>Do you wish to proceed?</b>
						</p>

						<Message info>
							<Message.Header>Please Note</Message.Header>
							<p>This update may take several minutes. Once started, please do not exit or refresh the MEP Builder.</p>
						</Message>
					</Modal.Description>
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='secondaryButton'
						onClick={() => {
							setIsUpdateNiemReleaseModalOpen(false);
						}}
					>
						No, Cancel
					</Button>
					<Button
						className='primaryButton'
						onClick={() => {
							setProgressActive(true);
							setIsUpdateNiemReleaseModalOpen(false);
							setShowUpdateAvailableCard(false);
							updateRelease();
						}}
					>
						Yes, Update
					</Button>
				</Modal.Actions>
			</Modal>
		);
	};

	const checkForNewRelease = async () => {
		const releases = await checkAvailableReleases();
		if (releases) {
			const latestAvailableRelease = releases[releases.length - 1];
			setShowUpdateAvailableCard(true);
			if (currentRelease !== latestAvailableRelease) {
				setLatestRelease(latestAvailableRelease);
				setIsUpdateAvailable(true);
			} else {
				setIsUpdateAvailable(false);
			}
		} else {
			// temporary solution until UI error messaging is implemented
			setShowUpdateAvailableCard(true);
			setIsUpdateAvailable(false);
		}
	};

	const updateRelease = async () => {
		await updateReleaseViaNiem(userId, currentRelease);
		const releases = await getLoadedReleases();
		if (releases) {
			dispatch({ type: actionTypes.FORCE_BROWSER_REFRESH, payload: true });
			dispatch({ type: actionTypes.LOADED_RELEASES, payload: releases });
			window.location.reload(); // after releases are loaded into the db, refresh application for changes to apply
		}
	};

	const panes = [
		{
			// ----------- Pending Users ----------- //
			menuItem: [
				<>
					<Label color='blue' size='large' horizontal>
						{listOfPendingUsers.length}
					</Label>
					<p>Pending Users</p>
				</>,
			],
			render: () => (
				<Tab.Pane>
					{showUpdateSuccessMessage ? (
						<Message success onDismiss={() => dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false })}>
							<Message.Header>Update Successful</Message.Header>
							<p>The database has successfully been updated.</p>
						</Message>
					) : null}
					<Table basic='very'>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell width={2}>First Name</Table.HeaderCell>
								<Table.HeaderCell width={2}>Last Name</Table.HeaderCell>
								<Table.HeaderCell width={3}>Organization</Table.HeaderCell>
								<Table.HeaderCell width={3}>Email</Table.HeaderCell>
								<Table.HeaderCell width={2}>Phone</Table.HeaderCell>
								<Table.HeaderCell width={1} textAlign='center'>
									Approve
								</Table.HeaderCell>
								<Table.HeaderCell width={1} textAlign='center'>
									Deny
								</Table.HeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>{renderPendingUsersRows()}</Table.Body>
					</Table>
				</Tab.Pane>
			),
		},
		{
			// ----------- All Users ----------- //
			menuItem: 'All Users',
			render: () => (
				<Tab.Pane>
					{emailExists ? (
						<Message error onDismiss={() => dispatch({ type: actionTypes.ADMIN_UPDATE_EMAIL_EXISTS_ERROR, payload: false })}>
							<Message.Header>User already exists.</Message.Header>
							<p>A user with this email address already exists.</p>
						</Message>
					) : permissionError ? (
						<Message error onDismiss={() => dispatch({ type: actionTypes.ADMIN_UPDATE_PERMISSION_ERROR, payload: false })}>
							<Message.Header>Update Permission Denied.</Message.Header>
							<p>Your current role does not have permission to edit users with an elevated role.</p>
						</Message>
					) : deleteSelfError ? (
						<Message error onDismiss={() => dispatch({ type: actionTypes.ADMIN_UPDATE_PERMISSION_ERROR, payload: false })}>
							<Message.Header>Delete Permission Denied.</Message.Header>
							<p>You may not delete your own user account.</p>
						</Message>
					) : deleteWithPackages ? (
						<Message error onDismiss={() => dispatch({ type: actionTypes.ADMIN_UPDATE_DELETE_USER_WITH_PACKAGES_ERROR, payload: false })}>
							<Message.Header>Delete Permission Denied.</Message.Header>
							<p>
								You may not delete a user that has packages. You must first transfer this user's packages to another user before
								proceeding with deletion.
							</p>
						</Message>
					) : validationError ? (
						<Message error onDismiss={() => dispatch({ type: actionTypes.ADMIN_UPDATE_VALIDATION_ERROR, payload: false })}>
							<Message.Header>Invalid Fields.</Message.Header>
							<p>Please correct the following invalid required fields:</p>
							<ul>
								{fNameError ? <li>First Name</li> : null}
								{lNameError ? <li>Last Name</li> : null}
								{orgError ? <li>Organization</li> : null}
								{emailError ? <li>Email Address</li> : null}
								{phoneError ? <li>Phone Number</li> : null}
								{roleError ? (
									<li>Role - Accepted roles include: User, Admin, SuperAdmin. A user cannot be set to the SysAdmin role.</li>
								) : null}
							</ul>
						</Message>
					) : showUpdateSuccessMessage ? (
						<Message success onDismiss={() => dispatch({ type: actionTypes.ADMIN_UPDATE_SUCCESS_MESSAGE, payload: false })}>
							<Message.Header>Update Successful</Message.Header>
							<p>The database has successfully been updated.</p>
						</Message>
					) : null}
					{!!transferedPackageCount ? (
						<Message
							success
							header='Package Transfer Successful'
							content={
								<p>
									Your package transfer of <strong>{transferedPackageCount} packages</strong> has been successfully completed
								</p>
							}
						/>
					) : apiErrorDetails.errorSource === trackedErrorSources.transfer ? (
						// displays specific transfer error message
						<ApiErrorNotification />
					) : null}
					<MaterialTable
						title='All Users TEST'
						icons={TableIcons}
						columns={[
							{},
							{
								title: 'Status',
								field: 'status',
								render: (rowData) => (
									<Tooltip
										content={
											rowData.status === status.lock
												? tooltipContent.lockedAccountIcon
												: rowData.status === status.unlock
												? tooltipContent.unlockedLockedIcon
												: rowData.status === status.revoke
												? tooltipContent.revokedAccountIcon
												: tooltipContent.accountDeniedIcon
										}
										position='bottom center'
										trigger={
											<div className='adminStatusIcon'>
												<Icon
													name={rowData.status === status.revoke ? 'user x' : rowData.status}
													className='lockedStatus'
													size='large'
												/>
											</div>
										}
									/>
								),
								editComponent: (rowData) => {
									const statusOptions = userStatusArray.map((status) => ({
										key: status,
										value: status,
										text: status.replace(status.charAt(0), status.charAt(0).toUpperCase()),
									}));
									return (
										<Dropdown
											defaultValue={rowData.rowData.status}
											fluid
											selection
											options={statusOptions}
											onChange={(e, d) => {
												handleStatusChange(rowData, d.value);
											}}
										/>
									);
								},
							},
							{
								title: 'First Name',
								field: 'firstName',
							},
							{
								title: 'Last Name',
								field: 'lastName',
							},
							{
								title: 'Organization',
								field: 'organization',
							},
							{
								title: 'Email',
								field: 'email',
							},
							{
								title: 'Phone',
								field: 'phone',
							},
							{
								title: 'Role',
								field: 'role',
								editComponent: (rowData) => {
									const roleOptions = roles.userRolesArray.map((role) => ({ key: role, value: role, text: role }));
									return (
										<Dropdown
											defaultValue={rowData.rowData.role}
											fluid
											selection
											options={roleOptions}
											onChange={(e, d) => (rowData.rowData.role = d.value)}
										/>
									);
								},
							},
						]}
						data={listOfAllUsers}
						options={{
							exportButton: false,
							columnsButton: false,
							showFirstLastPageButtons: false,
							search: false,
							paging: true,
							pageSize: 10,
							showTitle: false,
							toolbarButtonAlignment: 'left',
							filtering: true,
							addRowPosition: 'first',
							maxBodyHeight: 800,
							rowStyle: (rowData, index) => {
								if (index % 2 === 0) {
									return { backgroundColor: '#f2f2f2f2' };
								}
							},
						}}
						actions={[
							(rowData) => {
								return {
									icon: () => (
										<Button
											className={'secondaryButton ' + (packagesCountByUser[rowData.userId] === 0 ? '' : 'TransferAvailable')}
											fluid
											disabled={packagesCountByUser[rowData.userId] === 0}
											content={packagesCountByUser[rowData.userId] === 0 ? 'No Packages to Transfer' : 'Transfer Packages'}
										/>
									),
									isCustom: true,
									isFreeAction: false,
									disabled: packagesCountByUser[rowData.userId] === 0,
									onClick: (e, user) => {
										dispatch({ type: actionTypes.UPDATE_PACKAGE_TRANSFER_FROM_USER, payload: user });
										dispatch({
											type: actionTypes.UPDATE_NUMBER_OF_PACKAGES_TO_TRANSFER,
											payload: packagesCountByUser[user.userId],
										});
										dispatch({ type: actionTypes.TRANSFER_PACKAGES_MODAL_OPEN, payload: true });
									},
								};
							},
							{
								icon: () => <Button fluid content='Reset Password' className='secondaryButton' />,
								isCustom: true,
								isFreeAction: false,
								onClick: (e, user) => {
									if (user.role === sysAdmin && userPermissions.includes('write:resetSysAdminPassword')) {
										accessToResetModal(user.userId);
									} else if (user.role === superAdmin && userPermissions.includes('write:editSuperAdmin')) {
										accessToResetModal(user.userId);
									} else if (
										user.role !== sysAdmin &&
										user.role !== superAdmin &&
										userPermissions.includes('write:resetNonSysAdminPasswords')
									) {
										accessToResetModal(user.userId);
									} else {
										dispatch({ type: actionTypes.ADMIN_UPDATE_PERMISSION_ERROR, payload: true });
									}
								},
							},
						]}
						components={{
							Toolbar: (props) => (
								<div style={{ backgroundColor: '#e8eaf5' }}>
									<MTableToolbar {...props} />
								</div>
							),
						}}
						editable={{
							isEditable: () => true,
							isDeletable: () => (userPermissions.includes('write:deleteUsers') ? true : false),
							onRowAdd: (newData) =>
								new Promise((resolve) => {
									setTimeout(() => {
										addUser(newData, listOfAllUsers, userPermissions);
										resolve();
									}, 1000);
								}),
							onRowUpdate: (newData, oldData) =>
								new Promise((resolve) => {
									setTimeout(() => {
										editUser(newData, oldData, listOfAllUsers, oldData.tableData.id, userPermissions);
										resolve();
									}, 1000);
								}),
							onRowDelete: (oldData) =>
								new Promise((resolve) => {
									setTimeout(() => {
										deleteUser(oldData, listOfAllUsers, oldData.tableData.id, userPermissions);
										resolve();
									}, 1000);
								}),
						}}
					/>
				</Tab.Pane>
			),
		},
		{
			// ----------- Contact Submissions ----------- //
			menuItem: 'Contact Submissions',
			render: () => (
				<Tab.Pane>
					<Message info>
						<Message.Header>This functionality is not currently operational.</Message.Header>
						<p>This demonstrates the visibility of this tab based on the current user role.</p>
					</Message>
				</Tab.Pane>
			),
		},
		userPermissions.includes('control:auditLogs')
			? {
					// ----------- Audit Logs ----------- //
					menuItem: 'Audit Logs',
					render: () => (
						<AccessControl userPermissions={userPermissions} allowedPermissions={['control:auditLogs']}>
							<Tab.Pane>
								<AuditLogs />
							</Tab.Pane>
						</AccessControl>
					),
			  }
			: null,
		{
			// ----------- Update Release ----------- //
			menuItem: 'Release',
			render: () => (
				<Tab.Pane>
					<p>
						Here, you may check for the latest NIEMOpen release and update the MEP Builder. For information, please click{' '}
						<a className='basicLink' href='https://niem.github.io/niem-releases/' target='_blank' rel='noreferrer'>
							here
						</a>
						.
					</p>
					<Grid.Column>
						<Card>
							<Card.Content textAlign='center'>
								<p style={{ float: 'left' }}>
									<b>Current Release</b>
								</p>
								<p style={{ float: 'right' }}>{currentRelease}</p>

								<Button
									fluid
									className='primaryButton'
									onClick={() => {
										checkForNewRelease();
									}}
								>
									Check for update
								</Button>
							</Card.Content>
						</Card>
						{showUpdateAvailableCard ? (
							<Card>
								{isUpdateAvailable ? (
									<Card.Content textAlign='center'>
										<p style={{ float: 'left' }}>
											<b>Update Available</b>
										</p>
										<p style={{ float: 'right' }}>{latestRelease}</p>

										<Button
											fluid
											className='primaryButton'
											onClick={() => {
												setIsUpdateNiemReleaseModalOpen(true);
											}}
										>
											Update
										</Button>
									</Card.Content>
								) : (
									<Card.Content textAlign='center'>
										<p style={{ float: 'left' }}>
											<b>No Update Available</b>
										</p>
										<p style={{ float: 'left' }}>You are currently using the latest release</p>
									</Card.Content>
								)}
							</Card>
						) : null}
					</Grid.Column>
				</Tab.Pane>
			),
		},
	];

	return (
		<>
			<ProgressBarModal active={progressActive} value={value} total={total} label={label} />
			<LoaderModal active={isLoadingActive} />
			<UpdateNiemReleaseModal />
			<Tab panes={panes} />
			<AdminModuleModal />
			<TransferPackagesModal />
		</>
	);
};

export default AdminModule;
