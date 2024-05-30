import * as Yup from 'yup';
import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { setSessionValue, getSessionValue } from '../Util/localStorageUtil';
import * as sessionVar from '../Util/SessionVar';
import * as xlsx from 'xlsx';
import { retrieveFileRequest } from './UploadFileUtil';
import { isStringFieldValid, sortDropdownAlphabetically } from './FieldValidationUtil';
import { niemReferenceBaseURL } from '../config/config';
import { deleteSubsetTranslate } from '../Shared/MEPChangeWarningModal';
import { handleError, trackedErrorSources } from './ErrorHandleUtil';
import { updateReduxArtifactTreeFromDB } from './ArtifactTreeUtil';

// Generic error message text
const genRequiredMessage = 'This is a required field';

// Form Labels - the for each individual form field and their question mark icon text
export const formLabelContent = {
	// form
	elementType: 'What type of element would you like to create?',
	dataElement_type: 'What type of Data Element?',
	specific_type: 'Specific Type',
	dataElement_name: ['What would you like to name this Data Element? ', ' '],
	dataElement_definition: ['Please define this Data Element ', ' '],
	dataElement_definition_secondary: '(What this data represents, is made up of, will be used for, etc.)',
	container_type: 'What type of container?',
	container_name: ['What would you like to name this new Container? ', ' '],
	container_definition: ['Please define this Container ', ' '],
	container_definition_secondary: '(What this data represents, is made up of, will be used for, etc.)',
	existing_container_location: 'Which namespace is the exisiting container located in?',
	existing_container: 'Which container would you like to base your container on?',
	date_type: 'What type of date?',
	integer_type: 'Positive Integers Only',

	// code - add code
	code_type: 'What type of code would you like to create?',
	code_key: 'What is the Key?',
	code_value: 'What is the Value?',
	code_import: 'Does your file have a header record?',

	// containers - add container elementes
	niem_domain: 'Which namespace would you like to choose elements from?',
	add_elements: 'Which element(s) would you like to add?',

	//  Build CME / URI + Definition Modal fields
	cmeURI: 'URI ',
	cmeDefinition: 'Definition',

	// question mark icon content
	createElement_header: 'What are Elements?',
	createElement_body: [<b>Data Elements</b>, ' represent a concept.', <b> Containers</b>, ' hold elements.'],
	addContainerElements_header: 'What are Container Elements?',
	addContainerElements_body: [
		'A container bundles related element additions together into a single block, and makes the container element substitutable for the augmentation point element. More information on container elements and examples can be found ',
		<a href='https://niem.github.io/reference/concepts/augmentation/element/' target='_blank' rel='noreferrer'>
			here
		</a>,
		'.',
	],
	addCode_header: 'What are Codes?',
	addCode_body: [
		<b>"Codes"</b>,
		' is the general term NIEM uses to identify associative identifiers with more verbose data or data ranges (e.g., MON for Monday). Code Lists provide a tabular format for specifying codes and their associated data. Code Lists are most often used to limit the possible values for an element. More information on code lists and examples can be found ',
		<a href='https://niem.github.io/reference/specifications/code-lists/' target='_blank' rel='noreferrer'>
			here
		</a>,
		'.',
	],

	// question mark icon content - Build Custom Model Extensions URI + Definition modal
	uri_header: 'What is a URI?',
	uri_body: [
		<>
			A <b>Uniform Resource Identifier</b> (URI) identifies a resource.
			<ul>
				<li>
					May be an absolute URI (e.g., <b>http://example.org/incident182#person12</b>)
				</li>
				<li>
					May be a relative URI (e.g.,<b>#person12</b>)
				</li>
			</ul>
		</>,
	],

	// question mark icon content - name and defintion (NDR) suggesetios per NDR rules
	NDR_names_header: 'Naming Elements',
	NDR_names_body: [
		<>
			As stated in NIEM's Model Naming and Design Rules,<b> names should:</b>
			<ul>
				<li>
					Be written in <b>Camel Case</b>
				</li>
				<li>
					End in its proper <b>Representation Term</b>
				</li>
				<li>
					Be in <b>singular form </b>unless the concept itself is plural
				</li>
				<li>
					Be used in <b>present tense </b>unless the concept itself if past tense
				</li>
				<li>
					<b>Not </b>use <b>prepositions</b> except where they are required for clarity or by standard convention
				</li>
				<li>
					Use <b>acronyms</b> and <b>abbreviations</b> with great care as they may impair understanding when their defintions are not clear
					or when used injudiciously
				</li>
			</ul>
			<b>Example: </b>The NIEM component name, <b> AircraftFuselageColorCode</b>, disassembles as follows:
			<ul>
				<li>
					<b>Object class term </b> = "Aircraft"
				</li>
				<li>
					<b>Qualifier term </b> = "Fuselage"
				</li>
				<li>
					<b>Property term </b> = "Color"
				</li>
				<li>
					<b>Representation term </b> = "Code"
				</li>
			</ul>
			More information on how to name elements, and examples can be found&nbsp;
			<span className='basicLinkWithColor' onClick={() => getNDRlink('nameRules')}>
				here
			</span>
			.
		</>,
	],
	NDR_definitions_header: 'Defining Elements',
	NDR_definitions_body: [
		<>
			As stated in NIEM's Model Naming and Design Rules, definitions should begin with its proper opening phrase. <br />
			<br />
			More information on how to define elements, and examples can be found&nbsp;
			<span className='basicLinkWithColor' onClick={() => getNDRlink('definitionRules')}>
				here
			</span>
			.
		</>,
	],
	NDR_elementNameCharacterCase: [
		<>
			Some of your Data Element and Container names may have been updated to adhere to NIEM's NDR
			<b> Character Case</b> rule. <br />
			<br />
			More information about this rule can be found&nbsp;
			<span className='basicLinkWithColor' onClick={() => getNDRlink('characterCaseRules')}>
				here
			</span>
			.
		</>,
	],
};

// Field  Name References - this is used to limit and prevent hard coded stings throoughout various files
export const fieldNames = {
	elementType: 'elementType',
	// data elements
	myElements: 'myElements',
	dataElement: 'dataElement',
	dataElementType: 'dataElementType',
	dataElementName: 'dataElementName',
	dataElementDefinition: 'dataElementDefinition',
	specificType: 'specificType',
	boolean: 'Boolean',
	indicator: 'Indicator',
	text: 'Text',
	// code
	code: 'Code',
	codeType: 'codeType',
	codeKey: 'codeKey',
	codeValue: 'codeValue',
	codeObjs: 'codeObjs',
	enumeration: 'enumeration',
	fractionDigits: 'fractionDigits',
	length: 'length',
	maxLength: 'maxLength',
	minLength: 'minLength',
	minExclusive: 'minExclusive',
	minInclusive: 'minInclusive',
	maxExclusive: 'maxExclusive',
	maxInclusive: 'maxInclusive',
	pattern: 'pattern',
	totalDigits: 'totalDigits',
	whiteSpace: 'whiteSpace',
	codeImportEntry: 'codeImportEntry',
	codeManualEntry: 'codeManualEntry',
	headerRecordExists: 'headerRecordExists',
	codeSourceFile: 'codeSourceFile',
	// dates
	date: 'Date',
	fullDate: 'full',
	dateTime: 'date/time',
	yyyy: 'yyyy',
	yyyymm: 'yyyy-mm',
	yyyymmdd: 'yyyy-mm-dd',
	// decimals
	decimal: 'Decimal',
	amount: 'amount',
	number: 'number',
	percentage: 'percentage',
	quantity: 'quantity',
	value: 'value',
	// integers
	integer: 'Integer',
	integerType: 'integerType',
	negativeInteger: 'negativeInteger',
	nonNegativeInteger: 'nonNegativeInteger',
	positiveInteger: 'positiveInteger',
	nonPositiveInteger: 'nonPositiveInteger',
	// containers
	container: 'container',
	containerType: 'containerType',
	newContainer: 'newContainer',
	existingContainer: 'existingContainer',
	existingContainerObj: 'existingContainerObj',
	rootElement: 'rootElement',
	containerName: 'containerName',
	containerDefinition: 'containerDefinition',
	niemDomain: 'niemDomain',
	containerElements: 'containerElements',
	containerElementObjs: 'containerElementObjs',
	existingContainerLocation: 'existingContainerLocation',

	//  Build CME / URI + Definition modal fields
	cmeURI: 'cmeURI',
	cmeDefinition: 'cmeDefinition',
};

// NDR Rule Names - what each element name should end in
export const ndr_representationTerms = {
	// boolean
	boolean: 'Indicator',
	//code
	codeSimpleType: 'CodeSimpleType',
	codeComplexType: 'CodeType',
	// date
	date: 'Date',
	dateTime: 'DateTime',
	duration: 'Duration',
	time: 'Time',
	// decimal
	value: 'Value',
	numeric: 'Numeric',
	rate: 'Rate',
	percent: 'Percent',
	// integer
	integer: 'Integer',
	number: 'Number',
	quantity: 'Quantity',
	// text
	text: 'Text',
	// containers
	container: 'Container',
};

// NDR Rule Definitions - what each element definition should being with (defintion field ghost text)
export const ndr_openingPhrases = {
	boolean: 'True if YOUR STATEMENT ; false (otherwise|if) YOUR STATEMENT ',
	code: 'A data type YOUR STATEMENT ...',
	date: 'A|An (optional adjectives) YOUR STATEMENT (date|month|year)...',
	decimal: 'A|An (optional adjectives) YOUR STATEMENT ...',
	quantity: 'A|An (optional adjectives) YOUR STATEMENT (count|number)...',
	text: 'A|An (optional adjectives) YOUR STATEMENT ...',
	myElements: 'A|An (optional adjectives) YOUR STATEMENT ...',
};

// here, we are indicating dynamic fields that could be hidden using a "show_" + fieldname flag
// IMPORTANT: name "show_" fields with the part after the "_" being the same as the field name.
export const cmeFormInitialValues = {
	elementType: 'dataElement',
	// data elements
	show_dataElementType: true,
	dataElementType: '',
	show_dataElementName: true,
	dataElementName: '',
	show_dataElementDefinition: true,
	dataElementDefinition: '',
	show_specificType: true,
	specificType: '',
	// code
	codeType: '',
	codeKey: '',
	codeValue: '',
	show_codeObjs: false,
	codeObjs: [],
	show_codeImportEntry: false,
	show_codeManualEntry: true,
	headerRecordExists: null,
	codeSourceFile: '',
	// containers
	show_containerType: false,
	containerType: '',
	show_existingContainer: false,
	existingContainer: '',
	existingContainerObj: {},
	show_containerName: false,
	containerName: '',
	show_containerDefinition: false,
	containerDefinition: '',
	niemDomain: '',
	containerElements: [],
	show_containerElementObjs: false,
	containerElementObjs: [],
	show_existingContainerLocation: false,
	existingContainerLocation: '',
};

// validation schema using Yup library
// https://github.com/jquense/yup
export const cmeValidationSchema = Yup.object().shape({
	elementType: Yup.string().required(genRequiredMessage),
	// data elements
	show_dataElementType: Yup.boolean(),
	dataElementType: Yup.string().when('show_dataElementType', {
		is: true,
		then: Yup.string().required(genRequiredMessage),
	}),
	show_dataElementName: Yup.boolean(),
	dataElementName: Yup.string().when('show_dataElementName', {
		is: true,
		then: Yup.string().required(genRequiredMessage),
	}),
	show_dataElementDefinition: Yup.boolean(),
	dataElementDefinition: Yup.string().when('show_dataElementDefinition', {
		is: true,
		then: Yup.string().required(genRequiredMessage),
	}),
	show_specificType: Yup.boolean(),
	specificType: Yup.string().when('show_specificType', {
		is: true,
		then: Yup.string().required(genRequiredMessage),
	}),
	// code
	codeType: Yup.string(),
	codeKey: Yup.string(),
	codeValue: Yup.string(),
	show_codeObjs: Yup.boolean(),
	codeObjs: Yup.array().when('show_codeObjs', {
		is: true,
		then: Yup.array().min(1, 'You must add at least 1 code.'),
	}),
	// containers
	show_containerType: Yup.boolean(),
	containerType: Yup.string().when('show_containerType', {
		is: true,
		then: Yup.string().required(genRequiredMessage),
	}),
	show_existingContainer: Yup.boolean(),
	existingContainer: Yup.string().when('show_existingContainer', {
		is: true,
		then: Yup.string().required(genRequiredMessage),
	}),
	show_containerName: Yup.boolean(),
	containerName: Yup.string().when('show_containerName', {
		is: true,
		then: Yup.string().required(genRequiredMessage),
	}),
	show_containerDefinition: Yup.boolean(),
	containerDefinition: Yup.string().when('show_containerDefinition', {
		is: true,
		then: Yup.string().required(genRequiredMessage),
	}),
	niemDomain: Yup.string(),
	containerElements: Yup.array(),
	show_containerElementObjs: Yup.boolean(),
	containerElementObjs: Yup.array().when('show_containerElementObjs', {
		is: true,
		then: Yup.array().min(1, 'You must add at least 1 container element.'),
	}),
	show_existingContainerLocation: Yup.boolean(),
	existingContainerLocation: Yup.string().when('show_existingContainerLocation', {
		is: true,
		then: Yup.string().required(genRequiredMessage),
	}),
});

// saves CME data to db
export const saveCMEDataApi = async (packageId, cmeData) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'MongoRepo/saveCMEData', {
				cmeData: { packageId: packageId, cmeData: JSON.stringify(cmeData) },
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				if (response.status === 200) {
					return response.data; // {isSuccess: , data: } object format is returned
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.cme);
				return false;
			});
	} else {
		return false;
	}
};

// saves AND builds data to db
export const buildCMEDataApi = async (packageId, cmeData) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'MongoRepo/buildCMEData', {
				cmeData: { packageId: packageId, cmeData: JSON.stringify(cmeData) },
				auditUser: getSessionValue(sessionVar.user_id),
			})
			.then((response) => {
				if (response.status === 200) {
					return response.data; // {isSuccess: , data: } object format is returned
				}
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.cme);
				return false;
			});
	} else {
		return false;
	}
};

// used to determine extension schema outputs for each created element
const getDataType = (dataElementType, specificType, elementName) => {
	let niemDataType;
	// update and return niemDataType based on dataElementType and specificType
	if (dataElementType === 'myElements') {
		if (specificType.startsWith('ext:')) {
			niemDataType = specificType;
		} else {
			niemDataType = 'ext:' + specificType;
		}
	} else if (dataElementType === fieldNames.boolean) {
		niemDataType = 'xs:boolean';
	} else if (dataElementType === fieldNames.code) {
		if (elementName.substring(elementName.length - 8) === 'CodeType') {
			// element name follows NDR guidelines and ends in "CodeType"; leave as is
			// since the guidelines were followed, camel casing of the representation term has been enforced
			niemDataType = 'ext:' + elementName;
		} else if (
			elementName.substring(elementName.length - 4).toLowerCase() === 'code' ||
			elementName.substring(elementName.length - 4).toLowerCase() === 'type'
		) {
			// element name ignores NDR guidelines and ends in code or type, and not "CodeType"
			// splice last 4 characters and append "CodeType" to ensure proper casing
			let splicedElementName = elementName.substring(0, elementName.length - 4);
			niemDataType = 'ext:' + splicedElementName + 'CodeType';
		} else {
			// DataType for code should always end in "CodeType"
			niemDataType = 'ext:' + elementName + 'CodeType';
		}
	} else if (dataElementType === fieldNames.date) {
		if (specificType === fieldNames.fullDate) {
			niemDataType = 'xs:date';
		} else if (specificType === fieldNames.dateTime) {
			niemDataType = 'xs:dateTime';
		} else if (specificType === fieldNames.yyyy) {
			niemDataType = 'xs:gYear';
		} else if (specificType === fieldNames.yyyymm) {
			niemDataType = 'xs:gYearMonth';
		} else niemDataType = 'xs:date'; // if yyyy/mm/dd - awaiting correct value from BAH and GTRI SMEs
	} else if (dataElementType === fieldNames.decimal) {
		niemDataType = 'xs:decimal';
	} else if (dataElementType === fieldNames.integer) {
		if (specificType === fieldNames.negativeInteger) {
			niemDataType = 'xs:negativeInteger';
		} else if (specificType === fieldNames.nonNegativeInteger) {
			niemDataType = 'xs:nonNegativeInteger';
		} else if (specificType === fieldNames.nonPositiveInteger) {
			niemDataType = 'xs:nonPositiveInteger';
		} else niemDataType = fieldNames.positiveInteger;
	} else if (dataElementType === fieldNames.text) {
		niemDataType = 'nc:TextType';
	} else {
		// only append "Type" if it isn't already present at the end of the element name
		if (elementName.substring(elementName.length - 4).toLowerCase() === 'type') {
			// trauncate last 4 characters to ensure proper casing
			let splicedElementName = elementName.substring(0, elementName.length - 4);
			niemDataType = 'ext:' + splicedElementName + 'Type';
		} else {
			niemDataType = 'ext:' + elementName + 'Type';
		}
	}
	// TO DO - need one for container elements after NIEM 431 is completed
	return niemDataType;
};

/* Note: The following functions/methods are used to apply/enforce NIEM Model Naming and Design Rules (NDRs), specifically to:
		- determine which set of NDRs to apply/enforce, based on MEP major release version
		- determine whether element names satisfy NDR requirements, based on MEP major release version
			- check for special characters
			- check for inclusion of representation terms (repTerms) for data elements
			- checks for and applies upper/lower camel case to element names
	- These checks will allow error/warning messages to render on the form via CMEBuilderModal.js, prior to element creation
	- Exisiting NDRs can be found here: https://reference.niem.gov/niem/specification/naming-and-design-rules/
	*/

// NIEM NDRs differ btwn major relealses rather than incremental releases. need to determine which NDR to enforce, based on MEP's major release (i.e, releases 4.1 and 4.2 are part of major release 4.0)
export const getMajorReleaseVersion = () => {
	const state = store.getState();
	let release = state.mpd.release;
	//grabs the digit infront of the the incremental release's decimal point( . ), and replaces the second digit with a '.0' (i.e. 4.2 is made to be 4.0)
	let majorReleaseVersion = release.charAt('.') + '.0'; // release is brought in via exisiting redux variable using useState
	return majorReleaseVersion;
};

// bc NIEM Model Naming and Design Rules (NDR) links are named by major relealses and not incremental releases, need to get correct link based on MEP's major release (i.e, releases 4.1 and 4.2 are part of major release 4.0)
export const getNDRlink = (ndr) => {
	/* NOTE - accepted aurguments are one of the following, based on where the link is being accessed:
			- string: 'namingRules' - if accessed via the CME Builder form's 'Name' question mark icon
			- string: 'characterCaseRules' - if accessed via the CME Builder form's 'Character Case' message or tooltip above the Data Elements and Contanier viewports
			- string: 'definitionRules' - if accessed via the CME Builder form's 'Definition' question mark icon
			- empty sring: '' - if accessed via the verbiage at the top of the  CME Builder modal
	*/
	const state = store.getState();
	let majorReleaseVersion = state.cme.majorReleaseVersion;
	let ndrLink;
	let ruleSection;

	if (ndr === 'nameRules') {
		ruleSection = '_10.8'; // NDR 'Naming Rules' section
	} else if (ndr === 'characterCaseRules') {
		ruleSection = '_10.8.1'; // NDR 'Naming Rules - Character Case' section
	} else if (ndr === 'definitionRules') {
		ruleSection = '_11.6.1.1'; // NDR 'Data definition opening phrases' section
	} else ruleSection = ''; // top of the page

	// update ndrLink's url to include majorReleaseVersion, no matter the release increment, and correct section of rule
	ndrLink =
		niemReferenceBaseURL +
		'specification/naming-and-design-rules/' +
		majorReleaseVersion +
		'/niem-ndr-' +
		majorReleaseVersion +
		'.html#section' +
		ruleSection;

	// allows link in anchor tag to open in a new tab via the variable that calls the link
	window.open(ndrLink, '_blank', 'noreferrer');
	return ndr;
};

// checks that name does not include prohibited characters - returns 'isProhibitedCharacterPresent' true or false
export const checkForProhibitedCharacters = (values) => {
	let elementName;
	let characterRegex;
	let isProhibitedCharacterPresent;
	let majorReleaseVersion = getMajorReleaseVersion();

	// determine whether name to be checked is for a data element or container
	if (values.elementType === fieldNames.dataElement) {
		elementName = values.dataElementName;
	} else elementName = values.containerName;

	// determine which characters are allowed in name based on MEP release
	if (majorReleaseVersion === '3.0') {
		characterRegex = new RegExp(/^[a-z](?:-?[a-z0-9 ]+)*$/i); // per NDR v3.0, only accept the following characters: alphanumeric (upper and lowercase), spaces, hyphens, and must start with letters and end with letters or numbers
	} else characterRegex = new RegExp(/^[a-z](?:[._-]?[a-z0-9 ]+)*$/i); // per NDR 4.0 and above, accept the following characters: alphanumeric (upper and lowercase), spaces, and hypens, periods, underscores, and must start with letters and end with letters or numbers

	// if element names passes regex test (does not contain prohibited characters), element name is acceptable
	if (characterRegex.test(elementName)) {
		isProhibitedCharacterPresent = false;
	} else {
		isProhibitedCharacterPresent = true;
	}

	// store and return results to be accessed via CMEBuilderModal.js as needed
	return isProhibitedCharacterPresent;
};

// checks that dataElement names end in an accepted represetation terms (repTerm). does not apply to containers. - returns 'isRepTermPresent' true or false and proper repTerm(s)
//NOTE: repTerms are REQUIRED in v3.0 otherwise, only RECOMMENDED
export const checkForRepTerm = (values) => {
	const name = values.dataElementName;
	const nameType = values.dataElementType;
	let repTerm = ''; // string used to store single acceptable repTerm for dataElements that have only ONE acceptable repTerm
	let repTermOptions = []; // array used to store acceptable repTerm options for dataElements that have MULTIPLE acceptable repTerms
	let isRepTermPresent = false; // flag to used to determine whether name ends in an accpetable repTerm
	let repTermResults = {}; // will store all repTerm values

	// 1. define representation term(s) based on nameType - required in 3.0, otherwise recommended
	if (nameType === fieldNames.boolean) {
		// names of boolean elements should end in "Indicator"
		repTerm = ndr_representationTerms.boolean;
	} else if (nameType === fieldNames.code) {
		// names of code elements should end in "CodeType"
		repTerm = ndr_representationTerms.codeComplexType;
	} else if (nameType === fieldNames.date) {
		// names of date elements should end in ONE of the following
		repTermOptions = [
			ndr_representationTerms.date,
			ndr_representationTerms.dateTime,
			ndr_representationTerms.duration,
			ndr_representationTerms.time,
		];
	} else if (nameType === fieldNames.decimal) {
		// names of decimal elements should end in ONE of the following
		repTermOptions = [
			ndr_representationTerms.value,
			ndr_representationTerms.numeric,
			ndr_representationTerms.rate,
			ndr_representationTerms.percent,
		];
	} else if (nameType === fieldNames.integer) {
		// names of integer elements should end in ONE of the following
		repTermOptions = [ndr_representationTerms.integer, ndr_representationTerms.number, ndr_representationTerms.quantity];
	} else if (nameType === fieldNames.text) {
		// names of text elements should end in "Text"
		repTerm = ndr_representationTerms.text;
	}

	// 2. check name for representation term - if name does not end in (one of) it's acceptable repTerm(s), then acceptable repTerm is missing
	if (values.elementType === fieldNames.dataElement) {
		if (nameType === fieldNames.boolean || nameType === fieldNames.code || nameType === fieldNames.text) {
			// booleans, code, and text elements can only ever end in one particular repTerm, that has been set above (repTerm)
			const repTermRegEx = new RegExp(repTerm + '$', 'i'); // ensures name ends in its proper repTerm (case insensitive)
			if (repTermRegEx.test(name)) {
				isRepTermPresent = true;
			} else {
				isRepTermPresent = false;
			}
			// code elements should end in, 'CodeType' (1 word). need to accept this, as well as 'code type' (2 words) as this will be autocorrected in updateElementNameToCamelCase()
			if (nameType === fieldNames.code && name.toLowerCase().endsWith('code type')) {
				isRepTermPresent = true;
			}
		} else if (nameType === fieldNames.date || nameType === fieldNames.decimal || nameType === fieldNames.integer) {
			// dates, decimals, and integer elements can  end in one of multiple repTerms, that have been set above (repTermOptions)
			// create an empty array, test name against each repTermOption to see if name passes one of the regEx tests, and add each option's test result to the 'regexTestResults' array
			let regexTestResults = [];
			repTermOptions.forEach((option) => {
				let repTermRegex = new RegExp(option + '$', 'i'); //  ensures name ends in one of the repTermOptions (case insensitive and allows spaces)
				regexTestResults.push(repTermRegex.test(name));
			});

			// checks to see if name passes one of the above regEx test - if one of regexTestResults' values is true, name ends in one of the repTermOptions
			if (Object.values(regexTestResults).includes(true)) {
				isRepTermPresent = true;
			} else {
				isRepTermPresent = false;
			}
		} else if (nameType === fieldNames.myElements) {
			isRepTermPresent = true;
		}
	} else if (values.elementType === fieldNames.container) {
		// not a dataElement, so repTerm is NOT required
		isRepTermPresent = true;
	}

	// store and return all repTerm values as an obj, to be accessed via CMEBuilderModal.js as needed
	repTermResults = { isRepTermPresent, repTerm, repTermOptions };
	return repTermResults;
};

export const exampleDefintionPrefixes = {
	Boolean: 'True if ',
	Code: 'A data type ',
	Date: 'A date ',
	'date/time': 'A date and time ',
	Integer: 'A(n) ',
	Decimal: 'A(n) ',
	Text: 'A(n) ',
	myElements: 'A(n) ',
};

export const exampleDefinitionFormats = {
	Boolean: 'True if ...; false (otherwise/if) ...',
	Code: 'A(n) ...',
	Date: 'A(n) (optional adjectives) date ...',
	'date/time': 'A(n) (optional adjectives) date and time ...',
	Integer: 'A(n) ...',
	Decimal: 'A(n) ...',
	Text: 'A(n) ...',
	myElements: 'A(n) ...',
};

export const exampleDefinitionSuffixes = {
	Boolean: '; false otherwise',
	Code: '',
	Date: '',
	'date/time': '',
	Integer: '',
	Decimal: '',
	Text: '',
};

// Checks entered definition against regular expression and assembles example definition if invalid.
export const checkDefinitionValidity = (dataType, specificType, enteredDefinition) => {
	var definitionRegex;

	switch (dataType) {
		case 'Boolean':
			definitionRegex = new RegExp(/^((True if ){1}(.)+(; false ){1}((if )(.)+|(otherwise)(.)*))$/);
			break;
		case 'Code':
			definitionRegex = new RegExp(/^((A\s)|(An\s)){1}(.)+$/);
			break;
		case 'Date':
			if (specificType === 'date/time') {
				definitionRegex = new RegExp(/^((A )|(An )){1}(.)*(date and time ){1}(.)+$/);
			} else {
				definitionRegex = new RegExp(/^((A )|(An )){1}(.)*(date ){1}(.)+$/);
			}
			break;
		case 'Decimal':
		case 'Integer':
		case 'Text':
		case fieldNames.myElements:
			definitionRegex = new RegExp(/^((A\s)|(An\s)){1}(.)+$/);
			break;
		default:
			break;
	}

	const isValid = definitionRegex.test(enteredDefinition);
	if (specificType === 'date/time') {
		return { isValid, exampleDefinition: exampleDefintionPrefixes[specificType] + enteredDefinition + exampleDefinitionSuffixes[specificType] };
	} else {
		return { isValid, exampleDefinition: exampleDefintionPrefixes[dataType] + enteredDefinition + exampleDefinitionSuffixes[dataType] };
	}
};

// checks for and applies camel case to element names, including repTerms
export const updateElementNameToCamelCase = (elementType, dataElementName, containerName) => {
	/* NOTE - this method addresses the following pontential string forms:
		// 'possible name example repTerm'
		// 'Possible Name Example RepTerm'
		// 'possibleNameExampleRepTerm'
		// 'PossibleNameExampleRepTerm'
		// 'possiblenamexamplerepterm' - if all lowercase and no spaces (including all lowercase'd repTerm) ensures repTerm casing is properly updated (i.e., will update to 'possiblenameexampleRepTerm'),
		// 'possiblenamexample' - (containers only) if all lowercase and no spaces, only very first letter of entire sting will be capitaized (i.e., will update to 'Possiblenameexample'),
	*/

	let elementName; // to be determined base on elementType
	let repTerm;
	let updatedElementName;
	let nameArray = []; // new array that is created after .splitting of name string - used to apply upper camel case
	let updatedNameArray = []; // used to store new array items after capitalization of first letter of each - used to apply upper camel case

	// determine whether the element that is being created is a dataElement or a container, and updating updatedElementName accordingly
	if (elementType === fieldNames.dataElement) {
		elementName = dataElementName;
	} else elementName = containerName;

	// check if name has spaces and combine name into single string with no spaces - Example: 'This Is A Test' or 'this is a test' will be 'ThisIsATest'
	if (elementName.includes(' ')) {
		// if name has spaces, separate the name by each space, placing it into a new array
		nameArray = elementName.split(' ');

		// dataElements need to temporarily remove repTerm to avoid accidentally changing required casing
		if (elementType === fieldNames.dataElement) {
			repTerm = nameArray.pop(); // .pop() removes last item in nameArray (last item will always be the dataElement's repTerm)
			repTerm = repTerm.charAt(0).toUpperCase() + repTerm.slice(1); // ensures that the first letter of the repTerm is always capitalized
		}

		// iterate over each word item in the nameArray to capitalize the first letter of each
		updatedNameArray = nameArray.map((word) => {
			// capitalze the first letter of each item and join the new capitalized letter back with its original remaining lowercase letters
			const capitalizedFirstLetter = word.charAt(0).toUpperCase();
			const remainingLetters = word.slice(1).toLowerCase();
			// then add each new string to updatedNameArray
			updatedNameArray.push(capitalizedFirstLetter + remainingLetters);
			return capitalizedFirstLetter + remainingLetters;
		});

		// combine into a new, single string by joining strings with no space in btwn
		updatedElementName = updatedNameArray.join('');

		// dataElements can now have their original repTerm added back in its original spot
		if (elementType === fieldNames.dataElement) {
			updatedElementName = updatedElementName + repTerm;
		}
	} else if (elementType === fieldNames.dataElement && !elementName.includes(' ')) {
		//  when elementName has NO spaces (i.e. 'mydate', 'mycodetype') grab the repTerm and ensure it recieves proper casing (update to 'myDate', 'myCodeType')
		let improperlyCasedRepTerm; // user inputted repTerm (lowercase'd)
		let properlyCasedRepTerm; // properly cased repTerm (camel case'd)
		const improperlyCasedDateTimeRepTerm = ndr_representationTerms.dateTime.toLowerCase(); // used only when user inputs 'valuedatetime' - because 'date', 'time', and 'datetime' are all acceptable "Date" repTerms, 'datetime' needs to update to 'DateTime'

		// grab the full list of ndr_representationTerms values and go through it to the compare user inputted, lowercase'd version of repTerm to its proper camel case'd version, and identify incorrect and correct version of repTerm
		let ndrRepTermArray = Object.values(ndr_representationTerms);
		ndrRepTermArray.forEach((term) => {
			if (elementName.endsWith(term.toLowerCase())) {
				improperlyCasedRepTerm = term.toLowerCase();
				properlyCasedRepTerm = term;
			}
		});

		// if user inputted repTerm is 'datetime', default the correct repTerm to 'DateTime"
		if (elementName.toLowerCase().endsWith(improperlyCasedDateTimeRepTerm)) {
			improperlyCasedRepTerm = improperlyCasedDateTimeRepTerm;
			properlyCasedRepTerm = ndr_representationTerms.dateTime;
		}

		// replace user inputted, lowercase version of repTerm with properly camel case'd version
		let repTermRegex = new RegExp('' + improperlyCasedRepTerm + '');
		updatedElementName = elementName.replace(repTermRegex, properlyCasedRepTerm);
	} else {
		// it's a continer so just capitalize very first letter of name, and leave the rest as is
		const capitalizedFirstLetter = elementName.charAt(0).toUpperCase();
		const remainingLetters = elementName.slice(1);
		updatedElementName = capitalizedFirstLetter + remainingLetters;
	}

	// finally, if dataElement, need to ensure the very first letter of the new string is lowercase, and leave the rest as is (dataElements require lower camel casing. containers require upper camel casing)
	if (elementType === fieldNames.dataElement) {
		const lowercaseFirstLetter = updatedElementName.charAt(0).toLowerCase();
		const remainingLetters = updatedElementName.slice(1);
		updatedElementName = lowercaseFirstLetter + remainingLetters;
	}

	return updatedElementName;
};
// ENDS NIEM NDR related methods //

// this function structures and builds the element obj (storing only the values we need), to be used in handleCreateElement() and handleUpdateElement()
const buildElementObj = (values) => {
	const state = store.getState();
	const listOfCodeObjs = state.cme.listOfCodeObjs; // temporary variable that stores all code items for a code dataElement
	const listOfContainerElementObjs = state.cme.listOfContainerElementObjs; // temporary variable that stores all container elements for a container
	const existingFormData = state.cme.existingFormData; // temporary variable that stores the data of the ELEMENT selected to edit

	// ensures element names end in proper representation terms in accordance to NDR rules
	const updatedElementName = updateElementNameToCamelCase(values.elementType, values.dataElementName, values.containerName);

	// element will be determined based on user inputted values and whether building a brand new element or updating an exisitng one
	let elementToBuild; // obj we are building
	let code; // depending on whether code value is needed, this will either be set to an empty array or populated array
	let containerElements; // depending on whether user is editing existing container elements or adding new ones, this value will either need to be pull from listOfContainerElementObjs reducer variable or formik's values
	let index; // depending on whether user is editing and existing element or creating a new one, this value either be assigned in handleCreateElement() or retrieved from existingFormData after entering edit mode

	// if dataElement, combine values to build dataElement obj
	if (values.elementType === fieldNames.dataElement) {
		const elementType = values.elementType; // either dataElement or container
		const elementLabel = 'ext'; // needed to properly display elements in viewport (ext:elementName)
		const specificType = values.specificType;
		const elementName = updatedElementName;
		const dataType = getDataType(values.dataElementType, values.specificType, updatedElementName); // used to determine wantlist/extension schema outputs
		const elementDefinition = values.dataElementDefinition;
		// indexes are assigned at element creation. so if values.index has a value, use that. otherwise, use the index in existingFormData, as that is the element's original index assigned when created
		if ((values.index = undefined)) {
			index = values.index;
		} else {
			index = existingFormData.index;
		}
		// if listOfCodeObjs contains data, it's a code dataElement, user is editing an existing code item. so grab the list of code items from the already populated and updated reducer variable
		if (listOfCodeObjs.length !== 0) {
			code = listOfCodeObjs;
		} else {
			// otherwise, use the submitted formik value (if user is not creating a code dataElement, this will just be an empty array - which is fine)
			code = values.codeObjs;
		}

		// assemble dataElement
		const dataElement = {
			elementType,
			elementLabel,
			specificType,
			elementName,
			dataType,
			elementDefinition,
			code,
			index,
		};

		elementToBuild = dataElement;
	} else if (values.elementType === fieldNames.container) {
		// if container, combine values to build container obj
		const elementType = values.elementType; // either dataElement or container
		const containerType = values.containerType;
		const elementName = updatedElementName;
		const dataType = getDataType(values.containerType, '', updatedElementName); // used to determine wantlist/extension schema outputs
		const definition = values.containerDefinition;
		const existingContainerLocation = values.existingContainerLocation; // only used if creating a container that is based on an exisiting container
		const existingContainer = values.existingContainer; // only used if creating a container that is based on an exisiting container
		const existingContainerObj = values.existingContainerObj; // only used if creating a container that is based on an exisiting container
		// indexes are assigned at element creation. so if values.index has a value, use that. otherwise, use the index in existingFormData, as that is the element's original index assigned when created
		if ((values.index = undefined)) {
			index = values.index;
		} else {
			index = existingFormData.index;
		}

		// if listOfContainerElementObjs contains data, user is editing an existing container element. so grab the list of container elements from the already populated and updated reducer variable
		if (listOfContainerElementObjs.length !== 0) {
			containerElements = listOfContainerElementObjs;
		} else {
			// otherwise, use the submitted formik value
			containerElements = values.containerElementsObjs;
		}

		// assemble dataElement
		const container = {
			elementType,
			containerType,
			elementName,
			dataType,
			definition,
			existingContainerLocation,
			existingContainer,
			existingContainerObj,
			containerElements,
			index,
		};

		elementToBuild = container;
	}

	return elementToBuild;
};

export const handleBuildExtensionSchema = async () => {
	// get cmeData from reducer
	const state = store.getState();
	const latestCMEData = state.cme.cmeData;
	const packageId = state.mpd.packageId;

	// Save CME Data to database. This includes saving the URI and Definition that were just added to the reducer
	const buildResult = await buildCMEDataApi(packageId, latestCMEData);
	await updateReduxArtifactTreeFromDB(packageId);
	if (buildResult.isSuccess) {
		return true;
	} else {
		return false;
	}
};

// runs each time the "Create Element" button is clicked and a new element is being created - via CMEBuilderModal.js
export const handleCreateElement = async (values) => {
	// get cmeData from reducer
	const state = store.getState();
	const cmeData = state.cme.cmeData;
	const isTranslationGenerated = state.translate.isTranslationGenerated;

	// If translation files are already generated, delete translated files on create element
	if (isTranslationGenerated) {
		deleteSubsetTranslate(false, true);
	}

	// element is whatever is returned from buildElementObj()
	let element = buildElementObj(values);

	// check if user is creating Root Element container, and if so, allow the default name in reducer to be updated with user inputted value
	if (values.containerType === fieldNames.rootElement) {
		// if creating a rootElement container, only update top-level element name in reducer as this is what will continue to hold all created elements
		store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_ROOT_ELEMENT_NAME, payload: 'extension-' + values.containerName });
	} else {
		// create new variable to copy what's already in cmeData.children
		let updatedCmeDataChildren = [...cmeData.children];

		// add element obj to to children array
		updatedCmeDataChildren.push(element);

		// loop through each element and add an index to it
		let arrayLength = updatedCmeDataChildren.length;
		for (let i = 0; i < arrayLength; i++) {
			element.index = i;
		}

		// update cme children in reducer
		store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_DATA_CHILDREN, payload: updatedCmeDataChildren });
	}

	// empty any global temporary array once data is stored inside of cmeData
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: [] });
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: [] });
	store.dispatch({ type: actionTypes.CME_SOURCE_CODE_FILE, payload: '' });
	store.dispatch({ type: actionTypes.SHOW_CODE_IMPORT_FILE, payload: false });
	store.dispatch({ type: actionTypes.CME_CODE_IMPORT_SUMMARY, payload: { messageState: null, total: 0, imported: 0, unsuccessful: 0 } });
	// get latest reducer data before sending to db
	const updateState = store.getState();
	const packageId = updateState.mpd.packageId;
	const latestCMEData = updateState.cme.cmeData;

	const result = await saveCMEDataApi(packageId, latestCMEData);

	if (result.isSuccess) {
		setSessionValue(sessionVar.unsaved_cme_data, latestCMEData, actionTypes.UPDATE_CME_BUILDER_DATA);
		store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ELEMENT_CREATION_STATUS, payload: 'elementCreation_success' });
	} else {
		store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ELEMENT_CREATION_STATUS, payload: 'elementCreation_failed' });
	}
};

// runs each time the "Save" button is clicked and an existing element is being updated - via CMEBuilderModal.js
export const handleUpdateElement = async (newValues) => {
	// get cmeData from reducer
	const state = store.getState();
	const cmeData = state.cme.cmeData; // temporary variable that stores all cme elements data
	const existingFormData = state.cme.existingFormData; // temporary variable that stores the data of the ELEMENT selected to edit
	const existingCodeData = state.cme.existingCodeData; // temporary variable that stores the data of the CODE ITEM selected to edit
	const existingContainerElementData = state.cme.existingContainerElementData; // temporary variable that stores the CONTAINER ELEMENTS data of the container element selected to edit
	const isTranslationGenerated = state.translate.isTranslationGenerated;

	// If translation files are already generated, delete translated files on update element
	if (isTranslationGenerated) {
		deleteSubsetTranslate(false, true);
	}

	// check wether code items need to be updated, and update it - if existingCodeData contains data, user is editing a code item, so need to update list of code items
	if (Object.values(existingCodeData).length !== 0) {
		updateEditedCodeItems();
	}

	// check wether container elements need to be updated, and update it - if existingContainerElementData contains data, user is editing container element, so need to update list of container elements
	if (Object.keys(existingContainerElementData).length !== 0) {
		updateEditedContainerElements();
	}

	// then, build the updated element to be replaced with the orginial
	const updatedElement = buildElementObj(newValues); // this is the updated version of the original element

	// edge case - in the event a user edits a code data element, and changes its dataElementType (no longer making it a code data element), don't save any existing code from the orginial element)
	if (updatedElement.specificType !== fieldNames.code) {
		delete updatedElement['code'];
	}

	// create new variable to copy what's already in cmeData.children
	const updatedCmeDataChildren = [...cmeData.children];

	// Loop through the updatedCmeDataChildren array. 'element' is the current obj being processed, and we're returning the object that has the same index as whatever is in existingFormData - this is the element we want to update
	const toBeUpdated = updatedCmeDataChildren.find((element) => element.index === existingFormData.index);
	const elementIndex = updatedCmeDataChildren.indexOf(toBeUpdated);

	// update the children array by replacing the old element with the newly updated element - (.splice (where we want to start, how many we want to replace, what to insert))
	updatedCmeDataChildren.splice(elementIndex, 1, updatedElement);

	// update cme children in reducer
	store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_DATA_CHILDREN, payload: updatedCmeDataChildren });

	// empty any global temporary array once data is stored inside of cmeData
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: [] });
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: [] });

	// get latest reducer data before sending to db
	const updateState = store.getState();
	const packageId = updateState.mpd.packageId;
	const latestCMEData = updateState.cme.cmeData;

	// save latest data to the db
	const result = await saveCMEDataApi(packageId, latestCMEData);

	if (result.isSuccess) {
		setSessionValue(sessionVar.unsaved_cme_data, latestCMEData, actionTypes.UPDATE_CME_BUILDER_DATA);
		store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_EDIT_MODE, payload: false });
		store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_FORM_DATA, payload: {} });
		store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CODE_DATA, payload: {} });
		store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CONTAINER_ELEMENT_DATA, payload: {} });
		store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_CHANGES_SAVED_STATUS, payload: 'changesSaved_success' });
	} else {
		store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_CHANGES_SAVED_STATUS, payload: 'changesSaved_failed' });
	}
};

// called from CMEBuilderModal's checkForEditedCodeItems() only if a user has edited an existing code item (via the Code viewport) and changes are detected - saves latest changes
export const updateEditedCodeItems = () => {
	// get cmeData from reducer
	const state = store.getState();
	const listOfCodeObjs = state.cme.listOfCodeObjs; // temporary variable that stores all code elements
	const existingCodeData = state.cme.existingCodeData; // temporary variable that store the 'code' data of the code item selected to edit

	// create new variable to copy what's already in listOfCodeObjs
	const updatedListOfCodeObjs = [...listOfCodeObjs];

	// Loop through the updatedListOfCodeObjs array. 'element' is the current obj being processed, and we're returning the object that has the same index as whatever is in existingCodeData - this is the item we want to update
	const toBeUpdated = updatedListOfCodeObjs.find((element) => element.index === existingCodeData.index);
	const elementIndex = updatedListOfCodeObjs.indexOf(toBeUpdated);

	// update the children array by replacing the old element with the newly updated element - (.splice(where we want to start, how many we want to replace, what to replace with))
	updatedListOfCodeObjs.splice(elementIndex, 1, existingCodeData);

	// update the and global temporary array - used to populate code viewport table
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: updatedListOfCodeObjs }); //used to populate code viewport table
};

// called from CMEBuilderModal's checkForEditedContainerElementValues() only if a user has edited an existing CONTAINER ELEMENT (via the Container Elements viewport) and changes are detected - saves latest changes
export const updateEditedContainerElements = () => {
	// get cmeData from reducer
	const state = store.getState();
	const listOfContainerElementObjs = state.cme.listOfContainerElementObjs; // temporary variable that stores all container elements
	const existingContainerElementData = state.cme.existingContainerElementData; // temporary variable that store the 'container element' data of the contaier element obj/item selected to edit

	// create new variable to copy what's already in listOfCodeObjs
	const updatedListOfContainerElementObjs = [...listOfContainerElementObjs];

	// Loop through the updatedListOfContainerElementObjs array. 'element' is the current obj being processed, and we're returning the object that has the same index as whatever is in existingContainerElementData - this is the obj we want to update
	const toBeUpdated = updatedListOfContainerElementObjs.find((obj) => obj.index === existingContainerElementData.index);
	const elementIndex = updatedListOfContainerElementObjs.indexOf(toBeUpdated);

	// update the children array by replacing the old element with the newly updated element - (.splice(where we want to start, how many we want to replace, what to replace with))
	updatedListOfContainerElementObjs.splice(elementIndex, 1, existingContainerElementData);

	// update the and global temporary array - used to populate code viewport table
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: updatedListOfContainerElementObjs }); //used to populate code viewport table
};

// handles the deletion of either a dataElement or container from its respective viewport
export const handleDeleteElementFromViewport = async (rowData) => {
	// get cmeData from reducer
	const state = store.getState();
	const cmeData = state.cme.cmeData; // temporary variable that stores all cme elements data
	const isTranslationGenerated = state.translate.isTranslationGenerated;

	// If translation files are already generated, delete translated files on delete
	if (isTranslationGenerated) {
		deleteSubsetTranslate(false, true);
	}

	// create new variable to copy what's already in cmeData.children
	const updatedCmeDataChildren = [...cmeData.children];

	// Loop through the updatedCmeDataChildren array. 'element' is the current obj being processed, and we're returning the object that has the same index and element name as the rowData selected to be deleted - this is the element we want to delete
	const toDelete = updatedCmeDataChildren.find((element) => element.index === rowData.index && element.elementName === rowData.elementName);
	const elementIndex = updatedCmeDataChildren.indexOf(toDelete);

	// update the children array by removing the deleted element - (.splice(where we want to start, how many we want to replace, what to replace with))
	updatedCmeDataChildren.splice(elementIndex, 1);

	// update cme children in reducer
	store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_DATA_CHILDREN, payload: updatedCmeDataChildren });

	// get latest reducer data before sending to db
	const updateState = store.getState();
	const packageId = updateState.mpd.packageId;
	const latestCMEData = updateState.cme.cmeData;
	const currentItemDeleteStatusObj = updateState.cme.itemDeleteStatusObj;

	// save latest data to the db
	const result = await saveCMEDataApi(packageId, latestCMEData);

	if (result.isSuccess) {
		setSessionValue(sessionVar.unsaved_cme_data, latestCMEData, actionTypes.UPDATE_CME_BUILDER_DATA);

		// display respective 'item delete status' message based on element type
		if (rowData.elementType === fieldNames.dataElement) {
			// add status object to data element array of itemDeleteStatusObj and update redux
			currentItemDeleteStatusObj[fieldNames.dataElement].push({
				status: 'dataElementDelete_success',
				key: rowData.index,
				type: 'Element',
				data: rowData,
			});
			const newItemDeleteStatusObj = currentItemDeleteStatusObj;
			store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ, payload: newItemDeleteStatusObj });

			// hide "item deleted" message above viewport
			hideDeletedItemMessage(fieldNames.dataElement, rowData);
		} else {
			// add status object to container array of itemDeleteStatusObj and update redux
			currentItemDeleteStatusObj[fieldNames.container].push({
				status: 'containerDelete_success',
				key: rowData.index,
				type: 'Element',
				data: rowData,
			});
			const newItemDeleteStatusObj = currentItemDeleteStatusObj;
			store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ, payload: newItemDeleteStatusObj });

			// hide "item deleted" message above viewport
			hideDeletedItemMessage(fieldNames.container, rowData);
		}
	} else {
		if (rowData.elementType === fieldNames.dataElement) {
			// add status object to data element array of itemDeleteStatusObj and update redux
			currentItemDeleteStatusObj[fieldNames.dataElement].push({
				status: 'dataElementDelete_failed',
				key: rowData.index,
				type: 'Element',
				data: rowData,
			});
			const newItemDeleteStatusObj = currentItemDeleteStatusObj;
			store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ, payload: newItemDeleteStatusObj });

			// hide "item deleted" message above viewport
			hideDeletedItemMessage(fieldNames.dataElement, rowData);
		} else {
			currentItemDeleteStatusObj[fieldNames.container].push({
				status: 'containerDelete_failed',
				key: rowData.index,
				type: 'Element',
				data: rowData,
			});
			const newItemDeleteStatusObj = currentItemDeleteStatusObj;
			store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ, payload: newItemDeleteStatusObj });

			// hide "item deleted" message above viewport
			hideDeletedItemMessage(fieldNames.container, rowData);
		}
	}
};

// handles only the deletion of a code item from the code viewport
export const handleDeleteCodeItemFromViewport = (item) => {
	// get data from reducer
	const state = store.getState();
	const listOfCodeObjs = state.cme.listOfCodeObjs; // temporary variable that stores the data of the ELEMENT selected to edit
	const isTranslationGenerated = state.translate.isTranslationGenerated;
	const currentItemDeleteStatusObj = state.cme.itemDeleteStatusObj;

	// If translation files are already generated, delete translated files on delete
	if (isTranslationGenerated) {
		deleteSubsetTranslate(false, true);
	}

	// create new variable to copy what's already in listOfCodeObjs
	const updatedListOFCodeObjs = [...listOfCodeObjs];

	// Loop through the updatedCmeDataChildren array. 'element' is the current obj being processed, and we're returning the object that has the same index as the item selected to be deleted - this is the element we want to delete
	const toDelete = updatedListOFCodeObjs.find((element) => element.index === item.index);
	const elementIndex = updatedListOFCodeObjs.indexOf(toDelete);

	// update the children array by removing the deleted element - (.splice(where we want to start, how many we want to delete)
	updatedListOFCodeObjs.splice(elementIndex, 1);

	// update listOfCodeObjs in reducer and display 'item deleted' message above viewport
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: updatedListOFCodeObjs });

	// add status object to the codeItem array of itemDeleteStatusObj and update redux
	currentItemDeleteStatusObj[fieldNames.code].push({
		status: 'codeItemDelete_success',
		key: item.index,
		type: 'Code',
		data: item,
	});
	const newItemDeleteStatusObj = currentItemDeleteStatusObj;
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ, payload: newItemDeleteStatusObj });

	// hide "item deleted" message above viewport
	hideDeletedItemMessage(fieldNames.code, item);

	// NOTE - deleteing code from the viewport does not require a saveCMEDataApi api call bc the delete action is only ever offered before a user clicks the "Create Element" or "Save" button - and the api call is made at THAT time
};

// handles only the deletion of an entire container element (parent AND all children) from the container element viewport
export const handleDeleteContainerElementParentFromViewport = (obj) => {
	// get data from reducer
	const state = store.getState();
	const listOfContainerElementObjs = state.cme.listOfContainerElementObjs; // temporary variable that stores the data of the ELEMENT selected to edit
	const isTranslationGenerated = state.translate.isTranslationGenerated;
	const currentItemDeleteStatusObj = state.cme.itemDeleteStatusObj;

	// If translation files are already generated, delete translated files on delete
	if (isTranslationGenerated) {
		deleteSubsetTranslate(false, true);
	}

	// create new variable to copy what's already in listOfCodeObjs
	const updatedListOfContainerElementObjs = [...listOfContainerElementObjs];

	// Loop through the updatedCmeDataChildren array. 'element' is the current obj being processed, and we're returning the object that has the same index as the object selected to be deleted - this is the element we want to delete
	const toDelete = updatedListOfContainerElementObjs.find((element) => element.index === obj.index);
	const elementIndex = updatedListOfContainerElementObjs.indexOf(toDelete);

	// update the children array by removing the deleted element - (.splice(where we want to start, how many we want to delete)
	updatedListOfContainerElementObjs.splice(elementIndex, 1);

	// update listOfCodeObjs in reducer and display 'item deleted' message above viewport
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: updatedListOfContainerElementObjs });

	// add status object to container element array of itemDeleteStatusObj and update redux
	currentItemDeleteStatusObj[fieldNames.containerElements].push({
		status: 'containerElementParentDelete_success',
		key: obj.index,
		type: 'parentElement',
		data: obj,
	});
	const newItemDeleteStatusObj = currentItemDeleteStatusObj;
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ, payload: newItemDeleteStatusObj });

	// hide "item deleted" message above viewport
	hideDeletedItemMessage(fieldNames.containerElements, obj);

	// NOTE - deleteing container elements from the viewport does not require a saveCMEDataApi api call bc the delete action is only ever offered before a user clicks the "Create Element" or "Save" button - and the api call is made at THAT time
};

// handles only the deletion of a container element's child from the container element viewport
export const handleDeleteContainerElementChildFromViewport = (obj, child) => {
	// get data from reducer
	const state = store.getState();
	const listOfContainerElementObjs = state.cme.listOfContainerElementObjs; // temporary variable that stores the data of the ELEMENT selected to edit
	const isTranslationGenerated = state.translate.isTranslationGenerated;
	const currentItemDeleteStatusObj = state.cme.itemDeleteStatusObj;

	// If translation files are already generated, delete translated files on delete
	if (isTranslationGenerated) {
		deleteSubsetTranslate(false, true);
	}

	// create new variable to copy what's already in listOfContainerElementObjs
	const updatedListOfContainerElementObjs = [...listOfContainerElementObjs];

	// update obj's containerElements by removing the deleted child - (.splice(where we want to start, how many we want to delete)
	obj.containerElements.splice(obj.containerElements.indexOf(child), 1);

	// at this point, container elements will have already deleted from the viewport as they are deleted directly from viewport's listOfContainerElementObjs. so update listOfCodeObjs in reducer with latest values
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: updatedListOfContainerElementObjs });

	// add status object to container element array of itemDeleteStatusObj and update redux
	currentItemDeleteStatusObj[fieldNames.containerElements].push({
		status: 'containerElementChildDelete_success',
		key: child.index,
		type: 'childElement',
		data: { objectParentData: obj, child: child },
	});
	const newItemDeleteStatusObj = currentItemDeleteStatusObj;
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ, payload: newItemDeleteStatusObj });

	// hide "item deleted" message above viewport
	hideDeletedItemMessage(fieldNames.containerElements, { objectParentData: obj, child });

	// NOTE - deleteing container element children from the viewport does not require a saveCMEDataApi api call bc the delete action is only ever offered before a user clicks the "Create Element" or "Save" button - and the api call is made at THAT time
};

// hides 'item deleted' message that is set to display upon deleting an item from one of the viewports
export const hideDeletedItemMessage = (dataType, obj) => {
	const state = store.getState();
	const currentItemDeleteStatusObj = state.cme.itemDeleteStatusObj; // data structure used to contain the status of all recently deleted items and display message
	var arrayContainsObject = false; // temporary variable to store whether the status still exists within the array when hiding

	// find status object inside appropriate status array if it exists, and report it's index
	currentItemDeleteStatusObj[dataType].forEach((statusObj) => {
		// JSON.stringify() used to avoid reference inequality issues
		if (JSON.stringify(statusObj.data) === JSON.stringify(obj)) {
			arrayContainsObject = true;
			return;
		}
	});

	// only display if status hasn't already been removed via handleUndoDelete()
	if (arrayContainsObject) {
		const timer = setTimeout(() => {
			// find index here in case another status was removed in the time before clearing current message
			currentItemDeleteStatusObj[dataType].splice(currentItemDeleteStatusObj[dataType].indexOf(obj), 1);
			const newItemDeleteStatusObj = currentItemDeleteStatusObj;
			store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ, payload: newItemDeleteStatusObj });
		}, 7 * 1000);

		return () => clearTimeout(timer);
	}
};

// called in CMEViewportTables.js onClick of the 'Undo' text link within the 'item deleted' message to undo the delete of the most recent delete
export const handleUndoDelete = async (dataType, obj) => {
	// get cmeData from reducer
	const state = store.getState();
	const cmeData = state.cme.cmeData; // temporary variable that stores all cme elements data
	const listOfCodeObjs = state.cme.listOfCodeObjs; // temporary variable that stores the data of the ELEMENT selected to edit
	const listOfContainerElementObjs = state.cme.listOfContainerElementObjs; // temporary variable that stores the data of the ELEMENT selected to edit
	const isEditMode = state.cme.isEditMode;
	const currentItemDeleteStatusObj = state.cme.itemDeleteStatusObj;

	currentItemDeleteStatusObj[dataType].forEach((statusObj, i) => {
		// JSON.stringify() used to avoid reference inequality issues
		if (JSON.stringify(statusObj.data) === JSON.stringify(obj)) {
			// splice status from collection
			currentItemDeleteStatusObj[dataType].splice(i, 1);
		}
	});
	const newItemDeleteStatusObj = currentItemDeleteStatusObj;

	// update itemDeleteStatusObj in redux to not display undo delete message for the object
	store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_ITEM_DELETE_STATUS_OBJ, payload: newItemDeleteStatusObj });

	// create new variables to copy what's already in cmeData.children, listOfCodeObjs, and listOfContainerElementObjs
	const updatedCmeDataChildren = [...cmeData.children];
	const updatedListOfCodeObjs = [...listOfCodeObjs];
	const updatedListOfContainerElementObjs = [...listOfContainerElementObjs];
	// stores all the data of the recently deleted obj
	const deletedObj = obj;

	// add deleted item back into its respective viewport in its orginial place in the viewport
	if (Object.values(deletedObj).includes(fieldNames.dataElement) || Object.values(deletedObj).includes(fieldNames.container)) {
		// replace deleted element (either dataElement or container) - (.splice (where we want to start, how many we want to remove (none), what to insert))
		updatedCmeDataChildren.splice(deletedObj.index, 0, deletedObj);
	} else if (Object.keys(deletedObj).includes(fieldNames.codeType)) {
		// replace deleted code item - (.splice (where we want to start, how many we want to remove (none), what to insert))
		updatedListOfCodeObjs.splice(deletedObj.index, 0, deletedObj);
		store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CODE_OBJS, payload: updatedListOfCodeObjs });
	} else if (Object.keys(deletedObj).includes(fieldNames.niemDomain)) {
		// replace added deleted container element parent - (.splice (where we want to start, how many we want to remove (none), what to insert))
		updatedListOfContainerElementObjs.splice(deletedObj.index, 0, deletedObj);
		// update listOfContainerElementObjs reducer to update viewport
		store.dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: updatedListOfContainerElementObjs });
	} else {
		const child = deletedObj.child;
		const parentData = deletedObj.objectParentData;
		const children = parentData.containerElements;
		// create a copy of what's already in children and add the recently deleted child back into it
		const updatedChildren = [...children];
		updatedChildren.push(child);
		// replace deleted container elements child - (.splice (where we want to start, how many we want to remove (none), what to insert))
		children.splice(updatedChildren.indexOf(child), 0, child);
	}

	// only allow when user is NOT in edit mode, to allow these changes to save when user clicks "Save Changes" button. If user is making changes outside of edit mode, go ahead and update the db
	if (!isEditMode) {
		// update cme children in reducer
		store.dispatch({ type: actionTypes.UPDATE_CME_BUILDER_DATA_CHILDREN, payload: updatedCmeDataChildren });

		// get latest reducer data before sending to db
		const updateState = store.getState();
		const packageId = updateState.mpd.packageId;
		const latestCMEData = updateState.cme.cmeData;

		// save latest data to the db
		const result = await saveCMEDataApi(packageId, latestCMEData);

		if (result.isSuccess) {
			setSessionValue(sessionVar.unsaved_cme_data, latestCMEData, actionTypes.UPDATE_CME_BUILDER_DATA);
		}
	}
};

// parse CSV/XLSX files from code import section
export const parseCodeFile = (bufferArray, headerRecordExists) => {
	const promise = new Promise((resolve, reject) => {
		const wb = xlsx.read(bufferArray, { type: 'buffer' });
		const row = 0;
		const header = ['codeKey', 'codeValue', 'codeType']; // map columns to custom headers for ease of access later
		let data = [];
		const sheetName = wb.SheetNames[0]; // grab first sheet in excel
		const ws = wb.Sheets[sheetName]; // If sheet does not exist, it returns an empty array

		if (headerRecordExists) {
			data = xlsx.utils.sheet_to_json(ws, { range: row + 1, header: header });
			resolve(data);
		} else {
			data = xlsx.utils.sheet_to_json(ws, { range: row, header: header });
			resolve(data);
		}
	});

	return promise.then((res) => {
		return res;
	});
};

const codeTypesArray = [
	fieldNames.enumeration,
	fieldNames.fractionDigits,
	fieldNames.length,
	fieldNames.maxLength,
	fieldNames.minLength,
	fieldNames.minExclusive,
	fieldNames.minInclusive,
	fieldNames.maxExclusive,
	fieldNames.maxInclusive,
	fieldNames.pattern,
	fieldNames.totalDigits,
	fieldNames.whiteSpace,
];

// this function handles parsing the Code file and returning a valid code list
export const importCodeFile = async (fileId, headerRecordExists) => {
	const fileBuff = await retrieveFileRequest(fileId);
	const fileData = await parseCodeFile(fileBuff, headerRecordExists);

	const totalCodeObjs = fileData.length;
	const validCodeObjs = [];
	const invalidCodeObjs = [];
	let totalInvalid = 0;

	fileData.forEach((codeObj) => {
		// if an item is missing from the CSV/XLSX then it's property won't be included in the object due to the way SheetJS processes files
		const keyExists = Object.hasOwn(codeObj, 'codeKey');
		const valueExists = Object.hasOwn(codeObj, 'codeValue');
		const codeTypeExists = Object.hasOwn(codeObj, 'codeType');

		if (keyExists && valueExists && codeTypeExists) {
			// check if using a valid code type
			const isValidCodeType = codeTypesArray.includes(codeObj.codeType);

			if (isValidCodeType) {
				validCodeObjs.push(codeObj);
			} else {
				invalidCodeObjs.push(codeObj);
			}
		} else {
			invalidCodeObjs.push(codeObj);
		}
	});

	if (validCodeObjs.length < totalCodeObjs) {
		totalInvalid = totalCodeObjs - validCodeObjs.length;
	}
	store.dispatch({
		type: actionTypes.CME_CODE_IMPORT_REPORT_DATA,
		payload: { total: fileData, valid: validCodeObjs, invalid: invalidCodeObjs },
	});

	return { totalCodeObjs: totalCodeObjs, validCodeObjs: validCodeObjs, totalInvalid: totalInvalid };
};

const updateCodeHeaders = (data) => {
	// if a header is missing from the data, add it back to properly create the report file
	for (const item of data) {
		const codeKeyHeader = item.hasOwnProperty('codeKey');
		const codeValueHeader = item.hasOwnProperty('codeValue');
		const codeTypeHeader = item.hasOwnProperty('codeType');

		if (!codeKeyHeader) {
			item.codeKey = '';
		}

		if (!codeValueHeader) {
			item.codeValue = '';
		}

		if (!codeTypeHeader) {
			item.codeType = '';
		}
	}

	return data;
};

export const createCodeImportReportFile = () => {
	const state = store.getState();

	// fix missing headers
	const total = updateCodeHeaders(state.cme.codeImportReportData.total);
	const valid = updateCodeHeaders(state.cme.codeImportReportData.valid);
	const invalid = updateCodeHeaders(state.cme.codeImportReportData.invalid);

	// create the workbook, create the worksheets, and set column headers
	const workbook = xlsx.utils.book_new();
	const totalWorksheet = xlsx.utils.json_to_sheet(total, { header: ['codeKey', 'codeValue', 'codeType'] });
	const importedWorksheet = xlsx.utils.json_to_sheet(valid, { header: ['codeKey', 'codeValue', 'codeType'] });
	const unsuccessfulWorksheet = xlsx.utils.json_to_sheet(invalid, { header: ['codeKey', 'codeValue', 'codeType'] });

	// name the worksheet and add to the workbook
	xlsx.utils.book_append_sheet(workbook, totalWorksheet, 'Total');
	xlsx.utils.book_append_sheet(workbook, importedWorksheet, 'Imported');
	xlsx.utils.book_append_sheet(workbook, unsuccessfulWorksheet, 'Unsuccessful');

	// package the workbook and trigger download
	xlsx.writeFile(workbook, 'Code Import Report.xlsx');
};

const getNamespaceData = async (release) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'Releases/getNamespaceData', {
				release: release,
			})
			.then((response) => {
				return response.data.status;
			})
			.catch((error) => handleError(error));
	}
};

export const getNiemDomains = async (release) => {
	// grab niem domains to be placed in the dropdown
	const namespaceData = await getNamespaceData(release);

	let niemDomains = [];

	for (let i = 0; i < namespaceData.length; i++) {
		const isStringValid = isStringFieldValid(namespaceData[i].NamespaceFile);
		// NamespaceFile sometimes has empty values, if it is empty we will use the NamespacePrefix in it's place
		// Some Namespaces have duplicate NamespaceFile names, here we adding NamespacePrefix in parentheses so the user can differentiate them
		niemDomains.push({
			text: isStringValid
				? `${namespaceData[i].NamespaceFile} (${namespaceData[i].NamespacePrefix})`
				: `${namespaceData[i].NamespacePrefix} (${namespaceData[i].NamespacePrefix})`,
			value: namespaceData[i].NamespacePrefix,
		});
	}

	const alphabeticalSort = sortDropdownAlphabetically(niemDomains);

	// Container Elements dropdown
	let key1 = 0; // we'll manually set the keys to avoid duplicate key values
	let domainsWithMyElements = [
		{
			key: key1, // MyElements will always be first in the dropdown
			text: 'MyElements',
			value: 'MyElements',
		},
	];
	alphabeticalSort.forEach((domain) => {
		key1 += 1;
		domain['key'] = key1;
		domainsWithMyElements.push({ key: key1, ...domain }); // using spread operator to prevent modification of the original domain object, otherwise duplication errors occur
	});

	// Based on Existing Container Dropdown
	// MyElements will not be included in the Based on Existing Container's dropdown
	let domainsWithoutMyElements = [];
	let key2 = 0;
	alphabeticalSort.forEach((domain) => {
		domain['key'] = key2;
		domainsWithoutMyElements.push({ key: key2, ...domain }); // using spread operator to prevent modification of the original domain object, otherwise duplication errors occur
		key2 += 1;
	});

	return { domainsWithMyElements: domainsWithMyElements, domainsWithoutMyElements: domainsWithoutMyElements };
};

export const getDomainElementsApi = async (release, domainPrefix) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'Releases/getDomainElements', {
				release: release,
				domainPrefix: domainPrefix,
			})
			.then((response) => {
				return response.data.status;
			})
			.catch((error) => handleError(error));
	}
};

export const createDomainElementsOptions = async (release, cmeData, domainName) => {
	// create dropdown options structure
	let options = [];

	if (domainName === 'MyElements') {
		// if MyElements is selected grab the dataElements
		const dataElements = cmeData.children.filter((obj) => obj.elementType === 'dataElement');
		for (let i = 0; i < dataElements.length; i++) {
			options.push({ key: i, text: dataElements[i].elementName, value: dataElements[i].elementName, data: dataElements[i] });
		}
	} else {
		// grab the elements of the selected niem domain
		const elements = [];
		const result = await getDomainElementsApi(release, domainName);

		// tag each item and collect into one array
		for (let i = 0; i < result.property.length; i++) {
			result.property[i]['sheet'] = 'property';
			elements.push(result.property[i]);
		}
		for (let i = 0; i < result.type.length; i++) {
			result.type[i]['sheet'] = 'type';
			elements.push(result.type[i]);
		}

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			if (element.sheet === 'property') {
				options.push({ key: i, text: element.PropertyName, value: element.PropertyName, data: element });
			} else {
				options.push({ key: i, text: element.TypeName, value: element.TypeName, data: element });
			}
		}
	}
	const sortedOptions = sortDropdownAlphabetically(options);

	return sortedOptions;
};

export const getElementData = (value, options) => {
	// the element data is already loaded into the options array, here we are just retrieving it.
	const index = options.findIndex((i) => i.value === value);
	return options[index];
};
