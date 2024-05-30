import * as actionTypes from '../actions';
import { GetSidebarWidth } from '../../Util/ElementSizeUtil';

const initialState = {
	sidebarWidth: 0,
	creationGuideActive: true,
	scenarioPlanningActive: false,
	analyzeRequirementsActive: false,
	mapModelActive: false,
	buildValidateActive: false,
	assembleDocumentActive: false,
	publishImplementActive: false,
};

const LeftNavSidebarReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_SIDEBAR_WIDTH:
			return {
				...state,
				sidebarWidth: GetSidebarWidth(),
			};
		case actionTypes.UPDATE_CREATION_GUIDE_ACTIVE:
			return {
				...state,
				creationGuideActive: true,
				scenarioPlanningActive: false,
				analyzeRequirementsActive: false,
				mapModelActive: false,
				buildValidateActive: false,
				assembleDocumentActive: false,
				publishImplementActive: false,
			};
		case actionTypes.UPDATE_SCENARIO_PLANNING_ACTIVE:
			return {
				...state,
				creationGuideActive: false,
				scenarioPlanningActive: true,
				analyzeRequirementsActive: false,
				mapModelActive: false,
				buildValidateActive: false,
				assembleDocumentActive: false,
				publishImplementActive: false,
			};
		case actionTypes.UPDATE_ANALYZE_REQUIREMENTS_ACTIVE:
			return {
				...state,
				creationGuideActive: false,
				scenarioPlanningActive: false,
				analyzeRequirementsActive: true,
				mapModelActive: false,
				buildValidateActive: false,
				assembleDocumentActive: false,
				publishImplementActive: false,
			};
		case actionTypes.UPDATE_MAP_MODEL_ACTIVE:
			return {
				...state,
				creationGuideActive: false,
				scenarioPlanningActive: false,
				analyzeRequirementsActive: false,
				mapModelActive: true,
				buildValidateActive: false,
				assembleDocumentActive: false,
				publishImplementActive: false,
			};
		case actionTypes.UPDATE_BUILD_VALIDATE_ACTIVE:
			return {
				...state,
				creationGuideActive: false,
				scenarioPlanningActive: false,
				analyzeRequirementsActive: false,
				mapModelActive: false,
				buildValidateActive: true,
				assembleDocumentActive: false,
				publishImplementActive: false,
			};
		case actionTypes.UPDATE_ASSEMBLE_DOCUMENT_ACTIVE:
			return {
				...state,
				creationGuideActive: false,
				scenarioPlanningActive: false,
				analyzeRequirementsActive: false,
				mapModelActive: false,
				buildValidateActive: false,
				assembleDocumentActive: true,
				publishImplementActive: false,
			};
		case actionTypes.UPDATE_PUBLISH_IMPLEMENT_ACTIVE:
			return {
				...state,
				creationGuideActive: false,
				scenarioPlanningActive: false,
				analyzeRequirementsActive: false,
				mapModelActive: false,
				buildValidateActive: false,
				assembleDocumentActive: false,
				publishImplementActive: true,
			};
		default:
			return state;
	}
};

export default LeftNavSidebarReducer;
