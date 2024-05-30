import * as actionTypes from '../actions';

const initialState = {
	gettingStartedActive: false,
	myHomeActive: true,
	packageBuilderActive: false,
	strategicInitiativesActive: false,
	communitiesActive: false,
	trainingActive: false,
	administratorActive: false,
};

const HeaderNavReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.GETTING_STARTED_ACTIVE:
			return {
				...state,
				gettingStartedActive: true,
				myHomeActive: false,
				packageBuilderActive: false,
				strategicInitiativesActive: false,
				communitiesActive: false,
				trainingActive: false,
				administratorActive: false,
			};
		case actionTypes.MY_HOME_ACTIVE:
			return {
				...state,
				gettingStartedActive: false,
				myHomeActive: true,
				packageBuilderActive: false,
				strategicInitiativesActive: false,
				communitiesActive: false,
				trainingActive: false,
				administratorActive: false,
			};
		case actionTypes.PACKAGE_BUILDER_ACTIVE:
			return {
				...state,
				gettingStartedActive: false,
				myHomeActive: false,
				packageBuilderActive: true,
				strategicInitiativesActive: false,
				communitiesActive: false,
				trainingActive: false,
				administratorActive: false,
			};
		case actionTypes.STRATEGIC_INITIATIVES_ACTIVE:
			return {
				...state,
				gettingStartedActive: false,
				myHomeActive: false,
				packageBuilderActive: false,
				strategicInitiativesActive: true,
				communitiesActive: false,
				trainingActive: false,
				administratorActive: false,
			};
		case actionTypes.COMMUNITIES_ACTIVE:
			return {
				...state,
				gettingStartedActive: false,
				myHomeActive: false,
				packageBuilderActive: false,
				strategicInitiativesActive: false,
				communitiesActive: true,
				trainingActive: false,
				administratorActive: false,
			};
		case actionTypes.TRAINING_ACTIVE:
			return {
				...state,
				gettingStartedActive: false,
				myHomeActive: false,
				packageBuilderActive: false,
				strategicInitiativesActive: false,
				communitiesActive: false,
				trainingActive: true,
				administratorActive: false,
			};
		case actionTypes.ADMINISTRATOR_ACTIVE:
			return {
				...state,
				gettingStartedActive: false,
				myHomeActive: false,
				packageBuilderActive: false,
				strategicInitiativesActive: false,
				communitiesActive: false,
				trainingActive: false,
				administratorActive: true,
			};
		default:
			return state;
	}
};

export default HeaderNavReducer;
