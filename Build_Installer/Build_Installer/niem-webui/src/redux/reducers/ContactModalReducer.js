import * as actionTypes from '../actions';

const initialState = {
	contactModalOpen: false,
};

function ContactModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.CONTACT_MODAL_OPEN:
			return {
				...state,
				contactModalOpen: !state.contactModalOpen,
			};
		default:
			return state;
	}
}

export default ContactModalReducer;
