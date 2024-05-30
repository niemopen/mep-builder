import * as key from '../Shared/KVstore';
import { List } from 'semantic-ui-react';

export const functionalityUnavailable = 'This functionality is currently unavailable.';
export const roleIcon = 'To request a role change, please contact your System Administrator.';

/** Top Nav **/
export const topNavHamburger = 'Click here to expand/collapse the sidebar.';
export const hintsHeader = 'Need some help?';
export const hintsOff = 'Click here to turn hints off.';
export const hintsOn = 'Click here to turn hints on.';
export const currentRelease = `${key.packageName} Builder (${key.packageNameAcronymn}) Release 3.3.4`;
export const multipleEntrySeparation = 'Separate multiple entries by commas. (Entry 1, Entry 2, Entry 3)';
export const ownerFieldDescription =
	'Owner field searches by Owner name. All packages with an owner name that matches the field will return. Owner field is only functional when searching for Published packages (Include Published MEPS is checked). Ex: John Doe';
export const acceptableVersionValues = [
	'The following examples are valid MPD version numbers:',
	<ul>
		<li>1</li>
		<li>1.2</li>
		<li>1.3.1.0</li>
	</ul>,
];
/** End Top Nav **/

/** Left Sidebar **/
export const packageCreationGuide = [
	'Within this sidebar navigation, you are able to assemble, validate and publish your ',
	key.packageName,
	' (',
	key.packageNameAcronymn,
	').  You can follow the six lifecycle phases in order, or begin at any point during the build and compile the artifacts needed for your ',
	key.packageName,
	' (',
	key.packageNameAcronymn,
	'). For more information click here.',
	// TO DO: For future use, update "click here" on line the line above with a real link by uncommenting lines the lines below //
	// <a href='/GettingStarted'>click here</a>,
	// '.'
];
export const lifecyclePhases = [
	'There are six lifecycle phases where you will create and compile the artifacts needed for your ',
	key.packageName,
	' (',
	key.packageNameAcronymn,
	').',
];
export const scenarioPlanning = 'Example Scenario Planning artifacts include: Business Process Diagrams, Use Case Diagrams, Sequence Diagrams.';
export const analyzeRequirements = 'Example Analyze Requirements artifacts include: Business Rules, Business Requirements.';
export const mapModel = 'Example Map & Model artifacts include: Exchange Content Model, Mapping Document.';
export const buildValidate = 'Example Build & Validate artifacts include: Subset Schema, Exchange Schema, Reference Schema, Wantlist.';
export const assembleDocument = 'Example Assemble & Document artifacts include: Master Document, Catalog, Change Log, Sample Instance.';
export const publishImplement = ['Publish the ', key.packageName, ' (', key.packageNameAcronymn, ') to a repository and implement the exchange.'];
export const packageArtifacts = [
	'This is where you assemble the artifacts for your ',
	key.packageName,
	' (',
	key.packageNameAcronymn,
	'). For more information click here.',
	// TO DO: For future use, update "click here" on line the line above with a real link by uncommenting lines the lines below //
	// <a href='/GettingStarted'>click here</a>,
	// '.',
];
export const packageBuildComponents = 'This section provides a variety of filtering options.';
/** Left Sidebar **/

/** Map & Model Grid - Source, Mapping, and Target Headers **/
export const sourceHeader = 'This tooltip will describe what inforamtion should go under the Source Columns.';
export const mappingHeader = 'This tooltip will describe what inforamtion should go under the Mapping Columns.';
export const targetHeader = 'This tooltip will describe what inforamtion should go under the Target Columns.';
/** Map & Model Grid - Source, Mapping, and Target Headers **/

/** Map & Model Grid - Action Columns **/
export const actionMap = 'This tooltip will describe the Action Column.';
/** Map & Model Grid - Action Columns **/

/** Map & Model Grid - Map NIEM Components Modal **/
export const searchSSGTButton = 'Search for results for type or property';
export const searchCommonComponentsButton = 'Search Common NIEM Components for popular types or properties';
/** Map & Model Grid - Map NIEM Components Modal **/

/** Map & Model Grid - Property Tab **/
export const property_Source_NsPrefix = 'This tooltip will describe the Source "NS Prefix" Column.';
export const property_Source_PropertyName = 'This tooltip will describe the Source "Property Name" Column.';
export const property_Source_DataType = 'This tooltip will describe the "Data Type" Column.';
export const property_Source_Definition = 'This tooltip will describe the Source "Definition" Column.';
export const property_Source_Sample_Value = 'This tooltip will describe the Source "Sample Value" Column.';
export const property_Mapping_Code = 'This tooltip will describe the "Code" Column.';
export const property_Target_NsPrefix = 'This tooltip will describe the Target "NS Prefix" Column.';
export const property_Target_PropertyName = 'This tooltip will describe the Target "Property Name" Column.';
export const property_Target_QualifiedDataType = 'This tooltip will describe the "Qualified Data Type" Column.';
export const property_Target_Definition = 'This tooltip will describe the Target "Definition" Column.';
export const property_Target_SubstitutionGroup = 'This tooltip will describe the "Substitution" Group Column.';
export const property_Target_IsAbstract = 'This tooltip will describe the "Is Abstract" Column.';
export const property_Target_Style = 'This tooltip will describe the "Style" Column.';
export const property_Target_Keywords = 'This tooltip will describe the "Keywords" Column.';
export const property_Target_ExampleContent = 'This tooltip will describe the "Example Content" Column.';
export const property_Target_UsageInfo = 'This tooltip will describe the "Usage Info" Column.';
/** Map & Model Grid - Property Tab **/

/** Map & Model Grid - Type Tab **/
export const type_Source_NsPrefix = 'This tooltip will describe the Source "NS Prefix" Column.';
export const type_Source_TypeName = 'This tooltip will describe the Source "Type Name" Column.';
export const type_Source_ParentBaseType = 'This tooltip will describe the Source "Parent/Base Type" Column.';
export const type_Source_Definition = 'This tooltip will describe the Source "Definition" Column.';
export const type_Mapping_Code = 'This tooltip will describe the "Code" Column.';
export const type_Target_NsPrefix = 'This tooltip will describe the Target "NS Prefix" Column.';
export const type_Target_TypeName = 'This tooltip will describe the Target "Type Name" Column.';
export const type_Target_ParentBaseType = 'This tooltip will describe the Target "Parent/Base Type" Column.';
export const type_Target_Definition = 'This tooltip will describe the Target "Definition" Column.';
export const type_Target_Style = 'This tooltip will describe the "Style" Column.';
export const type_Target_elementInType = 'This tooltip will describe the "Element In Type" Column.';
/** Map & Model Grid - Type Tab **/

/** Map & Model Grid - Type-Has-Property Tab **/
export const typeHasProperty_Source_NsPrefix = 'This tooltip will describe the "NS Prefix" Column.';
export const typeHasProperty_Source_TypeName = 'This tooltip will describe the Source "Type Name" Column.';
export const typeHasProperty_Source_PropertyNs = 'This tooltip will describe the Source "Property NS" Column.';
export const typeHasProperty_Source_PropertyName = 'This tooltip will describe the Source "Property Name" Column.';
export const typeHasProperty_Source_Min = 'This tooltip will describe the Source "Minimum" Column.';
export const typeHasProperty_Source_Max = 'This tooltip will describe the Source "Maximum" Column.';
export const typeHasProperty_Mapping_Code = 'This tooltip will describe the "Code" Column.';
export const typeHasProperty_Target_TypeNs = 'This tooltip will describe the "Type NS" Column.';
export const typeHasProperty_Target_TypeName = 'This tooltip will describe the Target "Type Name" Column.';
export const typeHasProperty_Target_PropertyNs = 'This tooltip will describe the Target "Property NS" Column.';
export const typeHasProperty_Target_PropertyName = 'This tooltip will describe the Target "Property Name" Column.';
export const typeHasProperty_Target_Min = 'This tooltip will describe the Target "Minimum" Column.';
export const typeHasProperty_Target_Max = 'This tooltip will describe the Target "Maximum" Column.';
export const typeHasProperty_Target_Definition = 'This tooltip will describe the "Definition" Column.';
/** Map & Model Grid - Type-Has-Property Tab **/

/** Map & Model Grid - Code/Facets Tab **/
export const codeFacets_Source_NsPrefix = 'This tooltip will describe the Source "NS Prefix" Column.';
export const codeFacets_Source_TypeName = 'This tooltip will describe the Source "Type Name" Column.';
export const codeFacets_Source_Value = 'This tooltip will describe the Source "Value" Column.';
export const codeFacets_Source_Definition = 'This tooltip will describe the Source "Definition" Column.';
export const codeFacets_Source_KindOfFacet = 'This tooltip will describe the Source "Kind of Facet" Column.';
export const codeFacets_Mapping_Code = 'This tooltip will describe the "Code" Column.';
export const codeFacets_Target_NsPrefix = 'This tooltip will describe the Target "NS Prefix" Column.';
export const codeFacets_Target_TypeName = 'This tooltip will describe the Target "Type Name" Column.';
export const codeFacets_Target_Value = 'This tooltip will describe the Target "Value" Column.';
export const codeFacets_Target_Definition = 'This tooltip will describe the Target "Definition" Column.';
export const codeFacets_Target_KindOfFacet = 'This tooltip will describe the Target "Kind of Facet" Column.';
/** Map & Model Grid - Code/Facets Tab **/

/** Map & Model Grid - Namespace Tab **/
export const namespace_Source_NsPrefix = 'This tooltip will describe the Source "NS Prefix" Column.';
export const namespace_Source_Uri = 'This tooltip will describe the Source "URI" Column.';
export const namespace_Source_Definition = 'This tooltip will describe the Source "Definition" Column.';
export const namespace_Mapping_Code = 'This tooltip will describe the "Code" Column.';
export const namespace_Target_NsPrefix = 'This tooltip will describe the Target "NS Prefix" Column.';
export const namespace_Target_Style = 'This tooltip will describe the "Style" Column.';
export const namespace_Target_Uri = 'This tooltip will describe the Target "URI" Column.';
export const namespace_Target_Definition = 'This tooltip will describe the Target "Definition" Column.';
export const namespace_Target_NdrVersion = 'This tooltip will describe the "NDR Version" Column.';
export const namespace_Target_NdrTarget = 'This tooltip will describe the "NDR Target" Column.';
export const namespace_Target_FileName = 'This tooltip will describe the "File Name" Column.';
export const namespace_Target_RelativePath = 'This tooltip will describe the "Relative Path" Column.';
export const namespace_Target_DraftVersion = 'This tooltip will describe the "Draft Version" Column.';
/** Map & Model Grid - Namespace Tab **/

/** Map & Model Grid - Local Terminology Tab **/
export const localTerm_Source_NsPrefix = 'This tooltip will describe the Source "NS Prefix" Column.';
export const localTerm_Source_Term = 'This tooltip will describe the Source "Term" Column.';
export const localTerm_Source_Literal = 'This tooltip will describe the Source "Literal" Column.';
export const localTerm_Source_Definition = 'This tooltip will describe the Source "Definition" Column.';
export const localTerm_Mapping_Code = 'This tooltip will describe the "Code" Column.';
export const localTerm_Target_NsPrefix = 'This tooltip will describe the Target "NS Prefix" Column.';
export const localTerm_Target_Term = 'This tooltip will describe the Target "Term" Column.';
export const localTerm_Target_Literal = 'This tooltip will describe the Target "Literal" Column.';
export const localTerm_Target_Definition = 'This tooltip will describe the Target "Definition" Column.';
/** Map & Model Grid - Local Terminology Tab **/

/** Map & Model Grid - Type Union Tab **/
export const typeUnion_Source_UnionNs = 'This tooltip will describe the Source "Union NS" Column.';
export const typeUnion_Source_UnionTypeName = 'This tooltip will describe the Source "Union Type Name" Column.';
export const typeUnion_Source_MemberNs = 'This tooltip will describe the Source "Member NS" Column.';
export const typeUnion_Source_MemberTypeName = 'This tooltip will describe the Source "Member Type Name" Column.';
export const typeUnion_Mapping_Code = 'This tooltip will describe the "Code" Column.';
export const typeUnion_Target_UnionNs = 'This tooltip will describe the Target "Union NS" Column.';
export const typeUnion_Target_UnionTypeName = 'This tooltip will describe the Target "Union Type Name" Column.';
export const typeUnion_Target_MemberNs = 'This tooltip will describe the Target "Member NS" Column.';
export const typeUnion_Target_MemberTypeName = 'This tooltip will describe the Target "Member Type Name" Column.';
/** Map & Model Grid - Type Union Tab **/

/** Map & Model Grid - Metadata Tab **/
export const metadata_Source_MetadataNs = 'This tooltip will describe the Source "Metadata NS" Column.';
export const metadata_Source_MetadataTypeName = 'This tooltip will describe the Source "Metadata Type Name" Column.';
export const metadata_Source_AppliesToNs = 'This tooltip will describe the Source "Applies to NS" Column.';
export const metadata_Source_AppliesToTypeName = 'This tooltip will describe the Source "Applies to Type Name" Column.';
export const metadata_Mapping_Code = 'This tooltip will describe the "Code" Column.';
export const metadata_Target_MetadataNs = 'This tooltip will describe the Target "Metadata NS" Column.';
export const metadata_Target_MetadataTypeName = 'This tooltip will describe the Target "Metadata Type Name" Column.';
export const metadata_Target_AppliesToNs = 'This tooltip will describe the Target "Applies to NS" Column.';
export const metadata_Target_AppliesToTypeName = 'This tooltip will describe the Target "Applies to Type Name" Column.';
/** Map & Model Grid - Metadata Tab **/

/* Admin Module */
export const lockedAccountIcon = 'Locked';
export const unlockedLockedIcon = 'Unlocked';
export const accountDeniedIcon = 'Denied';
export const revokedAccountIcon = 'Revoked';

/* Release Migration */
export const migrateRelease = 'You may only migrate to a newer NIEM release.';

/* Translation */
export const unknownFormat = 'Option currently unavailable.';

/* Build & Validate - Validator Info Message */
export const validatorMessageContent =
	'Making changes to your packages will erase validation results, requiring you to validate artifacts again before publishing.';
export const validatiorMessageHeader = 'Please Note';

/* Build & Validate - CME Disabled Message */
export const cmeDisabledMessage = 'To Build a Custom Model Extension, first generate a Subset Schema.';

/* Removing artifacts on copy/migrate Info Message */
export const removingArtifactsMessageHeader = 'Please Note';
export const removingArtifactsMessageContent = [
	<p>
		To ensure your new package is built with the most accurate artifacts, the following artifacts will <strong>NOT</strong> be copied over (if
		applicable):
	</p>,
	<List bulleted className='notCopiedArtifactsList'>
		<List.Item>Subset Schema</List.Item>
		<List.Item>MPD Catalog</List.Item>
		<List.Item>Conformance Assertion</List.Item>
		<List.Item>Wantlist</List.Item>
		<List.Item>Translations</List.Item>
	</List>,
	<p>Please remember to generate these artifacts before publishing.</p>,
];
