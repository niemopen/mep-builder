import { ReactSession } from 'react-client-session';
import * as sessionVar from './SessionVar';
import store from '../redux/store';
import * as actionTypes from '../redux/actions';
import { handleOpenPackage } from '../components/MyHomeTableView';
import { closePackage } from './savePackageUtil';

export const setSessionLocalStorage = () => {
	ReactSession.setStoreType('localStorage');
};

export const getSessionValue = (key) => {
	return ReactSession.get(key);
};

export const setSessionValue = (key, value, actionType = null) => {
	// update local storage
	ReactSession.set(key, value);

	// update redux
	if (actionType) {
		store.dispatch({ type: actionType, payload: value });
	}
};

export const setLogOut = () => {
	store.dispatch({ type: actionTypes.IS_LOG_OUT_ACTIVE, payload: true }); // prevent initiateSession() from running while log out processes are happening
	store.dispatch({ type: actionTypes.UPDATE_LOGGED_IN, payload: false });
	store.dispatch({ type: actionTypes.UPDATE_USER_ROLE, payload: 'User' });

	closePackage();
	clearAllSessionData();
	store.dispatch({ type: actionTypes.IS_LOG_OUT_ACTIVE, payload: false });
};

// clear ALL local storage data. Includes unsaved/temp package data and user logged in information
export const clearAllSessionData = () => {
	localStorage.clear();
};

// Clear only unsaved/temp package data
export const clearUnsavedData = () => {
	ReactSession.remove(sessionVar.unsaved_package_name);
	ReactSession.remove(sessionVar.unsaved_release);
	ReactSession.remove(sessionVar.unsaved_version);
	ReactSession.remove(sessionVar.unsaved_status);
	ReactSession.remove(sessionVar.unsaved_status_no);
	ReactSession.remove(sessionVar.unsaved_POC);
	ReactSession.remove(sessionVar.unsaved_email);
	ReactSession.remove(sessionVar.unsaved_description);
	ReactSession.remove(sessionVar.unsaved_organization);
	ReactSession.remove(sessionVar.unsaved_organization_type);
	ReactSession.remove(sessionVar.unsaved_coi_tags);
	ReactSession.remove(sessionVar.unsaved_exchange_tags);

	ReactSession.remove(sessionVar.unsaved_property_sheet);
	ReactSession.remove(sessionVar.unsaved_type_sheet);
	ReactSession.remove(sessionVar.unsaved_type_has_property_sheet);
	ReactSession.remove(sessionVar.unsaved_codes_facets_sheet);
	ReactSession.remove(sessionVar.unsaved_namespace_sheet);
	ReactSession.remove(sessionVar.unsaved_local_terminology_sheet);
	ReactSession.remove(sessionVar.unsaved_type_union_sheet);
	ReactSession.remove(sessionVar.unsaved_metadata_sheet);

	ReactSession.remove(sessionVar.unsaved_artifact_tree);
	ReactSession.remove(sessionVar.unsaved_subset_uploaded);
	ReactSession.remove(sessionVar.unsaved_catalog_uploaded);
	ReactSession.remove(sessionVar.unsaved_sample_uploaded);
	ReactSession.remove(sessionVar.unsaved_readme_uploaded);
	ReactSession.remove(sessionVar.unsaved_changelog_uploaded);
	ReactSession.remove(sessionVar.unsaved_conformance_uploaded);

	ReactSession.remove(sessionVar.unsaved_cme_data);
};

export const restoreUnsavedPackageData = () => {
	if (getSessionValue(sessionVar.unsaved_package_name)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_PACKAGE_NAME, payload: getSessionValue(sessionVar.unsaved_package_name) });
	}
	if (getSessionValue(sessionVar.unsaved_release)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_RELEASE, payload: getSessionValue(sessionVar.unsaved_release) });
	}
	if (getSessionValue(sessionVar.unsaved_version)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_VERSION, payload: getSessionValue(sessionVar.unsaved_version) });
	}
	if (getSessionValue(sessionVar.unsaved_status)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_STATUS, payload: getSessionValue(sessionVar.unsaved_status) });
	}
	if (getSessionValue(sessionVar.unsaved_status_no)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_STATUS_NO, payload: getSessionValue(sessionVar.unsaved_status_no) });
	}
	if (getSessionValue(sessionVar.unsaved_POC)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_POC, payload: getSessionValue(sessionVar.unsaved_POC) });
	}
	if (getSessionValue(sessionVar.unsaved_email)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_EMAIL, payload: getSessionValue(sessionVar.unsaved_email) });
	}
	if (getSessionValue(sessionVar.unsaved_description)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_DESCRIPTION, payload: getSessionValue(sessionVar.unsaved_description) });
	}
	if (getSessionValue(sessionVar.unsaved_organization)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_ORGANIZATION_NAME, payload: getSessionValue(sessionVar.unsaved_organization) });
	}
	if (getSessionValue(sessionVar.unsaved_coi_tags)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_COI_TAGS, payload: getSessionValue(sessionVar.unsaved_coi_tags) });
	}
	if (getSessionValue(sessionVar.unsaved_exchange_tags)) {
		store.dispatch({ type: actionTypes.UPDATE_MPD_EXCHANGE_TAGS, payload: getSessionValue(sessionVar.unsaved_exchange_tags) });
	}
	if (getSessionValue(sessionVar.unsaved_codes_facets_sheet)) {
		store.dispatch({ type: actionTypes.UPDATE_CODES_FACETS_SHEET, payload: getSessionValue(sessionVar.unsaved_codes_facets_sheet) });
	}
	if (getSessionValue(sessionVar.unsaved_codes_facets_sheet)) {
		store.dispatch({ type: actionTypes.UPDATE_CODES_FACETS_SHEET, payload: getSessionValue(sessionVar.unsaved_codes_facets_sheet) });
	}
	// custom model extensions
	if (getSessionValue(sessionVar.unsaved_cme_data)) {
		store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_DATA, payload: getSessionValue(sessionVar.unsaved_cme_data) });
	}
};

export const restoreUnsavedMappingDoc = () => {
	if (getSessionValue(sessionVar.unsaved_property_sheet)) {
		store.dispatch({ type: actionTypes.UPDATE_PROPERTY_SHEET, payload: getSessionValue(sessionVar.unsaved_property_sheet) });
	}
	if (getSessionValue(sessionVar.unsaved_type_sheet)) {
		store.dispatch({ type: actionTypes.UPDATE_TYPE_SHEET, payload: getSessionValue(sessionVar.unsaved_type_sheet) });
	}
	if (getSessionValue(sessionVar.unsaved_type_has_property_sheet)) {
		store.dispatch({ type: actionTypes.UPDATE_TYPE_HAS_PROPERTY_SHEET, payload: getSessionValue(sessionVar.unsaved_type_has_property_sheet) });
	}
	if (getSessionValue(sessionVar.unsaved_namespace_sheet)) {
		store.dispatch({ type: actionTypes.UPDATE_NAMESPACE_SHEET, payload: getSessionValue(sessionVar.unsaved_namespace_sheet) });
	}
	if (getSessionValue(sessionVar.unsaved_local_terminology_sheet)) {
		store.dispatch({ type: actionTypes.UPDATE_LOCAL_TERMINOLOGY_SHEET, payload: getSessionValue(sessionVar.unsaved_local_terminology_sheet) });
	}
	if (getSessionValue(sessionVar.unsaved_type_union_sheet)) {
		store.dispatch({ type: actionTypes.UPDATE_TYPE_UNION_SHEET, payload: getSessionValue(sessionVar.unsaved_type_union_sheet) });
	}
	if (getSessionValue(sessionVar.unsaved_metadata_sheet)) {
		store.dispatch({ type: actionTypes.UPDATE_METADATA_SHEET, payload: getSessionValue(sessionVar.unsaved_metadata_sheet) });
	}
};

export const initiateSession = () => {
	if (
		getSessionValue(sessionVar.user_id) === undefined ||
		getSessionValue(sessionVar.user_id) === '' ||
		getSessionValue(sessionVar.user_id) === null
	) {
		// Default session variables
		setSessionValue(sessionVar.user_email, '');
		setSessionValue(sessionVar.user_id, '');
		setSessionValue(sessionVar.is_authenticated, false);
	} else {
		// Set redux variables as saved user session variables
		store.dispatch({ type: actionTypes.UPDATE_LOGGED_IN, payload: getSessionValue(sessionVar.is_authenticated) });
		store.dispatch({ type: actionTypes.UPDATE_USER_EMAIL, payload: getSessionValue(sessionVar.user_email) });
		store.dispatch({ type: actionTypes.UPDATE_USER_ID, payload: getSessionValue(sessionVar.user_id) });
		store.dispatch({ type: actionTypes.UPDATE_USER_ROLE, payload: getSessionValue(sessionVar.user_role) });
	}

	// if was editing a package, open that package
	if (getSessionValue(sessionVar.open_package_name)) {
		if (getSessionValue(sessionVar.publish_congrats_modal_open)) {
			// if the package was published, send the user back to the Publish & Implement page to prevent the user from editing the package
			handleOpenPackage(
				{ PackageName: getSessionValue(sessionVar.open_package_name), PackageId: getSessionValue(sessionVar.open_package_id) },
				store.dispatch,
				'PublishImplement'
			);
		} else {
			handleOpenPackage(
				{ PackageName: getSessionValue(sessionVar.open_package_name), PackageId: getSessionValue(sessionVar.open_package_id) },
				store.dispatch
			);
		}
		store.dispatch({ type: actionTypes.PUBLISH_CONGRATS_MODAL_OPEN, payload: getSessionValue(sessionVar.publish_congrats_modal_open) });
	}

	// if unsaved package data exists, use session values
	restoreUnsavedPackageData();

	// if unsaved mapping document data exists, use session values
	restoreUnsavedMappingDoc();

	// restore active tab
	if (getSessionValue(sessionVar.active_tab)) {
		const activeTab = getSessionValue(sessionVar.active_tab);

		switch (activeTab) {
			case 'MyHome':
				store.dispatch({ type: actionTypes.MY_HOME_ACTIVE });
				break;
			case 'GettingStarted':
				store.dispatch({ type: actionTypes.GETTING_STARTED_ACTIVE });
				break;
			case 'PackageBuilder':
				store.dispatch({ type: actionTypes.PACKAGE_BUILDER_ACTIVE });
				break;
			case 'Training':
				store.dispatch({ type: actionTypes.TRAINING_ACTIVE });
				break;
			default:
				store.dispatch({ type: actionTypes.MY_HOME_ACTIVE });
		}
	}
};
