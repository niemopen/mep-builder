import React from 'react';
import AdminModule from './AdminModule';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

const Administrator = () => {
	const loggedIn = useSelector((state) => state.session.loggedIn);
	const userPermissions = useSelector((state) => state.session.userPermissions);
	const history = useHistory();

	return (
		<div id='myHome' className='contentPage'>
			{/* if not logged in or have appropriate permissions, redirect user back to home and prevent browser history bypass */}
			{loggedIn && userPermissions.includes('control:adminModule') ? (
				<>
					<h1>System Administrator</h1>
					<AdminModule />{' '}
				</>
			) : (
				history.replace('/MyHome')
			)}
		</div>
	);
};

export default Administrator;
