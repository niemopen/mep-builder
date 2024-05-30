import * as actionTypes from '../actions';

const initialState = {
	infoAccordionOpen: true,
	isCustomMappingSpreadsheetModalOpen: false,
};

const AnalyzeRequirementsReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.ANALYZE_INFO_BANNER_SHOW_LESS:
			return {
				...state,
				infoAccordionOpen: !state.infoAccordionOpen,
			};
		case actionTypes.CUSTOM_MAPPING_SPREADSHEET_OPEN:
			return {
				...state,
				isCustomMappingSpreadsheetModalOpen: !state.isCustomMappingSpreadsheetModalOpen,
			};
		default:
			return state;
	}
};

export default AnalyzeRequirementsReducer;
