import { trackedErrorSources } from '../../Util/ErrorHandleUtil';
import * as actionTypes from '../actions';

const initialState = {
	systemErrorOccurred: false, // when this is set to true, execution of API calls are not made
	showApiErrorNotification: false,
	apiErrorDetailsModalOpen: false,
	apiErrorDetails: {
		errorId: '',
		errorStatus: '',
		errorSource: '',
		errorSummary: '',
	},
};

const ApiErrorReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_API_ERROR_DETAILS:
			if (action.payload.errorSource === trackedErrorSources.system) {
				// network error occurred; set flag
				return {
					...state,
					apiErrorDetails: action.payload,
					systemErrorOccurred: true,
				};
			} else {
				return {
					...state,
					apiErrorDetails: action.payload,
				};
			}
		case actionTypes.RESET_API_ERROR_DETAILS:
			return {
				...state,
				apiErrorDetails: {
					errorId: '',
					errorSource: '',
					errorSummary: '',
					errorMessage: '',
				},
			};
		case actionTypes.UPDATE_API_ERROR_DETAILS_MODAL_OPEN:
			return {
				...state,
				apiErrorDetailsModalOpen: action.payload,
			};
		case actionTypes.SET_SYSTEM_ERROR_OCCURRED:
			return {
				...state,
				systemErrorOccurred: action.payload,
			};
		case actionTypes.UPDATE_SHOW_API_ERROR_NOTIFICATION:
			return {
				...state,
				showApiErrorNotification: action.payload,
			};
		default:
			return state;
	}
};

export default ApiErrorReducer;
