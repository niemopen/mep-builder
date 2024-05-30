import * as actionTypes from '../actions';

const initialState = {
	uploadModalOpen: false,
	nodeId: '',
	artifactUploadingActive: false,
	packageSampleAdded: false,
	artifact: {
		name: '',
		size: '',
		type: '',
		fileBlob: '',
		tag: '',
		needsReview: false,
	},
	isUploadDisabled: true,
	uploadMessageState: '',
	uploadWorkflow: {
		allowUserChoice: true,
		artifactTag: null, // leave set to null, if allowUserChoice is true
		uploadItem: null, // options: 'readme', 'change log', 'conformance', 'code' etc. otherwise leave set to null, if allowUserChoice is true
	},
	isValidFileType: true,
};

const ModalReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_UPLOAD_MODAL_OPEN:
			return {
				...state,
				uploadModalOpen: !state.uploadModalOpen,
				artifactUploadingActive: false,
			};
		case actionTypes.BROWSE_AND_READ_ARTIFACT:
			return {
				...state,
				artifact: action.payload,
				artifactUploadingActive: true,
			};
		case actionTypes.RESET_ARTIFACT:
			return {
				...state,
				artifact: {
					name: '',
					size: '',
					type: '',
					fileBlob: '',
					tag: '',
					needsReview: false,
				},
			};
		case actionTypes.UPDATE_ARTIFACT_TAG:
			return {
				...state,
				artifact: action.payload,
			};
		case actionTypes.UPDATE_UPLOAD_MODAL_NODE_ID:
			return {
				...state,
				nodeId: action.payload,
			};
		case actionTypes.UPDATE_UPLOAD_BUTTON_DISABLED:
			return {
				...state,
				isUploadDisabled: action.payload,
			};
		case actionTypes.UPDATE_UPLOAD_MESSAGE_STATE:
			return {
				...state,
				uploadMessageState: action.payload,
			};
		case actionTypes.UPDATE_UPLOAD_WORKFLOW:
			return {
				...state,
				uploadWorkflow: action.payload,
			};
		case actionTypes.UPDATE_IS_VALID_FILE_TYPE:
			return {
				...state,
				isValidFileType: action.payload,
			};
		default:
			return state;
	}
};

export default ModalReducer;
