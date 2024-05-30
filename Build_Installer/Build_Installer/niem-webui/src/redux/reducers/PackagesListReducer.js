import * as actionTypes from '../actions';

const initialState = {
	unpublished: [],
	published: [],
	unpublishedSearchResults: [],
	publishedSearchResults: [],
	isPublishedActive: false,
};

const PackagesListReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_UNPUBLISHED_PACKAGES_LIST:
			return {
				...state,
				unpublished: action.payload,
			};
		case actionTypes.UPDATE_PUBLISHED_PACKAGES_LIST:
			return {
				...state,
				published: action.payload,
			};
		case actionTypes.UPDATE_UNPUBLISHED_SEARCH_RESULTS_LIST:
			return {
				...state,
				unpublishedSearchResults: action.payload,
			};
		case actionTypes.UPDATE_PUBLISHED_SEARCH_RESULTS_LIST:
			return {
				...state,
				publishedSearchResults: action.payload,
			};
		case actionTypes.PUBLISHED_PACKAGES_ACTIVE:
			return {
				...state,
				isPublishedActive: action.payload,
			};
		default:
			return state;
	}
};

export default PackagesListReducer;
