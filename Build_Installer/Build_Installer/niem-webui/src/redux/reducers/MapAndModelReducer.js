import * as actionTypes from '../actions';

const initialState = {
	infoAccordionOpen: true,
};

const MapAndModelReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.MAPPING_INFO_BANNER_SHOW_LESS:
			return {
				...state,
				infoAccordionOpen: !state.infoAccordionOpen,
			};
		default:
			return state;
	}
};

export default MapAndModelReducer;
