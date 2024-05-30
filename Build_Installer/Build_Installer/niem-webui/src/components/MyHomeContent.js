import React, { useEffect, useState } from 'react';
import '../styles/App.css';
import { useDispatch, useSelector } from 'react-redux';
import * as key from '../Shared/KVstore';
import * as actionTypes from '../redux/actions';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import MyHomeCard from '../components/MyHomeCardView';
import MyHomeTable from '../components/MyHomeTableView';
import { Divider, Grid, Header, Message, Segment, List, Dropdown, Checkbox, Button } from 'semantic-ui-react';
import LoaderModal from '../Shared/LoaderModal';
import { getSortedMpdDataApi, refreshMyHomePackages } from '../Util/PackageUtil';
import { handleError } from '../Util/ErrorHandleUtil';

function MyHomeContent() {
	const isStandAloneSys = useSelector((state) => state.session.isStandAloneSys);
	const loggedIn = useSelector((state) => state.session.loggedIn);
	const userEmail = useSelector((state) => state.session.userEmail);
	const userId = useSelector((state) => state.session.userId);
	const isFormatTranslationComplete = useSelector((state) => state.home.isFormatTranslationComplete);
	const translatedPackageName = useSelector((state) => state.home.translatedPackageName);
	const isPublishedMEPDeletionComplete = useSelector((state) => state.home.isPublishedMEPDeletionComplete);
	const deletedPublishedPackageName = useSelector((state) => state.home.deletedPublishedPackageName);
	const isPasswordExpiringMessageOpen = useSelector((state) => state.passwordExpiring.isPasswordExpiringMessageOpen);
	const [daysLeft, setDaysLeft] = useState(0);
	const publishedPackages = useSelector((state) => state.packagesList.published);
	const isPublishedActive = useSelector((state) => state.packagesList.isPublishedActive);
	const myHomeLoaderActive = useSelector((state) => state.home.myHomeLoaderActive);
	const isViewPublishedMEPsMessageOpen = useSelector((state) => state.home.isViewPublishedMEPsMessageOpen);
	const unpublishedSearchResults = useSelector((state) => state.packagesList.unpublishedSearchResults);
	const publishedSearchResults = useSelector((state) => state.packagesList.publishedSearchResults);
	const refreshPackages = useSelector((state) => state.home.refreshPackages);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);
	const [selectedPublishedNameSort, setSelectedPublishedNameSort] = useState('ascending');
	const [isShowMyMepChecked, setIsShowMyMepChecked] = useState(false);
	const dispatch = useDispatch();

	useEffect(() => {
		// initially populate home page cards and table with all packages
		getSortedMpdDataApi().then(({ unpublished, published }) => {
			refreshMyHomePackages({ unpublishedPackages: unpublished, publishedPackages: published });
		});
	}, []);

	useEffect(() => {
		// Sorts published package search results based on selected sorting methodology
		function sortPublishedPackageResults() {
			var sortedPublishedPackagesList;
			if (selectedPublishedNameSort === 'ascending') {
				// sort published packages in ascending order by name
				sortedPublishedPackagesList = publishedSearchResults.sort((a, b) => {
					let nameA = a.PackageName.toLowerCase();
					let nameB = b.PackageName.toLowerCase();
					return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
				});
			} else {
				// sort published packages in descending order by name
				sortedPublishedPackagesList = publishedSearchResults.sort((a, b) => {
					let nameA = a.PackageName.toLowerCase();
					let nameB = b.PackageName.toLowerCase();
					return nameA < nameB ? 1 : nameA > nameB ? -1 : 0;
				});
			}
			return sortedPublishedPackagesList;
		}

		// refresh rendered packages on the home page when a refresh is called for
		let isMounted = true;
		// only perform state updates on mounted components
		if (isMounted && refreshPackages) {
			// apply sorting to published package results
			const sortedPublishedSearchResults = sortPublishedPackageResults();
			if (isShowMyMepChecked) {
				const userMeps = sortedPublishedSearchResults.filter((pkg) => {
					return pkg.isSelfOwned === true;
				});
				refreshMyHomePackages({ unpublishedPackages: unpublishedSearchResults, publishedPackages: userMeps });
			} else {
				refreshMyHomePackages({ unpublishedPackages: unpublishedSearchResults, publishedPackages: sortedPublishedSearchResults });
			}
			dispatch({ type: actionTypes.REFRESH_PACKAGES, payload: false });
		}
		return () => {
			isMounted = false; // use effect cleanup to set flag false, if unmounted
		};
	}, [refreshPackages, dispatch, unpublishedSearchResults, publishedSearchResults, selectedPublishedNameSort, isShowMyMepChecked]);

	// grab account status on load
	useEffect(() => {
		const accountStatus = async () => {
			if (!systemErrorOccurred) {
				return axios
					.post(baseURL + 'Auth/accountStatus', {
						username: userEmail,
						userId: userId,
					})
					.then((response) => {
						return response.data;
					})
					.catch((error) => {
						handleError(error);
						return false;
					});
			} else {
				return false;
			}
		};

		const setDays = async () => {
			const status = await accountStatus();
			if (status !== false) {
				setDaysLeft(status.daysUntilLocked);
			}
		};

		// empty or null values cause errors
		if (userId !== null && userId !== '') {
			setDays();
		}
	}, [userId, userEmail]);

	const passwordExpiringMessage = {
		header: `Your password expires in ${daysLeft} days`,
		content: (
			<p>
				Please{' '}
				<span className='updatePasswordLink' onClick={() => dispatch({ type: actionTypes.USER_PROFILE_MODAL_OPEN })}>
					update password
				</span>{' '}
				to avoid account lockout.
			</p>
		),
	};

	const viewPublishedMEPsMessage = {
		header: ['In order to view a Published ', key.packageNameAcronymn, ' the following two options are available:'],
		content: (
			<List bulleted>
				<List.Item>
					Export the desired {key.packageNameAcronymn} and open it in a program of your choice, to view <strong>outside of </strong> the MEP
					Builder
				</List.Item>
				<List.Item>
					Make a copy of the desired {key.packageNameAcronymn}, which will add it to your existing Open/Unpublished MEPs, to view and edit
					within the MEP Builder
				</List.Item>
			</List>
		),
	};

	const numberOfPublishedPackages = publishedPackages.length;

	return (
		<div id='myHomeContent' className='contentPage'>
			{isStandAloneSys || (!isStandAloneSys && loggedIn) ? (
				<div className='workspace'>
					<LoaderModal active={myHomeLoaderActive} />
					<Message
						floating
						warning
						className='passwordExpiringWarning'
						hidden={!isPasswordExpiringMessageOpen}
						onDismiss={() => {
							dispatch({ type: actionTypes.PASSWORD_EXPIRING_MESSAGE_OPEN, payload: false });
						}}
					>
						<Message.Header>{passwordExpiringMessage.header}</Message.Header>
						{passwordExpiringMessage.content}
					</Message>
					<h2>
						{key.packageName} ({key.packageNameAcronymn}) Home
					</h2>
					<Divider hidden />
					<Segment>
						<Header size='medium'>Open/Unpublished</Header>
						<Divider hidden />
						<MyHomeTable />
					</Segment>
					<Divider hidden />
					<Segment>
						<div className='myHomePublishedSectionHeader'>
							<Header size='medium'>Published {isPublishedActive ? `(${publishedSearchResults.length})` : null}</Header>
							{isPublishedActive ? (
								<div>
									<Dropdown className='cardMenu' text='Sort By' simple closeOnChange={false} direction='left'>
										<Dropdown.Menu>
											<Dropdown.Item>
												<Checkbox
													label='Ascending by name (A-Z)'
													value='ascending'
													defaultChecked
													checked={selectedPublishedNameSort === 'ascending'}
													onChange={(e, d) => {
														setSelectedPublishedNameSort(d.value);
													}}
												/>
											</Dropdown.Item>
											<Dropdown.Item>
												<Checkbox
													label='Descending by name (Z-A)'
													value='descending'
													checked={selectedPublishedNameSort === 'descending'}
													onChange={(e, d) => {
														setSelectedPublishedNameSort(d.value);
													}}
												/>
											</Dropdown.Item>
											<Button
												className='primaryButton'
												content='Apply'
												onClick={() => dispatch({ type: actionTypes.REFRESH_PACKAGES, payload: true })}
											/>
										</Dropdown.Menu>
									</Dropdown>
									<Checkbox
										className='showMyMeps'
										label={`Only Show my ${key.packageNameAcronymn}s`}
										checked={isShowMyMepChecked}
										onChange={(e, d) => {
											setIsShowMyMepChecked(d.checked);
											dispatch({ type: actionTypes.REFRESH_PACKAGES, payload: true });
										}}
									/>
								</div>
							) : null}
						</div>

						{isFormatTranslationComplete === 'success' ? (
							<Message
								success
								header='Format Translation Completed'
								content={
									<>
										<b>{translatedPackageName}</b>
										<span>'s format translation has been successfully completed and added to its package artifacts.</span>
									</>
								}
							/>
						) : isFormatTranslationComplete === 'fail' ? (
							<Message
								error
								header='Format Translation Not Completed'
								content={'Your Format Translation was unsuccessful. Please try again.'}
							/>
						) : isPublishedMEPDeletionComplete === 'success' ? (
							<Message
								success
								content={
									<>
										<b>{deletedPublishedPackageName}</b>
										<span> has been deleted.</span>
									</>
								}
							/>
						) : isPublishedMEPDeletionComplete === 'fail' ? (
							<Message
								error
								header='Unable to Delete'
								content={
									<p>
										<b>{deletedPublishedPackageName}</b> was unable to delete.
										<br />
										Please try again.
									</p>
								}
							/>
						) : null}

						<Divider hidden />
						{!isPublishedActive ? (
							<p className='publishedPackagesMessage'>
								{numberOfPublishedPackages}
								{numberOfPublishedPackages === 1 ? ' Published Package' : ' Published Packages'} <br></br> To view published packages,
								enable "Include Published MEPS" in the Advanced Search dropdown menu at the top of the page
							</p>
						) : (
							<>
								<Message
									info
									hidden={!isViewPublishedMEPsMessageOpen}
									onDismiss={() => {
										dispatch({ type: actionTypes.SET_IS_VIEW_PUBLISHED_MEP_MESSAGE_OPEN, payload: false });
									}}
								>
									<Message.Header>{viewPublishedMEPsMessage.header}</Message.Header>
									{viewPublishedMEPsMessage.content}
								</Message>
								<Grid columns={5} className='myHomeCardGrid'>
									<MyHomeCard />
								</Grid>
							</>
						)}
					</Segment>
				</div>
			) : null}
		</div>
	);
}

export default MyHomeContent;
