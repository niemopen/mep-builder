import { React, useEffect } from 'react';
import './styles/App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import HeaderNavMenu from './Navigation/HeaderNavMenu.js';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from './redux/actions';
import { isStandAloneSys } from './config/config';
import { setSessionLocalStorage, initiateSession } from './Util/localStorageUtil';
import { getLoadedReleases } from './Util/LoadNiemDataUtil';
import LoaderModal from './Shared/LoaderModal';
import { useState } from 'react';
import store from './redux/store.js';
import { ForceLogOutCheckTimer } from './Util/AdminModuleUtil.js';

export const releaseOptions = () => {
	const state = store.getState();
	const niemReleases = state.data.loadedReleases;

	let releaseOptionsArray = [];

	if (niemReleases) {
		niemReleases.forEach((r) => {
			releaseOptionsArray.push({
				key: r,
				text: r,
				value: r,
			});
		});
	}

	return releaseOptionsArray;
};

function App() {
	const dispatch = useDispatch();
	const isNiemDataLoading = useSelector((state) => state.data.isNiemDataLoading);
	const forceBrowserRefresh = useSelector((state) => state.session.forceBrowserRefresh);
	const userId = useSelector((state) => state.session.userId);
	const loggedIn = useSelector((state) => state.session.loggedIn);
	const isLogOutActive = useSelector((state) => state.session.isLogOutActive);
	const [loaderActive, setLoaderActive] = useState(false);

	useEffect(() => {
		// Check database for loaded releases
		dispatch({ type: actionTypes.IS_NIEM_DATA_LOADING, payload: true });
		const loadNiemData = async () => {
			setLoaderActive(true);
			const releases = await getLoadedReleases();
			if (releases) {
				dispatch({ type: actionTypes.LOADED_RELEASES, payload: releases });
				setLoaderActive(false);
				dispatch({ type: actionTypes.IS_NIEM_DATA_LOADING, payload: false });
			}
		};

		loadNiemData();
	}, [dispatch]);

	// React Session will use local storage to store session data
	setSessionLocalStorage();

	// To ensure a boolean value is used for isStandAloneSys in the config file, convert string entries to boolean
	if (typeof isStandAloneSys === 'boolean') {
		if (isStandAloneSys) {
			dispatch({ type: actionTypes.UPDATE_STANDALONE, payload: true });
		} else {
			dispatch({ type: actionTypes.UPDATE_STANDALONE, payload: false });
		}
	} else if (typeof isStandAloneSys === 'string') {
		if (isStandAloneSys.toLowerCase() === 'true') {
			dispatch({ type: actionTypes.UPDATE_STANDALONE, payload: true });
		} else if (isStandAloneSys.toLowerCase() === 'false') {
			dispatch({ type: actionTypes.UPDATE_STANDALONE, payload: false });
		} else {
			// in the case of the incorrect value being used, defaulting to non-standalone version of the application
			dispatch({ type: actionTypes.UPDATE_STANDALONE, payload: false });
			console.log('Error: Invalid value for isStandAloneSys in config.json');
		}
	} else {
		// in the case of the incorrect value being used, defaulting to non-standalone version of the application
		dispatch({ type: actionTypes.UPDATE_STANDALONE, payload: false });
		console.log('Error: Invalid value for isStandAloneSys in config.json');
	}

	// enables browser prompt on tab close that unsaved changes may be lost
	useEffect(() => {
		if (forceBrowserRefresh === true) {
			// if browser is being forced to refresh bypass the browser prompt
			return () => {
				window.removeEventListener('beforeunload', handleUnload);
			};
		} else {
			window.addEventListener('beforeunload', handleUnload);
			return () => {
				window.removeEventListener('beforeunload', handleUnload);
			};
		}
	}, [forceBrowserRefresh]);

	const handleUnload = (e) => {
		const message = 'o/';
		(e || window.event).returnValue = message; //Gecko + IE
		return message;
	};

	// don't initiate a session until data is loaded and log out processes have completed.
	if (!isNiemDataLoading && !isLogOutActive) {
		// check if session data already exists
		initiateSession();
	}

	return (
		<Router>
			<div id='niemContent'>
				{userId && loggedIn ? <ForceLogOutCheckTimer userId={userId} /> : null}
				<LoaderModal active={loaderActive} />
				<HeaderNavMenu />
			</div>
		</Router>
	);
}

export default App;
