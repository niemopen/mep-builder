import * as actionTypes from '../actions';

const initialState = {
	propertySheet: [],
	typeSheet: [],
	typeHasPropertySheet: [],
	codesFacetsSheet: [],
	namespaceSheet: [],
	localTerminologySheet: [],
	typeUnionSheet: [],
	metadataSheet: [],
	autoAddedTypeQname: '',
	autoAddedPropertyCount: 0,
	autoAddedTypeCount: 0,
};

const MappingDocumentReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_PROPERTY_SHEET:
			return {
				...state,
				propertySheet: action.payload,
			};
		case actionTypes.UPDATE_TYPE_SHEET:
			return {
				...state,
				typeSheet: action.payload,
			};
		case actionTypes.UPDATE_TYPE_HAS_PROPERTY_SHEET:
			return {
				...state,
				typeHasPropertySheet: action.payload,
			};
		case actionTypes.UPDATE_CODES_FACETS_SHEET:
			return {
				...state,
				codesFacetsSheet: action.payload,
			};
		case actionTypes.UPDATE_NAMESPACE_SHEET:
			return {
				...state,
				namespaceSheet: action.payload,
			};
		case actionTypes.UPDATE_LOCAL_TERMINOLOGY_SHEET:
			return {
				...state,
				localTerminologySheet: action.payload,
			};
		case actionTypes.UPDATE_TYPE_UNION_SHEET:
			return {
				...state,
				typeUnionSheet: action.payload,
			};
		case actionTypes.UPDATE_METADATA_SHEET:
			return {
				...state,
				metadataSheet: action.payload,
			};
		case actionTypes.UPDATE_AUTO_ADDED_TYPE_QNAME:
			return {
				...state,
				autoAddedTypeQname: action.payload,
			};
		case actionTypes.UPDATE_AUTO_ADDED_PROPERTY_COUNT:
			return {
				...state,
				autoAddedPropertyCount: action.payload,
			};
		case actionTypes.UPDATE_AUTO_ADDED_TYPE_COUNT:
			return {
				...state,
				autoAddedTypeCount: action.payload,
			};
		case actionTypes.CLEAR_MAPPING_DOC:
			return initialState;
		default:
			return state;
	}
};

export default MappingDocumentReducer;
