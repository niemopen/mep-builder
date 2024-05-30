import * as actionTypes from '../actions';

const initialState = {
	generateTranslationActive: false,
	isTranslationGenerated: false,
	indexForTranslationGeneration: 0,
};

const TranslateReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.GENERATE_TRANSLATION_ACTIVE:
			return {
				...state,
				generateTranslationActive: action.payload,
			};
		case actionTypes.IS_TRANSLATION_GENERATED:
			return {
				...state,
				isTranslationGenerated: action.payload,
			};
		case actionTypes.UPDATE_INDEX_FOR_TRANSLATION_GENERATION:
			return {
				...state,
				indexForTranslationGeneration: action.payload,
			};
		default:
			return state;
	}
};

export default TranslateReducer;
