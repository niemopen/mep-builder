import React from 'react';
import { useSelector } from 'react-redux';
import TopNavMenu from '../Navigation/TopNavMenu';
import Workspace from './Workspace';

const PackageBuilder = () => {
	const isStandAloneSys = useSelector((state) => state.session.isStandAloneSys);
	const loggedIn = useSelector((state) => state.session.loggedIn);

	return (
		<div id='packageBuilder'>
			<TopNavMenu />
			{isStandAloneSys || (!isStandAloneSys && loggedIn) ? <Workspace /> : null}
		</div>
	);
};

export default PackageBuilder;
