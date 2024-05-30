import { React } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import MaterialTable, { MTableToolbar, MTableHeader } from 'material-table';
import { TableIcons } from '../Shared/MaterialTableGridSettings';
import { Button, Message, Popup, Tab } from 'semantic-ui-react';
import SSGTMappingModal from '../Shared/SSGTMappingModal';
import * as tooltipContent from '../Shared/TooltipContent.js';
import { addRowToSheet, mapDocSheetNames } from '../Util/MappingDocumentUtil';
import * as dateFormat from 'dateformat';
import { setSessionValue } from '../Util/localStorageUtil';
import * as sessionVar from '../Util/SessionVar';
import { deleteSubsetTranslate } from './MEPChangeWarningModal';
import { clearValidationResults } from '../Util/ValidationUtil';

const MappingGrid = () => {
	const packageName = useSelector((state) => state.mpd.packageName);
	const isMapModelActive = useSelector((state) => state.sidebar.mapModelActive);
	const propertySheet = useSelector((state) => state.mappingDoc.propertySheet);
	const typeSheet = useSelector((state) => state.mappingDoc.typeSheet);
	const typeHasPropertySheet = useSelector((state) => state.mappingDoc.typeHasPropertySheet);
	const codesFacetsSheet = useSelector((state) => state.mappingDoc.codesFacetsSheet);
	const namespaceSheet = useSelector((state) => state.mappingDoc.namespaceSheet);
	const localTerminologySheet = useSelector((state) => state.mappingDoc.localTerminologySheet);
	const typeUnionSheet = useSelector((state) => state.mappingDoc.typeUnionSheet);
	const metadataSheet = useSelector((state) => state.mappingDoc.metadataSheet);
	const tooltipsDisabled = useSelector((state) => state.top.tooltipsDisabled);
	const isRequiredArtifactUploaded = useSelector((state) => state.mpd.isRequiredArtifactUploaded);
	const autoAddedTypeQname = useSelector((state) => state.mappingDoc.autoAddedTypeQname);
	const autoAddedPropertyCount = useSelector((state) => state.mappingDoc.autoAddedPropertyCount);
	const autoAddedTypeCount = useSelector((state) => state.mappingDoc.autoAddedTypeCount);
	const currentDate = dateFormat(new Date(), 'UTC:mm-dd-yyyy HHMM');

	const dispatch = useDispatch();

	const mapRow = (sheet, data, key) => {
		dispatch({ type: actionTypes.UPDATE_SSGT_SEARCH_TYPE, payload: sheet });
		dispatch({ type: actionTypes.UPDATE_SSGT_SEARCH_STRING, payload: data });
		dispatch({ type: actionTypes.UPDATE_PROPERTY_TO_MAP, payload: data });
		dispatch({ type: actionTypes.UPDATE_ROW_KEY_TO_MAP, payload: key });
		dispatch({ type: actionTypes.UPDATE_SSGT_MAPPING_MODAL_OPEN });
	};

	const panes = [
		{
			menuItem: 'Property',
			pane: (
				<Tab.Pane key='pv'>
					<MaterialTable
						title={packageName + ' Property Sheet ' + currentDate}
						icons={TableIcons}
						localization={{
							header: {
								actions: '', // this removes the 'Actions' label from appearing in the second header row
							},
						}}
						columns={[
							{
								title: 'NS Prefix',
								field: 'sourceNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Source_NsPrefix,
								tooltipPosition: 'left',
							},
							{
								title: 'Property Name',
								field: 'sourcePropertyName',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Source_PropertyName,
							},
							{
								title: 'Data Type',
								field: 'dataType',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Source_DataType,
							},
							{
								title: 'Definition',
								field: 'sourceDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Source_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
							{
								title: 'Sample Value',
								field: 'sourceSampleValue',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Source_Sample_Value,
							},
							{
								title: 'Code',
								field: 'mappingCode',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Mapping_Code,
							},
							{
								title: 'NS Prefix',
								field: 'targetNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_NsPrefix,
							},
							{
								title: 'Property Name',
								field: 'targetPropertyName',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_PropertyName,
							},
							{
								title: 'Qualified Data Type',
								field: 'qualifiedDataType',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_QualifiedDataType,
							},
							{
								title: 'Definition',
								field: 'targetDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
							{
								title: 'Substitution Group',
								field: 'substitutionGroup',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_SubstitutionGroup,
							},
							{
								title: 'Is Abstract',
								field: 'isAbstract',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_IsAbstract,
							},
							{
								title: 'Style',
								field: 'style',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_Style,
							},
							{
								title: 'Keywords',
								field: 'keywords',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_Keywords,
							},
							{
								title: 'Example Content',
								field: 'exampleContent',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_ExampleContent,
							},
							{
								title: 'Usage Info',
								field: 'usageInfo',
								tooltip: tooltipsDisabled ? null : tooltipContent.property_Target_UsageInfo,
							},
						]}
						data={propertySheet}
						options={{
							exportButton: true,
							columnsButton: false,
							showFirstLastPageButtons: false,
							search: false,
							paging: true,
							showTitle: false,
							toolbarButtonAlignment: 'left',
							filtering: true,
							addRowPosition: 'first',
							maxBodyHeight: 800,
							rowStyle: (rowData, index) => {
								if (index % 2 === 0) {
									return { backgroundColor: '#f2f2f2f2' };
								}
							},
						}}
						actions={
							isMapModelActive // This displays the Actions column only if the user is on the Map and Model page
								? [
										{
											icon: () => <Button content='Map' className='secondaryButton' />,
											tooltip: 'Map Property',
											isCustom: true,
											isFreeAction: false,
											onClick: (e, rowData) => {
												mapRow('Property', rowData.sourcePropertyName, rowData.key);
											},
										},
								  ]
								: null
						}
						components={{
							Toolbar: (props) => (
								<div style={{ backgroundColor: '#e8eaf5' }}>
									<MTableToolbar {...props} />
								</div>
							),
							Header: (props) => (
								<>
									<thead className='MuiTableHead-root'>
										<tr className='MuiTableRow-root MuiTableRow-head'>
											{isMapModelActive ? ( // display the Actions column header if the user is on the Map and Model page
												<th
													className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
													colSpan={1}
												>
													<Popup
														inverted={true}
														content={tooltipContent.actionMap}
														position='top center'
														wide
														disabled={tooltipsDisabled}
														trigger={<p className='columnHeader'>Actions</p>}
														mouseEnterDelay={700}
													/>
												</th>
											) : null}
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={5}
											>
												<Popup
													inverted={true}
													content={tooltipContent.sourceHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Source</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'>
												<Popup
													inverted={true}
													content={tooltipContent.mappingHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Mapping</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={10}
											>
												<Popup
													inverted={true}
													content={tooltipContent.targetHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Target</p>}
													mouseEnterDelay={700}
												/>
											</th>
										</tr>
									</thead>
									<MTableHeader {...props} />
								</>
							),
						}}
						editable={
							isMapModelActive // This allows editing only if the user is on the Map and Model page
								? {
										isEditable: () => true,
										isDeletable: () => true,
										onRowAdd: (newData) =>
											new Promise((resolve, reject) => {
												addRowToSheet(mapDocSheetNames.propertySheet, newData);
												resolve();
											}),
										onRowUpdate: (newData, oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												clearValidationResults();
												setTimeout(() => {
													const dataUpdate = [...propertySheet];
													const index = oldData.tableData.id;
													dataUpdate[index] = newData;
													setSessionValue(
														sessionVar.unsaved_property_sheet,
														[...dataUpdate],
														actionTypes.UPDATE_PROPERTY_SHEET
													);
													resolve();
												}, 1000);
											}),
										onRowDelete: (oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												clearValidationResults();
												setTimeout(() => {
													const dataDelete = [...propertySheet];
													const index = oldData.tableData.id;
													dataDelete.splice(index, 1);
													setSessionValue(
														sessionVar.unsaved_property_sheet,
														[...dataDelete],
														actionTypes.UPDATE_PROPERTY_SHEET
													);
													resolve();
												}, 1000);
											}),
								  }
								: null
						}
					/>
				</Tab.Pane>
			),
		},
		{
			menuItem: 'Type',
			pane: (
				<Tab.Pane key='tv'>
					<MaterialTable
						title={packageName + ' Type Sheet ' + currentDate}
						icons={TableIcons}
						localization={{
							header: {
								actions: '', // this removes the 'Actions' label from appearing in the second header row
							},
						}}
						columns={[
							{
								title: 'NS Prefix',
								field: 'sourceNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Source_NsPrefix,
							},
							{
								title: 'Type Name',
								field: 'sourceTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Source_TypeName,
							},
							{
								title: 'Parent/Base Type',
								field: 'sourceParentBaseType',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Source_ParentBaseType,
							},
							{
								title: 'Definition',
								field: 'sourceDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Source_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
							{
								title: 'Code',
								field: 'mappingCode',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Mapping_Code,
							},
							{
								title: 'NS Prefix',
								field: 'targetNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Target_NsPrefix,
							},
							{
								title: 'Type Name',
								field: 'targetTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Target_TypeName,
							},
							{
								title: 'Elements In Type',
								field: 'elementsInTypeString',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Target_elementInType,
							},
							{
								title: 'Parent/Base Type',
								field: 'targetParentBaseType',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Target_ParentBaseType,
							},
							{
								title: 'Definition',
								field: 'targetDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Target_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
							{
								title: 'Style',
								field: 'style',
								tooltip: tooltipsDisabled ? null : tooltipContent.type_Target_Style,
							},
						]}
						data={typeSheet}
						options={{
							exportButton: true,
							columnsButton: false,
							showFirstLastPageButtons: false,
							search: false,
							paging: true,
							showTitle: false,
							toolbarButtonAlignment: 'left',
							filtering: true,
							addRowPosition: 'first',
							maxBodyHeight: 800,
							rowStyle: (rowData, index) => {
								if (index % 2 === 0) {
									return { backgroundColor: '#f2f2f2f2' };
								}
							},
						}}
						actions={
							isMapModelActive // This displays the Actions column only if the user is on the Map and Model page
								? [
										{
											icon: () => <Button content='Map' className='secondaryButton' />,
											tooltip: 'Map Type',
											isCustom: true,
											isFreeAction: false,
											onClick: (e, rowData) => {
												mapRow('Type', rowData.sourceTypeName, rowData.key);
											},
										},
								  ]
								: null
						}
						components={{
							Toolbar: (props) => (
								<div style={{ backgroundColor: '#e8eaf5' }}>
									<MTableToolbar {...props} />
								</div>
							),
							Header: (props) => (
								<>
									<thead className='MuiTableHead-root'>
										<tr className='MuiTableRow-root MuiTableRow-head'>
											{isMapModelActive ? ( // display the Actions column header if the user is on the Map and Model page
												<th
													className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
													colSpan={1}
												>
													<Popup
														inverted={true}
														content={tooltipContent.actionMap}
														position='top center'
														wide
														disabled={tooltipsDisabled}
														trigger={<p className='columnHeader'>Actions</p>}
														mouseEnterDelay={700}
													/>
												</th>
											) : null}
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={4}
											>
												<Popup
													inverted={true}
													content={tooltipContent.sourceHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Source</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'>
												<Popup
													inverted={true}
													content={tooltipContent.mappingHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Mapping</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={6}
											>
												<Popup
													inverted={true}
													content={tooltipContent.targetHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Target</p>}
													mouseEnterDelay={700}
												/>
											</th>
										</tr>
									</thead>
									<MTableHeader {...props} />
								</>
							),
						}}
						editable={
							isMapModelActive // This allows editing only if the user is on the Map and Model page
								? {
										isEditable: () => true,
										isDeletable: () => true,
										onRowAdd: (newData) =>
											new Promise((resolve, reject) => {
												addRowToSheet(mapDocSheetNames.typeSheet, newData);
												resolve();
											}),
										onRowUpdate: (newData, oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataUpdate = [...typeSheet];
													const index = oldData.tableData.id;
													dataUpdate[index] = newData;
													setSessionValue(sessionVar.unsaved_type_sheet, [...dataUpdate], actionTypes.UPDATE_TYPE_SHEET);
													resolve();
												}, 1000);
											}),
										onRowDelete: (oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataDelete = [...typeSheet];
													const index = oldData.tableData.id;
													dataDelete.splice(index, 1);
													setSessionValue(sessionVar.unsaved_type_sheet, [...dataDelete], actionTypes.UPDATE_TYPE_SHEET);
													resolve();
												}, 1000);
											}),
								  }
								: null
						}
					/>
				</Tab.Pane>
			),
		},
		{
			menuItem: 'Type-Has-Property',
			pane: (
				<Tab.Pane key='thpv'>
					<MaterialTable
						title={packageName + ' Type-Has-Property Sheet ' + currentDate}
						icons={TableIcons}
						localization={{
							header: {
								actions: '', // this removes the 'Actions' label from appearing in the second header row
							},
						}}
						columns={[
							{
								title: 'NS Prefix',
								field: 'sourceTypeNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Source_NsPrefix,
							},
							{
								title: 'Type Name',
								field: 'sourceTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Source_TypeName,
							},
							{
								title: 'Property NS',
								field: 'sourcePropertyNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Source_PropertyNs,
							},
							{
								title: 'Property Name',
								field: 'sourcePropertyName',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Source_PropertyName,
							},
							{
								title: 'Min',
								field: 'sourceMin',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Source_Min,
							},
							{
								title: 'Max',
								field: 'sourceMax',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Source_Max,
							},
							{
								title: 'Code',
								field: 'mappingCode',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Mapping_Code,
							},
							{
								title: 'Type NS',
								field: 'targetTypeNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Target_TypeNs,
							},
							{
								title: 'Type Name',
								field: 'targetTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Target_TypeName,
							},
							{
								title: 'Property NS',
								field: 'targetPropertyNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Target_PropertyNs,
							},
							{
								title: 'Property Name',
								field: 'targetPropertyName',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Target_PropertyName,
							},
							{
								title: 'Min',
								field: 'targetMin',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Target_Min,
							},
							{
								title: 'Max',
								field: 'targetMax',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Target_Max,
							},
							{
								title: 'Definition',
								field: 'targetDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeHasProperty_Target_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
						]}
						data={typeHasPropertySheet}
						options={{
							exportButton: true,
							columnsButton: false,
							showFirstLastPageButtons: false,
							search: false,
							paging: true,
							showTitle: false,
							toolbarButtonAlignment: 'left',
							filtering: true,
							addRowPosition: 'first',
							maxBodyHeight: 800,
							rowStyle: (rowData, index) => {
								if (index % 2 === 0) {
									return { backgroundColor: '#f2f2f2f2' };
								}
							},
						}}
						components={{
							Toolbar: (props) => (
								<div style={{ backgroundColor: '#e8eaf5' }}>
									<MTableToolbar {...props} />
								</div>
							),
							Header: (props) => (
								<>
									<thead className='MuiTableHead-root'>
										<tr className='MuiTableRow-root MuiTableRow-head'>
											{isMapModelActive ? ( // display the Actions column header if the user is on the Map and Model page
												<th
													className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
													colSpan={1}
												>
													<Popup
														inverted={true}
														content={tooltipContent.actionMap}
														position='top center'
														wide
														disabled={tooltipsDisabled}
														trigger={<p className='columnHeader'>Actions</p>}
														mouseEnterDelay={700}
													/>
												</th>
											) : null}
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={6}
											>
												<Popup
													inverted={true}
													content={tooltipContent.sourceHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Source</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'>
												<Popup
													inverted={true}
													content={tooltipContent.mappingHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Mapping</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={7}
											>
												<Popup
													inverted={true}
													content={tooltipContent.targetHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Target</p>}
													mouseEnterDelay={700}
												/>
											</th>
										</tr>
									</thead>
									<MTableHeader {...props} />
								</>
							),
						}}
						editable={
							isMapModelActive // This allows editing only if the user is on the Map and Model page
								? {
										isEditable: () => true,
										isDeletable: () => true,
										onRowAdd: (newData) =>
											new Promise((resolve, reject) => {
												addRowToSheet(mapDocSheetNames.typeHasPropertySheet, newData);
												resolve();
											}),
										onRowUpdate: (newData, oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataUpdate = [...typeHasPropertySheet];
													const index = oldData.tableData.id;
													dataUpdate[index] = newData;
													setSessionValue(
														sessionVar.unsaved_type_has_property_sheet,
														[...dataUpdate],
														actionTypes.UPDATE_TYPE_HAS_PROPERTY_SHEET
													);
													resolve();
												}, 1000);
											}),
										onRowDelete: (oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataDelete = [...typeHasPropertySheet];
													const index = oldData.tableData.id;
													dataDelete.splice(index, 1);
													setSessionValue(
														sessionVar.unsaved_type_has_property_sheet,
														[...dataDelete],
														actionTypes.UPDATE_TYPE_HAS_PROPERTY_SHEET
													);
													resolve();
												}, 1000);
											}),
								  }
								: null
						}
					/>
				</Tab.Pane>
			),
		},
		{
			menuItem: 'Codes | Facets',
			pane: (
				<Tab.Pane key='cfv'>
					<MaterialTable
						title={packageName + ' Codes_Facets Sheet ' + currentDate}
						icons={TableIcons}
						localization={{
							header: {
								actions: '', // this removes the 'Actions' label from appearing in the second header row
							},
						}}
						columns={[
							{
								title: 'NS Prefix',
								field: 'sourceNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Source_NsPrefix,
							},
							{
								title: 'Type Name',
								field: 'sourceTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Source_TypeName,
							},
							{
								title: 'Value',
								field: 'sourceValue',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Source_Value,
							},
							{
								title: 'Definition',
								field: 'sourceDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Source_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
							{
								title: 'Kind of Facet',
								field: 'sourceKindOfFacet',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Source_KindOfFacet,
							},
							{
								title: 'Code',
								field: 'mappingCode',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Mapping_Code,
							},
							{
								title: 'NS Prefix',
								field: 'targetNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Target_NsPrefix,
							},
							{
								title: 'Type Name',
								field: 'targetTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Target_TypeName,
							},
							{
								title: 'Value',
								field: 'targetValue',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Target_Value,
							},
							{
								title: 'Definition',
								field: 'targetDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Target_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
							{
								title: 'Kind of Facet',
								field: 'targetKindOfFacet',
								tooltip: tooltipsDisabled ? null : tooltipContent.codeFacets_Target_KindOfFacet,
							},
						]}
						data={codesFacetsSheet}
						options={{
							exportButton: true,
							columnsButton: false,
							showFirstLastPageButtons: false,
							search: false,
							paging: true,
							showTitle: false,
							toolbarButtonAlignment: 'left',
							filtering: true,
							addRowPosition: 'first',
							maxBodyHeight: 800,
							rowStyle: (rowData, index) => {
								if (index % 2 === 0) {
									return { backgroundColor: '#f2f2f2f2' };
								}
							},
						}}
						actions={
							isMapModelActive // This displays the Actions column only if the user is on the Map and Model page
								? []
								: null
						}
						components={{
							Toolbar: (props) => (
								<div style={{ backgroundColor: '#e8eaf5' }}>
									<MTableToolbar {...props} />
								</div>
							),
							Header: (props) => (
								<>
									<thead className='MuiTableHead-root'>
										<tr className='MuiTableRow-root MuiTableRow-head'>
											{isMapModelActive ? ( // display the Actions column header if the user is on the Map and Model page
												<th
													className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
													colSpan={1}
												>
													<Popup
														inverted={true}
														content={tooltipContent.actionMap}
														position='top center'
														wide
														disabled={tooltipsDisabled}
														trigger={<p className='columnHeader'>Actions</p>}
														mouseEnterDelay={700}
													/>
												</th>
											) : null}
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={5}
											>
												<Popup
													inverted={true}
													content={tooltipContent.sourceHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Source</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'>
												<Popup
													inverted={true}
													content={tooltipContent.mappingHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Mapping</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={5}
											>
												<Popup
													inverted={true}
													content={tooltipContent.targetHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Target</p>}
													mouseEnterDelay={700}
												/>
											</th>
										</tr>
									</thead>
									<MTableHeader {...props} />
								</>
							),
						}}
						editable={
							isMapModelActive // This allows editing only if the user is on the Map and Model page
								? {
										isEditable: () => true,
										isDeletable: () => true,
										onRowAdd: (newData) =>
											new Promise((resolve, reject) => {
												addRowToSheet(mapDocSheetNames.codesFacetsSheet, newData);
												resolve();
											}),
										onRowUpdate: (newData, oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataUpdate = [...codesFacetsSheet];
													const index = oldData.tableData.id;
													dataUpdate[index] = newData;
													setSessionValue(
														sessionVar.unsaved_codes_facets_sheet,
														[...dataUpdate],
														actionTypes.UPDATE_CODES_FACETS_SHEET
													);
													resolve();
												}, 1000);
											}),
										onRowDelete: (oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataDelete = [...codesFacetsSheet];
													const index = oldData.tableData.id;
													dataDelete.splice(index, 1);
													setSessionValue(
														sessionVar.unsaved_codes_facets_sheet,
														[...dataDelete],
														actionTypes.UPDATE_CODES_FACETS_SHEET
													);
													resolve();
												}, 1000);
											}),
								  }
								: null
						}
					/>
				</Tab.Pane>
			),
		},
		{
			menuItem: 'Namespace',
			pane: (
				<Tab.Pane key='nv'>
					<MaterialTable
						title={packageName + ' Namespace ' + currentDate}
						icons={TableIcons}
						localization={{
							header: {
								actions: '', // this removes the 'Actions' label from appearing in the second header row
							},
						}}
						columns={[
							{
								title: 'NS Prefix',
								field: 'sourceNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Source_NsPrefix,
							},
							{
								title: 'URI',
								field: 'sourceURI',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Source_Uri,
							},
							{
								title: 'Definition',
								field: 'sourceDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Source_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
							{
								title: 'Code',
								field: 'mappingCode',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Mapping_Code,
							},
							{
								title: 'NS Prefix',
								field: 'targetNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Target_NsPrefix,
							},
							{
								title: 'Style',
								field: 'style',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Target_Style,
							},
							{
								title: 'URI',
								field: 'targetURI',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Target_Uri,
							},
							{
								title: 'Definition',
								field: 'targetDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Target_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
							{
								title: 'NDR Verison',
								field: 'ndrVersion',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Target_NdrVersion,
							},
							{
								title: 'NDR Target',
								field: 'ndrTarget',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Target_NdrTarget,
							},
							{
								title: 'File Name',
								field: 'fileName',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Target_FileName,
							},
							{
								title: 'Relative Path',
								field: 'relativePath',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Target_RelativePath,
							},
							{
								title: 'Draft Version',
								field: 'draftVersion',
								tooltip: tooltipsDisabled ? null : tooltipContent.namespace_Target_DraftVersion,
							},
						]}
						data={namespaceSheet}
						options={{
							exportButton: true,
							columnsButton: false,
							showFirstLastPageButtons: false,
							search: false,
							paging: true,
							showTitle: false,
							toolbarButtonAlignment: 'left',
							filtering: true,
							addRowPosition: 'first',
							maxBodyHeight: 800,
							rowStyle: (rowData, index) => {
								if (index % 2 === 0) {
									return { backgroundColor: '#f2f2f2f2' };
								}
							},
						}}
						components={{
							Toolbar: (props) => (
								<div style={{ backgroundColor: '#e8eaf5' }}>
									<MTableToolbar {...props} />
								</div>
							),
							Header: (props) => (
								<>
									<thead className='MuiTableHead-root'>
										<tr className='MuiTableRow-root MuiTableRow-head'>
											{isMapModelActive ? ( // display the Actions column header if the user is on the Map and Model page
												<th
													className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
													colSpan={1}
												>
													<Popup
														inverted={true}
														content={tooltipContent.actionMap}
														position='top center'
														wide
														disabled={tooltipsDisabled}
														trigger={<p className='columnHeader'>Actions</p>}
														mouseEnterDelay={700}
													/>
												</th>
											) : null}
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={3}
											>
												<Popup
													inverted={true}
													content={tooltipContent.sourceHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Source</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'>
												<Popup
													inverted={true}
													content={tooltipContent.mappingHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Mapping</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={9}
											>
												<Popup
													inverted={true}
													content={tooltipContent.targetHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Target</p>}
													mouseEnterDelay={700}
												/>
											</th>
										</tr>
									</thead>
									<MTableHeader {...props} />
								</>
							),
						}}
						editable={
							isMapModelActive // This allows editing only if the user is on the Map and Model page
								? {
										isEditable: () => true,
										isDeletable: () => true,
										onRowAdd: (newData) =>
											new Promise((resolve, reject) => {
												addRowToSheet(mapDocSheetNames.namespaceSheet, newData);
												resolve();
											}),
										onRowUpdate: (newData, oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataUpdate = [...namespaceSheet];
													const index = oldData.tableData.id;
													dataUpdate[index] = newData;
													setSessionValue(
														sessionVar.unsaved_namespace_sheet,
														[...dataUpdate],
														actionTypes.UPDATE_NAMESPACE_SHEET
													);
													resolve();
												}, 1000);
											}),
										onRowDelete: (oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataDelete = [...namespaceSheet];
													const index = oldData.tableData.id;
													dataDelete.splice(index, 1);
													setSessionValue(
														sessionVar.unsaved_namespace_sheet,
														[...dataDelete],
														actionTypes.UPDATE_NAMESPACE_SHEET
													);
													resolve();
												}, 1000);
											}),
								  }
								: null
						}
					/>
				</Tab.Pane>
			),
		},
		{
			menuItem: 'Local Terminology',
			pane: (
				<Tab.Pane key='ltv'>
					<MaterialTable
						title={packageName + ' Local Terminology ' + currentDate}
						icons={TableIcons}
						localization={{
							header: {
								actions: '', // this removes the 'Actions' label from appearing in the second header row
							},
						}}
						columns={[
							{
								title: 'NS Prefix',
								field: 'sourceNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.localTerm_Source_NsPrefix,
							},
							{
								title: 'Term',
								field: 'sourceTerm',
								tooltip: tooltipsDisabled ? null : tooltipContent.localTerm_Source_Term,
							},
							{
								title: 'Literal',
								field: 'sourceLiteral',
								tooltip: tooltipsDisabled ? null : tooltipContent.localTerm_Source_Literal,
							},
							{
								title: 'Definition',
								field: 'sourceDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.localTerm_Source_Definition,

								cellStyle: {
									minWidth: 300,
								},
								headerStyle: {
									minWidth: 300,
								},
							},
							{
								title: 'Code',
								field: 'mappingCode',
								tooltip: tooltipsDisabled ? null : tooltipContent.localTerm_Mapping_Code,
							},
							{
								title: 'NS Prefix',
								field: 'targetNSPrefix',
								tooltip: tooltipsDisabled ? null : tooltipContent.localTerm_Target_NsPrefix,
							},
							{
								title: 'Term',
								field: 'targetTerm',
								tooltip: tooltipsDisabled ? null : tooltipContent.localTerm_Target_Term,
							},
							{
								title: 'Literal',
								field: 'targetLiteral',
								tooltip: tooltipsDisabled ? null : tooltipContent.localTerm_Target_Literal,
							},
							{
								title: 'Definition',
								field: 'targetDefinition',
								tooltip: tooltipsDisabled ? null : tooltipContent.localTerm_Target_Definition,

								cellStyle: {
									width: 300,
									minWidth: 300,
								},
								headerStyle: {
									width: 300,
									minWidth: 300,
								},
							},
						]}
						data={localTerminologySheet}
						options={{
							exportButton: true,
							columnsButton: false,
							showFirstLastPageButtons: false,
							search: false,
							paging: true,
							showTitle: false,
							toolbarButtonAlignment: 'left',
							filtering: true,
							addRowPosition: 'first',
							maxBodyHeight: 800,
							rowStyle: (rowData, index) => {
								if (index % 2 === 0) {
									return { backgroundColor: '#f2f2f2f2' };
								}
							},
						}}
						actions={
							isMapModelActive // This displays the Actions column only if the user is on the Map and Model page
								? []
								: null
						}
						components={{
							Toolbar: (props) => (
								<div style={{ backgroundColor: '#e8eaf5' }}>
									<MTableToolbar {...props} />
								</div>
							),
							Header: (props) => (
								<>
									<thead className='MuiTableHead-root'>
										<tr className='MuiTableRow-root MuiTableRow-head'>
											{isMapModelActive ? ( // display the Actions column header if the user is on the Map and Model page
												<th
													className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
													colSpan={1}
												>
													<Popup
														inverted={true}
														content={tooltipContent.actionMap}
														position='top center'
														wide
														disabled={tooltipsDisabled}
														trigger={<p className='columnHeader'>Actions</p>}
														mouseEnterDelay={700}
													/>
												</th>
											) : null}
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={4}
											>
												<Popup
													inverted={true}
													content={tooltipContent.sourceHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Source</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'>
												<Popup
													inverted={true}
													content={tooltipContent.mappingHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Mapping</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={4}
											>
												<Popup
													inverted={true}
													content={tooltipContent.targetHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Target</p>}
													mouseEnterDelay={700}
												/>
											</th>
										</tr>
									</thead>
									<MTableHeader {...props} />
								</>
							),
						}}
						editable={
							isMapModelActive // This allows editing only if the user is on the Map and Model page
								? {
										isEditable: () => true,
										isDeletable: () => true,
										onRowAdd: (newData) =>
											new Promise((resolve, reject) => {
												addRowToSheet(mapDocSheetNames.localTerminologySheet, newData);
												resolve();
											}),
										onRowUpdate: (newData, oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataUpdate = [...localTerminologySheet];
													const index = oldData.tableData.id;
													dataUpdate[index] = newData;
													setSessionValue(
														sessionVar.unsaved_local_terminology_sheet,
														[...dataUpdate],
														actionTypes.UPDATE_LOCAL_TERMINOLOGY_SHEET
													);
													resolve();
												}, 1000);
											}),
										onRowDelete: (oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataDelete = [...localTerminologySheet];
													const index = oldData.tableData.id;
													dataDelete.splice(index, 1);
													setSessionValue(
														sessionVar.unsaved_local_terminology_sheet,
														[...dataDelete],
														actionTypes.UPDATE_LOCAL_TERMINOLOGY_SHEET
													);
													resolve();
												}, 1000);
											}),
								  }
								: null
						}
					/>
				</Tab.Pane>
			),
		},
		{
			menuItem: 'Type Union',
			pane: (
				<Tab.Pane key='tuv'>
					<MaterialTable
						title={packageName + ' Type Union ' + currentDate}
						icons={TableIcons}
						localization={{
							header: {
								actions: '', // this removes the 'Actions' label from appearing in the second header row
							},
						}}
						columns={[
							{
								title: 'Union NS',
								field: 'sourceUnionNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeUnion_Source_UnionNs,
							},
							{
								title: 'Union Type Name',
								field: 'sourceUnionTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeUnion_Source_UnionTypeName,
							},
							{
								title: 'Member NS',
								field: 'sourceMemberNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeUnion_Source_MemberNs,
							},
							{
								title: 'Member Type Name',
								field: 'sourceMemberTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeUnion_Source_MemberTypeName,
							},
							{
								title: 'Code',
								field: 'mappingCode',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeUnion_Mapping_Code,
							},
							{
								title: 'Union NS',
								field: 'targetUnionNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeUnion_Target_UnionNs,
							},
							{
								title: 'Union Type Name',
								field: 'targetUnionTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeUnion_Target_UnionTypeName,
							},
							{
								title: 'Member NS',
								field: 'targetMemberNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeUnion_Target_MemberNs,
							},
							{
								title: 'Member Type Name',
								field: 'targetMemberTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.typeUnion_Target_MemberTypeName,
							},
						]}
						data={typeUnionSheet}
						options={{
							exportButton: true,
							columnsButton: false,
							showFirstLastPageButtons: false,
							search: false,
							paging: true,
							showTitle: false,
							toolbarButtonAlignment: 'left',
							filtering: true,
							addRowPosition: 'first',
							maxBodyHeight: 800,
							rowStyle: (rowData, index) => {
								if (index % 2 === 0) {
									return { backgroundColor: '#f2f2f2f2' };
								}
							},
						}}
						actions={
							isMapModelActive // This displays the Actions column only if the user is on the Map and Model page
								? []
								: null
						}
						components={{
							Toolbar: (props) => (
								<div style={{ backgroundColor: '#e8eaf5' }}>
									<MTableToolbar {...props} />
								</div>
							),
							Header: (props) => (
								<>
									<thead className='MuiTableHead-root'>
										<tr className='MuiTableRow-root MuiTableRow-head'>
											{isMapModelActive ? ( // display the Actions column header if the user is on the Map and Model page
												<th
													className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
													colSpan={1}
												>
													<Popup
														inverted={true}
														content={tooltipContent.actionMap}
														position='top center'
														wide
														disabled={tooltipsDisabled}
														trigger={<p className='columnHeader'>Actions</p>}
														mouseEnterDelay={700}
													/>
												</th>
											) : null}
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={4}
											>
												<Popup
													inverted={true}
													content={tooltipContent.sourceHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Source</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'>
												<Popup
													inverted={true}
													content={tooltipContent.mappingHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Mapping</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={4}
											>
												<Popup
													inverted={true}
													content={tooltipContent.targetHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Target</p>}
													mouseEnterDelay={700}
												/>
											</th>
										</tr>
									</thead>
									<MTableHeader {...props} />
								</>
							),
						}}
						editable={
							isMapModelActive // This allows editing only if the user is on the Map and Model page
								? {
										isEditable: () => true,
										isDeletable: () => true,
										onRowAdd: (newData) =>
											new Promise((resolve, reject) => {
												addRowToSheet(mapDocSheetNames.typeUnionSheet, newData);
												resolve();
											}),
										onRowUpdate: (newData, oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataUpdate = [...typeUnionSheet];
													const index = oldData.tableData.id;
													dataUpdate[index] = newData;
													setSessionValue(
														sessionVar.unsaved_type_union_sheet,
														[...dataUpdate],
														actionTypes.UPDATE_TYPE_UNION_SHEET
													);
													resolve();
												}, 1000);
											}),
										onRowDelete: (oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataDelete = [...typeUnionSheet];
													const index = oldData.tableData.id;
													dataDelete.splice(index, 1);
													setSessionValue(
														sessionVar.unsaved_type_union_sheet,
														[...dataDelete],
														actionTypes.UPDATE_TYPE_UNION_SHEET
													);
													resolve();
												}, 1000);
											}),
								  }
								: null
						}
					/>
				</Tab.Pane>
			),
		},
		{
			menuItem: 'Metadata',
			pane: (
				<Tab.Pane key='mv'>
					<MaterialTable
						title={packageName + ' Metadata ' + currentDate}
						icons={TableIcons}
						localization={{
							header: {
								actions: '', // this removes the 'Actions' label from appearing in the second header row
							},
						}}
						columns={[
							{
								title: 'Metadata NS',
								field: 'sourceMetadataNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.metadata_Source_MetadataNs,
							},
							{
								title: 'Metadata Type Name',
								field: 'sourceMetadataTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.metadata_Source_MetadataTypeName,
							},
							{
								title: 'Applies to NS',
								field: 'sourceAppliesToNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.metadata_Source_AppliesToNs,
							},
							{
								title: 'Applies to Type Name',
								field: 'sourceAppliesToTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.metadata_Source_AppliesToTypeName,
							},
							{
								title: 'Code',
								field: 'mappingCode',
								tooltip: tooltipsDisabled ? null : tooltipContent.metadata_Mapping_Code,
							},
							{
								title: 'Metadata NS',
								field: 'targetMetadataNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.metadata_Target_MetadataNs,
							},
							{
								title: 'Metadata Type Name',
								field: 'targetMetadataTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.metadata_Target_MetadataTypeName,
							},
							{
								title: 'Applies to NS',
								field: 'targetAppliesToNS',
								tooltip: tooltipsDisabled ? null : tooltipContent.metadata_Target_AppliesToNs,
							},
							{
								title: 'Applies to Type Name',
								field: 'targetAppliesToTypeName',
								tooltip: tooltipsDisabled ? null : tooltipContent.metadata_Target_AppliesToTypeName,
							},
						]}
						data={metadataSheet}
						options={{
							exportButton: true,
							columnsButton: false,
							showFirstLastPageButtons: false,
							search: false,
							paging: true,
							showTitle: false,
							toolbarButtonAlignment: 'left',
							filtering: true,
							addRowPosition: 'first',
							maxBodyHeight: 800,
							rowStyle: (rowData, index) => {
								if (index % 2 === 0) {
									return { backgroundColor: '#f2f2f2f2' };
								}
							},
						}}
						actions={
							isMapModelActive // This displays the Actions column only if the user is on the Map and Model page
								? []
								: null
						}
						components={{
							Toolbar: (props) => (
								<div style={{ backgroundColor: '#e8eaf5' }}>
									<MTableToolbar {...props} />
								</div>
							),
							Header: (props) => (
								<>
									<thead className='MuiTableHead-root'>
										<tr className='MuiTableRow-root MuiTableRow-head'>
											{isMapModelActive ? ( // display the Actions column header if the user is on the Map and Model page
												<th
													className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
													colSpan={1}
												>
													<Popup
														inverted={true}
														content={tooltipContent.actionMap}
														position='top center'
														wide
														disabled={tooltipsDisabled}
														trigger={<p className='columnHeader'>Actions</p>}
														mouseEnterDelay={700}
													/>
												</th>
											) : null}
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={4}
											>
												<Popup
													inverted={true}
													content={tooltipContent.sourceHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Source</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'>
												<Popup
													inverted={true}
													content={tooltipContent.mappingHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Mapping</p>}
													mouseEnterDelay={700}
												/>
											</th>
											<th
												className='MuiTableCell-root MuiTableCell-head MTableHeader-header-14 MuiTableCell-alignLeft'
												colSpan={4}
											>
												<Popup
													inverted={true}
													content={tooltipContent.targetHeader}
													position='top center'
													wide
													disabled={tooltipsDisabled}
													trigger={<p className='columnHeader'>Target</p>}
													mouseEnterDelay={700}
												/>
											</th>
										</tr>
									</thead>
									<MTableHeader {...props} />
								</>
							),
						}}
						editable={
							isMapModelActive // This allows editing only if the user is on the Map and Model page
								? {
										isEditable: () => true,
										isDeletable: () => true,
										onRowAdd: (newData) =>
											new Promise((resolve, reject) => {
												addRowToSheet(mapDocSheetNames.metadataSheet, newData);
												resolve();
											}),
										onRowUpdate: (newData, oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataUpdate = [...metadataSheet];
													const index = oldData.tableData.id;
													dataUpdate[index] = newData;
													setSessionValue(
														sessionVar.unsaved_metadata_sheet,
														[...dataUpdate],
														actionTypes.UPDATE_METADATA_SHEET
													);
													resolve();
												}, 1000);
											}),
										onRowDelete: (oldData) =>
											new Promise((resolve, reject) => {
												if (isRequiredArtifactUploaded.subset) {
													deleteSubsetTranslate(true, false);
												}
												setTimeout(() => {
													const dataDelete = [...metadataSheet];
													const index = oldData.tableData.id;
													dataDelete.splice(index, 1);
													setSessionValue(
														sessionVar.unsaved_metadata_sheet,
														[...dataDelete],
														actionTypes.UPDATE_METADATA_SHEET
													);
													resolve();
												}, 1000);
											}),
								  }
								: null
						}
					/>
				</Tab.Pane>
			),
		},
	];

	return (
		<>
			<SSGTMappingModal />
			<Message
				hidden={autoAddedTypeQname === '' && autoAddedPropertyCount === 0 && autoAddedTypeCount === 0}
				info
				header='Please Note'
				content={
					<>
						{autoAddedTypeQname !== '' ? (
							<p>
								Type: <strong>{autoAddedTypeQname}</strong> has been added to your Type Sheet and can be reviewed in the "Type" tab.
							</p>
						) : autoAddedPropertyCount > 0 && autoAddedTypeCount > 0 ? (
							<p>
								{autoAddedPropertyCount} nested {autoAddedPropertyCount === 1 ? 'property has' : 'properties have'} been added to your
								Property Sheet and can be reviewed in the "Property" tab. <br /> {autoAddedTypeCount} associated{' '}
								{autoAddedTypeCount === 1 ? 'type has' : 'types have'} also been added to your Type Sheet and can be reviewed in the
								"Type" tab.
							</p>
						) : autoAddedPropertyCount === 0 && autoAddedTypeCount > 0 ? (
							<p>
								{autoAddedTypeCount} associated {autoAddedTypeCount === 1 ? 'type has' : 'types have'} been added to your Type Sheet
								and can be reviewed in the "Type" tab.
							</p>
						) : autoAddedPropertyCount > 0 && autoAddedTypeCount === 0 ? (
							<p>
								{autoAddedPropertyCount} nested {autoAddedPropertyCount === 1 ? 'property has' : 'properties have'} been added to your
								Property Sheet and can be reviewed in the "Property" tab.
							</p>
						) : null}
					</>
				}
			/>
			<Tab panes={panes} renderActiveOnly={false} />
		</>
	);
};

export default MappingGrid;
