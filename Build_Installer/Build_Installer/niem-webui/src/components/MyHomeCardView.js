import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as key from '../Shared/KVstore';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { getSessionValue } from '../Util/localStorageUtil';
import * as sessionVar from '../Util/SessionVar';
import * as actionTypes from '../redux/actions';
import { Button, Card, Icon, Dropdown, Grid, Popup, Modal } from 'semantic-ui-react';
import { closePackage } from '../Util/savePackageUtil';
import { disableMigrateButton } from './ReleaseMigrationModal';
import * as tooltipContent from '../Shared/TooltipContent.js';
import { exportArtifactItem } from '../Util/ArtifactTreeUtil';
import TranslateList from '../Shared/TranslateList';
import Tooltip from '../Shared/Tooltip.js';
import { handleError } from '../Util/ErrorHandleUtil.js';
import store from '../redux/store.js';

// Api call to delete from Mongo database
export const deletePackageApiDB = async (packageId) => {
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

const MyHomeCard = () => {
	const dispatch = useDispatch();
	const publishedPackages = useSelector((state) => state.packagesList.published);
	const userId = useSelector((state) => state.session.userId);
	const openedPackageName = useSelector((state) => state.mpd.packageName);
	const [isDeleteMEPModalOpen, setIsDeleteMEPModalOpen] = useState(false);
	const [cardKey, setCardKey] = useState();
	const [cardId, setCardId] = useState();

	async function handleDeletePackage(packageId) {
		// Make API call to remove the package Mongo Database
		const isSuccessDB = await deletePackageApiDB(packageId);

		// Allows Delete Successful message to only be visble
		if (isSuccessDB) {
			dispatch({ type: actionTypes.UPDATE_PUBLISHED_MEP_DELETION_STATUS, payload: 'success' });
			dispatch({ type: actionTypes.DELETED_PUBLISHED_PACKAGE_NAME, payload: cardKey });

			// close package if previously viewed package was deleted package
			if (getSessionValue(sessionVar.open_package_id) === packageId) {
				closePackage();
			}
		} else {
			dispatch({ type: actionTypes.UPDATE_PUBLISHED_MEP_DELETION_STATUS, payload: 'fail' });
		}

		// Allows PUBLISHED_MEP_DELETION success/fail message to only be visble for 5 seconds and reset DELETED_PUBLISHED_PACKAGE_NAME back to an empty string
		const timer = setTimeout(() => {
			dispatch({ type: actionTypes.UPDATE_PUBLISHED_MEP_DELETION_STATUS, payload: '' });
			dispatch({ type: actionTypes.DELETED_PUBLISHED_PACKAGE_NAME, payload: '' });
		}, 5000);
		return () => clearTimeout(timer);
	}

	// Modal to confirm a MEP deletion
	const deletePublishedMEPModal = () => {
		return (
			<Modal
				open={isDeleteMEPModalOpen}
				size='tiny'
				closeIcon
				onClose={() => {
					setIsDeleteMEPModalOpen(false);
					dispatch({ type: actionTypes.UPDATE_PUBLISHED_MEP_DELETION_STATUS, payload: '' });
				}}
				closeOnDimmerClick={false}
			>
				<Modal.Header>Confirm Delete - {cardKey}</Modal.Header>
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
							handleDeletePackage(cardId);
							setIsDeleteMEPModalOpen(false);
						}}
					>
						Yes
					</Button>
				</Modal.Actions>
			</Modal>
		);
	};

	return publishedPackages.map((pkg, i) => {
		const endOfRow = (i + 1) % 5 === 0 ? true : false; //the grid is columns of 5. Determines if the card is the last item in the column
		return (
			<>
				<Grid.Column>
					<Card
						fluid
						// NOTE - TODO: when viewing/opening functionaility of published MEPs is available, un-comment out the 'link' flag below
						// link - this flag automatically enables card hover animation.
						key={i}
						onClick={() => {
							dispatch({ type: actionTypes.SET_IS_VIEW_PUBLISHED_MEP_MESSAGE_OPEN, payload: true });
						}}
					>
						<Card.Content>
							<Dropdown
								open={false} // open set to false to prevent UI rendering issues
								item
								simple
								icon='ellipsis horizontal'
								className='cardMenu'
							>
								{/* publishedPackageDropdown className is needed here to override semantic UI's dropdown positioning */}
								<Dropdown.Menu direction={endOfRow ? 'left' : 'right'} className='publishedPackageDropdown'>
									{/* Some dropdown items are disabled until their functionality is implemented */}
									<Dropdown.Item
										onClick={(e) => {
											if (openedPackageName !== '') {
												dispatch({ type: actionTypes.SET_COPY_MIGRATE_ACTION, payload: 'copy' });
												dispatch({ type: actionTypes.IS_COPY_MIGRATE_WARNING_MODAL_OPEN, payload: true });
											} else {
												dispatch({ type: actionTypes.IS_COPY_MEP_MODAL_OPEN, payload: true });
											}
											dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: pkg }); // variable used in 'Copy MEP' modal to display
										}}
									>
										Copy
									</Dropdown.Item>
									{/* only offer delete functionaility for package that belong to the user */}
									{pkg.isSelfOwned ? (
										<Dropdown.Item
											onClick={(e) => {
												setIsDeleteMEPModalOpen(true);
												setCardKey(pkg.PackageName);
												setCardId(pkg.PackageId);
											}}
										>
											Delete
										</Dropdown.Item>
									) : null}
									<Dropdown.Item
										onClick={(e) => {
											exportArtifactItem('', '0', pkg.PackageName, pkg.PackageId, pkg);
										}}
									>
										Export
									</Dropdown.Item>
									{disableMigrateButton(pkg) ? (
										<Popup
											className='roleTooltipIcon'
											content={tooltipContent.migrateRelease}
											position='top center'
											trigger={<Dropdown.Item className='disabledDropdownItem'>Migrate Release</Dropdown.Item>}
										/>
									) : (
										<Dropdown.Item
											onClick={() => {
												if (openedPackageName !== '') {
													dispatch({ type: actionTypes.SET_COPY_MIGRATE_ACTION, payload: 'migrate' });
													dispatch({ type: actionTypes.IS_COPY_MIGRATE_WARNING_MODAL_OPEN, payload: true });
												} else {
													dispatch({ type: actionTypes.RELEASE_MIGRATION_MODAL_OPEN, payload: true });
												}
												dispatch({ type: actionTypes.ROW_DATA, payload: pkg });
											}}
										>
											Migrate Release
										</Dropdown.Item>
									)}
									{/* Only offer translate functionality for package that belong to user */}
									{pkg.isSelfOwned ? (
										<Dropdown.Item>
											<Icon name='dropdown' />
											<span className='text'>Translate</span>
											<Dropdown.Menu
												className={'translateListDropdownMenu ' + (endOfRow ? 'translateDropdownLeft' : '')}
												direction={endOfRow ? 'left' : 'right'}
											>
												<TranslateList sourceComponent='MyHomeCard' packageId={pkg.PackageId} pkg={pkg} index={i} />
											</Dropdown.Menu>
										</Dropdown.Item>
									) : null}
									{/* <Dropdown.Item disabled={true}>Make Public</Dropdown.Item> */}
								</Dropdown.Menu>
							</Dropdown>
							<Card.Header>{pkg.PackageName}</Card.Header>
							<Card.Meta>Organization: {pkg.OrganizationName}</Card.Meta>
							<Card.Meta>Owner: {pkg.Owner}</Card.Meta>
							<Card.Meta>Format(s): {pkg.Format}</Card.Meta>
							<Card.Meta>Release: {pkg.Release}</Card.Meta>
							<Card.Description>{pkg.Status}</Card.Description>
							{pkg.Description.length > 30 ? (
								<Tooltip
									header={pkg.PackageName}
									content={pkg.Description}
									position='top center'
									trigger={<Card.Description className='publishedCardDescription'>{pkg.Description}</Card.Description>}
								/>
							) : (
								<Card.Description className='publishedCardDescription'>{pkg.Description}</Card.Description>
							)}
						</Card.Content>
					</Card>
					{deletePublishedMEPModal()}
				</Grid.Column>
			</>
		);
	});
};

export default MyHomeCard;
