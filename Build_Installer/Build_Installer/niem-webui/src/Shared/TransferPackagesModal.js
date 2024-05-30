import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Divider, Form, Modal, Select, Table, Checkbox } from 'semantic-ui-react';
import * as actionTypes from '../redux/actions';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { handleError, trackedErrorSources } from '../Util/ErrorHandleUtil';
import { getAllUserPackagesApi } from '../Util/AdminModuleUtil';

const TransferPackagesModal = () => {
	const dispatch = useDispatch();
	const listOfAllUsers = useSelector((state) => state.admin.listOfAllUsers);
	const numberOfPackagesToTransfer = useSelector((state) => state.transfer.numberOfPackagesToTransfer);
	const [transferToUser, setTransferToUser] = useState(JSON.stringify({ firstName: '', lastName: '', userId: '' }));
	const [transferToUserJSON, setTransferToUserJSON] = useState(JSON.parse(transferToUser));
	const transferPackagesModalOpen = useSelector((state) => state.transfer.isTransferPackagesModalOpen);
	const transferFromUser = useSelector((state) => state.transfer.transferFromUser);
	const userId = useSelector((state) => state.session.userId);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);
	const [transferToUserOptions, setTransferToUserOptions] = useState({ key: '0', text: '', value: {} });
	const [packageSelectionViewOpen, setPackageSelectionViewOpen] = useState(false);
	const [userPackages, setUserPackages] = useState([{ packageName: '', isPublished: false }]);
	const [selectAll, setSelectAll] = useState(true);
	const [checkedStates, setCheckedStates] = useState([]);
	const [assignAsPackagePOC, setAssignAsPackagePOC] = useState(true);
	const [POCInputStates, setPOCInputStates] = useState({}); // maps package IDs to intended POC
	const [POCEmailInputStates, setPOCEmailInputStates] = useState({}); // maps packageIDs to intended POC emails
	const [packagesToTransfer, setPackagesToTransfer] = useState([]);

	useEffect(() => {
		setTransferToUserJSON(JSON.parse(transferToUser));
	}, [transferToUser]);

	useEffect(() => {
		// construct dropdown options of transfer-to user
		if (transferFromUser) {
			const transferOptions = listOfAllUsers
				.filter((user) => user.userId !== transferFromUser.userId && user.firstName !== 'Admin' && user.lastName !== 'System')
				.map((user) => {
					return {
						key: `${user.firstName} ${user.lastName}`,
						text: (
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<span>{`${user.firstName} ${user.lastName}`}</span>
								<span style={{ color: '#00000088' }}>{user.email}</span>
							</div>
						),
						value: JSON.stringify(user),
					};
				});
			setTransferToUserOptions(transferOptions);
		}
	}, [listOfAllUsers, transferFromUser]);

	const populatePackageSelectionView = async () => {
		// populate package selection screen
		let unpublished = [];
		let published = [];
		let checkedStateInitalizer = [];
		let POCInputInitializer = {};
		let POCEmailInputInitializer = {};
		const response = await getAllUserPackagesApi(transferFromUser.userId);

		// seperate packages into published and unpublished
		response.data.ownedPackages.forEach((pkg, i) => {
			if (pkg.isPublished) {
				published.push({ ...pkg, key: i });
				checkedStateInitalizer.push({ key: i, checked: true });
				POCInputInitializer[pkg._id] = assignAsPackagePOC ? `${transferToUserJSON.firstName} ${transferToUserJSON.lastName}` : '';
				POCEmailInputInitializer[pkg._id] = assignAsPackagePOC ? `${transferToUserJSON.email}` : '';
			} else {
				unpublished.push({ ...pkg, key: i });
				checkedStateInitalizer.push({ key: i, checked: true });
				POCInputInitializer[pkg._id] = assignAsPackagePOC ? `${transferToUserJSON.firstName} ${transferToUserJSON.lastName}` : '';
				POCEmailInputInitializer[pkg._id] = assignAsPackagePOC ? `${transferToUserJSON.email}` : '';
			}
		});

		// sort alphabetically
		const alphabeticalSort = (packages) => {
			return packages.sort((a, b) => {
				let aText = a.packageName.toLowerCase();
				let bText = b.packageName.toLowerCase();

				if (aText < bText) {
					return -1;
				}

				if (aText > bText) {
					return 1;
				}
				return 0;
			});
		};

		const sortedUnpub = alphabeticalSort(unpublished);
		const sortedPub = alphabeticalSort(published);

		// merge into one array of objects and populate states
		setUserPackages([...sortedPub, ...sortedUnpub]);
		setPackagesToTransfer([...sortedPub, ...sortedUnpub]);
		setCheckedStates(checkedStateInitalizer);
		setPOCInputStates(POCInputInitializer);
		setPOCEmailInputStates(POCEmailInputInitializer);
	};

	const handleSelectAll = (selectAllState) => {
		// update checked state of all items and selected packages
		const updatedStateArray = checkedStates.map((item) => {
			return { ...item, checked: selectAllState };
		});
		selectAllState ? setPackagesToTransfer(userPackages) : setPackagesToTransfer([]);
		setCheckedStates(updatedStateArray);
		setSelectAll(selectAllState);
	};

	const handleCheckedStates = (pkgData, checked) => {
		// update item's checked state, selected packages, and select all checked state
		const updatedStateArray = checkedStates.map((item) => {
			if (item.key === pkgData.key) {
				return { ...item, checked: checked };
			}
			return item;
		});
		if (checked === true) {
			setPackagesToTransfer([...packagesToTransfer, pkgData]);
		} else {
			const updatedPackages = packagesToTransfer.filter((pkg) => {
				return pkg._id !== pkgData._id;
			});
			setPackagesToTransfer(updatedPackages);
		}

		const areAllSelected = updatedStateArray.every((obj) => obj.checked === true);
		setSelectAll(areAllSelected);
		setCheckedStates(updatedStateArray);
	};

	const resetValues = (resetAll = true) => {
		// reset modal values
		setTransferToUser(JSON.stringify({ firstName: '', lastName: '', userId: '' }));
		setPackagesToTransfer([]);
		setPackageSelectionViewOpen(false);
		setAssignAsPackagePOC(true);
		setSelectAll(true);

		if (resetAll) {
			// close modal and reset reducer values
			dispatch({ type: actionTypes.RESET_TRANSFER_PACKAGES_MODAL });
		}
	};

	const handlePackageTransfer = async () => {
		if (!systemErrorOccurred) {
			return await axios
				.post(baseURL + 'mongorepo/transferPackages/', {
					transferData: {
						transferToUserId: transferToUserJSON.userId,
						transferFromUserId: transferFromUser.userId,
						packagesToTransfer: packagesToTransfer,
						packagePocMap: POCInputStates,
						packagePocEmailMap: POCEmailInputStates,
					},
					auditUser: userId,
				})
				.then((response) => {
					// report number of transfered pacakges for info message
					return response.data.transferedPackages.length;
				})
				.catch((error) => {
					handleError(error, trackedErrorSources.transfer);
					return false;
				});
		} else {
			return false;
		}
	};

	const isCurrentPackageChecked = (key) => {
		const arr = checkedStates.filter((obj) => obj.key === key);
		return arr[0].checked;
	};

	return (
		<Modal open={transferPackagesModalOpen}>
			<Modal.Header>Transfer Packages - {`${transferFromUser.firstName} ${transferFromUser.lastName}`}</Modal.Header>
			<Modal.Content>
				<>
					{packageSelectionViewOpen ? <p>Please select the package(s) you wish to transfer.</p> : null}
					{!packageSelectionViewOpen ? (
						<>
							<p>
								{`${transferFromUser.firstName} ${transferFromUser.lastName}`} currently has{' '}
								<strong>{numberOfPackagesToTransfer}</strong> {numberOfPackagesToTransfer === 1 ? 'package' : 'packages'}.
							</p>
							<p>Please select the user you wish to transfer package ownership to:</p>
							<Form>
								<Form.Field
									fluid
									required
									search={(options, query) => {
										return options.filter((option) => {
											if (option.key.toLowerCase().includes(query.toLowerCase())) {
												return option;
											} else {
												return null;
											}
										});
									}}
									options={transferToUserOptions}
									text={`${transferToUserJSON.firstName} ${transferToUserJSON.lastName}`}
									value={transferToUser}
									control={Select}
									placeholder='Search users'
									onChange={(e, d) => {
										setTransferToUser(d.value);
									}}
								/>
								{!!transferToUserJSON.userId ? (
									<Checkbox
										checked={assignAsPackagePOC}
										onChange={(e, d) => setAssignAsPackagePOC(d.checked)}
										label='Assign as package POC'
									/>
								) : null}
							</Form>
						</>
					) : (
						<>
							<div className='transferPackageTableContainer'>
								<Table compact striped>
									<Table.Header className='transferPackageTableHeader'>
										<Table.Row>
											<Table.HeaderCell />
											<Table.HeaderCell>Package Name</Table.HeaderCell>
											<Table.HeaderCell>Status</Table.HeaderCell>
											<Table.HeaderCell>POC</Table.HeaderCell>
											<Table.HeaderCell>POC Email</Table.HeaderCell>
										</Table.Row>
									</Table.Header>

									<Table.Body>
										{userPackages.map((pkg) => {
											return (
												<Table.Row key={pkg.key}>
													<Table.Cell collapsing>
														<Checkbox
															checked={isCurrentPackageChecked(pkg.key)}
															onClick={(e, d) => {
																handleCheckedStates(pkg, d.checked);
															}}
														/>
													</Table.Cell>
													<Table.Cell>{pkg.packageName}</Table.Cell>
													<Table.Cell>{pkg.isPublished ? 'Published' : 'Unpublished'}</Table.Cell>
													<Table.Cell>
														{isCurrentPackageChecked(pkg.key) ? (
															<Form.Input
																value={POCInputStates[pkg._id]}
																onChange={(e, d) => {
																	const updatedPOCInputStates = { ...POCInputStates, [pkg._id]: d.value };
																	setPOCInputStates(updatedPOCInputStates);
																}}
															/>
														) : (
															pkg.poc
														)}
													</Table.Cell>
													<Table.Cell>
														{isCurrentPackageChecked(pkg.key) ? (
															<Form.Input
																value={POCEmailInputStates[pkg._id]}
																onChange={(e, d) => {
																	const updatedPOCEmailInputStates = { ...POCEmailInputStates, [pkg._id]: d.value };
																	setPOCEmailInputStates(updatedPOCEmailInputStates);
																}}
															/>
														) : (
															pkg.pocEmail
														)}
													</Table.Cell>
												</Table.Row>
											);
										})}
									</Table.Body>
								</Table>
							</div>
							<div className='transferPackageCount'>
								<div>
									<Checkbox
										label='Select All'
										checked={selectAll}
										onClick={(e, d) => {
											handleSelectAll(d.checked);
										}}
									/>
								</div>
								<div>
									<p>
										{packagesToTransfer.length} of {numberOfPackagesToTransfer} selected
									</p>
								</div>
							</div>
						</>
					)}
					{transferToUserJSON.userId !== '' ? (
						<>
							<Divider hidden />
							<p>
								You are transferring {numberOfPackagesToTransfer === 1 ? 'package' : 'packages'} belonging to{' '}
								<strong>{`${transferFromUser.firstName} ${transferFromUser.lastName}`}</strong>, to{' '}
								<strong>{`${transferToUserJSON.firstName} ${transferToUserJSON.lastName}`}</strong>.
							</p>
						</>
					) : null}

					{packageSelectionViewOpen ? <p>Do you wish to proceed?</p> : null}
				</>
			</Modal.Content>
			<Modal.Actions>
				{packageSelectionViewOpen ? (
					<Button
						className='secondaryButton'
						content='Go Back'
						disabled={transferToUserJSON.userId === ''}
						onClick={(e) => {
							resetValues(false);
						}}
					/>
				) : null}
				<Button
					className='secondaryButton'
					content='Cancel'
					onClick={() => {
						// close modal and reset modal values
						resetValues();
					}}
				/>
				{packageSelectionViewOpen ? (
					<Button
						className='primaryButton'
						content='Yes, Transfer'
						disabled={packagesToTransfer.length === 0}
						onClick={async (e) => {
							const result = await handlePackageTransfer();
							if (result) {
								// display transfered packages notification for 7 seconds
								dispatch({ type: actionTypes.UPDATE_TRANSFERED_PACKAGES_COUNT, payload: result });
								setTimeout(() => {
									dispatch({ type: actionTypes.UPDATE_TRANSFERED_PACKAGES_COUNT, payload: null });
								}, 7 * 1000);
							}
							// close modal and reset modal values
							resetValues();
						}}
					/>
				) : (
					<Button
						className='primaryButton'
						content='Next'
						disabled={transferToUserJSON.userId === ''}
						onClick={async (e) => {
							await populatePackageSelectionView();
							setPackageSelectionViewOpen(true);
						}}
					/>
				)}
			</Modal.Actions>
		</Modal>
	);
};

export default TransferPackagesModal;
