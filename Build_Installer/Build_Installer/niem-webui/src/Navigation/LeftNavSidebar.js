import React, { useEffect, useState } from 'react';
import { Menu, Sidebar } from 'semantic-ui-react';
import LeftNavContent from './LeftNavContent';
import { Route, Switch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import CreateNewIEPD from '../components/CreateNewIEPD.js';
import AnalyzeRequirements from '../components/AnalyzeRequirements.js';
import MapModel from '../components/MapModel.js';
import BuildValidate from '../components/BuildValidate.js';
import AssembleDocument from '../components/AssembleDocument.js';
import ScenarioPlanning from '../components/ScenarioPlanning.js';
import PublishImplement from '../components/PublishImplement';
import * as actionTypes from '../redux/actions';
import UploadModal from '../Shared/UploadModal';

function LeftNavSidebar() {
	const sidebarVisible = useSelector((state) => state.top.sidebarVisible);
	const topNavHeight = useSelector((state) => state.top.topNavHeight);
	const sidebarWidth = useSelector((state) => state.sidebar.sidebarWidth);
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	const [windowHeight, setWindowHeight] = useState(window.innerHeight);
	const dispatch = useDispatch();

	const pusherContentStyle = { width: windowWidth - sidebarWidth + 'px' };
	const pushableContentStyle = { minHeight: windowHeight - topNavHeight + 'px' };

	function debounce(fn, ms) {
		let timer;
		return (_) => {
			clearTimeout(timer);
			timer = setTimeout((_) => {
				timer = null;
				fn.apply(this, arguments);
			}, ms);
		};
	}

	const debouncedHandleResize = debounce(function handleResize() {
		setWindowWidth(window.innerWidth);
		setWindowHeight(window.innerHeight);
	}, 1000);

	useEffect(() => {
		dispatch({ type: actionTypes.UPDATE_SIDEBAR_WIDTH });
		window.addEventListener('resize', debouncedHandleResize);
		return () => window.removeEventListener('resize', debouncedHandleResize);
	});

	return (
		<Sidebar.Pushable style={pushableContentStyle} id='LeftNavSidebarPushable'>
			<Sidebar as={Menu} animation='slide along' vertical visible={sidebarVisible} id='sidebar' width='wide'>
				<LeftNavContent />
			</Sidebar>
			<Sidebar.Pusher style={pusherContentStyle}>
				<UploadModal />
				<Switch>
					<Route path='/PackageBuilder/EditPackage' component={CreateNewIEPD} />
					<Route path='/PackageBuilder/ScenarioPlanning' component={ScenarioPlanning} />
					<Route path='/PackageBuilder/AnalyzeRequirements' component={AnalyzeRequirements} />
					<Route path='/PackageBuilder/MapModel' component={MapModel} />
					<Route path='/PackageBuilder/BuildValidate' component={BuildValidate} />
					<Route path='/PackageBuilder/AssembleDocument' component={AssembleDocument} />
					<Route path='/PackageBuilder/PublishImplement' component={PublishImplement} />
					{/* Default route */}
					<Route component={CreateNewIEPD} />
				</Switch>
			</Sidebar.Pusher>
		</Sidebar.Pushable>
	);
}

export default LeftNavSidebar;
