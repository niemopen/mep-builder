import * as actionTypes from '../actions';
import { GetPackageMenuHeight } from '../../Util/ElementSizeUtil.js';

const initialState = {
	showMore: true,
	sidebarVisible: true,
	topNavHeight: 0,
	tooltipsDisabled: false,
	tooltipsSwitch: true,
	isAutoSaving: false,
	signInError: false,
	isMepNameEditable: false, // when set to false, allows the MEP Change Warning modal to appear. When set to true, the warning modal does not appear and the field is editable.
};

const TopNavReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_TOP_NAV_HEIGHT:
			return {
				...state,
				topNavHeight: GetPackageMenuHeight(),
			};
		case actionTypes.UPDATE_SHOW_MORE:
			return {
				...state,
				showMore: !state.showMore,
			};
		case actionTypes.UPDATE_SIDEBAR_VISIBLE:
			return {
				...state,
				sidebarVisible: !state.sidebarVisible,
			};
		case actionTypes.TOOGLE_TOOLTIPS:
			return {
				...state,
				tooltipsDisabled: !state.tooltipsDisabled,
				tooltipsSwitch: !state.tooltipsSwitch,
			};
		case actionTypes.UPDATE_IS_AUTO_SAVING:
			return {
				...state,
				isAutoSaving: action.payload,
			};
		case actionTypes.SIGN_IN_ERROR:
			return {
				...state,
				signInError: action.payload,
			};
		case actionTypes.IS_MEP_NAME_EDITABLE:
			return {
				...state,
				isMepNameEditable: action.payload,
			};
		default:
			return state;
	}
};

export default TopNavReducer;
