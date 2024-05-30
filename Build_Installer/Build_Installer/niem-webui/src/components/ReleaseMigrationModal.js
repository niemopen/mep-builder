import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { Link } from 'react-router-dom';
import { Button, Icon, Modal, Grid, Dropdown, Message, Popup } from 'semantic-ui-react';
import { releaseOptions } from '../App.js';
import { handleOpenPackage, UpdateMappingGrid } from './MyHomeTableView';
import * as tooltipContent from '../Shared/TooltipContent.js';
import store from '../redux/store';
import { checkIfDuplicatePackageNameExists, closePackage, handleSavePackage } from '../Util/savePackageUtil';
import { createUpdateFile } from '../Util/UploadFileUtil';
import { removeArtifactsAfterCopy, updateReduxFromPackageData } from '../Util/PackageUtil';
import { updateNewPkgArtifacts } from '../Util/PackageUtil';
import { clearValidationResults } from '../Util/ValidationUtil';
import { handleError } from '../Util/ErrorHandleUtil.js';
import { artifactTags, getArtifactTreeFromDB, getFilesByTag, updateArtifactTreeLabel } from '../Util/ArtifactTreeUtil.js';

export const disableMigrateButton = (row) => {
	// if the package's release is the latest release, disable the migrate button
	const releases = releaseOptions();
	const indexOfCurrentRelease = releases.map((i) => i.key).indexOf(row.Release);

	if (indexOfCurrentRelease === releases.length - 1) {
		return true;
	} else {
		return false;
	}
};

const ReleaseMigrationModal = () => {
	const dispatch = useDispatch();
	const isReleaseMigrationModalOpen = useSelector((state) => state.migration.isReleaseMigrationModalOpen);
	const isExistingMEPNameModalOpen = useSelector((state) => state.existing.isModalOpen);
	const rowData = useSelector((state) => state.migration.rowData);
	const userId = useSelector((state) => state.session.userId);
	const niemReleases = useSelector((state) => state.data.loadedReleases);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);

	const [desiredRelease, setDesiredRelease] = useState('');
	const [migrationActive, setMigrationActive] = useState(false);
	const [dropdownDisabled, setDropdownDisabled] = useState(false);
	const [migrationComplete, setMigrationComplete] = useState(false);
	const [migrationMessage, setMigrationMessage] = useState('');
	const [totalItems, setTotalItems] = useState(0);
	const [completedItems, setCompletedItems] = useState(0);
	const [missingItems, setMissingItems] = useState(0);
	const [migratedPackageData, setMigratedPackageData] = useState({ PackageName: '', PackageId: '' });
	const [updatingReleaseActive, setUpdatingReleaseActive] = useState(false);
	const [updatingReleaseComplete, setUpdatingReleaseComplete] = useState(false);
	const [updatingReleaseMessage, setUpdatingReleaseMessage] = useState('');

	// message variables
	const successMessage = 'success';
	const warningMessage = 'warning';
	const failureMessage = 'failure';

	const resetModal = () => {
		setDesiredRelease('');
		setDropdownDisabled(false);
		setMigrationActive(false);
		setMigrationComplete(false);
		setUpdatingReleaseActive(false);
		setUpdatingReleaseComplete(false);
	};

	const filteredReleaseOptions = () => {
		// this code prevents the user from downgrading a release.
		const releases = releaseOptions();
		const index = releases.map((i) => i.key).indexOf(rowData.Release);

		if (index === -1) {
			// if index is not found, return the original release array
			return releases;
		} else {
			const filteredReleases = releases.splice(index + 1);
			return filteredReleases;
		}
	};

	const handleMigration = async () => {
		setDropdownDisabled(true);
		setMigrationActive(true);

		const result = await migrateRelease();

		if (result === false) {
			setMigrationMessage(failureMessage);
		} else {
			// update redux with original package data
			await updateReduxFromPackageData(rowData, dispatch, false);
			dispatch({ type: actionTypes.UPDATE_PACKAGE_OWNER_ID, payload: userId }); // update packageOwnerId to current user
			const validDesiredReleaseStr = desiredRelease.toString().replaceAll('.', '_');
			dispatch({ type: actionTypes.UPDATE_MPD_PACKAGE_NAME, payload: `${rowData.PackageName}_rel` + validDesiredReleaseStr });
			dispatch({ type: actionTypes.UPDATE_MPD_RELEASE, payload: desiredRelease }); // update release

			// check if generated packageName already exists
			const { packageNameExists, existingPackageId } = await checkIfDuplicatePackageNameExists(
				`${rowData.PackageName}_rel${desiredRelease}`,
				''
			);
			if (packageNameExists) {
				// update packageId to existingPackageId since new package will not be generated
				dispatch({ type: actionTypes.UPDATE_MPD_PACKAGE_ID, payload: existingPackageId });
			} else {
				// leave packageId blank to create a new package
				dispatch({ type: actionTypes.UPDATE_MPD_PACKAGE_ID, payload: '' });
			}

			if (rowData.isPublished === true) {
				// the new migrated package will be unpublished
				dispatch({ type: actionTypes.UPDATE_MPD_IS_PUBLISHED, payload: false });
			}

			UpdateMappingGrid(result.newMappingDoc, dispatch); // update mapping grid from migrated results

			await handleSavePackage();

			const state = store.getState(); // called after previous functions to get the latest state
			setMigratedPackageData({ PackageName: state.mpd.packageName, PackageId: state.mpd.packageId });

			// save migration chnages into a json file and add to artifact tree
			const migrationChangelogFile = new File([JSON.stringify(result.niemChanges, null, 2)], 'migrationChangelog.json', {
				type: 'application/json',
			});
			await createUpdateFile(state.artifact.treeItems, state.mpd.packageId, migrationChangelogFile, 'migrationChangelog.json', '7', true);

			// updated migrated package id for use on the homepage
			dispatch({ type: actionTypes.MIGRATED_PACKAGE_ID, payload: state.mpd.packageId });

			// update migrated artifacts and their fileblob IDs - handleSavePackage() gets called again downstream via updateNewPkgArtifacts()
			const migratedArtifactTree = await updateNewPkgArtifacts(state.mpd.packageId);

			// remove outdated artifacts from the artifact tree
			await removeArtifactsAfterCopy(state.mpd.packageId, migratedArtifactTree);
			dispatch({ type: actionTypes.UPDATE_MPD_IS_MIGRATED_PACKAGE, payload: true });
			clearValidationResults();
			await handleSavePackage(true, false);

			// summary totals
			const summary = getSummaryTotals(result.originalMappingDoc, result.niemChanges);

			setTotalItems(summary.total);
			setCompletedItems(summary.completed);
			setMissingItems(summary.missing);

			if (summary.missing > 0) {
				setMigrationMessage(warningMessage);
			} else {
				setMigrationMessage(successMessage);
			}
		}

		setMigrationComplete(true);
	};

	const migrateRelease = async () => {
		if (!systemErrorOccurred) {
			return axios
				.post(baseURL + 'Releases/migrateRelease', {
					packageId: rowData.PackageId,
					releases: niemReleases,
					startingRelease: rowData.Release,
					endRelease: desiredRelease,
				})
				.then((response) => {
					return response.data.status;
				})
				.catch((err) => {
					handleError(err);
					return false;
				});
		} else {
			return false;
		}
	};

	const getSummaryTotals = (mappingDoc, niemChanges) => {
		// only select required sheets for count totals
		const validSheets = ['codesFacetsSheet', 'namespaceSheet', 'propertySheet', 'typeHasPropertySheet', 'typeSheet'];

		const filteredMappingDoc = Object.keys(mappingDoc).reduce((newObj, key) => {
			if (validSheets.includes(key)) {
				newObj[key] = mappingDoc[key];
			}
			return newObj;
		}, {});

		let totalItems = 0;
		let completedItems = 0;
		let missingItems = 0;

		const mappingDocValues = Object.values(filteredMappingDoc);
		const niemChangesArray = Object.values(niemChanges);

		// loop through each sheet object and get length
		for (let i = 0; i < mappingDocValues.length; i++) {
			totalItems += mappingDocValues[i].length;
		}

		const releaseChanges = niemChangesArray[niemChangesArray.length - 1]; // grab the last set of changes made
		const sheetNames = Object.keys(releaseChanges);

		// get totals by sheetName
		for (let i = 0; i < sheetNames.length; i++) {
			const sheet = sheetNames[i];
			const sheetChanges = releaseChanges[sheet];
			completedItems += sheetChanges.add.length;
			completedItems += sheetChanges.edit.length;
			completedItems += sheetChanges.noChange.length;
			completedItems += sheetChanges.delete.length;

			missingItems += sheetChanges.notFound.length;
		}

		return { total: totalItems, completed: completedItems, missing: missingItems };
	};

	const handleUpdateRelease = async () => {
		setDropdownDisabled(true);
		setUpdatingReleaseActive(true);
		try {
			// update redux with original package data
			await updateReduxFromPackageData(rowData, dispatch);

			// update catalog file name if needed
			if (Number.parseFloat(desiredRelease) >= 5.0 && Number.parseFloat(rowData.Release) < 5.0) {
				const artifactTree = await getArtifactTreeFromDB(rowData.PackageId);
				const catalogFile = await getFilesByTag(artifactTree, artifactTags.catalog);
				await updateArtifactTreeLabel(artifactTree, catalogFile[0].nodeId, 'iepd-catalog.xml', true, false);
			}
			dispatch({ type: actionTypes.UPDATE_MPD_RELEASE, payload: desiredRelease }); // update release

			await handleSavePackage(true);
			setUpdatingReleaseMessage(successMessage);
		} catch (error) {
			// NOTE: Skipped for implementation of handleError as error message already appears
			console.log(error);
			setUpdatingReleaseMessage(failureMessage);
		}

		setUpdatingReleaseComplete(true);
	};

	const updateHomePage = (packageId) => {
		// Capture the package id of the newly migrated package for use on the homepage
		dispatch({ type: actionTypes.MIGRATED_PACKAGE_ID, payload: packageId });
		dispatch({ type: actionTypes.REFRESH_PACKAGES, payload: true });
	};

	const MigrationReleaseSelectionScreen = () => {
		return (
			<>
				<Modal.Content>
					<Message info>
						<Message.Header>{tooltipContent.removingArtifactsMessageHeader}</Message.Header>
						<Message.Content>{tooltipContent.removingArtifactsMessageContent}</Message.Content>
					</Message>
					<Grid columns={3}>
						<Grid.Row centered>
							<Grid.Column width={7} textAlign='center'>
								<b>Current Release</b>
							</Grid.Column>
							<Grid.Column width={2}></Grid.Column>
							<Grid.Column width={7} textAlign='center'>
								<b>Desired Release</b>
								<Popup
									content={tooltipContent.migrateRelease}
									position='top center'
									trigger={<Icon name='question circle outline' size='small' color='blue'></Icon>}
								/>
							</Grid.Column>
						</Grid.Row>
						<Grid.Row centered verticalAlign='middle'>
							<Grid.Column width={7} textAlign='center'>
								{rowData.Release}
							</Grid.Column>
							<Grid.Column width={2} textAlign='center'>
								<Icon name='arrow right' size='large' fitted />
							</Grid.Column>
							<Grid.Column width={7} textAlign='center'>
								<Dropdown
									value={desiredRelease}
									compact
									search
									selection
									disabled={dropdownDisabled}
									options={filteredReleaseOptions()}
									onChange={(e, d) => {
										setDesiredRelease(d.value);
									}}
								/>
							</Grid.Column>
						</Grid.Row>
						<Grid.Row columns={1}>
							<Grid.Column>
								{desiredRelease === '' ? null : (
									<p>
										You are migrating the contents of this MEP from Release <b>{rowData.Release}</b> to <b>{desiredRelease}</b>.
									</p>
								)}
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='secondaryButton'
						disabled={migrationActive} // disable cancel button during migration
						onClick={() => {
							dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: false });
							resetModal();
						}}
					>
						Cancel
					</Button>
					{migrationActive ? (
						<Button className='primaryButton'>Migrating...</Button>
					) : (
						<Button
							className='primaryButton'
							disabled={desiredRelease === '' ? true : false}
							onClick={() => {
								handleMigration();
							}}
						>
							Migrate
						</Button>
					)}
				</Modal.Actions>
			</>
		);
	};

	const MigrationCompletionScreen = () => {
		return (
			<>
				<Modal.Content>
					{migrationMessage === failureMessage ? null : (
						<>
							<p style={{ textAlign: 'center' }}>Migration complete.</p>
							<p style={{ textAlign: 'center' }}>
								<b>Summary</b>
							</p>
						</>
					)}
					{migrationMessage === successMessage ? (
						<Message positive style={{ textAlign: 'center' }}>
							<p>All attributes have been migrated successfully.</p>
							<p>
								<b>Total:</b> {totalItems}
							</p>
							<p>
								<b>Completed:</b> {completedItems}
							</p>
							<p>
								<b>Missing:</b> {missingItems}
							</p>
						</Message>
					) : migrationMessage === warningMessage ? (
						<Message warning style={{ textAlign: 'center' }}>
							<p>Not all attributes were migrated successfully</p>
							<p>
								<b>Total:</b> {totalItems}
							</p>
							<p>
								<b>Completed:</b> {completedItems}
							</p>
							<p>
								<b>Missing:</b> {missingItems}
							</p>
						</Message>
					) : (
						<Message negative style={{ textAlign: 'center' }} header='Error' content='Unable to migrate your package. Please try again' />
					)}
					{migrationMessage === failureMessage ? null : (
						<p>Please review in Map & Model before proceeding to the Build & Validate or Assemble & Document phase.</p>
					)}
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='secondaryButton'
						onClick={() => {
							closePackage();
							if (migrationMessage !== failureMessage) {
								// only update if successful
								updateHomePage(migratedPackageData.PackageId);
							}
							dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: false });
							resetModal();
						}}
					>
						Close
					</Button>

					{migrationMessage === failureMessage ? (
						<Button
							className='primaryButton'
							onClick={() => {
								resetModal();
							}}
						>
							Try again
						</Button>
					) : (
						<Button
							as={Link}
							to='/PackageBuilder/MapModel'
							className='primaryButton'
							onClick={() => {
								handleOpenPackage(migratedPackageData, dispatch, 'MapModel');
								dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: false });
								dispatch({ type: actionTypes.IS_OPENED_COPIED_MIGRATED_MEP_MODAL_OPEN, payload: true });
							}}
						>
							Go to Map & Model
						</Button>
					)}
				</Modal.Actions>
			</>
		);
	};

	const UpdateReleaseSelectionScreen = () => {
		return (
			<>
				<Modal.Content>
					<Message info>
						<Message.Header>{tooltipContent.removingArtifactsMessageHeader}</Message.Header>
						<Message.Content>{tooltipContent.removingArtifactsMessageContent}</Message.Content>
					</Message>
					<p>There are no elements to migrate, but you may update to a later release.</p>
					<Grid columns={3}>
						<Grid.Row centered>
							<Grid.Column width={7} textAlign='center'>
								<b>Current Release</b>
							</Grid.Column>
							<Grid.Column width={2}></Grid.Column>
							<Grid.Column width={7} textAlign='center'>
								<b>Desired Release</b>
								<Popup
									content={tooltipContent.migrateRelease}
									position='top center'
									trigger={<Icon name='question circle outline' size='small' color='blue'></Icon>}
								/>
							</Grid.Column>
						</Grid.Row>
						<Grid.Row centered verticalAlign='middle'>
							<Grid.Column width={7} textAlign='center'>
								{rowData.Release}
							</Grid.Column>
							<Grid.Column width={2} textAlign='center'>
								<Icon name='arrow right' size='large' fitted />
							</Grid.Column>
							<Grid.Column width={7} textAlign='center'>
								<Dropdown
									value={desiredRelease}
									compact
									search
									selection
									disabled={dropdownDisabled}
									options={filteredReleaseOptions()}
									onChange={(e, d) => {
										setDesiredRelease(d.value);
									}}
								/>
							</Grid.Column>
						</Grid.Row>
						<Grid.Row columns={1}>
							<Grid.Column>
								{desiredRelease === '' ? null : (
									<p>
										You are updating the MEP from Release <b>{rowData.Release}</b> to <b>{desiredRelease}</b>.
									</p>
								)}
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='secondaryButton'
						disabled={updatingReleaseActive} // disable close button during updating
						onClick={() => {
							dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: false });
							resetModal();
						}}
					>
						Close
					</Button>
					{updatingReleaseActive ? (
						<Button className='primaryButton'>Updating...</Button>
					) : (
						<Button
							className='primaryButton'
							disabled={desiredRelease === '' ? true : false}
							onClick={() => {
								handleUpdateRelease();
							}}
						>
							Update
						</Button>
					)}
				</Modal.Actions>
			</>
		);
	};

	const UpdateReleaseCompletionScreen = () => {
		return (
			<>
				<Modal.Content>
					{updatingReleaseMessage === successMessage ? (
						<Message positive style={{ textAlign: 'center' }} header='Success' content='The package release was updated successfully.' />
					) : (
						<Message
							negative
							style={{ textAlign: 'center' }}
							header='Error'
							content='Unable to update your package release. Please try again.'
						/>
					)}
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='secondaryButton'
						onClick={() => {
							closePackage();
							if (updatingReleaseMessage === successMessage) {
								// only update if successful
								updateHomePage(rowData.PackageId);
							}
							dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: false });
							resetModal();
						}}
					>
						Close
					</Button>

					{updatingReleaseMessage === failureMessage ? (
						<Button
							className='primaryButton'
							onClick={() => {
								resetModal();
							}}
						>
							Try again
						</Button>
					) : (
						<Button
							as={Link}
							to='/PackageBuilder/AnalyzeRequirements'
							className='primaryButton'
							onClick={() => {
								handleOpenPackage(rowData, dispatch);
								dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: false });
							}}
						>
							Open package
						</Button>
					)}
				</Modal.Actions>
			</>
		);
	};

	const displayScreen = () => {
		// display screens based on workflow
		// we will only use the Migration workflow for published packages
		if (rowData.isMappingDocEmpty === true && rowData.isPublished === false) {
			if (updatingReleaseComplete) {
				return <UpdateReleaseCompletionScreen />;
			} else {
				return <UpdateReleaseSelectionScreen />;
			}
		} else {
			if (migrationComplete) {
				return <MigrationCompletionScreen />;
			} else {
				return <MigrationReleaseSelectionScreen />;
			}
		}
	};

	return (
		<Modal
			open={isReleaseMigrationModalOpen && !isExistingMEPNameModalOpen} // this is to prevent double stacking of modals after save on copy/migrate w/ open package
			size='tiny'
			onClose={() => {
				dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: false });
			}}
			closeOnDimmerClick={false}
		>
			<Modal.Header>Migrate Release - {rowData.PackageName}</Modal.Header>
			{displayScreen()}
		</Modal>
	);
};

export default ReleaseMigrationModal;
