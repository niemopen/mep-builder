import * as actionTypes from '../actions';

const initialState = {
	mepChangeWarningModalOpen: false,
	modalTrigger: '', // Options: subset, translate, mepName, cme, mapping
	mepContainsDefaultText: true,
	mepContainsSubsetText: false,
	mepContainsSubsetTranslationText: false,
	mepContainsTranslationText: false,
	generateSubsetText: true,
	generateSubsetTranslationText: false,
	generateTranslationText: false,
};

const MEPChangeWarningModalReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.MEP_CHANGE_WARNING_MODAL_OPEN:
			return {
				...state,
				mepChangeWarningModalOpen: action.payload,
			};
		case actionTypes.MEP_CHANGE_WARNING_MODAL_TRIGGER:
			return {
				...state,
				modalTrigger: action.payload,
			};
		case actionTypes.MEP_CONTAINS_DEFAULT_TEXT_TRUE:
			return {
				...state,
				mepContainsDefaultText: true,
				mepContainsSubsetText: false,
				mepContainsSubsetTranslationText: false,
				mepContainsTranslationText: false,
			};
		case actionTypes.MEP_CONTAINS_SUBSET_TEXT_TRUE:
			return {
				...state,
				mepContainsDefaultText: false,
				mepContainsSubsetText: true,
				mepContainsSubsetTranslationText: false,
				mepContainsTranslationText: false,
			};
		case actionTypes.MEP_CONTAINS_SUBSET_TRANSLATION_TEXT_TRUE:
			return {
				...state,
				mepContainsDefaultText: false,
				mepContainsSubsetText: false,
				mepContainsSubsetTranslationText: true,
				mepContainsTranslationText: false,
			};
		case actionTypes.MEP_CONTAINS_TRANSLATION_TEXT_TRUE:
			return {
				...state,
				mepContainsDefaultText: false,
				mepContainsSubsetText: false,
				mepContainsSubsetTranslationText: false,
				mepContainsTranslationText: true,
			};
		case actionTypes.GENERATE_SUBSET_TEXT_TRUE:
			return {
				...state,
				generateSubsetText: true,
				generateSubsetTranslationText: false,
				generateTranslationText: false,
			};
		case actionTypes.GENERATE_SUBSET_TRANSLATION_TEXT_TRUE:
			return {
				...state,
				generateSubsetText: false,
				generateSubsetTranslationText: true,
				generateTranslationText: false,
			};
		case actionTypes.GENERATE_TRANSLATION_TEXT_TRUE:
			return {
				...state,
				generateSubsetText: false,
				generateSubsetTranslationText: false,
				generateTranslationText: true,
			};
		default:
			return state;
	}
};

export default MEPChangeWarningModalReducer;
