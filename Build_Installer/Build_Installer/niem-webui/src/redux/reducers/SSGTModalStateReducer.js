import * as actionTypes from '../actions';

const initialState = {
	ssgtMappingModalOpen: false,
	searchString: '',
	propertyToMap: '',
	searchType: 'test',
	keyToMap: '',
};

function ModalStateReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.UPDATE_SSGT_MAPPING_MODAL_OPEN:
			return {
				...state,
				ssgtMappingModalOpen: !state.ssgtMappingModalOpen,
			};
		case actionTypes.UPDATE_SSGT_SEARCH_STRING:
			return {
				...state,
				searchString: action.payload,
			};
		case actionTypes.UPDATE_PROPERTY_TO_MAP:
			return {
				...state,
				propertyToMap: action.payload,
			};
		case actionTypes.UPDATE_SSGT_SEARCH_TYPE:
			return {
				...state,
				searchType: action.payload,
			};
		case actionTypes.UPDATE_ROW_KEY_TO_MAP:
			return {
				...state,
				keyToMap: action.payload,
			};
		default:
			return state;
	}
}

export default ModalStateReducer;
