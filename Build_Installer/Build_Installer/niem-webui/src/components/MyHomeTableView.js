import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Link } from 'react-router-dom';
import * as key from '../Shared/KVstore';
import { Button, Table, Icon, Message, Modal, Popup } from 'semantic-ui-react';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { clearUnsavedData, getSessionValue, restoreUnsavedMappingDoc, restoreUnsavedPackageData, setSessionValue } from '../Util/localStorageUtil';
import * as sessionVar from '../Util/SessionVar';
import { closePackage } from '../Util/savePackageUtil';
import ReleaseMigrationModal from './ReleaseMigrationModal';
import { setActiveSidebarTab } from '../Navigation/LeftNavContent';
import * as tooltipContent from '../Shared/TooltipContent.js';
import { disableMigrateButton } from './ReleaseMigrationModal';
import { exportArtifactItem } from '../Util/ArtifactTreeUtil';
import { getArtifactChecklist, getArtifactChecklistApi } from '../Shared/ArtifactChecklist';
import CopyMEPModal from '../Shared/CopyMEPMyHomeModal';
import { isTranslationGenerated } from '../Util/TranslationUtil';
import store from '../redux/store';
import CopyMigrateWarningModal from '../Shared/CopyMigrateWarningModal';
import { handleError } from '../Util/ErrorHandleUtil.js';

export const getExistingPackageData = (packageId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'MongoRepo/getPackageData/' + packageId, {
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				return response.data;
			})
			.catch((error) => handleError(error));
	}
};

// Api call to delete from Mongo database
const deletePackageApiDB = (packageId) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.delete(baseURL + 'MongoRepo/deletePackage', {
				data: {
					packageId: packageId,
					auditUser: getSessionValue(sessionVar.user_id),
				},
			})
			.then((response) => {
				return response.data;
			})
			.catch((error) => handleError(error));
	}
};

export async function handleOpenPackage(rowData, dispatch, routing = 'AnalyzeRequirements') {
	// Track which package is open
	setSessionValue(sessionVar.open_package_name, rowData.PackageName);
	setSessionValue(sessionVar.open_package_id, rowData.PackageId);

	// Make API call to get the existing package data from the local repository
	const existingPackageData = await getExistingPackageData(rowData.PackageId);

	if (existingPackageData) {
		// Update reducer files
		UpdateMetadata(existingPackageData['mpdData'], dispatch);
		UpdateMappingGrid(existingPackageData['mappingDoc'], dispatch);
		dispatch({ type: actionTypes.UPDATE_ARTIFACT_TREE, payload: { treeItems: existingPackageData['artifactTree'] } });

		// check for existing Custom Model Extensions inside of existingPackageData and update cme reducer
		const exisitingCMEData = existingPackageData['mpdData'].cmeData;
		if (exisitingCMEData !== null && exisitingCMEData !== undefined) {
			const cmeData = JSON.parse(exisitingCMEData);
			dispatch({ type: actionTypes.UPDATE_CME_BUILDER_DATA, payload: cmeData });
		}
	}

	// if there was unsaved package data, load this instead
	restoreUnsavedPackageData();
	restoreUnsavedMappingDoc();

	// If user is not copying a package, route user to selected page, defaults to Analyze Requirements
	const state = store.getState(); // called after previous functions to get the latest state
	const isCopyMEPModalOpen = state.copyMEP.isCopyMEPModalOpen;

	if (!isCopyMEPModalOpen) {
		setSessionValue(sessionVar.active_tab, 'PackageBuilder');
		dispatch({ type: actionTypes.PACKAGE_BUILDER_ACTIVE });

		// check if the package to be opened has been recently copied/migrated from another package and there are artifacts that needs review
		if (
			(state.mpd.isCopiedPackage || state.mpd.isMigratedPackage) &&
			(state.artifact.sampleNeedsReview || state.artifact.changelogNeedsReview || state.artifact.readmeNeedsReview)
		) {
			dispatch({ type: actionTypes.IS_OPENED_COPIED_MIGRATED_MEP_MODAL_OPEN, payload: true });
		}

		setActiveSidebarTab(routing, dispatch);
	}
}

export const UpdateMetadata = async (mpdData, dispatch) => {
	dispatch({ type: actionTypes.UPDATE_PACKAGE_OWNER_ID, payload: mpdData['userId'] });
	dispatch({ type: actionTypes.UPDATE_MPD_PACKAGE_ID, payload: mpdData['_id'] });
	dispatch({ type: actionTypes.UPDATE_MPD_PACKAGE_NAME, payload: mpdData['packageName'] });
	dispatch({ type: actionTypes.UPDATE_MPD_RELEASE, payload: mpdData['niemRelease'] });
	dispatch({ type: actionTypes.UPDATE_MPD_VERSION, payload: mpdData['version'] });
	dispatch({ type: actionTypes.UPDATE_MPD_STATUS, payload: mpdData['status'] });
	dispatch({ type: actionTypes.UPDATE_MPD_STATUS_NO, payload: mpdData['statusNo'] });
	dispatch({ type: actionTypes.UPDATE_MPD_POC, payload: mpdData['poc'] });
	dispatch({ type: actionTypes.UPDATE_MPD_EMAIL, payload: mpdData['pocEmail'] });
	dispatch({ type: actionTypes.UPDATE_MPD_DESCRIPTION, payload: mpdData['description'] });
	dispatch({ type: actionTypes.UPDATE_MPD_ORGANIZATION_NAME, payload: mpdData['orgName'] });
	dispatch({ type: actionTypes.UPDATE_MPD_ORGANIZATION_TYPE, payload: mpdData['orgType'] });
	dispatch({ type: actionTypes.UPDATE_MPD_COI_TAGS, payload: mpdData['coiTags'] });
	dispatch({ type: actionTypes.UPDATE_MPD_EXCHANGE_TAGS, payload: mpdData['exchangeTags'] });
	dispatch({ type: actionTypes.UPDATE_MPD_FORMAT, payload: mpdData['format'] });
	dispatch({ type: actionTypes.UPDATE_MPD_RELEASE_LOCKED, payload: mpdData['isReleaseLocked'] });
	dispatch({ type: actionTypes.UPDATE_MPD_IS_PUBLISHED, payload: mpdData['isPublished'] });
	dispatch({ type: actionTypes.UPDATE_VALIDATION_ARTIFACTS, payload: mpdData['validationArtifacts'] });
	dispatch({ type: actionTypes.SET_SHOW_VALIDATION_RESULTS, payload: mpdData['showValidationResults'] });
	dispatch({ type: actionTypes.UPDATE_MPD_IS_COPIED_PACKAGE, payload: mpdData['isCopiedPackage'] });
	dispatch({ type: actionTypes.UPDATE_MPD_IS_MIGRATED_PACKAGE, payload: mpdData['isMigratedPackage'] });

	await getArtifactChecklist(mpdData['_id']);
	await isTranslationGenerated(mpdData['_id']);
};

export const UpdateMappingGrid = (mappingDoc, dispatch) => {
	dispatch({ type: actionTypes.UPDATE_PROPERTY_SHEET, payload: mappingDoc['propertySheet'] });
	dispatch({ type: actionTypes.UPDATE_TYPE_SHEET, payload: mappingDoc['typeSheet'] });
	dispatch({ type: actionTypes.UPDATE_TYPE_HAS_PROPERTY_SHEET, payload: mappingDoc['typeHasPropertySheet'] });
	dispatch({ type: actionTypes.UPDATE_CODES_FACETS_SHEET, payload: mappingDoc['codesFacetsSheet'] });
	dispatch({ type: actionTypes.UPDATE_NAMESPACE_SHEET, payload: mappingDoc['namespaceSheet'] });
	dispatch({ type: actionTypes.UPDATE_LOCAL_TERMINOLOGY_SHEET, payload: mappingDoc['localTerminologySheet'] });
	dispatch({ type: actionTypes.UPDATE_TYPE_UNION_SHEET, payload: mappingDoc['typeUnionSheet'] });
	dispatch({ type: actionTypes.UPDATE_METADATA_SHEET, payload: mappingDoc['metadataSheet'] });
};

const MyHomeTable = () => {
	const unpublishedPackages = useSelector((state) => state.packagesList.unpublished);
	const packageBuilderActive = useSelector((state) => state.header.packageBuilderActive);
	const migratedPackageId = useSelector((state) => state.migration.migratedPackageId);
	const copiedPkgPkgId = useSelector((state) => state.copyMEP.copiedPkgPkgId);
	const openedPackageName = useSelector((state) => state.mpd.packageName);
	const dispatch = useDispatch();
	const [actionMessage, setActionMessage] = useState('');
	const [isDeleteMEPModalOpen, setIsDeleteMEPModalOpen] = useState(false);
	const [rowKey, setRowKey] = useState();
	const [rowId, setRowId] = useState();

	// Action Message Values
	const deleteSuccessful = 'deleteSuccessful';
	const errorMessage = 'errorMessage';

	async function handleDeletePackage(packageId) {
		// Make API call to remove the package Mongo Database
		const isSuccessDB = await deletePackageApiDB(packageId);

		// Allows Delete Successful message to only be visble for 5 seconds
		if (isSuccessDB) {
			setActionMessage(deleteSuccessful);

			// close package if previously viewed package was deleted package
			dispatch({ type: actionTypes.DELETED_UNPUBLISHED_PACKAGE_NAME, payload: rowKey });
			if (getSessionValue(sessionVar.open_package_id) === packageId) {
				closePackage();
			}
		} else {
			setActionMessage(errorMessage);
		}

		const timer = setTimeout(() => {
			setActionMessage('');
			dispatch({ type: actionTypes.DELETED_UNPUBLISHED_PACKAGE_NAME, payload: '' });
		}, 5000);
		return () => clearTimeout(timer);
	}

	// Modal to confirm a MEP deletion
	const deleteUnpublishedMEPModal = () => {
		return (
			<Modal
				open={isDeleteMEPModalOpen}
				size='tiny'
				closeIcon
				onClose={() => {
					setIsDeleteMEPModalOpen(false);
					setActionMessage('');
				}}
				closeOnDimmerClick={false}
			>
				<Modal.Header>Confirm Delete - {rowKey}</Modal.Header>
				<Modal.Content>
					<Modal.Description>Are you sure you want to permanently delete this {key.packageName}?</Modal.Description>
				</Modal.Content>
				{/*Modal Button Section*/}
				<Modal.Actions>
					<Button
						className='secondaryButton'
						onClick={() => {
							setIsDeleteMEPModalOpen(false);
						}}
					>
						Cancel
					</Button>
					<Button
						primary
						onClick={(e) => {
							handleDeletePackage(rowId);
							setIsDeleteMEPModalOpen(false);
						}}
					>
						Yes
					</Button>
				</Modal.Actions>
			</Modal>
		);
	};

	const isMappingDocEmpty = async (row) => {
		const data = await getExistingPackageData(row.PackageId);
		const mappingDoc = data.mappingDoc;

		if (
			mappingDoc.codesFacetsSheet.length === 0 &&
			mappingDoc.namespaceSheet.length === 0 &&
			mappingDoc.propertySheet.length === 0 &&
			mappingDoc.typeHasPropertySheet.length === 0 &&
			mappingDoc.typeSheet.length === 0
		) {
			row.isMappingDocEmpty = true;
		} else {
			row.isMappingDocEmpty = false;
		}
	};

	const isNewlyCreatedPackageFunc = (packageId) => {
		if (packageId === migratedPackageId || packageId === copiedPkgPkgId) {
			clearNewlyCreatedPackageReduxId();
			return true;
		} else {
			return false;
		}
	};

	const clearNewlyCreatedPackageReduxId = () => {
		const timer = setTimeout(() => {
			// Clear value to prevent infinite highlight rendering, after 6 seconds
			dispatch({ type: actionTypes.MIGRATED_PACKAGE_ID, payload: '' });
			dispatch({ type: actionTypes.UPDATE_COPIED_PACKAGE_ID, payload: '' });
		}, 6000);
		return () => clearTimeout(timer);
	};

	// this method retrieves the package data for the package, checks for missing artifacts, and either displays the 'Export' modal or allows export
	async function exportFromMyHome(row) {
		// first, get MEP's package data from db via returned data from getExistingPackageData(), called above
		const existingPackageData = await getExistingPackageData(row.PackageId);
		const artifactTree = existingPackageData.artifactTree[0]; // parameter needed for exportArtifactItem(), called below
		const artifactChecklist = await getArtifactChecklistApi(row.PackageId);
		const itemToExport = {
			artifactTree: artifactTree,
			packageName: row.PackageName,
			packageId: row.PackageId,
			artifactChecklist: artifactChecklist.checklist,
		}; // what 'Export' modal needs in order to display package's info and allow export via the modal's 'Export' button

		// determine whether to show 'Export Modal' + missing artifacts OR allow export
		if (artifactChecklist.isChecklistComplete) {
			// if all items are uploaded, allow export
			dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: false });
			exportArtifactItem(artifactTree, '0', row.PackageName, row.PackageId, row);
			// reset reducer variable to make room for the next data set...
			dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: '' });
		} else {
			// if all items are not fully uploaded, display modal
			// prep for and display 'Export' modal
			dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: itemToExport });
			dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: true });
			dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: 'exportMEP' });
		}
	}

	const renderRows = () => {
		return unpublishedPackages.map((row, i) => {
			const isNewlyCreatedPackage = isNewlyCreatedPackageFunc(row.PackageId); // flag used to temporairly highlight newly created packages

			return (
				<>
					<Table.Row key={i} className={isNewlyCreatedPackage ? 'highlightRow' : ''}>
						<Table.Cell>
							<Button
								active={packageBuilderActive}
								as={Link}
								to='/PackageBuilder/AnalyzeRequirements'
								className='MyHomeGridIcon'
								icon
								onClick={async (e) => {
									dispatch({ type: actionTypes.MY_HOME_LOADER_ACTIVE, payload: true });
									// clear unsaved session data from previously viewed package
									clearUnsavedData();
									await handleOpenPackage(row, dispatch);
									dispatch({ type: actionTypes.MY_HOME_LOADER_ACTIVE, payload: false });
								}}
							>
								<Icon name='folder open' size='large' />
							</Button>
						</Table.Cell>
						<Table.Cell>
							<Button
								active={packageBuilderActive}
								as={Link}
								to='/'
								className='MyHomeGridIcon'
								icon
								onClick={(e) => {
									if (openedPackageName !== '') {
										dispatch({ type: actionTypes.SET_COPY_MIGRATE_ACTION, payload: 'copy' });
										dispatch({ type: actionTypes.IS_COPY_MIGRATE_WARNING_MODAL_OPEN, payload: true });
									} else {
										dispatch({ type: actionTypes.IS_COPY_MEP_MODAL_OPEN, payload: true });
									}
									dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: row }); // variable used in 'Copy MEP' modal to display
								}}
							>
								<Icon name='copy' size='large' />
							</Button>
						</Table.Cell>
						<Table.Cell>
							<Button
								active={packageBuilderActive}
								as={Link}
								to='/'
								className='MyHomeGridIcon'
								icon
								onClick={(e) => {
									setIsDeleteMEPModalOpen(true);
									setRowKey(row.PackageName);
									setRowId(row.PackageId);
								}}
							>
								<Icon name='trash' size='large' />
							</Button>
						</Table.Cell>
						<Table.Cell>
							<Button
								active={packageBuilderActive}
								as={Link}
								to='/'
								className='MyHomeGridIcon'
								icon
								onClick={(e) => {
									exportFromMyHome(row);
								}}
							>
								<Icon name='download' size='large' />
							</Button>
						</Table.Cell>
						<Table.Cell>
							{disableMigrateButton(row) ? (
								<Popup
									className='roleTooltipIcon'
									content={tooltipContent.migrateRelease}
									position='top center'
									trigger={
										<Button compact className='primaryButton disabledButton' size='small'>
											Migrate
										</Button>
									}
								/>
							) : (
								<Button
									compact
									className='secondaryButton'
									size='small'
									onClick={async () => {
										await isMappingDocEmpty(row);
										if (openedPackageName !== '') {
											dispatch({ type: actionTypes.SET_COPY_MIGRATE_ACTION, payload: 'migrate' });
											dispatch({ type: actionTypes.IS_COPY_MIGRATE_WARNING_MODAL_OPEN, payload: true });
										} else {
											dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: true });
										}
										dispatch({ type: actionTypes.ROW_DATA, payload: row });
									}}
								>
									Migrate
								</Button>
							)}
						</Table.Cell>
						<Table.Cell>Justice</Table.Cell>
						<Table.Cell>{row.PackageName}</Table.Cell>
						<Table.Cell>{row.Description}</Table.Cell>
						<Table.Cell>{row.Format}</Table.Cell>
						<Table.Cell>{row.Release}</Table.Cell>
					</Table.Row>
				</>
			);
		});
	};

	return (
		<>
			<CopyMigrateWarningModal />
			<CopyMEPModal />
			<ReleaseMigrationModal />
			{/*Success/Error Message Section*/}
			{actionMessage === deleteSuccessful ? (
				<Message success floating>
					<p>
						<b>{rowKey}</b> has been deleted.
					</p>
				</Message>
			) : actionMessage === errorMessage ? (
				<Message error floating>
					<p>
						<b>Action failed</b>
						<br />
						Please try again.
					</p>
				</Message>
			) : null}
			<Table basic='very'>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell width={1}>View</Table.HeaderCell>
						<Table.HeaderCell width={1}>Copy</Table.HeaderCell>
						<Table.HeaderCell width={1}>Delete</Table.HeaderCell>
						<Table.HeaderCell width={1}>Export</Table.HeaderCell>
						<Table.HeaderCell width={1}>Migrate Release</Table.HeaderCell>
						<Table.HeaderCell width={1}>Domain</Table.HeaderCell>
						<Table.HeaderCell width={2}>{key.packageName}</Table.HeaderCell>
						<Table.HeaderCell width={7}>Summary Description</Table.HeaderCell>
						<Table.HeaderCell width={2}>Format</Table.HeaderCell>
						<Table.HeaderCell width={1}>Release</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>{renderRows()}</Table.Body>
			</Table>
			{deleteUnpublishedMEPModal()}
		</>
	);
};

export default MyHomeTable;
