import * as actionTypes from '../actions';
import { getTreeInitialState } from '../../Util/ArtifactTreeUtil';

const initialState = {
	rerender: false,
	treeItems: getTreeInitialState(),
	changelogNeedsReview: false,
	readmeNeedsReview: false,
	sampleNeedsReview: false,
};

const ArtifactTreeReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_ARTIFACT_TREE:
			return {
				...state,
				treeItems: action.payload.treeItems,
			};
		case actionTypes.UPDATE_ARTIFACT_NODE:
			return {
				...state,
				treeItems: action.payload.treeItems,
			};
		case actionTypes.RERENDER_ARTIFACT_TREE:
			return {
				...state,
				rerender: !state.rerender,
			};
		case actionTypes.SET_CHANGELOG_NEEDS_REVIEW:
			return {
				...state,
				changelogNeedsReview: action.payload,
			}
		case actionTypes.SET_README_NEEDS_REVIEW:
			return {
				...state,
				readmeNeedsReview: action.payload,
			}
		case actionTypes.SET_SAMPLE_NEEDS_REVIEW: 
			return {
				...state,
				sampleNeedsReview: action.payload,
			}
		case actionTypes.CLEAR_ARTIFACT_TREE:
			return initialState;
		default:
			return state;
	}
};

export default ArtifactTreeReducer;
