import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Button, Form, Icon, Table, Radio, Modal, Divider, Dropdown, Message } from 'semantic-ui-react';
import * as xlsx from 'xlsx';
import { loadMappingSpreadsheetFile } from '../Util/UploadFileUtil';
import { ParseCustomExcel } from '../Util/MappingDocumentUtil';
import LoaderModal from '../Shared/LoaderModal';

const CustomMappingSheetModal = (props) => {
	const initialForm = {
		columnRowLocation: '',
		firstColumn: '',
		lastColumn: '',
	};

	const niemColumnOptions = [
		// Property tab columns
		{ key: 0, value: 'propertySourceNSPrefixKey', text: 'Property - Source - NS Prefix' },
		{ key: 1, value: 'propertySourcePropertyName', text: 'Property - Source - Property Name' },
		{ key: 2, value: 'propertyDataType', text: 'Property - Source - Data Type' },
		{ key: 3, value: 'propertySourceDefinition', text: 'Property - Source - Definition' },
		{ key: 4, value: 'propertySourceSampleValue', text: 'Property - Source - Sample Value' },
		{ key: 5, value: 'propertyMappingCode', text: 'Property - Mapping - Code' },
		{ key: 6, value: 'propertyTargetNSPrefix', text: 'Property - Target - NS Prefix' },
		{ key: 7, value: 'propertyTargetPropertyName', text: 'Property - Target - Property Name' },
		{ key: 8, value: 'propertyQualifiedDataType', text: 'Property - Target - Qualified Data Type' },
		{ key: 9, value: 'propertyTargetDefinition', text: 'Property - Target - Definition' },
		{ key: 10, value: 'propertySubstitutionGroup', text: 'Property - Target - Substitution Group' },
		{ key: 11, value: 'propertyIsAbstract', text: 'Property - Target - Is Abstract' },
		{ key: 12, value: 'propertyStyle', text: 'Property - Target - Style' },
		{ key: 13, value: 'propertyKeywords', text: 'Property - Target - Keywords' },
		{ key: 14, value: 'propertyExampleContent', text: 'Property - Target - Example Content' },
		{ key: 15, value: 'propertyUsageInfo', text: 'Property - Target - Usage Info' },
		// Type tab columns
		{ key: 16, value: 'typeSourceNSPrefix', text: 'Type - Source - NS Prefix' },
		{ key: 17, value: 'typeSourceTypeName', text: 'Type - Source - Type Name' },
		{ key: 18, value: 'typeSourceParentBaseType', text: 'Type - Source - Parent/Base Type' },
		{ key: 19, value: 'typeSourceDefinition', text: 'Type - Source - Definition' },
		{ key: 20, value: 'typeMappingCode', text: 'Type - Mapping - Code' },
		{ key: 21, value: 'typeTargetNSPrefix', text: 'Type - Target - NS Prefix' },
		{ key: 22, value: 'typeTargetTypeName', text: 'Type - Target - Type Name' },
		{ key: 23, value: 'typeElementsInType', text: 'Type - Target - Elements In Type' },
		{ key: 24, value: 'typeTargetParentBaseType', text: 'Type - Target - Parent/Base Type' },
		{ key: 25, value: 'typeTargetDefinition', text: 'Type - Target - Definition' },
		{ key: 26, value: 'typeStyle', text: 'Type - Target - Style' },
	];

	const dispatch = useDispatch();
	const isCustomMappingSpreadsheetModalOpen = useSelector((state) => state.analyze.isCustomMappingSpreadsheetModalOpen);
	const [initialView, setInitialView] = useState(true);
	const [sheetHasHeaders, setSheetHasHeaders] = useState(false);
	const [columnLocationForm, setColumnLocationForm] = useState(initialForm);
	const [customColumnHeaders, setCustomColumnHeaders] = useState([]);
	const [columnSelections, setColumnSelections] = useState([]);
	const [hasDuplicates, setHasDuplicates] = useState(false);
	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const customMappingSheet = props.customSheet;

	const handleClickedNext = async () => {
		setIsLoadingActive(true);
		setInitialView(false);
		const fileBuff = await loadMappingSpreadsheetFile(customMappingSheet.id);
		getColumnHeaders(fileBuff).then((result) => {
			setCustomColumnHeaders(result);
		});
		setIsLoadingActive(false);
	};

	const handleCancel = () => {
		dispatch({ type: actionTypes.CUSTOM_MAPPING_SPREADSHEET_OPEN });
		setInitialView(true);
		setSheetHasHeaders(false);
		setColumnLocationForm(initialForm);
		setHasDuplicates(false);
	};

	const handleColumnSelection = (i, value) => {
		const newColumnSelection = [...columnSelections];
		newColumnSelection[i] = value;
		setColumnSelections(newColumnSelection);
	};

	const handleResetAll = () => {
		let newColumnSelection = [...columnSelections];
		newColumnSelection = newColumnSelection.map(() => {
			return '';
		});
		setColumnSelections(newColumnSelection);
		setHasDuplicates(false);
	};

	const getColumnHeaders = (bufferArray) => {
		const promise = new Promise((resolve, reject) => {
			const wb = xlsx.read(bufferArray, { type: 'buffer' });
			let headers = [];

			// This code handles multiple worksheets in a custom mapping spreadsheet. Saving for potential use in a future release
			// const sheetsArray = ['Property', 'Type'];
			// 		sheetsArray.forEach((sheetName) => {
			// 			if (!wb.Sheets[sheetName]) {
			// 				// if sheet is not found skip it
			// 				return;
			// 			}
			//         /* use below code to loop through each sheet here */
			//       }

			const sheetName = wb.Props.SheetNames[0]; // grab first sheet in excel
			const sheet = wb.Sheets[sheetName];

			if (sheetHasHeaders === 'true') {
				// xlsx uses 0-based indexing when searching excel cells
				let excelRow = columnLocationForm.columnRowLocation === '0' ? 0 : columnLocationForm.columnRowLocation - 1;
				const range = xlsx.utils.decode_range(sheet['!ref']);
				let Col;
				let Row = (range.s.r = excelRow); // start in the chosen row
				let header;
				// walk every column in the range
				for (Col = range.s.c; Col <= range.e.c; ++Col) {
					let cell = sheet[xlsx.utils.encode_cell({ c: Col, r: Row })]; // find the cell in the chosen row
					header = xlsx.utils.format_cell(cell);
					headers.push(header);
				}
				resolve(headers);
			} else {
				const firstColumn = columnLocationForm.firstColumn.toUpperCase();
				const lastColumn = columnLocationForm.lastColumn.toUpperCase();
				let columnRange = (sheet['!ref'] = `${firstColumn}1:${lastColumn}1`); // find columns in A1:D1 format
				let range = xlsx.utils.decode_range(columnRange);
				let Col;
				let header;
				// walk every column in the range and grab column letter names
				for (Col = range.s.c; Col <= range.e.c; ++Col) {
					header = xlsx.utils.encode_col(Col);
					headers.push(header);
				}
				resolve(headers);
			}
		});

		return promise.then((result) => {
			return result;
		});
	};

	const handleMapping = async () => {
		setIsLoadingActive(true);
		const fileBuff = await loadMappingSpreadsheetFile(customMappingSheet.id);
		const duplicateColumns = columnSelections.some((columnSelection, index) => {
			let result;
			// if columnSelection is empty or undefined skip it to prevent false flags
			if (columnSelection) {
				result = index !== columnSelections.indexOf(columnSelection);
			}
			return result;
		});
		setHasDuplicates(duplicateColumns);

		if (!duplicateColumns) {
			let mappedColumns = {};

			// map custom columns to selections
			customColumnHeaders.forEach((customColumnHeader, i) => {
				if (columnSelections[i]) {
					return (mappedColumns[columnSelections[i]] = customColumnHeader);
				}
			});

			// map custom columns to appropiate sections
			// if column is not mapped add empty string
			const niemColumns = {
				property: {
					sourceNSPrefixKey: mappedColumns.propertySourceNSPrefixKey ? mappedColumns.propertySourceNSPrefixKey : ' ',
					sourcePropertyName: mappedColumns.propertySourcePropertyName ? mappedColumns.propertySourcePropertyName : ' ',
					dataType: mappedColumns.propertyDataType ? mappedColumns.propertyDataType : ' ',
					sourceDefinition: mappedColumns.propertySourceDefinition ? mappedColumns.propertySourceDefinition : ' ',
					sourceSampleValue: mappedColumns.propertySourceSampleValue ? mappedColumns.propertySourceSampleValue : ' ',
					mappingCode: mappedColumns.propertyMappingCode ? mappedColumns.propertyMappingCode : ' ',
					targetNSPrefix: mappedColumns.propertyTargetNSPrefix ? mappedColumns.propertyTargetNSPrefix : ' ',
					targetPropertyName: mappedColumns.propertyTargetPropertyName ? mappedColumns.propertyTargetPropertyName : ' ',
					qualifiedDataType: mappedColumns.propertyQualifiedDataType ? mappedColumns.propertyQualifiedDataType : ' ',
					targetDefinition: mappedColumns.propertyTargetDefinition ? mappedColumns.propertyTargetDefinition : ' ',
					substitutionGroup: mappedColumns.propertySubstitutionGroup ? mappedColumns.propertySubstitutionGroup : ' ',
					isAbstract: mappedColumns.propertyIsAbstract ? mappedColumns.propertyIsAbstract : ' ',
					style: mappedColumns.propertyStyle ? mappedColumns.propertyStyle : ' ',
					keywords: mappedColumns.propertyKeywords ? mappedColumns.propertyKeywords : ' ',
					exampleContent: mappedColumns.propertyExampleContent ? mappedColumns.propertyExampleContent : ' ',
					usageInfo: mappedColumns.propertyUsageInfo ? mappedColumns.propertyUsageInfo : ' ',
				},
				type: {
					sourceNSPrefix: mappedColumns.typeSourceNSPrefix ? mappedColumns.typeSourceNSPrefix : ' ',
					sourceTypeName: mappedColumns.typeSourceTypeName ? mappedColumns.typeSourceTypeName : ' ',
					sourceParentBaseType: mappedColumns.typeSourceParentBaseType ? mappedColumns.typeSourceParentBaseType : ' ',
					sourceDefinition: mappedColumns.typeSourceDefinition ? mappedColumns.typeSourceDefinition : ' ',
					mappingCode: mappedColumns.typeMappingCode ? mappedColumns.typeMappingCode : ' ',
					targetNSPrefix: mappedColumns.typeTargetNSPrefix ? mappedColumns.typeTargetNSPrefix : ' ',
					targetTypeName: mappedColumns.typeTargetTypeName ? mappedColumns.typeTargetTypeName : ' ',
					elementsInTypeString: mappedColumns.typeElementsInType ? mappedColumns.typeElementsInType : ' ',
					targetParentBaseType: mappedColumns.typeTargetParentBaseType ? mappedColumns.typeTargetParentBaseType : ' ',
					targetDefinition: mappedColumns.typeTargetDefinition ? mappedColumns.typeTargetDefinition : ' ',
					style: mappedColumns.typeStyle ? mappedColumns.typeStyle : ' ',
				},
			};

			if (sheetHasHeaders === 'true') {
				// xlsx uses 0-based indexing
				let excelRow = columnLocationForm.columnRowLocation === '0' ? 0 : columnLocationForm.columnRowLocation - 1;
				ParseCustomExcel(fileBuff, niemColumns, excelRow, true);
			} else {
				ParseCustomExcel(fileBuff, niemColumns, 0, false);
			}

			handleCancel();
		} else {
			setHasDuplicates(true);
		}
		setIsLoadingActive(false);
	};

	const renderRows = () => {
		return customColumnHeaders.map((row, i) => {
			return (
				<Table.Row key={i}>
					<Table.Cell>{row}</Table.Cell>
					<Table.Cell textAlign='center'>
						<Icon name='arrow right' />
					</Table.Cell>
					<Table.Cell>
						<Dropdown
							key={i}
							search
							selection
							fluid
							value={columnSelections[i]}
							options={niemColumnOptions}
							onChange={(e, d) => {
								handleColumnSelection(i, d.value);
							}}
						/>
					</Table.Cell>
					<Table.Cell textAlign='center'>
						<Button
							basic
							content='Clear'
							onClick={() => {
								handleColumnSelection(i, '');
							}}
						/>
					</Table.Cell>
				</Table.Row>
			);
		});
	};

	return (
		<>
			<Modal open={isCustomMappingSpreadsheetModalOpen} size='small' onClose={handleCancel} aria-labelledby='draggable-modal-title' closeIcon>
				<LoaderModal active={isLoadingActive} />
				<Modal.Header content={props.header} />
				{/* ---------------------- Modal Content ---------------------- */}
				{initialView ? (
					// ---------------------- Spreadsheet Header Determination View ---------------------- //
					<>
						<Modal.Content>
							<p>
								<b>Does your Custom Spreadsheet have column headers? </b>
							</p>
							<Radio
								label='Yes'
								name='yesHeaders'
								value='true'
								checked={sheetHasHeaders === 'true'}
								onChange={() => setSheetHasHeaders('true')}
							/>
							<br />
							<Radio
								label='No'
								name='noHeaders'
								value='false'
								checked={sheetHasHeaders === 'false'}
								onChange={() => setSheetHasHeaders('false')}
							/>
							<br />
							{sheetHasHeaders === 'true' ? (
								<>
									<Divider hidden />
									<p>
										<b>What row are your column headers in?</b>
									</p>
									<Form>
										<Form.Input
											name='columnRowLocation'
											width={2}
											value={columnLocationForm.columnRowLocation}
											onChange={(e, d) => {
												setColumnLocationForm({
													...columnLocationForm,
													columnRowLocation: d.value,
												});
											}}
										/>
									</Form>
								</>
							) : sheetHasHeaders === 'false' ? (
								<>
									<Divider hidden />{' '}
									<p>
										<b>Which column(s) would you like to map?</b>
									</p>
									<Form>
										<Form.Group>
											<Form.Input
												name='firstColumn'
												width={2}
												value={columnLocationForm.firstColumn}
												onChange={(e, d) => {
													setColumnLocationForm({
														...columnLocationForm,
														firstColumn: d.value,
													});
												}}
											/>
											<p>
												<b>to</b>
											</p>
											<Form.Input
												name='lastColumn'
												width={2}
												value={columnLocationForm.lastColumn}
												onChange={(e, d) => {
													setColumnLocationForm({
														...columnLocationForm,
														lastColumn: d.value,
													});
												}}
											/>
										</Form.Group>
									</Form>
								</>
							) : null}
						</Modal.Content>
					</>
				) : (
					// ---------------------- Custom Mapping Table View ---------------------- //
					<Modal.Content>
						<>
							<Table celled striped selectable>
								<Table.Header>
									{/* --- Table Headers --- */}
									<Table.Row>
										<Table.HeaderCell>Spreadsheet Column</Table.HeaderCell>
										<Table.HeaderCell width={1}></Table.HeaderCell>
										<Table.HeaderCell>NIEM Mapping Spreadsheet</Table.HeaderCell>
										<Table.HeaderCell textAlign='center' width={3}>
											<Button basic content='Reset All' onClick={() => handleResetAll()} />
										</Table.HeaderCell>
									</Table.Row>
								</Table.Header>
								{/* --- Table Body --- */}
								<Table.Body>{renderRows()}</Table.Body>
							</Table>
						</>
					</Modal.Content>
				)}
				{/* ---------------------- Modal Actions ---------------------- */}
				{initialView ? (
					// ---------------------- Spreadsheet Header Determination View Actions ---------------------- //
					<Modal.Actions>
						<Button className={'secondaryButton'} onClick={handleCancel}>
							Cancel
						</Button>
						<Button
							className={`primaryButton ${
								(sheetHasHeaders && columnLocationForm.columnRowLocation !== '') ||
								(sheetHasHeaders === 'false' && columnLocationForm.firstColumn !== '' && columnLocationForm.lastColumn !== '')
									? ''
									: 'disabled'
							}`}
							onClick={() => handleClickedNext()}
						>
							Next
						</Button>
					</Modal.Actions>
				) : (
					// ---------------------- Custom Mapping Table Modal View Actions ---------------------- //
					<>
						{hasDuplicates ? (
							<Message
								error
								header={'Duplicate Selections'}
								content={'You are attempting to map two or more headers to the same selection. Please try again.'}
							/>
						) : null}

						<Modal.Actions>
							<Button className='secondaryButton' floated='left' onClick={() => setInitialView(true)}>
								Go Back
							</Button>
							<Button className='secondaryButton' onClick={handleCancel}>
								Cancel
							</Button>
							<Button primary onClick={handleMapping}>
								Map
							</Button>
						</Modal.Actions>
					</>
				)}
			</Modal>
		</>
	);
};

export default CustomMappingSheetModal;
