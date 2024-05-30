import { React, useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { ReactSession } from 'react-client-session';
import * as sessionVar from '../Util/SessionVar';
import { Button, Form, Grid, Message, Checkbox, Modal, Radio, Icon, Header, Select, Divider, Input, List } from 'semantic-ui-react';
import { useFormik } from 'formik';
import Tooltip from './Tooltip';
import {
	CMEDataElementsViewportTable,
	CMECodeViewportTable,
	CMEContainersViewportTable,
	CMEContainerElementsViewportTable,
} from '../components/CMEViewportTables';
import {
	formLabelContent,
	fieldNames,
	cmeFormInitialValues,
	cmeValidationSchema,
	ndr_openingPhrases,
	getMajorReleaseVersion,
	getNDRlink,
	checkForProhibitedCharacters,
	checkForRepTerm,
	handleBuildExtensionSchema,
	handleCreateElement,
	handleUpdateElement,
	updateEditedCodeItems,
	updateEditedContainerElements,
	updateElementNameToCamelCase,
	importCodeFile,
	getNiemDomains,
	createDomainElementsOptions,
	getElementData,
	exampleDefinitionFormats,
	checkDefinitionValidity,
} from '../Util/CMEBuilderUtil';
import flatten from 'flat';
import { isStringFieldValid } from '../Util/FieldValidationUtil';
import { clearValidationResults } from '../Util/ValidationUtil';
import { CMEUndoDeleteMessage } from './CMEUndoDeleteMessage';
import LoaderModal from './LoaderModal';

const CMEBuilderModal = () => {
	//reducers
	const dispatch = useDispatch();
	const isCMEBuilderModalOpen = useSelector((state) => state.cme.isCMEBuilderModalOpen);
	const listOfCodeObjs = useSelector((state) => state.cme.listOfCodeObjs);
	const listOfContainerElementObjs = useSelector((state) => state.cme.listOfContainerElementObjs);
	const fullscreenViewportType = useSelector((state) => state.cme.fullscreenViewportType);
	const isFullscreenModalOpen = useSelector((state) => state.cme.isFullscreenModalOpen);
	const isResetCodeListModalOpen = useSelector((state) => state.cme.isResetCodeListModalOpen);
	const [isConfirmCancelEditsModalOpen, setIsConfirmCancelEditsModalOpen] = useState(false);
	const packageName = useSelector((state) => state.mpd.packageName);
	const majorReleaseVersion = useSelector((state) => state.cme.majorReleaseVersion);
	const cmeData = useSelector((state) => state.cme.cmeData);
	const codeImportFileData = useSelector((state) => state.cme.codeImportFileData);
	const showCodeImportFile = useSelector((state) => state.cme.showCodeImportFile);
	const release = useSelector((state) => state.mpd.release);
	const itemDeleteStatusObj = useSelector((state) => state.cme.itemDeleteStatusObj);
	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const [isConfirmBuildModalOpen, setIsConfirmBuildModalOpen] = useState(false);
	const [isShowNameCharacterRules, setIsShowNameCharacterRules] = useState(false); // flag to display special character rules in accordance to NDR rules (helper text below the name field)
	const [elementDefinition, setElementDefinition] = useState(''); // used to set definition default/ghost text
	const [isProhibitedCharacterFound, setIsProhibitedCharacterFound] = useState(null); // flag used strictly for detection of probihited character in element name
	const [isMissingRepTerm, setIsMissingRepTerm] = useState(false); // flag used strictly for detection of missing representation term in element name
	const [acceptableRepTermsArray, setAcceptableRepTermsArray] = useState([]); // used to store list of representation terms to be displayed in "missing rep term" error/warning message
	const [acceptableRepTerm, setAcceptableRepTerm] = useState(''); // used to store representation term to be displayed in "missing rep term" error/warning message
	const [repTermNameExample, setRepTermNameExample] = useState(''); // used in "Missing RepTerm" message to display an acceptable data element name example to users
	const [bypassRepTermCheck, setBypassRepTermCheck] = useState(false); // flag used for MEPs of releases v4.0 or higher that allows names to be accepted WITHOUT repTerm
	const [isOverwritingCodeList, setIsOverwritingCodeList] = useState(false);
	const [displayCharacterCaseMessage, setDisplayCharacterCaseMessage] = useState(true); // flag used for displaying the message to users regarding their element names changing to adhere to NDR Character Case rule
	const [isMissingNameValue, setIsMissingNameValue] = useState(false); // flag used for displating  "Missing Name Value" message if user attempts to name their dataElement as its repTerm
	const [isDefinitionValid, setIsDefinitionValid] = useState(true); // flag used to show field definition warning message
	const [definitionWarningContent, setDefinitionWarningContent] = useState(''); // contains the generated example definition
	const [bypassDefinitionCheck, setBypassDefinitionCheck] = useState(false); // flag used to bypass the check for definition validity
	const [myElementsTypeOptions, setMyElementsTypeOptions] = useState([]); // used to store existing types to populate My Elements Type specific types dropdown list
	// viewports - allow viewport visibility to be toggled on/off
	const [viewDataElementsOn, setViewDataElementsOn] = useState(true);
	const [viewContainersOn, setViewContainersOn] = useState(true);
	const [viewCodeOn, setViewCodeOn] = useState(true);
	const [viewContainerElementsOn, setViewContainerElementsOn] = useState(true);
	const [radioOptionSelected, setRadioOptionSelected] = useState('DataElement');
	// variables used while editing elements only
	const isEditMode = useSelector((state) => state.cme.isEditMode);
	const existingFormData = useSelector((state) => state.cme.existingFormData);
	const existingCodeData = useSelector((state) => state.cme.existingCodeData);
	const existingContainerElementData = useSelector((state) => state.cme.existingContainerElementData);
	const elementCreationStatus = useSelector((state) => state.cme.elementCreationStatus);
	const changesSavedStatus = useSelector((state) => state.cme.changesSavedStatus);

	// this 'Build CMEs' modal appears after clicking the 'Next' button (bottom-right of overall CME Builder), for users to input an overall URI and Definition for their CMEs, before the 'Confirm Build' modal
	const [isBuildCMEModalOpen, setIsBuildCMEModalOpen] = useState(false);
	const uriFieldValue = useSelector((state) => state.cme.cmeData.uri);
	const definitionFieldValue = useSelector((state) => state.cme.cmeData.definition);
	const [enteredUri, setEnteredUri] = useState(uriFieldValue);
	const [enteredDefinition, setEnteredDefinition] = useState(definitionFieldValue);

	// dropdown data
	const [niemDomainsOptions, setNiemDomainsOptions] = useState([{ key: '0', text: '', value: '' }]); // Container Elements dropdown
	const [niemDomainsExistingContainerOptions, setNiemDomainsExistingContainerOptions] = useState([{ key: '0', text: '', value: '' }]); // Based on Existing Container dropdown
	const [niemDataElementsSingleOptions, setNiemDataElementsSingleOptions] = useState([{ key: '0', text: '', value: '' }]);
	const [niemDataElementsMultiOptions, setNiemDataElementsMultiOptions] = useState([{ key: '0', text: '', value: '' }]);

	const dataElementTypeOptions = [
		{ key: '0', text: '', value: '' },
		{ key: '1', text: 'My Elements Type', value: fieldNames.myElements },
		{ key: '2', text: 'Boolean', value: fieldNames.boolean },
		{ key: '3', text: 'CodeType', value: fieldNames.code },
		{ key: '4', text: 'Date', value: fieldNames.date },
		{ key: '5', text: 'Decimal', value: fieldNames.decimal },
		{ key: '6', text: 'Integer', value: fieldNames.integer },
		{ key: '7', text: 'Text', value: fieldNames.text },
	];

	const containerTypeOptions = [
		{ key: '0', text: '', value: '' },
		{ key: '1', text: 'New Container', value: fieldNames.newContainer },
		{ key: '2', text: 'Based on Existing Container', value: fieldNames.existingContainer },
		{ key: '3', text: 'Root Element', value: fieldNames.rootElement },
	];

	const codeTypeOptions = [
		{ key: '0', text: '', value: '' },
		{ key: '1', text: 'enumeration', value: fieldNames.enumeration },
		{ key: '2', text: 'fractionDigits', value: fieldNames.fractionDigits },
		{ key: '3', text: 'length', value: fieldNames.length },
		{ key: '4', text: 'maxLength', value: fieldNames.maxLength },
		{ key: '5', text: 'minLength', value: fieldNames.minLength },
		{ key: '6', text: 'minExclusive', value: fieldNames.minExclusive },
		{ key: '7', text: 'minInclusive', value: fieldNames.minInclusive },
		{ key: '8', text: 'maxExclusive', value: fieldNames.maxExclusive },
		{ key: '9', text: 'maxInclusive', value: fieldNames.maxInclusive },
		{ key: '10', text: 'pattern', value: fieldNames.pattern },
		{ key: '11', text: 'totalDigits', value: fieldNames.totalDigits },
		{ key: '12', text: 'whiteSpace', value: fieldNames.whiteSpace },
	];

	const dateTypeOptions = [
		{ key: '0', text: '', value: '' },
		{ key: '1', text: 'Full', value: fieldNames.fullDate },
		{ key: '2', text: 'Date/Time', value: fieldNames.dateTime },
		{ key: '3', text: 'YYYY', value: fieldNames.yyyy },
		{ key: '4', text: 'YY/MM', value: fieldNames.yyyymm },
		{ key: '5', text: 'YYYY/MM/DD', value: fieldNames.yyyymmdd },
	];

	const decimalTypeOptions = [
		{ key: '0', text: '', value: '' },
		{ key: '1', text: 'Amount', value: fieldNames.amount },
		{ key: '2', text: 'Number', value: fieldNames.number },
		{ key: '3', text: 'Percentage', value: fieldNames.percentage },
		{ key: '4', text: 'Quantity', value: fieldNames.quantity },
		{ key: '5', text: 'Value', value: fieldNames.value },
	];

	const integerTypeOptions = [
		{ key: '0', text: '', value: '' },
		{ key: '1', text: 'Negative', value: fieldNames.negativeInteger },
		{ key: '2', text: 'Non-Negative', value: fieldNames.nonNegativeInteger },
		{ key: '3', text: 'Positive', value: fieldNames.positiveInteger },
		{ key: '4', text: 'Non-Positive', value: fieldNames.nonPositiveInteger },
	];

	// the Formik library is used for form field tracking, validation, and submission
	// https://formik.org/docs/overview
	const formik = useFormik({
		initialValues: cmeFormInitialValues,
		validationSchema: cmeValidationSchema,
		validateOnChange: false,
		validateOnBlur: false,
		enableReinitialize: true,
		onSubmit: (values, { resetForm }) => {
			// Note: Per formik functionality, the below code will only execute on 'successful' submission (not every attempted submit)
			const filteredValues = filterSubmissionValues(values);
			let nameAccepted = isNameAccepted(); // checks for repTerms and prohihibted characters - returns true or false
			let definitionAcceped = isDefinitionAccepted(); // check if definition field is valid - returns true of false

			// resets form after submission (by default, asynchronously runs first)
			if ((nameAccepted || (!nameAccepted && bypassRepTermCheck)) && (definitionAcceped || (!definitionAcceped && bypassDefinitionCheck))) {
				resetForm({ values: '' }); // only resets formik values
				// resets form specific useState values
				setIsShowNameCharacterRules(false);
				setElementDefinition('');
				setIsProhibitedCharacterFound(false);
				setIsMissingRepTerm(false);
				setAcceptableRepTerm('');
				setAcceptableRepTermsArray([]);
				setBypassRepTermCheck(false);
				setIsDefinitionValid(true);
				setBypassDefinitionCheck(false);
			}

			// handles the actual update/creation of element and adds data to db (see handleCreateElement() and handleUpdateElement() in CMEBuilderUtil.js)
			if ((nameAccepted || (!nameAccepted && bypassRepTermCheck)) && (definitionAcceped || (!definitionAcceped && bypassDefinitionCheck))) {
				if (isEditMode) {
					// if edititing an element, update existing element
					handleUpdateElement(filteredValues);
				} else {
					// otherwise, create a new element
					handleCreateElement(filteredValues);
				}
				displayStatusMessage(); // handles 'changes saved' and 'element created' message timeout
				handleResetCMEBuilder(); // reset form
			}

			// when the CME Builder Modal closes (via 'Cancel' button or after extension schema builds), reset everything via handleResetCMEBuilder()
			if (!isCMEBuilderModalOpen) {
				handleResetCMEBuilder();
			}
		},
	});

	// BEGIN FUNCTIONS AND METHODS
	// used to get the major release version upon initial load of CME Builder
	useEffect(() => {
		let majorReleaseVersion = getMajorReleaseVersion();
		dispatch({ type: actionTypes.UPDATE_CME_MAJOR_RELEASE_VERSION, payload: majorReleaseVersion });
	}, [dispatch]); // dependencies changed in NIEM 633; Should still only run at load when reference value for dispatch is assigned

	useEffect(() => {
		let isMounted = true;
		if (isMounted && release !== '') {
			// grab niemDomains on component load
			const niemDomain = async () => {
				const niemDomains = await getNiemDomains(release);
				setNiemDomainsOptions(niemDomains.domainsWithMyElements);
				setNiemDomainsExistingContainerOptions(niemDomains.domainsWithoutMyElements);
			};
			niemDomain();
		}
		return () => {
			isMounted = false; // use effect cleanup to set flag false, if unmounted
		};
	}, [release]);

	const getDomainElements = async (domainName, updateContainerElements = false) => {
		const dataElementsOptions = await createDomainElementsOptions(release, cmeData, domainName);

		// update dropdowns based on which area is selected
		if (updateContainerElements) {
			setNiemDataElementsMultiOptions(dataElementsOptions);
		} else {
			setNiemDataElementsSingleOptions(dataElementsOptions);
		}
	};

	// only repopulates 'Code' related fields with exisitng data onClick of Code viewport pencil icon -  used only when updating code viewport items
	const updateCodeFormData = () => {
		// preserve any recently added code items that were add prior to clicking on a code viewport pencil icon, before clicking save
		dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: listOfCodeObjs });
		//populate Code Type, Code Key, Code Value, and hidden codeObj formik fields
		formik.setFieldValue(fieldNames.codeType, existingCodeData.codeType);
		formik.setFieldValue(fieldNames.codeKey, existingCodeData.codeKey);
		formik.setFieldValue(fieldNames.codeValue, existingCodeData.codeValue);
		formik.setFieldValue(fieldNames.codeObjs, listOfCodeObjs);
		// Note - this function only updates the formik fields one time, upon click of the code item's viewport pencil icon. The values will be updated/overwritten onClick of the "add" or "save" button
	};

	// only repopulates 'Container Element' related fields with existing data onClick of Container Elements viewport pencil icon - used only when updating container elements
	const updateContainerElementFormData = () => {
		// preserve any recently added code items that were add prior to clicking on a code viewport pencil icon, before clicking save
		dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: listOfContainerElementObjs });
		//populate NIEM Domain, Container Elements, and hidden containerElementObjs formik fields
		formik.setFieldValue(fieldNames.niemDomain, existingContainerElementData.niemDomain);
		formik.setFieldValue(fieldNames.containerElements, existingContainerElementData.containerElements);
		formik.setFieldValue(fieldNames.containerElementObjs, listOfContainerElementObjs);
		getDomainElements(existingContainerElementData.niemDomain, true); // retrieve domain elements to repopulate domain elements dropdown
		// Note - this function only updates the formik fields one time, upon click of the container element's viewport pencil icon. The values will be updated/overwritten onClick of the "add" or "save" button
	};
	// NOTE: Compiler wants formik as a dependency for any useEffect/useCallback where it is referenced. This will break the code.

	const updateFieldVisibility = (field, isVisible) => {
		if (!isVisible) {
			// if not visible, remove from error list
			let updatedErrors = { ...formik.errors };
			delete updatedErrors[field];
			formik.setErrors(updatedErrors);
		}

		formik.setFieldValue('show_' + field, isVisible);
	};

	const updateDataElementFieldVisibility = (isVisible) => {
		updateFieldVisibility(fieldNames.dataElementType, isVisible);
		updateFieldVisibility(fieldNames.dataElementName, isVisible);
		updateFieldVisibility(fieldNames.specificType, isVisible);
		updateFieldVisibility(fieldNames.dataElementDefinition, isVisible);
	};

	const updateContainerFieldVisibility = (isVisible) => {
		updateFieldVisibility(fieldNames.containerType, isVisible);
		updateFieldVisibility(fieldNames.containerName, isVisible);
		updateFieldVisibility(fieldNames.containerDefinition, isVisible);
		updateFieldVisibility(fieldNames.containerElementObjs, isVisible);
		if (isVisible && formik.values.containerType === fieldNames.existingContainer) {
			updateFieldVisibility(fieldNames.existingContainer, true);
			updateFieldVisibility(fieldNames.existingContainerLocation, true);
		} else {
			updateFieldVisibility(fieldNames.existingContainer, false);
			updateFieldVisibility(fieldNames.existingContainerLocation, false);
		}
	};

	// repopulates the required formik fields with existing data onClick of DataElement or Container viewport pencil icon
	const updateEditModeForm = () => {
		formik.setFieldValue(fieldNames.elementType, existingFormData.elementType);

		// if updating an existing data element, update dataElement related fields
		if (existingFormData.elementType === fieldNames.dataElement) {
			// show data element fields & hide container fields
			updateDataElementFieldVisibility(true);
			updateContainerFieldVisibility(false);

			// update field values
			let dataElementType;
			let dataType = existingFormData.dataType;
			let specificType = existingFormData.specificType;
			// determine dataElementType based on saved data type or specific type
			// casing for some of these data types is inconsistent with one another. See getDataType() method in CMEBuilderUtil.js
			if (dataType.endsWith('boolean')) {
				dataElementType = fieldNames.boolean;
			} else if (dataType.endsWith('CodeType')) {
				dataElementType = fieldNames.code;
			} else if (dataType.includes('date') || dataType.includes('Year')) {
				dataElementType = fieldNames.date;
			} else if (dataType.endsWith('decimal')) {
				dataElementType = fieldNames.decimal;
			} else if (dataType.endsWith('Integer')) {
				dataElementType = fieldNames.integer;
			} else if (dataType.includes('Text')) {
				dataElementType = fieldNames.text;
			} else if (specificType.endsWith('Type')) {
				// for elements of type "My Elements Type", the specific type should always end with "Type"
				dataElementType = fieldNames.myElements;
			} else {
				dataElementType = existingFormData.elementLabel;
			}

			// update field values
			formik.setFieldValue(fieldNames.dataElementType, dataElementType);
			formik.setFieldValue(fieldNames.dataElementName, existingFormData.elementName);
			formik.setFieldValue(fieldNames.specificType, existingFormData.specificType);
			formik.setFieldValue(fieldNames.dataElementDefinition, existingFormData.elementDefinition);
			formik.setFieldValue(fieldNames.dataElementDefinition, existingFormData.elementDefinition);
			setElementDefinition(existingFormData.elementDefinition);

			// reset and code fields that may have been set during the last edit session
			formik.setFieldValue(fieldNames.codeType, cmeFormInitialValues.codeType);
			formik.setFieldValue(fieldNames.codeKey, cmeFormInitialValues.codeKey);
			formik.setFieldValue(fieldNames.codeValue, cmeFormInitialValues.codeValue);

			// if editing a code dataElement, update code related fields and viewport
			if (dataElementType === fieldNames.code) {
				// update formik's codeObjs field to ensure edited code dateElements are not saved without at least code item
				updateFieldVisibility(fieldNames.codeObjs, true);
				formik.setFieldValue(fieldNames.codeObjs, existingFormData.code); // hidden formik field that checks for the precense of code objs

				// if existingCodeData contains data, the user is editing via the "My Code" viewport, so we need to preserve any already updated formik fields, and update the code related fields with existing code data.
				if (Object.values(existingCodeData).length !== 0 && existingCodeData !== 0) {
					// preserve any formik value changes that were made prior to clicking on a code viewport pencil icon
					formik.setFieldValue(fieldNames.dataElementType, formik.values.dataElementType);
					formik.setFieldValue(fieldNames.dataElementName, formik.values.dataElementName);
					formik.setFieldValue(fieldNames.specificType, formik.values.dataElementType);
					formik.setFieldValue(fieldNames.dataElementDefinition, elementDefinition);
					setElementDefinition(elementDefinition);
					// update formik code related fields
					updateCodeFormData();
				}

				// update reducer variable used for code viewport with element's existing code items
				dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: existingFormData.code }); //used to populate code viewport table
			}
		} else {
			//reset Container Element dropdowns
			formik.setFieldValue(fieldNames.niemDomain, '');
			formik.setFieldValue(fieldNames.containerElements, []);

			// show container fields & hide data element fields
			updateDataElementFieldVisibility(false);
			updateContainerFieldVisibility(true);
			updateFieldVisibility(fieldNames.containerElementObjs, true);

			// update field values
			formik.setFieldValue(fieldNames.containerType, existingFormData.containerType);
			formik.setFieldValue(fieldNames.containerName, existingFormData.elementName);
			formik.setFieldValue(fieldNames.containerDefinition, existingFormData.definition);
			formik.setFieldValue(fieldNames.existingContainer, existingFormData.existingContainer);
			formik.setFieldValue(fieldNames.existingContainerLocation, existingFormData.existingContainerLocation);
			formik.setFieldValue(fieldNames.existingContainerObj, existingFormData.existingContainerObj);
			getDomainElements(existingFormData.existingContainerLocation, false); // retrieve domain element to repopulate dropdown
			formik.setFieldValue(fieldNames.containerElementObjs, existingFormData.containerElements);

			// if updating an existing container
			if (existingFormData.containerType === fieldNames.existingContainer) {
				updateFieldVisibility(fieldNames.existingContainerLocation, true);
				updateFieldVisibility(fieldNames.existingContainer, true);
			} else {
				updateFieldVisibility(fieldNames.existingContainerLocation, false);
				updateFieldVisibility(fieldNames.existingContainer, false);
			}

			// if existingContainerElementData contains data, the user is editing via the "Container Elementes" viewport, so we need to update the formik container elements fields with existing container element data, and preserve any already updated formik fields
			if (Object.values(existingContainerElementData).length !== 0) {
				// preserve any formik value changes that were made prior to clicking on a code viewport pencil icon
				formik.setFieldValue(fieldNames.containerType, formik.values.containerType);
				formik.setFieldValue(fieldNames.containerName, formik.values.containerName);
				formik.setFieldValue(fieldNames.existingContainer, formik.values.existingContainer);
				formik.setFieldValue(fieldNames.existingContainerLocation, formik.values.existingContainerLocation);
				formik.setFieldValue(fieldNames.existingContainerObj, formik.values.existingContainerObj);
				formik.setFieldValue(fieldNames.containerDefinition, formik.values.containerDefinition);

				// update formik container element related fields
				updateContainerElementFormData();
			}

			// update reducer variable used for container elements viewport with element's existing container elements objs (niem domain + individual elements)
			dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: existingFormData.containerElements }); // used to populate container elements viewport table
		}
	};

	// used to update formik form with appropriate values when editing
	useEffect(() => {
		if (isEditMode) {
			// updates required formik fields with existing data
			updateEditModeForm();
		}
		// users may update code items while NOT in editMode if pencil icon is clicked before form submission  - if existingCodeData contains data, user is editing the "Add code" section of the form - so repopulate those fields specifically with the data of the code item selected for edits
		if (Object.values(existingCodeData).length !== 0 && existingCodeData !== 0) {
			updateCodeFormData();
		}
		// users may update container elements while NOT in editMode if pencil icon is clicked before form submission - if existingContainerElementData contains data, user is editing the "Add container elements" section of the form - so repopulate those fields specifically with the data of the container element selected for edits
		if (Object.values(existingContainerElementData).length !== 0) {
			updateContainerElementFormData();
		}
	}, [isEditMode, existingFormData, existingCodeData, existingContainerElementData, cmeData]); // runs each time isEditMode, existingFormData, existingCodeData, existingContainerElementData, or cmeData changes

	// used to prevent users from saving changes to an existing code data element with now, 0 code items (decreasing orginal code item count from 'x' to 0)
	useEffect(() => {
		// users are able to edit a code data element, delete all exisiting code items from the code viewport, and attempt to save - update the formik field with the reducer variable, as the reducer can change during edits and deletes, but will always be the lastest and most accurate data
		formik.setFieldValue(fieldNames.codeObjs, listOfCodeObjs);
	}, [listOfCodeObjs]); // called when listOfCodeObjs changes

	// used to prevent users from saving changes to an existing container with now, 0 container elementes (decreasing orginal container element count from 'x' to 0)
	useEffect(() => {
		// users are able to edit a container, delete all exisiting container elements from the container elements viewport, and attempt to save - update the formik field with the reducer variable, as the reducer can change during edits and deletes, but will always be the lastest and most accurate data
		formik.setFieldValue(fieldNames.containerElementObjs, listOfContainerElementObjs);
	}, [listOfContainerElementObjs]); // called when listOfCodeObjs changes

	// used to update My Elements Type specific types dropdown list
	useEffect(() => {
		let isMounted = true;
		if (isMounted && cmeData.children.length > 0) {
			const myTypeElements = [];
			cmeData.children.forEach((extension) => {
				if (extension.elementName.endsWith('Type')) {
					myTypeElements.push(extension);
				}
			});
			// transform types into options for dropdown
			const myTypeOptions = myTypeElements.map((type, i) => {
				return { key: i, value: type.elementName, text: type.elementName };
			});
			setMyElementsTypeOptions(myTypeOptions);
		}
		return () => {
			isMounted = false; // use effect cleanup to set flag false, if unmounted
		};
	}, [cmeData.children]);

	const filterSubmissionValues = (values) => {
		// after sucessful submission, should reset any values where its 'show_' flag was false as those fields were irrelevant to the submitted form.
		let filteredValues = { ...values };

		// also need to reset Add Code Form fields and Add Container Form Fields
		const fieldsToReset = [fieldNames.codeType, fieldNames.codeKey, fieldNames.codeValue, fieldNames.niemDomain, fieldNames.containerElements];

		for (const field of Object.keys(flatten(filteredValues))) {
			if (field.includes('show_')) {
				if (filteredValues[field] === false) {
					// grab the corresponding field string to reset (substring after 'show_')
					const subStringField = field.substring(5);
					filteredValues[subStringField] = cmeFormInitialValues[subStringField];
				}
			}

			if (fieldsToReset.includes(field)) {
				filteredValues[field] = cmeFormInitialValues[field];
			}
		}

		return filteredValues;
	};

	const handleCodeImport = async () => {
		// this function handles importing CSV/XLSX files for Codes
		const fileImportResult = await importCodeFile(codeImportFileData.fileId, formik.values.headerRecordExists);
		const messageState = fileImportResult.totalInvalid > 0 ? 'warning' : 'success';
		dispatch({
			type: actionTypes.CME_CODE_IMPORT_SUMMARY,
			payload: {
				messageState: messageState,
				total: fileImportResult.totalCodeObjs,
				imported: fileImportResult.validCodeObjs.length,
				unsuccessful: fileImportResult.totalInvalid,
			},
		});

		let fileCodeObjs = [];

		fileImportResult.validCodeObjs.forEach((row) => {
			fileCodeObjs.push({ codeType: row.codeType, codeKey: row.codeKey, codeValue: row.codeValue });
		});

		const updateCodeObjectArray = fileCodeObjs; // imported files overwrite data within the viewport

		dispatch({ type: actionTypes.SHOW_CODE_IMPORT_FILE, payload: true });
		dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: updateCodeObjectArray }); //used to populate code viewport table
		formik.setFieldValue(fieldNames.codeObjs, updateCodeObjectArray);

		dispatch({ type: actionTypes.CME_SOURCE_CODE_FILE, payload: codeImportFileData.fileName });
		formik.setFieldValue(fieldNames.codeSourceFile, codeImportFileData.fileName);

		dispatch({ type: actionTypes.CODE_IMPORT_FILE_DATA, payload: { fileId: null, fileName: null } }); // clear upload data
		// return Add Code section back to default view
		updateFieldVisibility(fieldNames.codeImportEntry, false);
		updateFieldVisibility(fieldNames.codeManualEntry, true);
	};

	// resets all values back to initial and clear unsaved session data
	const handleResetCMEBuilder = () => {
		dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: [] });
		dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: [] });
		dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_EDIT_MODE, payload: false }); // exit edit mode
		dispatch({ type: actionTypes.SHOW_CODE_IMPORT_FILE, payload: false });
		setViewDataElementsOn(true);
		setViewCodeOn(true);
		setViewContainersOn(true);
		setViewContainerElementsOn(true);
		setIsShowNameCharacterRules(false);
		setElementDefinition('');
		setIsProhibitedCharacterFound(false);
		setIsMissingRepTerm(false);
		setAcceptableRepTerm('');
		setAcceptableRepTermsArray([]);
		setBypassRepTermCheck(false);

		// check which view to reset to
		if (radioOptionSelected === 'DataElement') {
			updateDataElementFieldVisibility(true);
			updateContainerFieldVisibility(false);
		} else if (radioOptionSelected === 'Container') {
			updateDataElementFieldVisibility(false);
			updateContainerFieldVisibility(true);
		}

		// remove unsaved session data
		ReactSession.remove(sessionVar.unsaved_cme_data);
		// reset edit mode related reducer variables
		dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_EDIT_MODE, payload: false });
		dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_FORM_DATA, payload: {} });
		dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CODE_DATA, payload: {} });
		dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CONTAINER_ELEMENT_DATA, payload: {} });
		formik.resetForm({ values: '' }); // this value needs to be placed to ensure proper reset of formik values
	};

	// only called onChange of Data Element and Container radio buttons - resets certain values back to initial if user toggles to a different element type while in edit mode,
	const handlePartialResetCMEBuilder = () => {
		// reset edit mode related reducer variables
		dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_EDIT_MODE, payload: false });
		dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_FORM_DATA, payload: {} });
		dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CODE_DATA, payload: {} });
		dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CONTAINER_ELEMENT_DATA, payload: {} });
		dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: [] });
		dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: [] });
		// reset form values1
		formik.resetForm({ values: '' });
		setIsShowNameCharacterRules(false);
		setElementDefinition('');
		setIsProhibitedCharacterFound(false);
		setIsMissingRepTerm(false);
		setAcceptableRepTerm('');
		setAcceptableRepTermsArray([]);
		setBypassRepTermCheck(false);
		setIsMissingNameValue(false);
	};

	// used only when adding code while creating or updating a code dataElement
	const handleAddCode = () => {
		// create new varibles to store the 3 code related fields and combine them into a single code object
		const codeType = formik.values.codeType;
		const codeKey = formik.values.codeKey;
		const codeValue = formik.values.codeValue;
		const codeObj = { codeType, codeKey, codeValue };

		// make a copy of listOfCodeObjs, and add the new codeObj
		let updatedCodeObjArray = [...listOfCodeObjs, codeObj];

		// assign an index for each code item in the array - this is needed for edit/delete functionality
		updatedCodeObjArray.forEach((item, i) => (item.index = i));

		//update formik field value with the latest data (this field tracks of all added code items)
		formik.setFieldValue(fieldNames.codeObjs, updatedCodeObjArray);

		// update the global temporary arrays - used to populate the code viewport
		dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: updatedCodeObjArray });
	};

	// used only when adding container elements while creating or updating a container
	const handleAddContainerElements = () => {
		// create new varibles to appropriately store the needed key:value pairs (niemDomain:[containerElements]) and combine them into s single object
		const niemDomain = formik.values.niemDomain;
		const containerElements = formik.values.containerElements;
		let index;
		const elementObj = { index, niemDomain, containerElements };

		// store each added code and updated the local and global temporary arrays, and update the form field with this data
		let updatedContainerElementObjArray = [...listOfContainerElementObjs, elementObj];

		// assign an index for each code item in the array - this is needed for edit/delete functionality
		updatedContainerElementObjArray.forEach((obj, i) => (obj.index = i));

		// store each added code and updated the local and global temporary arrays, and update the form field with this data
		formik.setFieldValue(fieldNames.containerElementObjs, updatedContainerElementObjArray);
		dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: updatedContainerElementObjArray }); // used to populate container elements viewport table
	};

	/* Note: The following functions are used to render components necceassry to prevent users from improperly naming elements, per NIEM Model Naming and Design Rules (NDRs).
	- These checks occur in CMEBuilderUtil prior to element creation
	- Exisiting NDRs can be found here: https://reference.niem.gov/niem/specification/naming-and-design-rules/
	*/

	// determines whether element name satisfies NDRs (ends in appropriate repTerm, does not include prohibited characters, and is NOT the same value as its repTerm(s)) - returns 'isNameAccepted' true or false
	const isNameAccepted = () => {
		// to allow formik's to check for form completion FIRST, only check whether name is accepeted when there is a value to be checked
		if (
			(formik.values.show_dataElementName && formik.values.dataElementName !== '') ||
			(formik.values.show_containerName && formik.values.containerName !== '')
		) {
			let isNameAccepted;
			let prohibitedCharacterResults = checkForProhibitedCharacters(formik.values); // checks that name does NOT include prohibited characters
			const repTermResults = checkForRepTerm(formik.values); // checks that name ends in appropriate repTerm
			const repTermOptions = repTermResults.repTermOptions;
			let isValuePresent; // checks that name contains a value infront of the repTerm

			//update useState flag variables to be used for 'Missing RepTerm' and 'Allowed Characters" info/error/warning messages
			setIsMissingRepTerm(!repTermResults.isRepTermPresent);
			setAcceptableRepTerm(repTermResults.repTerm);
			setAcceptableRepTermsArray(repTermResults.repTermOptions);
			setIsProhibitedCharacterFound(prohibitedCharacterResults);

			// prevents user from naming their element the same value as its repTerm by comparing user inputted name to the selected dataElemtType's repTerm(s)
			if (formik.values.elementType === fieldNames.dataElement) {
				if (
					formik.values.dataElementType === fieldNames.boolean ||
					formik.values.dataElementType === fieldNames.code ||
					formik.values.dataElementType === fieldNames.text
				) {
					if (formik.values.dataElementName.toLowerCase() === repTermResults.repTerm.toLowerCase()) {
						// if user inputted value matches its repTerm's value, value is missing
						isValuePresent = false;
						setIsMissingNameValue(true);
					} else {
						isValuePresent = true;
						setIsMissingNameValue(false);
					}

					// code elements should end in, 'CodeType' (1 word). need to ensure user doesn't name their element this, as well as 'code type' (2 words)
					if (formik.values.dataElementType === fieldNames.code && formik.values.dataElementName.toLowerCase() === 'code type') {
						isValuePresent = false;
						setIsMissingNameValue(true);
					}
				} else {
					// for Date, Integer, and Decimal dataElementTypes, grab a list of their accepted repTerms in lowercase form to compare to user inputted value
					let repTermOptionsArray = [];
					repTermOptions.forEach((option) => {
						repTermOptionsArray.push(option.toLowerCase());
						// to be displayed in "Missing Name Value" message, if user inputted value mataches one of the accepted repTerms, update the flag used in message example
						if (option.toLowerCase() === formik.values.dataElementName.toLowerCase()) {
							setAcceptableRepTerm(option);
						}
					});
					// if user inputted value matches of its repTerm values, value is missing
					if (repTermOptionsArray.includes(formik.values.dataElementName.toLowerCase())) {
						isValuePresent = false;
						setIsMissingNameValue(true);
					} else {
						isValuePresent = true;
						setIsMissingNameValue(false);
					}
				}
			}

			// to display an example to users of how their inputted data element name should look, apply camel case to their value and update the flag used in the 'Missing Rep Term" error/warning message
			if (formik.values.elementType === fieldNames.dataElement) {
				const acceptedNameExample = updateElementNameToCamelCase(formik.values.elementType, formik.values.dataElementName);
				setRepTermNameExample(acceptedNameExample);
			}

			// for dataElements only - if element names does NOT contain prohibited characters AND ends in an appropriate repTerm, element name is acceptable
			if (formik.values.elementType === fieldNames.dataElement) {
				if (formik.values.dataElementType === fieldNames.myElements) {
					isNameAccepted = true;
				} else if (!isProhibitedCharacterFound && repTermResults.isRepTermPresent === true && isValuePresent) {
					isNameAccepted = true;
				} else isNameAccepted = false;
			} else {
				// for containers only - if element names does NOT contain prohibited character, element name is acceptable
				if (!isProhibitedCharacterFound) {
					isNameAccepted = true;
				} else isNameAccepted = false;
			}

			return isNameAccepted;
		}
	};

	// only called for MEPs in releases 4.0 and higher, if user opts to bypass checkForRepTerm() via 'Missing Rep Term' warning message - allowing name to be accepted in absence of repTerm
	const bypassCheckForRepTerm = () => {
		// update useState flags to indicate repTerm check has been bypassed and consider repTerm as NOT missing
		setBypassRepTermCheck(true);
		setIsMissingRepTerm(false);

		let isNameAccepted;

		// if element names does NOT contain prohibited characters, element name is acceptable
		if (!isProhibitedCharacterFound) {
			isNameAccepted = true;
		} else isNameAccepted = false;
		return isNameAccepted;
	};

	const bypassCheckForDefinition = () => {
		setBypassDefinitionCheck(true);
		setIsDefinitionValid(true);
	};

	// dynamically renders 'Missing RepTerm" list, based on dataElement type, for error message vs hard coding each list and accepted repTerm (dataElements only)
	const renderMissingRepTermMessageListItems = () => {
		return acceptableRepTermsArray.map((term) => {
			return <List.Item>{term}</List.Item>;
		});
	};

	// dynamically renders 'Missing RepTerm" message, based on dataElement type, vs hard coding each list and accepted repTerm (dataElements only)
	const renderMissingRepTermMessage = () => {
		return (
			<>
				<Message
					visible={isMissingRepTerm} // only display when name is missing a repTerm
					className='CME_NDRrules'
					// if v3.0 MEP, should be an error message, otherwise only a warning as repTerms are not REQUIRED for later MEP versions
					error={majorReleaseVersion === '3.0' ? true : false}
					warning
				>
					<Message.Header>Missing Representation Term</Message.Header>
					{(acceptableRepTerm === undefined && formik.values.dataElementType === fieldNames.date) ||
					formik.values.dataElementType === fieldNames.decimal ||
					formik.values.dataElementType === fieldNames.integer ? (
						<>
							<p>
								{formik.values.dataElementType} names {majorReleaseVersion === '3.0' ? <b>must</b> : 'should'} end in one of the
								following Representation Terms:
							</p>
							<List bulleted>{renderMissingRepTermMessageListItems()}</List>
							{/* display example of an acceptabled element name by combining user inputted value and first item in the list of acceptableRepTerms */}
							<p>
								<b>For example</b>: {repTermNameExample}
								{acceptableRepTermsArray[0]}
							</p>
						</>
					) : (
						<>
							<p>
								<b>{formik.values.dataElementType}</b> names {majorReleaseVersion === '3.0' ? <b>must</b> : 'should'} end in '
								<b>{acceptableRepTerm}</b>'.
							</p>
							{/* display example of an acceptabled element name by combining user inputted value and acceptableRepTerm */}
							<p>
								<b>For example</b>: {repTermNameExample}
								{acceptableRepTerm}
							</p>
						</>
					)}
					{/* bc repTerms are only required for v3.0 MEPs, only make recommendation to user, and allow them to ignore and proceed with workflow */}
					{majorReleaseVersion !== '3.0' ? (
						<>
							<b>WARNING</b>: Improperly named elements may produce conformance errors. &nbsp;
							<span
								className='basicLinkWithColor'
								onClick={() => {
									bypassCheckForRepTerm();
								}}
							>
								Ignore
							</span>
							?
						</>
					) : null}
				</Message>
			</>
		);
	};

	// dynamically renders "Character Rules" message, based on major releasee, to avoid hard coding it each time - twice for data Elements, twice for containers (when in error or when name fields are active/focused)
	const renderProhibitedCharacterMessage = () => {
		return (
			<>
				<Message
					className='CME_NDRrules'
					visible={isShowNameCharacterRules || isProhibitedCharacterFound} // allows message to display when needed
					error={isProhibitedCharacterFound ? true : false} //  message will be red for "error" only if validation detects a prohibited character in element name
					info // otherwise, message will be blue for "information"
				>
					<Message.Header>Only the following characters are allowed:</Message.Header>
					<List bulleted>
						<List.Item>Upper-case letters (A-Z)</List.Item>
						<List.Item>Lower-case letters (a-z)</List.Item>
						<List.Item>Numbers (0-9)</List.Item>
						<List.Item>
							Hyphens ( <b>-</b> ) <b> as separators</b>
						</List.Item>
						{/* only releases 4.0 and above allow underscores and periods in names */}
						{majorReleaseVersion !== '3.0' ? (
							<>
								<List.Item>
									Underscores ( <b>_</b> ) <b> as separators</b>
								</List.Item>
								<List.Item>
									Periods ( <b>.</b> ) <b> as separators</b>
								</List.Item>
							</>
						) : null}
					</List>
					<b>Names must begin with a letter and end with a letter or number</b>.
				</Message>
			</>
		);
	};

	// dynamically renders "Missing Name Value" message if user attempts to name their dataElement as its repTerm
	const renderMissingNameValueMessage = () => {
		return (
			<>
				<Message
					visible={isMissingNameValue} // only display when name is missing a name value
					error
				>
					<Message.Header>Data Elements cannot be named its Representation Term</Message.Header>
					<p>
						'<b>{acceptableRepTerm}</b>' is a {formik.values.dataElementType} Representation Term.
					</p>
					<p>
						Data Element names must begin with a value that is <b>not</b> its Representation Term.
					</p>
					<p>
						<b>For example</b>: yourValue{acceptableRepTerm}
					</p>
				</Message>
			</>
		);
	};

	// dynamically renders invalid data element definition message if user attempts to define their dataElement improperly
	const renderInvalidElementDefinitionMessage = () => {
		return (
			<>
				<Message visible={!isDefinitionValid || bypassDefinitionCheck} warning>
					<Message.Header>Definition does not conform to NDR guidelines</Message.Header>
					<p>
						{formik.values.dataElementType} definitions should be of the form:{' '}
						{formik.values.specificType === 'date/time'
							? exampleDefinitionFormats['date/time']
							: exampleDefinitionFormats[formik.values.dataElementType]}
						;
					</p>
					<p>
						<strong>For example</strong>: {definitionWarningContent}.
					</p>
					{majorReleaseVersion !== '3.0' ? ( // NOTE: this may need to be changed as the guidelines do not specify
						<>
							<b>WARNING</b>: Improperly defined elements may produce conformance errors. &nbsp;
							<span
								className='basicLinkWithColor'
								onClick={() => {
									bypassCheckForDefinition();
								}}
							>
								Ignore
							</span>
							?
						</>
					) : null}
				</Message>
			</>
		);
	};

	const renderUndoDeleteMessages = (dataType) => {
		const itemDeleteStatusArray = itemDeleteStatusObj[dataType];
		return itemDeleteStatusArray.map((statusObj) => {
			return (
				<List.Item key={statusObj.key}>
					<CMEUndoDeleteMessage
						visible={true}
						success={statusObj.status.includes('success')}
						objType={statusObj.type}
						dataType={dataType}
						data={statusObj.data}
						objName={
							statusObj.type === 'Code'
								? `${statusObj.data.codeKey}:${statusObj.data.codeValue}`
								: statusObj.type === 'childElement'
								? `${statusObj.data.objectParentData.niemDomain}:${statusObj.data.child.value}`
								: statusObj.type === 'parentElement'
								? statusObj.data.niemDomain
								: statusObj.data.elementName
						}
					/>
				</List.Item>
			);
		});
	};

	/* Note: The following functions/methods are used to enable edit/delete functionaility to exisiting elements.
		- UPDATES FORM ONLY
			- updateEditModeForm() - repopulates the required formik fields with existing data
			- updateCodeFormData() - repopulates only 'Code Type', 'Code Key', and 'Code Value' fields after selecting a single code item to edit, via the "Code" viewport
			- updateContainerElementFormData() - repopulates only the 'Niem Domain / Namespace' and 'Container Elements' fields after selecting a single container element to edit, via the "Container Elements" viewport
		- UPDATES ELEMENTS
			- checkForEditedCodeItems() - checks for changes made to 'Code Type', 'Code Key', and 'Code Value'. If changes are detected, the element is updated via updateEditedCodeItems(), found in CMEBuilderUtil.js
			- checkForEditedContainerElementValues() - checks for changes made to ''Niem Domain / Namespace' and 'Container Elements'. If changes are detected, the element is updated via updateEditedContainerElements(), found in CMEBuilderUtil.js
	*/

	// Check if the definition of a Data Element satisfies NDR guidelines
	const isDefinitionAccepted = () => {
		// Only validate a data element definiton if it exists and isn't empty
		if (formik.values.show_dataElementDefinition && formik.values.dataElementDefinition !== '') {
			let { isValid, exampleDefinition } = checkDefinitionValidity(
				formik.values.dataElementType,
				formik.values.specificType,
				formik.values.dataElementDefinition
			); // deconstruct defintion field validation results
			setIsDefinitionValid(isValid);
			setDefinitionWarningContent(exampleDefinition);
			return isValid;
		} else {
			return true;
		}
	};

	// checks for edited code items and calls update function - called onClick of "Save" button, right before formik's handleSubmit function, to store the formik code field values before emptying during element creation/update
	const checkForEditedCodeItems = () => {
		//  check whether user is updating a code item - if existingCodeData contains data, user is updating an existing code item
		if (existingCodeData !== 0) {
			// check to see if any of the code fields' values have changed - compare existingCodeData's data to formik's field values
			if (
				(formik.values.codeType !== existingCodeData.codeType && existingCodeData.codeType !== undefined) ||
				(formik.values.codeKey !== existingCodeData.codeKey && existingCodeData.codeKey !== undefined) ||
				(formik.values.codeValue !== existingCodeData.codeValue && existingCodeData.codeValue !== undefined)
			) {
				// if what's been inputted into the either of the fields is different than what it had orginally been repopulated with, update existingCodeData reducer with the latest values to used in handleUpdateElement() in CMEBuilderUtil.js
				dispatch({
					type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CODE_DATA,
					payload: {
						index: existingCodeData.index,
						codeType: formik.values.codeType,
						codeKey: formik.values.codeKey,
						codeValue: formik.values.codeValue,
					},
				});

				// update edited values
				updateEditedCodeItems();

				//reset form fields
				formik.setFieldValue(fieldNames.codeType, cmeFormInitialValues.codeType);
				formik.setFieldValue(fieldNames.codeKey, cmeFormInitialValues.codeKey);
				formik.setFieldValue(fieldNames.codeValue, cmeFormInitialValues.codeValue);
			}
		}
	};

	// checks for edited container elements and calls update function - called onClick of "update"/"Add" button, right before formik's handleSubmit function, to store the formik container element field values, before emptying during element creation/update
	const checkForEditedContainerElementValues = () => {
		//  check whether user is updating a container element - if existingContainerElementData contains data, user is updating an existing container element
		if (Object.values(existingContainerElementData).length !== 0) {
			// check to see if any of the container element fields' values have changed - compare existingContainerElementData's data to formik's field values
			if (
				formik.values.niemDomain !== existingContainerElementData.niemDomain ||
				formik.values.containerElements !== existingContainerElementData.elements
			) {
				// if what's been inputted into either of the fields is different than what it had orginally been repopulated with, update existingContainerElementData reducer with the latest values to used in handleUpdateElement()
				dispatch({
					type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CONTAINER_ELEMENT_DATA,
					payload: {
						index: existingContainerElementData.index,
						niemDomain: formik.values.niemDomain,
						containerElements: formik.values.containerElements,
					},
				});

				// update edited values
				updateEditedContainerElements();

				//reset form fields
				formik.setFieldValue(fieldNames.niemDomain, cmeFormInitialValues.niemDomain);
				formik.setFieldValue(fieldNames.containerElements, cmeFormInitialValues.containerElements);
			}
		}
	};

	const checkForDuplicateNamespace = () => {
		for (const obj of listOfContainerElementObjs) {
			// check if existing data has desired namespace
			if (formik.values.niemDomain === obj.niemDomain) {
				return { hasDuplicate: true, duplicateObject: obj };
			}
		}
		return { hasDuplicate: false, namespace: null };
	};

	// temporarily displays success message upon successfully element creation of update - handles message timeout
	const displayStatusMessage = () => {
		const timer = setTimeout(() => {
			dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ELEMENT_CREATION_STATUS, payload: '' });
			dispatch({ type: actionTypes.CME_BUILDER_UPDATE_CHANGES_SAVED_STATUS, payload: '' });
		}, 4000);
		return () => clearTimeout(timer);
	};

	// ---------------------------------- BEGIN MAIN CME MODAL AND FORM ----------------------------------
	return (
		<Modal
			id='cmeBuilderModal'
			open={isCMEBuilderModalOpen}
			onClose={() => {
				dispatch({ type: actionTypes.UPDATE_CME_BUILDER_MODAL_OPEN, payload: false });
			}}
			closeOnDimmerClick={false}
			size='fullscreen'
		>
			<Modal.Header>Custom Model Extension Builder - {packageName}</Modal.Header>
			<Modal.Content>
				<Grid divided='vertically'>
					<Grid.Row columns={2}>
						<Grid.Column width={10}>
							<Modal.Description>
								{/* ---------------------------------- BEGIN CREATE ELEMENT/TOP SECTION ---------------------------------- */}
								<p>
									NIEM adheres to a set of Model Naming and Design Rules (NDRs), found&nbsp;
									<span className='basicLinkWithColor' onClick={() => getNDRlink()}>
										here
									</span>
									. To remain in accordance with NIEM's NDRs, please keep these standards in mind as you build.
								</p>
								<Header as='h3' className='formHeader'>
									Create Element
								</Header>
								<Tooltip
									header={formLabelContent.createElement_header}
									content={formLabelContent.createElement_body}
									position='right center'
									trigger={<Icon name='question circle outline' color='blue' />}
								/>
								<p>Please choose, name, and define the element you wish to create.</p>
								{/* ---------------------------------- begin main form ---------------------------------- */}
								<Form>
									{/* ------- element type ------- */}
									<Form.Field required label={formLabelContent.elementType} />
									<Radio
										label='Data Element'
										name={fieldNames.elementType}
										value={fieldNames.dataElement}
										checked={radioOptionSelected === 'DataElement'}
										onChange={(e, d) => {
											// if user toggles to a different element type while in edit mode, cancel editMode
											if (isEditMode) {
												handlePartialResetCMEBuilder();
											}

											formik.setFieldValue(fieldNames.elementType, d.value);
											if (d.checked === true) {
												// show data element fields & hide container fields
												setRadioOptionSelected('DataElement');
												updateDataElementFieldVisibility(true);
												updateContainerFieldVisibility(false);
											} else {
												// hide data element fields & show container fields
												setRadioOptionSelected('Container');
												updateDataElementFieldVisibility(false);
												updateContainerFieldVisibility(true);
											}
										}}
									/>
									<br />
									<Radio
										label='Container'
										name={fieldNames.elementType}
										value={fieldNames.container}
										checked={radioOptionSelected === 'Container'}
										onChange={(e, d) => {
											// if user toggles to a different element type while in edit mode, cancel editMode
											if (isEditMode) {
												handlePartialResetCMEBuilder();
											}

											formik.setFieldValue(fieldNames.elementType, d.value);

											if (d.checked === true) {
												// hide data element fields & show container fields
												setRadioOptionSelected('Container');
												updateDataElementFieldVisibility(false);
												updateContainerFieldVisibility(true);
												updateFieldVisibility(fieldNames.codeObjs, false);
											} else {
												// show data element fields & hide container fields
												setRadioOptionSelected('DataElement');
												updateDataElementFieldVisibility(true);
												updateContainerFieldVisibility(false);
											}
										}}
									/>
									<br />
									<br />
									{/* -------  data element / container type ------- */}
									{formik.values.show_dataElementType ? (
										<Form.Field
											required
											label={formLabelContent.dataElement_type}
											name={fieldNames.dataElementType}
											value={formik.values.dataElementType}
											control={Select}
											options={dataElementTypeOptions}
											placeholder=''
											width={5}
											search
											onChange={(e, d) => {
												formik.setFieldValue(fieldNames.dataElementType, d.value);

												// avoids issue of user recieving the "Missing RepTerm" error message, and selecting a different dataElement before addressing/correcting the error ... resulting in the new dataElementType to proceed without repTerm
												setBypassRepTermCheck(false);
												// if 'Missing RepTerm' error/warning message is displaying, update to false to remove message after switching dataElementType
												if (isMissingRepTerm) {
													setIsMissingRepTerm(false);
												}

												// set specific type
												if (d.value === fieldNames.boolean) {
													formik.setFieldValue(fieldNames.specificType, fieldNames.indicator);
													setElementDefinition(ndr_openingPhrases.boolean); // updates definition default ghost/helper text
													updateFieldVisibility(fieldNames.codeObjs, false);
												} else if (d.value === fieldNames.code || existingFormData.specificType === fieldNames.code) {
													formik.setFieldValue(fieldNames.specificType, fieldNames.code);
													setElementDefinition(ndr_openingPhrases.code); // updates definition default ghost/helper text
													updateFieldVisibility(fieldNames.codeObjs, true);
													updateFieldVisibility(fieldNames.codeManualEntry, true); // default code view
													updateFieldVisibility(fieldNames.codeImportEntry, false);
												} else if (d.value === fieldNames.date) {
													formik.setFieldValue(fieldNames.specificType, '');
													setElementDefinition(ndr_openingPhrases.date); // updates definition default ghost/helper text
													updateFieldVisibility(fieldNames.codeObjs, false);
												} else if (d.value === fieldNames.decimal) {
													formik.setFieldValue(fieldNames.specificType, '');
													setElementDefinition(ndr_openingPhrases.decimal); // updates definition default ghost/helper text
													updateFieldVisibility(fieldNames.codeObjs, false);
												} else if (d.value === fieldNames.integer) {
													formik.setFieldValue(fieldNames.specificType, '');
													setElementDefinition(ndr_openingPhrases.quantity); // updates definition default ghost/helper text
													updateFieldVisibility(fieldNames.codeObjs, false);
												} else if (d.value === fieldNames.text) {
													formik.setFieldValue(fieldNames.specificType, fieldNames.text);
													setElementDefinition(ndr_openingPhrases.text); // updates definition default ghost/helper text
													updateFieldVisibility(fieldNames.codeObjs, false);
												} else if (d.value === fieldNames.myElements) {
													formik.setFieldValue(fieldNames.specificType, '');
													setElementDefinition(ndr_openingPhrases.myElements);
													updateFieldVisibility(fieldNames.codeObjs, false);
												} else {
													formik.setFieldValue(fieldNames.specificType, '');
													updateFieldVisibility(fieldNames.codeObjs, false);
												}

												// resets definition field to to avoid issue of definition field being considered 'touched' after user makes a change to defintion field, and switches dataElementTypes. -  w/o resetting, the field remains 'touched'.
												formik.setFieldValue(fieldNames.dataElementDefinition, '');

												// if 'Missing Name Value' error message is displaying, update to false to remove message after switching dataElementType
												if (isMissingNameValue) {
													setIsMissingNameValue(false);
												}
											}}
											error={
												formik.errors.dataElementType && {
													content: formik.errors.dataElementType,
													pointing: 'below',
												}
											}
										/>
									) : null}
									{formik.values.show_containerType ? (
										<Form.Field
											required
											label={formLabelContent.container_type}
											name={fieldNames.containerType}
											value={formik.values.containerType}
											control={Select}
											options={containerTypeOptions}
											placeholder=''
											width={5}
											disabled={isEditMode}
											onChange={(e, d) => {
												formik.setFieldValue(fieldNames.containerType, d.value);
												if (d.value === fieldNames.existingContainer) {
													updateFieldVisibility(fieldNames.existingContainerLocation, true);
													updateFieldVisibility(fieldNames.existingContainer, true);
												} else {
													updateFieldVisibility(fieldNames.existingContainerLocation, false);
													updateFieldVisibility(fieldNames.existingContainer, false);
												}
											}}
											error={
												formik.errors.containerType && {
													content: formik.errors.containerType,
													pointing: 'below',
												}
											}
										/>
									) : null}
									<br />
									{/* ------- begin container - based on an exisiting container ------- */}
									{formik.values.show_existingContainerLocation ? (
										<Form.Field
											required
											control={Select}
											options={niemDomainsExistingContainerOptions}
											label={formLabelContent.existing_container_location}
											name={fieldNames.existingContainerLocation}
											value={formik.values.existingContainerLocation}
											placeholder=''
											width={10}
											search
											onChange={(e, d) => {
												getDomainElements(d.value, false);
												formik.setFieldValue(fieldNames.existingContainerLocation, d.value);
											}}
											error={
												formik.errors.existingContainerLocation && {
													content: formik.errors.existingContainerLocation,
													pointing: 'below',
												}
											}
										/>
									) : null}
									{formik.values.show_existingContainer ? (
										<>
											<Form.Field
												required
												control={Select}
												options={niemDataElementsSingleOptions}
												label={formLabelContent.existing_container}
												name={fieldNames.existingContainer}
												value={formik.values.existingContainer}
												placeholder=''
												width={10}
												search
												onChange={(e, d) => {
													const elementData = getElementData(d.value, d.options);
													formik.setFieldValue(fieldNames.existingContainer, d.value);
													formik.setFieldValue(fieldNames.existingContainerObj, elementData.data); // saves the NIEM db element data with the container
												}}
												error={
													formik.errors.existingContainer && {
														content: formik.errors.existingContainer,
														pointing: 'below',
													}
												}
											/>
											<br />
										</>
									) : null}
									{/* ------- end container - based on an exisiting container ------- */}
									{/* ------- data element : name ------- */}
									{formik.values.show_dataElementName ? (
										<Form.Group>
											<Grid columns={2}>
												<Grid.Column width={12}>
													<>
														<Form.Field
															required
															label={[
																formLabelContent.dataElement_name,
																<Tooltip
																	header={formLabelContent.NDR_names_header}
																	content={formLabelContent.NDR_names_body}
																	position='right center'
																	wide='very'
																	trigger={
																		<Icon name='question circle outline' color='blue' className='inlineIcon' />
																	}
																/>,
															]}
															name={fieldNames.dataElementName}
															value={formik.values.dataElementName}
															control={Input}
															onChange={(e, d) => {
																formik.setFieldValue(fieldNames.dataElementName, d.value);
																// in the evenet user has already bypassed the repTerm check, and changes the value that was passed, reset the bypass repTerm flag to force name to validate again
																if (bypassCheckForRepTerm) {
																	setBypassRepTermCheck(false);
																}
															}}
															onFocus={() => {
																setIsShowNameCharacterRules(true);
															}}
															onBlur={() => {
																setIsShowNameCharacterRules(false);
															}}
															error={
																formik.errors.dataElementName && {
																	content: formik.errors.dataElementName,
																	pointing: 'below',
																}
															}
														/>
														{/* if dataElementName field is active OR a if prohibted chacter is found in name field, display character rules */}
														{(isShowNameCharacterRules && !isMissingRepTerm) || isProhibitedCharacterFound
															? renderProhibitedCharacterMessage()
															: null}

														{/* if dataElementName does not end one of the accepted repTerms, display error/warning */}
														{isMissingRepTerm ? renderMissingRepTermMessage() : null}

														{/* if dataElementName does not end one of the accepted repTerms, display error/warning */}
														{isMissingNameValue ? renderMissingNameValueMessage() : null}
													</>
												</Grid.Column>
												{/* ------- end data element : name ------- */}
												{/* ------- data element : specific type ------- */}
												<Grid.Column width={4}>
													{formik.values.show_specificType ? (
														<Form.Field
															required
															search
															control={Select}
															disabled={
																formik.values.dataElementType === fieldNames.boolean ||
																formik.values.dataElementType === fieldNames.code ||
																formik.values.dataElementType === fieldNames.text
																	? true
																	: false
															}
															options={
																formik.values.dataElementType === fieldNames.date
																	? dateTypeOptions
																	: formik.values.dataElementType === fieldNames.decimal
																	? decimalTypeOptions
																	: formik.values.dataElementType === fieldNames.integer
																	? integerTypeOptions
																	: formik.values.dataElementType === fieldNames.myElements
																	? myElementsTypeOptions
																	: []
															}
															label={formLabelContent.specific_type}
															name={fieldNames.specificType}
															value={formik.values.specificType}
															placeholder={
																formik.values.dataElementType === fieldNames.boolean
																	? fieldNames.indicator
																	: formik.values.dataElementType === fieldNames.code
																	? fieldNames.code
																	: formik.values.dataElementType === fieldNames.text
																	? fieldNames.text
																	: null
															}
															onChange={(e, d) => {
																formik.setFieldValue(fieldNames.specificType, d.value);
															}}
															error={
																formik.errors.specificType && {
																	content: formik.errors.specificType,
																	pointing: 'below',
																}
															}
														/>
													) : null}
												</Grid.Column>
											</Grid>
										</Form.Group>
									) : null}
									{/* ------- end data element : specific type ------- */}
									{/* ------- container : name ------- */}
									{formik.values.show_containerName ? (
										<>
											<Form.Group>
												<Grid columns={1}>
													<Grid.Column>
														<Form.Field
															required
															label={[
																formLabelContent.container_name,
																<Tooltip
																	header={formLabelContent.NDR_names_header}
																	content={formLabelContent.NDR_names_body}
																	position='right center'
																	wide='very'
																	trigger={
																		<Icon name='question circle outline' color='blue' className='inlineIcon' />
																	}
																/>,
															]}
															name={fieldNames.containerName}
															value={formik.values.containerName}
															control={Input}
															onChange={(e, d) => {
																formik.setFieldValue(fieldNames.containerName, d.value);
															}}
															onFocus={() => {
																setIsShowNameCharacterRules(true);
															}}
															onBlur={() => {
																setIsShowNameCharacterRules(false);
															}}
															error={
																formik.errors.containerName && {
																	content: formik.errors.containerName,
																	pointing: 'below',
																}
															}
														/>
														{/* if containerName field is active OR a if prohibted chacter is found in name field, display character rules */}
														{isShowNameCharacterRules || isProhibitedCharacterFound
															? renderProhibitedCharacterMessage()
															: null}
													</Grid.Column>
												</Grid>
											</Form.Group>
										</>
									) : null}

									<br />
									{/* ------- data element : definition ------- */}
									{formik.values.show_dataElementDefinition ? (
										<>
											<Form.TextArea
												required
												label={[
													formLabelContent.dataElement_definition,
													<Tooltip
														header={formLabelContent.NDR_definitions_header}
														content={formLabelContent.NDR_definitions_body}
														position='right center'
														wide='very'
														trigger={<Icon name='question circle outline' color='blue' />}
													/>,
												]}
												name={fieldNames.dataElementDefinition}
												value={elementDefinition} // uses useState variable instead of formik.values to accomodate for default/ghost text. formik will still store this value.
												placeholder={formLabelContent.dataElement_definition_secondary}
												onChange={(e, d) => {
													setElementDefinition(d.value);
													formik.setFieldValue(fieldNames.dataElementDefinition, d.value);
												}}
												error={
													formik.errors.dataElementDefinition && {
														content: formik.errors.dataElementDefinition,
														pointing: 'below',
													}
												}
											/>
											{!isDefinitionValid ? renderInvalidElementDefinitionMessage() : null}
										</>
									) : null}
									{/* ------- container : definition ------- */}
									{formik.values.show_containerDefinition ? (
										<>
											<Form.TextArea
												required
												label={[
													formLabelContent.container_definition,
													<Tooltip
														header={formLabelContent.NDR_definitions_header}
														content={formLabelContent.NDR_definitions_body}
														position='right center'
														wide='very'
														trigger={<Icon name='question circle outline' color='blue' />}
													/>,
												]}
												name={fieldNames.containerDefinition}
												value={formik.values.containerDefinition}
												placeholder={formLabelContent.container_definition_secondary}
												onChange={(e, d) => {
													formik.setFieldValue(fieldNames.containerDefinition, d.value);
												}}
												error={
													formik.errors.containerDefinition && {
														content: formik.errors.containerDefinition,
														pointing: 'below',
													}
												}
											/>
										</>
									) : null}
								</Form>
								{/* ---------------------------------- end main form ---------------------------------- */}
							</Modal.Description>
						</Grid.Column>
						<Grid.Column width={6}>
							{/* display element name 'Character Case' message to inform user why there element names may have been update - only display where this is at least on CME element created */}
							{displayCharacterCaseMessage && cmeData.children.length > 0 ? (
								<Message
									info
									onDismiss={() => {
										setDisplayCharacterCaseMessage(false);
									}}
								>
									Some of your Data Element and Container names may have been updated to adhere to NIEM's NDR
									<b> Character Case</b> rule.
									<p>No action required.</p>
									<p>
										More information about this rule can be found&nbsp;
										<span
											className='basicLinkWithColor'
											onClick={() => {
												getNDRlink('characterCaseRules');
											}}
										>
											here
										</span>
										.
									</p>
									<p>
										<b>
											<span
												className='basicLinkWithColor'
												onClick={() => {
													setDisplayCharacterCaseMessage(false);
												}}
											>
												Dismiss
											</span>
										</b>
									</p>
								</Message>
							) : null}
							{/* ---------------------------------- begin data elements / containers viewports ---------------------------------- */}
							{/* Data Elements */}
							<Checkbox
								toggle
								label='View My Data Elements'
								checked={viewDataElementsOn}
								onChange={() => setViewDataElementsOn(!viewDataElementsOn)}
							/>
							{/* element name 'Character Case' tooltip/helper text (data elements) - only display when the intital message is closed/dismissed and user has created a least 1 data element */}
							{!displayCharacterCaseMessage && cmeData.children.some((child) => child.elementType === fieldNames.dataElement) ? (
								<Tooltip
									header={formLabelContent.NDR_names_header}
									content={formLabelContent.NDR_elementNameCharacterCase}
									position='right center'
									trigger={<span className='basicLinkWithColor'>Why did my element names change?</span>}
									wide
								/>
							) : null}
							{itemDeleteStatusObj[fieldNames.dataElement].length > 0 ? (
								<List>{renderUndoDeleteMessages(fieldNames.dataElement)}</List>
							) : null}
							{/* Data Elements viewport - only show if the user has created at least 1 data element */}
							{!cmeData.children.some((child) => child.elementType === fieldNames.dataElement) &&
							Object.values(itemDeleteStatusObj[fieldNames.dataElement]).length === 0 ? (
								<Message className='noElements' hidden={!viewDataElementsOn} content='You currently have no elements.' />
							) : (
								<CMEDataElementsViewportTable className={!viewDataElementsOn ? 'cmeViewport.hiddenViewport' : 'cmeViewport'} />
							)}

							{/* Containers */}
							{formik.values.show_containerType ? (
								<>
									<Divider hidden />
									<Checkbox
										toggle
										label='View My Containers'
										checked={viewContainersOn}
										onChange={() => setViewContainersOn(!viewContainersOn)}
									/>
									{/* element name 'Character Case' tooltip/helper text (containers) - only display when the intital message is closed/dismissed and user has created a least 1 container */}
									{!displayCharacterCaseMessage && cmeData.children.some((child) => child.elementType === fieldNames.container) ? (
										<Tooltip
											header={formLabelContent.NDR_names_header}
											content={formLabelContent.NDR_elementNameCharacterCase}
											position='right center'
											trigger={<span className='basicLinkWithColor'>Why did my element names change?</span>}
											wide
										/>
									) : null}
									{itemDeleteStatusObj[fieldNames.container].length > 0 ? (
										<List>{renderUndoDeleteMessages(fieldNames.container)}</List>
									) : null}
									{/* Containers viewport - only show if the user has created at least 1 container and undo delete message is not on screen*/}
									{!cmeData.children.some((child) => child.elementType === fieldNames.container) &&
									Object.values(itemDeleteStatusObj[fieldNames.container]).length === 0 ? (
										<Message className='noElements' hidden={!viewContainersOn} content='You currently have no containers.' />
									) : (
										<CMEContainersViewportTable className={!viewContainersOn ? 'cmeViewport.hiddenViewport' : 'cmeViewport'} />
									)}
								</>
							) : null}
							{/* ---------------------------------- end add data elements / containers viewports ---------------------------------- */}
						</Grid.Column>
						{/* ---------------------------------- END CREATE ELEMENT/TOP SECTION ---------------------------------- */}
					</Grid.Row>
					<Grid.Row columns={2}>
						<Grid.Column width={10}>
							{/* ---------------------------------- BEGIN ADD ELEMENTS/BOTTOM SECTION ---------------------------------- */}
							{formik.values.elementType === fieldNames.dataElement && formik.values.dataElementType === fieldNames.code ? (
								<>
									{/* ---------------------------------- begin add codes form  ---------------------------------- */}
									{/* error message displays only if the user attempts to create a code element without adding at least 1 code */}
									{formik.errors.codeObjs && listOfCodeObjs.length === 0 ? (
										<Message
											negative
											icon='warning'
											header='Code Elements cannot be created without code'
											content='Please add at least one code to proceed.'
										/>
									) : null}
									<Modal.Description>
										<Header as='h3' className='formHeader'>
											Add Codes
										</Header>
										<Tooltip
											header={formLabelContent.addCode_header}
											content={formLabelContent.addCode_body}
											position='right center'
											trigger={<Icon name='question circle outline' color='blue' />}
										/>
										<p>
											Please add codes individually or&nbsp;
											<span
												className='cmeCodeImportLink'
												onClick={() => {
													// if user has code in their viewport, update flag used to inform them that they have existing code that will be overwritten, BEFORE initiating import worflow
													if (listOfCodeObjs.length >= 1 || showCodeImportFile) {
														setIsOverwritingCodeList(true);
														dispatch({ type: actionTypes.UPDATE_CME_BUILDER_RESET_CODELIST_MODAL_OPEN, payload: true });
													} else {
														// proceed with regular code import workflow
														updateFieldVisibility(fieldNames.codeImportEntry, true);
														updateFieldVisibility(fieldNames.codeManualEntry, false);
														dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
														dispatch({
															type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
															payload: { allowUserChoice: false, artifactTag: 'Other', uploadItem: 'code' },
														});
													}
												}}
											>
												import
											</span>
											&nbsp;a <b>.csv</b> or <b>.xlsx</b> Code List file.
										</p>
										<p>
											To download a standardized Code List template, please click&nbsp;
											<a
												// template used to create CME Builder Code List
												download='CodeListTemplate.xlsx'
												href='/CodeListTemplate.xlsx'
												id='downloadCodeListTemplate'
												className='basicLink'
											>
												here
											</a>
											.
										</p>
										{formik.values.show_codeManualEntry ? (
											// form view for manual entry of codes
											<Form>
												<Form.Field
													required
													control={Select}
													options={codeTypeOptions}
													name={fieldNames.codeType}
													value={formik.values.codeType}
													label={formLabelContent.code_type}
													placeholder=''
													width={6}
													search
													onChange={(e, d) => {
														if (d.value !== undefined) {
															formik.setFieldValue(fieldNames.codeType, d.value);
														}
													}}
												/>
												<Form.Group>
													<Form.Field
														control={Input}
														required
														label={formLabelContent.code_key}
														name={fieldNames.codeKey}
														value={formik.values.codeKey}
														onChange={(e, d) => {
															if (d.value !== undefined) {
																formik.setFieldValue(fieldNames.codeKey, d.value);
															}
														}}
													/>

													<Form.Field
														control={Input}
														required
														label={formLabelContent.code_value}
														name={fieldNames.codeValue}
														value={formik.values.codeValue}
														onChange={(e, d) => {
															if (d.value !== undefined) {
																formik.setFieldValue(fieldNames.codeValue, d.value);
															}
														}}
													/>
													{/* hide 'Add' button if editing a code item via the code viewport - if existingCodeData contains data, user is editing code */}
													{Object.values(existingCodeData).length !== 0 ? null : (
														<>
															<Form.Button
																className='cmeAddButton'
																content='Add'
																disabled={
																	!(
																		isStringFieldValid(formik.values.codeType) &&
																		isStringFieldValid(formik.values.codeKey) &&
																		isStringFieldValid(formik.values.codeValue)
																	)
																}
																onClick={() => {
																	handleAddCode();
																	formik.setFieldValue(fieldNames.codeType, cmeFormInitialValues.codeType);
																	formik.setFieldValue(fieldNames.codeKey, cmeFormInitialValues.codeKey);
																	formik.setFieldValue(fieldNames.codeValue, cmeFormInitialValues.codeValue);
																}}
															/>
														</>
													)}
												</Form.Group>
											</Form>
										) : null}
										{formik.values.show_codeImportEntry ? (
											// form view for importing codes
											<Form>
												<Header as='h4' className='formHeader'>
													Import Code
												</Header>
												<Form.Field required label={formLabelContent.code_import} />
												<Radio
													label='Yes'
													name='yesHeaders'
													value='true'
													checked={formik.values.headerRecordExists === true}
													onChange={() => {
														formik.setFieldValue(fieldNames.headerRecordExists, true);
													}}
												/>
												<br />
												<Radio
													label='No'
													name='noHeaders'
													value='false'
													checked={formik.values.headerRecordExists === false}
													onChange={() => {
														formik.setFieldValue(fieldNames.headerRecordExists, false);
													}}
												/>
												<br />
												<br />
												<Button
													className='primaryButton'
													disabled={formik.values.headerRecordExists === null ? true : false}
													onClick={() => {
														handleCodeImport();
													}}
												>
													Import
												</Button>
												<Button
													className='secondaryButton'
													onClick={() => {
														formik.setFieldValue(fieldNames.headerRecordExists, null); // null is the default value
														updateFieldVisibility(fieldNames.codeImportEntry, false);
														updateFieldVisibility(fieldNames.codeManualEntry, true);
													}}
												>
													Cancel
												</Button>
											</Form>
										) : null}
									</Modal.Description>
									{/* ---------------------------------- end add codes form  ---------------------------------- */}
									<br />
								</>
							) : null}
							{/* ---------------------------------- begin add container elements form  ---------------------------------- */}
							{formik.values.elementType === fieldNames.container ? (
								<>
									{/* error message displays only if the user attempts to create a container without adding at least 1 container element */}
									{formik.errors.containerElementObjs && listOfContainerElementObjs.length === 0 ? (
										<Message
											negative
											icon='warning'
											header='Containers cannot be created without container elements'
											content='Please add at least one container element to proceed.'
										/>
									) : null}
									<Modal.Description>
										<Header as='h3' className='formHeader'>
											Add Container Elements
										</Header>
										<Tooltip
											header={formLabelContent.addContainerElements_header}
											content={formLabelContent.addContainerElements_body}
											position='right center'
											trigger={<Icon name='question circle outline' color='blue' />}
										/>
										<p>Please choose elements to add to your new container.</p>
										<Form>
											<Form.Field
												required
												control={Select}
												options={niemDomainsOptions}
												label={formLabelContent.niem_domain}
												name={fieldNames.niemDomain}
												value={formik.values.niemDomain}
												placeholder=''
												width={10}
												search
												onChange={(e, d) => {
													if (d.value !== undefined) {
														formik.setFieldValue(fieldNames.containerElements, cmeFormInitialValues.containerElements); // when a new niemDomain is selected, reset containerElements to prevent errors
														getDomainElements(d.value, true);
														formik.setFieldValue(fieldNames.niemDomain, d.value);
													}
												}}
											/>
											<Form.Group>
												<Form.Field
													control={Select}
													required
													fluid
													multiple
													search
													selection
													options={niemDataElementsMultiOptions}
													labeled
													label={formLabelContent.add_elements}
													name={fieldNames.containerElements}
													placeholder=''
													width={12}
													value={formik.values.containerElements.map((i) => i.value)}
													onChange={(e, d) => {
														let containerElements = [];
														d.value.forEach((value) => {
															const elementData = getElementData(value, d.options);
															containerElements.push({ data: elementData.data, value: elementData.value });
														});

														if (d.value !== undefined) {
															formik.setFieldValue(fieldNames.containerElements, containerElements);
														}
													}}
												/>
												<Form.Button
													className='cmeAddButton'
													content={
														isEditMode && Object.values(existingContainerElementData.length !== 0) ? 'Update' : 'Add'
													}
													disabled={
														!isStringFieldValid(formik.values.niemDomain) ||
														Object.keys(formik.values.containerElements).length === 0
													}
													onClick={(d) => {
														if (!bypassRepTermCheck) {
															// if user is NOT bypassing the repTerm check (via clicking "Ignore" in the "Missing Rep Term" warning msg), then check whether name is accepted
															isNameAccepted(); // otherwise, checks repTerms AND prohibited charactesr to determine whether isNameAccepted is true or false
														}

														// check for any edited code items or container elements
														if (
															isEditMode ||
															(!isEditMode && Object.values(existingCodeData).length !== 0) ||
															(!isEditMode && Object.values(existingContainerElementData).length !== 0)
														) {
															// this is to accomodate users editing code items before the entire code dataElement has been created and saved, need to check for edited code items
															if (existingCodeData !== 0) {
																// in this event, do not save the entire form, only update the edited code item
																checkForEditedCodeItems();
															}
															const { hasDuplicate: hasDuplicateNamespace, duplicateObject } =
																checkForDuplicateNamespace();
															// this is to accomodate users editing container elements before the entire container has been created and saved, need to check for edited container items
															if (Object.values(existingContainerElementData).length !== 0) {
																// in this event, do not save the entire form, only update the edited code item
																checkForEditedContainerElementValues();
															} else if (!hasDuplicateNamespace) {
																// this accomodates adding a new namespace to an existing container
																handleAddContainerElements(d.value);
																formik.setFieldValue(fieldNames.niemDomain, cmeFormInitialValues.niemDomain);
																formik.setFieldValue(
																	fieldNames.containerElements,
																	cmeFormInitialValues.containerElements
																);
															} else {
																// this branch handles the user adding elements to a nonspecific container element. Prevents the user from creating duplicate namespaces inside of a single container.
																const combinedContainerElements = [...duplicateObject.containerElements];
																let foundDuplicateElement = false;
																// merge edited container elements with those that are in the existing namespace, excluding duplicate elements
																for (const elem of formik.values.containerElements) {
																	for (const val of Object.values(duplicateObject.containerElements)) {
																		if (val.value === elem.value) {
																			foundDuplicateElement = true;
																		}
																	}
																	if (!foundDuplicateElement) {
																		combinedContainerElements.push(elem);
																	}
																}
																duplicateObject.containerElements = combinedContainerElements;
																// update existing container element data in redux
																dispatch({
																	type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CONTAINER_ELEMENT_DATA,
																	payload: duplicateObject,
																});
																// apply changes
																checkForEditedContainerElementValues();
															}
														} else {
															// This branch handles adding a new namespace to a container while not in edit mode
															handleAddContainerElements(d.value);
															formik.setFieldValue(fieldNames.niemDomain, cmeFormInitialValues.niemDomain);
															formik.setFieldValue(
																fieldNames.containerElements,
																cmeFormInitialValues.containerElements
															);
														}
													}}
												/>
											</Form.Group>
										</Form>
									</Modal.Description>
									<br />
								</>
							) : null}
							{/* ---------------------------------- end add container elements form  ---------------------------------- */}
							{/* ---------------------------------- create element / save and cancel buttons ---------------------------------- */}
							{isEditMode ||
							(!isEditMode && Object.values(existingCodeData).length !== 0) ||
							(!isEditMode && Object.values(existingContainerElementData).length !== 0) ? (
								<Button
									className='secondaryButton'
									onClick={(e, d) => {
										setIsConfirmCancelEditsModalOpen(true);
									}}
								>
									Cancel Edits
								</Button>
							) : null}
							<Button
								className='primaryButton'
								onClick={(e, d) => {
									if (!bypassRepTermCheck) {
										// if user is NOT bypassing the repTerm check (via clicking "Ignore" in the "Missing Rep Term" warning msg), then check whether name is accepted
										isNameAccepted(); // otherwise, checks repTerms AND prohibited charactesr to determine whether isNameAccepted is true or false
									}

									// then handle form submission - this does not run unless isNameAccepted() has returned true
									formik.handleSubmit(e); // handles formik validation, checking for form completeness, also clears unsaved values
								}}
								type='submit'
							>
								{/* if changes are being made, button will be "Save". otherwise, user is creating a new element */}
								{isEditMode ||
								(!isEditMode && Object.values(existingCodeData).length !== 0) ||
								(!isEditMode && Object.values(existingContainerElementData).length !== 0)
									? 'Save Changes'
									: 'Create Element'}
							</Button>
							{/* success/error message for the status of the created element */}
							{elementCreationStatus !== '' ? (
								<Message
									positive={elementCreationStatus === 'elementCreation_success' ? true : false}
									negative={elementCreationStatus === 'elementCreation_failed' ? true : false}
									content={
										elementCreationStatus === 'elementCreation_success' ? (
											<b>Element created successfully!</b>
										) : (
											[<b>Element failed to create</b>, '.', ' Please try again.']
										)
									}
								></Message>
							) : null}
							{/* success/error message for the status of element changes */}
							{changesSavedStatus !== '' ? (
								<Message
									positive={changesSavedStatus === 'changesSaved_success' ? true : false}
									negative={changesSavedStatus === 'changesSaved_failed' ? true : false}
									content={
										changesSavedStatus === 'changesSaved_success' ? (
											<b>Changes saved.</b>
										) : (
											[<b>Changes did not save</b>, '.', ' Please try again.']
										)
									}
								></Message>
							) : null}

							{/* ---------------------------------- end  create element / save and cancel buttons ---------------------------------- */}
						</Grid.Column>
						{/* --------------- begin add code / container elements viewports --------------- */}
						<Grid.Column width={6}>
							{formik.values.elementType === fieldNames.dataElement && formik.values.dataElementType === fieldNames.code ? (
								<>
									<Checkbox
										toggle
										label='View My Code List'
										checked={viewCodeOn}
										onChange={() => {
											setViewCodeOn(!viewCodeOn);
											dispatch({ type: actionTypes.SHOW_CODE_IMPORT_FILE, payload: !showCodeImportFile });
										}}
									/>
									{itemDeleteStatusObj[fieldNames.code].length > 0 ? (
										<List>{renderUndoDeleteMessages(fieldNames.code)}</List>
									) : null}
									{/* allows viewport table to show only if the user has added at least 1 code */}
									{listOfCodeObjs.length === 0 &&
									showCodeImportFile === false &&
									Object.values(itemDeleteStatusObj[fieldNames.code]).length === 0 ? (
										<Message className='noElements' hidden={!viewCodeOn} content='You currently have no code elements.' />
									) : (
										<CMECodeViewportTable className={!viewCodeOn ? 'cmeViewport.hiddenViewport' : 'cmeViewport'} />
									)}
								</>
							) : null}

							{formik.values.elementType === fieldNames.container ? (
								<>
									<Checkbox
										toggle
										label='View My Container Elements'
										checked={viewContainerElementsOn}
										onChange={() => setViewContainerElementsOn(!viewContainerElementsOn)}
									/>
									{itemDeleteStatusObj[fieldNames.containerElements].length > 0 ? (
										<List>{renderUndoDeleteMessages(fieldNames.containerElements)}</List>
									) : null}
									{/* allows viewport table to show only if the user has added at least 1 container container element and undo delete message is not on screen*/}
									{listOfContainerElementObjs.length === 0 && itemDeleteStatusObj[fieldNames.containerElements].length === 0 ? (
										<Message
											className='noElements'
											hidden={!viewContainerElementsOn}
											content='You currently have no container elements.'
										/>
									) : (
										<CMEContainerElementsViewportTable
											className={!viewContainerElementsOn ? 'cmeViewport.hiddenViewport' : 'cmeViewport'}
										/>
									)}
								</>
							) : null}
						</Grid.Column>
						{/* --------------- end add code / container elements viewports --------------- */}
					</Grid.Row>
				</Grid>
			</Modal.Content>
			{/* ---------------------------------- END ADD ELEMENTS/BOTTOM SECTION ---------------------------------- */}
			{/* ---------------------------------- BEGIN MODAL BUTTONS ---------------------------------- */}
			<Modal.Actions>
				<Button
					className='secondaryButton'
					onClick={(e, d) => {
						dispatch({ type: actionTypes.UPDATE_CME_BUILDER_MODAL_OPEN, payload: false });
						handleResetCMEBuilder();
					}}
				>
					Cancel
				</Button>
				<Button
					className='primaryButton'
					disabled={cmeData.children.length === 0 ? true : false}
					onClick={() => {
						setIsBuildCMEModalOpen(true);
					}}
				>
					Next
				</Button>
			</Modal.Actions>
			{/* ---------------------------------- END MODAL BUTTONS ---------------------------------- */}
			{/* ---------------------------------- BEGIN FULLSCREEN VIEWPORT MODAL ---------------------------------- */}
			<Modal
				id='cmeBuilderModal'
				open={isFullscreenModalOpen}
				onClose={() => {
					dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: false });
				}}
				closeOnDimmerClick={false}
				size='tiny'
			>
				<Modal.Header>
					{fullscreenViewportType === fieldNames.dataElement
						? 'My Data Elements'
						: fullscreenViewportType === fieldNames.container
						? 'My Containers'
						: fullscreenViewportType === fieldNames.code
						? 'My Code'
						: 'My Container Elements'}
				</Modal.Header>
				<Modal.Content scrolling>
					{fullscreenViewportType === fieldNames.dataElement ? (
						<CMEDataElementsViewportTable />
					) : fullscreenViewportType === fieldNames.container ? (
						<CMEContainersViewportTable />
					) : fullscreenViewportType === fieldNames.code ? (
						<CMECodeViewportTable />
					) : (
						<CMEContainerElementsViewportTable />
					)}
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='secondaryButton'
						onClick={() => {
							dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: false });
						}}
					>
						Close
					</Button>
				</Modal.Actions>
			</Modal>

			{/* ---------------------------------- BEGIN BUILD CMEs / URI + DEFINIFITON MODAL ---------------------------------- */}
			{/* this modal appears after clicking the 'Next' button (bottom-right of overall CME Builder), for users to input an overall URI and Definition value for their CMEs, before the 'Confirm Build' modal */}
			<Modal
				open={isBuildCMEModalOpen}
				onClose={() => {
					setIsConfirmBuildModalOpen(false);
				}}
				closeOnDimmerClick={false}
				size='mini'
			>
				<Modal.Header>Build Custom Model Extensions</Modal.Header>
				<Modal.Content>
					<p>To build your Custom Model Extensions and save the extension file, you must provide the following:</p>
					<Form>
						<Form.Field // does not require formik / Yup validation
							fluid
							required
							label={[
								formLabelContent.cmeURI,
								<Tooltip
									header={formLabelContent.uri_header}
									content={formLabelContent.uri_body}
									position='right center'
									wide='very'
									trigger={<Icon name='question circle outline' color='blue' className='inlineIcon' />}
								/>,
							]}
							name={fieldNames.cmeURI}
							value={enteredUri}
							control={Input}
							onChange={(e, d) => {
								setEnteredUri(d.value);
							}}
						/>
						<Form.Field // does not require formik / Yup validation
							fluid
							required
							label={[formLabelContent.cmeDefinition]}
							name={fieldNames.cmeDefinition}
							value={enteredDefinition}
							control={Input}
							onChange={(e, d) => {
								setEnteredDefinition(d.value);
							}}
						/>
					</Form>
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='secondaryButton'
						onClick={() => {
							// reset entered values and close this modal
							setEnteredUri(uriFieldValue);
							setEnteredDefinition(definitionFieldValue);
							setIsBuildCMEModalOpen(false);
						}}
					>
						Cancel
					</Button>
					<Button
						className='primaryButton'
						disabled={enteredUri === '' || enteredDefinition === '' ? true : false} // disabled unless uri AND definiton values are present
						onClick={() => {
							// update redux with entered URI and Definition values, then close this modal and open 'Confirm Build' modal
							dispatch({ type: actionTypes.UPDATE_CME_BUILDER_URI, payload: enteredUri });
							dispatch({ type: actionTypes.UPDATE_CME_BUILDER_DEFINITION, payload: enteredDefinition });
							setIsBuildCMEModalOpen(false);
							setIsConfirmBuildModalOpen(true);
						}}
					>
						Build
					</Button>
				</Modal.Actions>
			</Modal>

			{/* ---------------------------------- BEGIN BUILD CONFIRMATION MODAL ---------------------------------- */}
			<Modal
				id='cmeBuilderModal'
				open={isConfirmBuildModalOpen}
				onClose={() => {
					setIsConfirmBuildModalOpen(false);
				}}
				closeOnDimmerClick={false}
				size='mini'
			>
				<Modal.Header>Confirm Build</Modal.Header>
				<LoaderModal active={isLoadingActive} />
				<Modal.Content>
					<p>
						<b>Ready to build an extension schema?</b>
					</p>
					<p>
						Please note you can edit this extension schema multiple times if needed. This extension will show up in the artifact tree in
						the left pane.
					</p>
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='secondaryButton'
						onClick={() => {
							setIsConfirmBuildModalOpen(false);
						}}
					>
						Cancel
					</Button>
					<Button
						className='primaryButton'
						onClick={async (e, d) => {
							// NOTE: The removal of the subset schema and translation files needs to be removed for CME building. This process utilizes these starting files and creates updated versions for extensions. NIEM 516 should update these files
							// // If subset schema or translation files are already generated, remove subset schema and translation files on confirm
							// if (isRequiredArtifactUploaded.subset || isTranslationGenerated) {
							// 	deleteSubsetTranslate(true, true);
							// }

							clearValidationResults();
							dispatch({ type: actionTypes.UPDATE_CME_BUILDER_MODAL_OPEN, payload: false });

							// Build extension Schema
							setIsLoadingActive(true);
							const resultSuccess = await handleBuildExtensionSchema();
							setIsLoadingActive(false);

							if (resultSuccess) {
								dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_EXTENSION_SCHEMA_GENERATED, payload: 'success' });
							} else {
								dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_EXTENSION_SCHEMA_GENERATED, payload: 'fail' });
							}

							// Reset forms
							dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_CME_COMPELTE, payload: true });
							setIsConfirmBuildModalOpen(false);
							handleResetCMEBuilder();
							const timer = setTimeout(() => {
								dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_EXTENSION_SCHEMA_GENERATED, payload: '' });
							}, 5000);
							return () => clearTimeout(timer);
						}}
					>
						Confirm
					</Button>
				</Modal.Actions>
			</Modal>
			{/* ---------------------------------- BEGIN RESET / OVERWRITE CODE LIST MODAL ---------------------------------- */}
			<Modal
				// id='cmeBuilderModal'
				open={isResetCodeListModalOpen}
				onClose={() => {
					dispatch({ type: actionTypes.UPDATE_CME_BUILDER_RESET_CODELIST_MODAL_OPEN, paylod: false });
					setIsOverwritingCodeList(false);
				}}
				closeOnDimmerClick={false}
				size='mini'
			>
				<Modal.Header>{isOverwritingCodeList ? 'Overwrite Existing Code List' : 'Confirm Code List Reset'}</Modal.Header>
				<Modal.Content>
					{isOverwritingCodeList ? (
						<>
							<p>
								You currently have <b>{listOfCodeObjs.length} </b>items in your Code List viewport. Importing a new Code List will
								overwrite any existing code.
							</p>
							<p>
								<b>Do you wish to proceed?</b>
							</p>
						</>
					) : (
						<>
							<p>
								Proceeding will reset your Code List and remove all <b>{listOfCodeObjs.length} </b>
								codes from the element you are currently creating.
							</p>
							<p>
								<b>Do you wish to proceed?</b>
							</p>
						</>
					)}
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='primaryButton'
						onClick={(e, d) => {
							if (isOverwritingCodeList) {
								// user is importing a new code list, over existing code list
								updateFieldVisibility(fieldNames.codeImportEntry, true);
								updateFieldVisibility(fieldNames.codeManualEntry, false);
								dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
								dispatch({
									type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
									payload: { allowUserChoice: false, artifactTag: 'Other', uploadItem: 'code' },
								});
							} else {
								// user is resetting code list, separate from import flow
								dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: [] }); //used to populate code viewport table
								dispatch({ type: actionTypes.SHOW_CODE_IMPORT_FILE, payload: false });
								setIsOverwritingCodeList(false);
							}
							dispatch({ type: actionTypes.UPDATE_CME_BUILDER_RESET_CODELIST_MODAL_OPEN, payload: false });
						}}
					>
						Yes
					</Button>
					<Button
						className='secondaryButton'
						onClick={() => {
							dispatch({ type: actionTypes.UPDATE_CME_BUILDER_RESET_CODELIST_MODAL_OPEN, payload: false });
							setIsOverwritingCodeList(false);

							if (isOverwritingCodeList) {
								updateFieldVisibility(fieldNames.codeManualEntry, true);
								updateFieldVisibility(fieldNames.codeImportEntry, false);
							}
						}}
					>
						No
					</Button>
				</Modal.Actions>
			</Modal>
			{/* ---------------------------------- BEGIN CONFIRM CANCEL EDITS MODAL ---------------------------------- */}
			<Modal open={isConfirmCancelEditsModalOpen} size='mini'>
				<Modal.Header>Please Note</Modal.Header>
				<Modal.Content>
					<p>
						By canceling edits, your changes <strong>will not</strong> be saved.
					</p>{' '}
					<p>Would you like to continue?</p>
				</Modal.Content>
				<Modal.Actions>
					<Button
						className='primaryButton'
						onClick={() => {
							handleResetCMEBuilder();
							setIsConfirmCancelEditsModalOpen(false);
						}}
					>
						Yes, Continue
					</Button>
					<Button className='secondaryButton' onClick={() => setIsConfirmCancelEditsModalOpen(false)}>
						No, Abort
					</Button>
				</Modal.Actions>
			</Modal>
		</Modal>
	);
};

export default CMEBuilderModal;
