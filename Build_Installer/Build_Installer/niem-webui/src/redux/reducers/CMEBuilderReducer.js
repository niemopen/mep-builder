import * as actionTypes from '../actions';

export const initialState = {
	isCMEBuilderModalOpen: false,
	isFullscreenModalOpen: false,
	isResetCodeListModalOpen: false,
	listOfCodeObjs: [], // temporary array that holds added code and empties when that code element is created // used to populate code viewport table
	listOfContainerElementObjs: [], // stores entire object for each parent (niemDomain) and its children (container elements) // used to populate container elements viewport table
	fullscreenViewportType: '', // [ 'fieldNames.dataElement', 'fieldNames.container', 'fieldNames.code', 'fieldNames.containerElements']
	isCMEComplete: false, // used to mark Extension Schema as complete in ArtifactChecklist.js
	isExtensionSchemaGenerated: false, // used to determine failed/successful generation message on BuildValidate page and allow the message to disappear after 5s by resetting the flag to '' but NOT remove completion from the ArtifactChecklist
	isEditMode: false,
	existingFormData: {}, // repopulates the entire data element and container form
	existingCodeData: {}, // repopulates the "Add Code" section of the data element form
	existingContainerElementData: {}, // repopulates the "Add Container Elements" section of the data element form
	majorReleaseVersion: '',
	showCodeImportFile: false,
	itemDeleteStatusObj: {
		// contains a mapping of data types to their array of delete statuses
		dataElement: [], // collection of delete status objects for data elements
		container: [], // collection of delete status objects for containers
		Code: [], // collection of delete status objects for code Items
		containerElements: [], // collection of delete status objects for container parent/child elements
	},
	elementCreationStatus: '', // elementCreation_success, elementCreation_failed
	changesSavedStatus: '', // changesSaved_success, changesSaved_failed
	// CME Data is a nested JSON obj with a primary top-level (root) item below. All created elements are placed inside of the children attribute below
	cmeData: {
		elementName: 'extension', // renamable by user only if a container w/ a rootElement containerType is named and created
		elementType: 'container',
		uri: '',
		definition: '',
		children: [], // holds all created elements, containers, and any of their children
	},
	codeImportFileData: { fileId: null, fileName: null }, // used on upload of a code file
	cmeSourceCodeFile: '', // used to display file info above the Code Viewport
	codeImportSummary: { messageState: null, total: 0, imported: 0, unsuccessful: 0 },
	codeImportReportData: { total: [], valid: [], invalid: [] }, // used to build the Code Import Report file
};

const CMEBuilderReducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_CME_BUILDER_MODAL_OPEN:
			return {
				...state,
				isCMEBuilderModalOpen: action.payload,
			};
		case actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS:
			return {
				...state,
				listOfCodeObjs: action.payload,
			};
		case actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS:
			return {
				...state,
				listOfContainerElementObjs: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_VIEWPORT_TYPE:
			return {
				...state,
				fullscreenViewportType: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN:
			return {
				...state,
				isFullscreenModalOpen: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_RESET_CODELIST_MODAL_OPEN:
			return {
				...state,
				isResetCodeListModalOpen: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_IS_CME_COMPELTE: // used to mark Extension Schema as complete in ArtifactChecklist.js
			return {
				...state,
				isCMEComplete: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_IS_EXTENSION_SCHEMA_GENERATED: // used to determine failed/successful generation message on BuildValidate page and allow the message to disappear after 5s by resetting the flag to '' but NOT remove completion from the ArtifactChecklist
			return {
				...state,
				isExtensionSchemaGenerated: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_DATA:
			return {
				...state,
				cmeData: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_DATA_CHILDREN:
			return {
				...state,
				cmeData: {
					...state.cmeData,
					children: action.payload,
				},
			};
		case actionTypes.UPDATE_CME_BUILDER_IS_EDIT_MODE:
			return {
				...state,
				isEditMode: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_EXISTING_FORM_DATA:
			return {
				...state,
				existingFormData: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_EXISTING_CODE_DATA:
			return {
				...state,
				existingCodeData: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_EXISTING_CONTAINER_ELEMENT_DATA:
			return {
				...state,
				existingContainerElementData: action.payload,
			};
		case actionTypes.UPDATE_CME_BUILDER_ROOT_ELEMENT_NAME: // allows root top-level element name to be renamed by user
			return {
				...state,
				cmeData: {
					...state.cmeData,
					elementName: action.payload,
				},
			};
		case actionTypes.UPDATE_CME_BUILDER_URI: // allows root top-level element name to be renamed by user
			return {
				...state,
				cmeData: {
					...state.cmeData,
					uri: action.payload,
				},
			};
		case actionTypes.UPDATE_CME_BUILDER_DEFINITION: // allows root top-level element name to be renamed by user
			return {
				...state,
				cmeData: {
					...state.cmeData,
					definition: action.payload,
				},
			};
		case actionTypes.UPDATE_CME_MAJOR_RELEASE_VERSION:
			return {
				...state,
				majorReleaseVersion: action.payload,
			};
		case actionTypes.SHOW_CODE_IMPORT_FILE:
			return {
				...state,
				showCodeImportFile: action.payload,
			};
		case actionTypes.CODE_IMPORT_FILE_DATA:
			return {
				...state,
				codeImportFileData: action.payload,
			};
		case actionTypes.CME_SOURCE_CODE_FILE:
			return {
				...state,
				cmeSourceCodeFile: action.payload,
			};
		case actionTypes.CME_CODE_IMPORT_SUMMARY:
			return {
				...state,
				codeImportSummary: action.payload,
			};
		case actionTypes.CME_CODE_IMPORT_REPORT_DATA:
			return {
				...state,
				codeImportReportData: action.payload,
			};
		case actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ:
			// deconstructing payload to update reference
			let statuses = { ...action.payload };
			return {
				...state,
				itemDeleteStatusObj: statuses,
			};
		case actionTypes.CME_BUILDER_UPDATE_ELEMENT_CREATION_STATUS:
			return {
				...state,
				elementCreationStatus: action.payload,
			};
		case actionTypes.CME_BUILDER_UPDATE_CHANGES_SAVED_STATUS:
			return {
				...state,
				changesSavedStatus: action.payload,
			};
		case actionTypes.RESET_CME_BUILDER:
			return initialState;
		default:
			return state;
	}
};

export default CMEBuilderReducer;
