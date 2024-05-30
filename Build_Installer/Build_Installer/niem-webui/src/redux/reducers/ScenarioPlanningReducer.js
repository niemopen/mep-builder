import * as actionTypes from '../actions';

const initialState = {
	infoAccordionOpen: true,
};

const ScenarioPlanningReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.PLANNING_INFO_BANNER_SHOW_LESS:
			return {
				...state,
				infoAccordionOpen: !state.infoAccordionOpen,
			};
		default:
			return state;
	}
};

export default ScenarioPlanningReducer;
