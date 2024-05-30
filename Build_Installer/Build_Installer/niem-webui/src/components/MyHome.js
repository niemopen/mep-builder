import React from 'react';
import { useSelector } from 'react-redux';
import TopNavMenu from '../Navigation/TopNavMenu.js';
import Workspace from './Workspace';

const MyHome = () => {
	const isStandAloneSys = useSelector((state) => state.session.isStandAloneSys);
	const loggedIn = useSelector((state) => state.session.loggedIn);

	return (
		<div id='myHome'>
			<TopNavMenu />
			{isStandAloneSys || (!isStandAloneSys && loggedIn) ? <Workspace /> : null}
		</div>
	);
};

export default MyHome;
