import * as actionTypes from '../actions';

const initialState = {
	infoAccordionOpen: true,
	publishImplementComplete: false,
	congratsModalOpen: false,
};

const PublishImplementReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.PUBLISH_INFO_BANNER_SHOW_LESS:
			return {
				...state,
				infoAccordionOpen: !state.infoAccordionOpen,
			};
		case actionTypes.PUBLISH_IMPLEMENT_COMPLETE:
			return {
				...state,
				publishImplementComplete: action.payload,
			};
		case actionTypes.PUBLISH_CONGRATS_MODAL_OPEN:
			return {
				...state,
				congratsModalOpen: action.payload,
			};
		default:
			return state;
	}
};

export default PublishImplementReducer;
