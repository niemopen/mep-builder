import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import * as sessionVar from '../Util/SessionVar';
import { Modal, Button, Form } from 'semantic-ui-react';
import { handleSavePackage, handleSaveClosePackage } from '../Util/savePackageUtil';
import Tooltip from './Tooltip.js';
import { setActiveSidebarTab } from '../Navigation/LeftNavContent';
import { Link } from 'react-router-dom';
import { setSessionValue } from '../Util/localStorageUtil';
import { releaseOptions } from '../App.js';
import { isStringFieldValid } from '../Util/FieldValidationUtil';
import { isDuplicatePublishedPackageName } from '../Util/PackageUtil';

const ReleaseModal = () => {
	const dispatch = useDispatch();

	const isReleaseModalOpen = useSelector((state) => state.release.isReleaseModalOpen);
	const packageName = useSelector((state) => state.mpd.packageName);
	const release = useSelector((state) => state.mpd.release);
	const organizationName = useSelector((state) => state.mpd.organizationName);
	const isReleaseLocked = useSelector((state) => state.mpd.isReleaseLocked);
	const creationGuideActive = useSelector((state) => state.sidebar.creationGuideActive);
	const packageBuilderActive = useSelector((state) => state.header.packageBuilderActive);
	const returnHomeOnSave = useSelector((state) => state.existing.returnHomeOnSave);
	const isNiemDataLoading = useSelector((state) => state.data.isNiemDataLoading);

	const [unconfirmedPackageName, setUnconfirmedPackageName] = useState(packageName);
	const [unconfirmedRelease, setUnconfirmedRelease] = useState(release);
	const [unconfirmedOrganizationName, setUnconfirmedOrganizationName] = useState(organizationName);
	const [isFormComplete, setIsFormComplete] = useState(false);
	const [isDuplicatePublishedName, setIsDuplicatePublishedName] = useState(false);
	const formMessage = 'All fields are required to proceed';

	useEffect(() => {
		// update unconfirmedPackageName and unconfirmedRelease from MPD
		setUnconfirmedRelease(release);
		setUnconfirmedPackageName(packageName);
		setUnconfirmedOrganizationName(organizationName);
	}, [release, packageName, organizationName]);

	useEffect(() => {
		validateInputName();
	}, [unconfirmedPackageName, unconfirmedOrganizationName]);

	useEffect(() => {
		// show/hide release modal based on sidebar tab, header tab, isReleaseLocked, and isNiemDataLoading state
		if (!isReleaseLocked && !creationGuideActive && packageBuilderActive && !isNiemDataLoading) {
			dispatch({ type: actionTypes.RELEASE_MODAL_OPEN, payload: true });
		} else {
			dispatch({ type: actionTypes.RELEASE_MODAL_OPEN, payload: false });
		}
	}, [isReleaseLocked, creationGuideActive, packageBuilderActive, dispatch, isNiemDataLoading]);

	const validateInputName = () => {
		const packageResult = isStringFieldValid(unconfirmedPackageName);
		const orgResult = isStringFieldValid(unconfirmedOrganizationName);
		if (packageResult && orgResult) {
			setIsFormComplete(true);
		} else {
			setIsFormComplete(false);
		}
	};

	const handleConfirm = async () => {
		const isDuplicatePublishedName = await isDuplicatePublishedPackageName(unconfirmedPackageName);
		setIsDuplicatePublishedName(isDuplicatePublishedName);
		// only proceed if name is not in use by a published package
		if (!isDuplicatePublishedName) {
			// update packageName, release, release locked state, then save package
			setSessionValue(sessionVar.unsaved_package_name, unconfirmedPackageName, actionTypes.UPDATE_MPD_PACKAGE_NAME);
			setSessionValue(sessionVar.open_package_name, unconfirmedPackageName, actionTypes.UPDATE_MPD_PACKAGE_NAME);
			setSessionValue(sessionVar.unsaved_release, unconfirmedRelease, actionTypes.UPDATE_MPD_RELEASE);
			dispatch({ type: actionTypes.UPDATE_MPD_RELEASE_LOCKED, payload: true });
			setSessionValue(sessionVar.unsaved_organization, unconfirmedOrganizationName, actionTypes.UPDATE_MPD_ORGANIZATION_NAME);
			if (returnHomeOnSave) {
				handleSaveClosePackage();
			} else {
				await handleSavePackage();
			}

			dispatch({ type: actionTypes.RELEASE_MODAL_OPEN, payload: false });
		}
	};

	return (
		<Modal size='tiny' open={isReleaseModalOpen}>
			<Modal.Header>Confirm MEP Metadata</Modal.Header>
			<Modal.Content>
				<p>
					You are creating this MEP under NIEM Release <b>{unconfirmedRelease}.</b>
				</p>
				<p>
					Before proceeding, please confirm MEP Name and NIEM Release to ensure proper mapping of properties and types, conformance
					attestation, and to enforce the appropriate NDR Rules.
				</p>
				<Form>
					<Form.Group>
						<Form.Input
							width={12}
							required
							label='MEP Name'
							value={unconfirmedPackageName}
							onChange={(e, d) => {
								setUnconfirmedPackageName(d.value);
								validateInputName();
							}}
							error={
								isDuplicatePublishedName
									? {
											content: 'A Published Package with this name already exists.',
											pointing: 'above',
									  }
									: false
							}
						/>
						<Form.Dropdown
							width={4}
							selection
							compact
							search
							required
							label='NIEM Release'
							options={releaseOptions()}
							value={unconfirmedRelease}
							onChange={(e, d) => {
								setUnconfirmedRelease(d.value);
							}}
						/>
					</Form.Group>

					<Form.Group>
						<Form.Input
							width={16}
							required
							label='Organization Name'
							value={unconfirmedOrganizationName}
							onChange={(e, d) => {
								setUnconfirmedOrganizationName(d.value);
							}}
						/>
					</Form.Group>
				</Form>
				{isFormComplete ? null : <p>{formMessage}</p>}
			</Modal.Content>
			<Modal.Actions>
				<Button
					id='sidebarCreationGuideMenu'
					as={Link}
					to='/PackageBuilder/EditPackage'
					active={creationGuideActive}
					className='secondaryButton'
					onClick={() => {
						//reset modal values, close modal, and return to creation guide page
						setUnconfirmedRelease(release);
						setUnconfirmedPackageName(packageName);
						dispatch({ type: actionTypes.RELEASE_MODAL_OPEN, payload: false });
						setActiveSidebarTab('CreationGuide', dispatch);
					}}
				>
					Cancel
				</Button>
				{
					// only show tooltip if form is invalid
					isFormComplete ? (
						<Button
							className='primaryButton'
							onClick={() => {
								handleConfirm();
							}}
						>
							Confirm
						</Button>
					) : (
						<Tooltip
							content={formMessage}
							position='top center'
							trigger={<Button className='primaryButton disabledButton'>Confirm</Button>}
						/>
					)
				}
			</Modal.Actions>
		</Modal>
	);
};

export default ReleaseModal;
