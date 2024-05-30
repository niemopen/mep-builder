import * as actionTypes from '../actions';

const initialState = {
	infoAccordionOpen: true,
	wantlistEmpty: false,
	ssgtWantlistError: false,
	ssgtSubsetError: false,
	wantlist: null,
	translateMessage: '',
	generateSubsetSchemaActive: false,
	isValidationLoading: false,
	showSubsetMessage: false,
};

const BuildValidateReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.BUILD_INFO_BANNER_SHOW_LESS:
			return {
				...state,
				infoAccordionOpen: !state.infoAccordionOpen,
			};
		case actionTypes.UPDATE_SSGT_WANTLIST_ERROR:
			return {
				...state,
				ssgtWantlistError: action.payload,
			};
		case actionTypes.UPDATE_SSGT_SUBSET_ERROR:
			return {
				...state,
				ssgtSubsetError: action.payload,
			};
		case actionTypes.UPDATE_WANTLIST_EMPTY:
			return {
				...state,
				wantlistEmpty: action.payload,
			};
		case actionTypes.BUILD_UPDATE_TRANSLATE_MESSAGE:
			return {
				...state,
				translateMessage: action.payload,
			};
		case actionTypes.GENERATE_SUBSET_SCHEMA_ACTIVE:
			return {
				...state,
				generateSubsetSchemaActive: action.payload,
			};
		case actionTypes.IS_VALIDATION_DATA_LOADING:
			return {
				...state,
				isValidationLoading: action.payload,
			};
		case actionTypes.SET_SHOW_SUBSET_MESSAGE:
			return {
				...state,
				showSubsetMessage: action.payload,
			};
		default:
			return state;
	}
};

export default BuildValidateReducer;
