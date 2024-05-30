import * as actionTypes from '../actions';

const initialState = {
	infoAccordionOpen: true,
	assembleDocumentComplete: false,
	activePane: 0, // 0 = readme, 1 = changelog, 2 = conformance
	assembleUploadMessage: '',
	businessRules: [],
};

const AssembleDocumentReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.ASSEMBLE_INFO_BANNER_SHOW_LESS:
			return {
				...state,
				infoAccordionOpen: !state.infoAccordionOpen,
			};
		case actionTypes.ASSEMBLE_DOCUMENT_COMPLETE:
			return {
				...state,
				assembleDocumentComplete: action.payload,
			};
		case actionTypes.ACTIVE_PANE:
			return {
				...state,
				activePane: action.payload,
			};
		case actionTypes.ASSEMBLE_UPLOAD_MESSAGE:
			return {
				...state,
				assembleUploadMessage: action.payload,
			};
		case actionTypes.UPDATE_BUSINESS_RULES:
			return {
				...state,
				businessRules: action.payload,
			};
		default:
			return state;
	}
};

export default AssembleDocumentReducer;
