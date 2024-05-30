import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import AccessControl from '../Shared/AccessControl';
import * as sessionVar from '../Util/SessionVar';
import GettingStarted from '../components/GettingStarted';
import MyHome from '../components/MyHome';
import PackageBuilder from '../components/PackageBuilder';
import Training from '../components/Training';
import Administrator from '../components/Administrator';
import ContactModalStatic from '../Shared/ContactModalStatic';
import UserProfileModal from '../Shared/UserProfileModal';
import LogOutModal from '../Shared/LogOutModal';
import Tooltip from '../Shared/Tooltip.js';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import * as key from '../Shared/KVstore';
import * as tooltipContent from '../Shared/TooltipContent.js';
import { setActiveSidebarTab } from './LeftNavContent';
import { setSessionValue } from '../Util/localStorageUtil';

import { Dropdown, Grid, Menu } from 'semantic-ui-react';

import logo from '../images/NIEM-NO-Horiz-Logo-WEB-FINAL.png';
import ApiErrorDetailsModal from '../Shared/ApiErrorDetailsModal.js';

export const setActiveTab = (tab) => {
	switch (tab) {
		case 'MyHome':
			setSessionValue(sessionVar.active_tab, 'MyHome', actionTypes.MY_HOME_ACTIVE);
			break;
		case 'GettingStarted':
			setSessionValue(sessionVar.active_tab, 'GettingStarted', actionTypes.GETTING_STARTED_ACTIVE);
			break;
		case 'PackageBuilder':
			setSessionValue(sessionVar.active_tab, 'PackageBuilder', actionTypes.PACKAGE_BUILDER_ACTIVE);
			break;
		case 'Training':
			setSessionValue(sessionVar.active_tab, 'Training', actionTypes.TRAINING_ACTIVE);
			break;
		case 'Administrator':
			setSessionValue(sessionVar.active_tab, 'Administrator', actionTypes.ADMINISTRATOR_ACTIVE);
			break;
		default:
			setSessionValue(sessionVar.active_tab, 'MyHome', actionTypes.MY_HOME_ACTIVE);
	}
};

const HeaderNavMenu = () => {
	const isStandAloneSys = useSelector((state) => state.session.isStandAloneSys);
	const loggedIn = useSelector((state) => state.session.loggedIn);
	const userEmail = useSelector((state) => state.session.userEmail);
	const userPermissions = useSelector((state) => state.session.userPermissions);

	// Sidebar tabs
	const creationGuideActive = useSelector((state) => state.sidebar.creationGuideActive);
	const scenarioPlanningActive = useSelector((state) => state.sidebar.scenarioPlanningActive);
	const analyzeRequirementsActive = useSelector((state) => state.sidebar.analyzeRequirementsActive);
	const mapModelActive = useSelector((state) => state.sidebar.mapModelActive);
	const buildValidateActive = useSelector((state) => state.sidebar.buildValidateActive);
	const assembleDocumentActive = useSelector((state) => state.sidebar.assembleDocumentActive);
	const publishImplementActive = useSelector((state) => state.sidebar.publishImplementActive);

	// Header tabs
	const gettingStartedActive = useSelector((state) => state.header.gettingStartedActive);
	const myHomeActive = useSelector((state) => state.header.myHomeActive);
	const packageBuilderActive = useSelector((state) => state.header.packageBuilderActive);
	const strategicInitiativesActive = useSelector((state) => state.header.strategicInitiativesActive);
	const communitiesActive = useSelector((state) => state.header.communitiesActive);
	const trainingActive = useSelector((state) => state.header.trainingActive);
	const administratorActive = useSelector((state) => state.header.administratorActive);

	const dispatch = useDispatch();
	const history = useHistory();

	const navigationTabs = {
		header: {
			gettingStarted: { name: 'gettingStarted', status: gettingStartedActive, url: '/GettingStarted' },
			myHome: { name: 'myHome', status: myHomeActive, url: '/MyHome' },
			packageBuilder: { name: 'packageBuilder', status: packageBuilderActive, url: '/PackageBuilder/EditPackage' },
			strategicInitiatives: { name: 'strategicInitiatives', status: strategicInitiativesActive, url: '/' },
			communities: { name: 'communities', status: communitiesActive, url: '/' },
			training: { name: 'training', status: trainingActive, url: '/Training' },
			administrator: { name: 'administrator', status: administratorActive, url: '/Administrator' },
		},
		sidebar: {
			creationGuide: { name: 'creationGuide', status: creationGuideActive, url: '/PackageBuilder/EditPackage' },
			scenarioPlanning: { name: 'scenarioPlanning', status: scenarioPlanningActive, url: '/PackageBuilder/ScenarioPlanning' },
			analyzeRequirements: { name: 'analyzeRequirements', status: analyzeRequirementsActive, url: '/PackageBuilder/AnalyzeRequirements' },
			mapModel: { name: 'mapModel', status: mapModelActive, url: '/PackageBuilder/MapModel' },
			buildValidate: { name: 'buildValidate', status: buildValidateActive, url: '/PackageBuilder/BuildValidate' },
			assembleDocument: { name: 'assembleDocument', status: assembleDocumentActive, url: '/PackageBuilder/AssembleDocument' },
			publishImplement: { name: 'publishImplement', status: publishImplementActive, url: '/PackageBuilder/PublishImplement' },
		},
	};

	useEffect(() => {
		const updateURL = () => {
			// this function updates the page URL based on the currently active tab to keep the UI and URL in sync.
			const headerTabs = checkTabs(navigationTabs.header);
			const sidebarTabs = checkTabs(navigationTabs.sidebar);

			if (headerTabs.result) {
				if (headerTabs.activeTab.name === 'packageBuilder') {
					// if packageBuilder is active, grab the active sidebarTab url
					if (sidebarTabs.result) {
						history.push(sidebarTabs.activeTab.url);
					} else {
						// if all sidebar tabs are false, go to package builder's default page
						history.push(headerTabs.activeTab.url);
					}
				} else {
					// if the packageBuilder is not active, update the url with the current active header
					history.push(headerTabs.activeTab.url);
				}
			} else {
				// if all header tabs are false, go to home page
				history.push('/');
			}
		};

		updateURL();
	}, [navigationTabs.header, navigationTabs.sidebar, history]);

	const checkTabs = (obj) => {
		const statusArr = [];
		let activeTab = {};
		for (const item in obj) {
			if (obj[item].status) {
				// if status is true, return with information about the activeTab as we don't need to check for false values later in the function
				activeTab = obj[item];
				return {
					result: true,
					activeTab: activeTab,
				};
			} else {
				statusArr.push(obj[item].status);
			}
		}

		// will return true if only false values are found
		const allFalseValues = statusArr.every((item) => {
			return item === false;
		});

		return {
			result: !allFalseValues,
		};
	};

	return (
		<div className='NavMenu'>
			<ContactModalStatic />
			<UserProfileModal />
			<ApiErrorDetailsModal />
			<LogOutModal />
			<Grid padded id='headerMenu'>
				<Menu borderless inverted fluid fixed='top' className='headerMenu-neim-row'>
					<Menu.Item className='headerMenu-neim-text'>NIEMOpen</Menu.Item>
				</Menu>
				<Menu className='headerMenu-logo-row' borderless fluid>
					<Menu.Item position='left'>
						<img src={logo} alt='Logo' className='headerMenu-logo-img' />
					</Menu.Item>
					<Menu.Item as='a'>
						<Tooltip
							content={tooltipContent.currentRelease}
							position='bottom center'
							trigger={<Dropdown.Item text='Current Release' />}
						/>
					</Menu.Item>
					<Menu.Item as='a' onClick={() => dispatch({ type: actionTypes.CONTACT_MODAL_OPEN })}>
						Contact
					</Menu.Item>
					{isStandAloneSys === false ? (
						<>
							{loggedIn ? (
								<Dropdown item text={userEmail}>
									<Dropdown.Menu>
										<Dropdown.Item
											as={Link}
											to='/'
											text='View Profile'
											onClick={() => dispatch({ type: actionTypes.USER_PROFILE_MODAL_OPEN })}
										/>
										<Dropdown.Item
											as={Link}
											to='/'
											text='Log Out'
											onClick={() => dispatch({ type: actionTypes.LOG_OUT_MODAL_OPEN })}
										/>
									</Dropdown.Menu>
								</Dropdown>
							) : (
								<Menu.Item as={Link} to='/MyHome' position='right' onClick={() => setActiveTab('MyHome')}>
									Sign In
								</Menu.Item>
							)}
						</>
					) : null}
				</Menu>
				<Menu className='headerMenu-navigation-row' borderless fluid>
					<Menu.Item active={gettingStartedActive} as={Link} to='/GettingStarted' onClick={() => setActiveTab('GettingStarted')}>
						<p>Getting Started</p>
					</Menu.Item>
					<Menu.Item active={myHomeActive} as={Link} to='/MyHome' onClick={() => setActiveTab('MyHome')}>
						<p>My Home</p>
					</Menu.Item>
					<Menu.Item
						active={packageBuilderActive}
						as={Link}
						to='/PackageBuilder/EditPackage'
						onClick={() => {
							setActiveTab('PackageBuilder');
							setActiveSidebarTab('CreationGuide', dispatch);
						}}
					>
						<Tooltip content={[key.packageName, '  Builder']} position='top center' trigger={<p>{key.packageNameAcronymn} Builder</p>} />
					</Menu.Item>
					<Menu.Item active={trainingActive} as={Link} to='/Training' onClick={() => setActiveTab('Training')}>
						<p>Training</p>
					</Menu.Item>
					{isStandAloneSys === false ? (
						<AccessControl userPermissions={userPermissions} allowedPermissions={['control:adminModule']}>
							<Menu.Item active={administratorActive} as={Link} to='/Administrator' onClick={() => setActiveTab('Administrator')}>
								<p>Administrator</p>
							</Menu.Item>
						</AccessControl>
					) : null}
				</Menu>
			</Grid>
			<Switch>
				<Route exact path='/' component={MyHome} />
				<Route exact path='/MyHome' component={MyHome} />
				<Route exact path='/GettingStarted' component={GettingStarted} />
				<Route path='/PackageBuilder/' component={PackageBuilder} />
				<Route path='/Training' component={Training} />
				<Route path='/Administrator' component={Administrator} />
			</Switch>
		</div>
	);
};

export default HeaderNavMenu;
