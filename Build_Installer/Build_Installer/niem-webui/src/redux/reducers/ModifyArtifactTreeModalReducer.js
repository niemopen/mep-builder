import * as actionTypes from '../actions';

const initialState = {
	itemData: '',
	isModalOpen: false,
	workflowType: '', // 'renameItem', 'moveItem', 'newFolder' 'exportMEP'
};

function ModifyArtifactTreeModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.UPDATE_ITEM_DATA:
			return {
				...state,
				itemData: action.payload,
			};
		case actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN:
			return {
				...state,
				isModalOpen: action.payload,
			};
		case actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW:
			return {
				...state,
				workflowType: action.payload,
			};
		default:
			return state;
	}
}

export default ModifyArtifactTreeModalReducer;
