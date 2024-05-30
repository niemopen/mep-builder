import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Modal, Button, Form, Message, Grid, Table, Radio, Checkbox, Dropdown, Accordion, Icon } from 'semantic-ui-react';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { addRowToSheet, UpdateMapDocRow, mapDocSheetNames } from '../Util/MappingDocumentUtil';
import LoaderModal from './LoaderModal';
import Tooltip from './Tooltip.js';
import * as tooltipContent from './TooltipContent.js';
import { deleteSubsetTranslate } from './MEPChangeWarningModal';
import { handleError, trackedErrorSources } from '../Util/ErrorHandleUtil.js';

const SSGTMappingModal = () => {
	const ssgtModalOpen = useSelector((state) => state.ssgt.ssgtMappingModalOpen);
	const propertyToMap = useSelector((state) => state.ssgt.propertyToMap);
	const keyToMap = useSelector((state) => state.ssgt.keyToMap);
	const searchString = useSelector((state) => state.ssgt.searchString);
	const searchType = useSelector((state) => state.ssgt.searchType);
	const release = useSelector((state) => state.mpd.release);
	const isRequiredArtifactUploaded = useSelector((state) => state.mpd.isRequiredArtifactUploaded);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);
	const [submittedSearchType, setSubmittedSearchType] = useState('');
	const [formError, setFormError] = useState(false);
	const [ssgtResults, setSsgtResults] = useState([]);
	const [noResults, setNoResults] = useState(false);
	const [notPartOfRelease, setNotPartOfRelease] = useState(false);
	const [checkedRadioIndex, setCheckedRadioIndex] = useState('');
	const [selectedRowData, setSelectedRowData] = useState('');
	const [checkedElementsInType, setCheckedElementsInType] = useState([]);
	const [selectedCardinality, setSelectedCardinality] = useState([]);
	const [ssgtConnError, setSsgtConnError] = useState(false);
	const [isLoadingActive, setIsLoadingActive] = useState(false);
	const [isMappingActive, setIsMappingActive] = useState(false);
	const [accordionActive, setAccordionActive] = useState();
	const [tableTitle, setTableTitle] = useState('');
	const [mapMessageTitle, setMapMessageTitle] = useState('');
	const [searchingCommon, setSearchingCommon] = useState(false);

	const propertySheet = useSelector((state) => state.mappingDoc.propertySheet);
	const typeSheet = useSelector((state) => state.mappingDoc.typeSheet);
	const namespaceSheet = useSelector((state) => state.mappingDoc.namespaceSheet);

	const dispatch = useDispatch();

	async function handleSSGTSearchSubmit() {
		setSsgtResults([]);
		setIsLoadingActive(true);
		setSearchingCommon(false);
		setNotPartOfRelease(false);
		setTableTitle('Search Results');
		setMapMessageTitle('Confirm Mapping Selection');
		if (searchString === '') {
			setFormError(true);
		} else {
			setFormError(false);
			setSubmittedSearchType(searchType);
			let results;
			if (searchType === 'Property') {
				results = await searchProperties(release, searchString);
			} else if (searchType === 'Type') {
				results = await searchTypes(release, searchString);
			}

			if (!!results && ssgtConnError === false) {
				// sort results into alphabetical order based on element name
				const sortedResults = results.sort((resA, resB) => (resA.name > resB.name ? 1 : resA.name < resB.name ? -1 : 0));
				await mapElements(sortedResults);
			} else {
				setSsgtConnError(true);
			}
			setIsLoadingActive(false);
		}
	}

	async function handleCommonComponentsSearchSubmit() {
		setSsgtResults([]);
		setIsLoadingActive(true);
		setSearchingCommon(true);
		setNotPartOfRelease(false);
		setTableTitle('Common NIEM Component Results');
		setMapMessageTitle('Confirm Common Component Mapping Selection');

		setSubmittedSearchType(searchType);
		const results = await searchCommonComponents();
		let elementsInTypeResults = [];
		if (!!results && results.length > 0) {
			setNoResults(false);
			let sortedResults;
			if (searchType === 'Property') {
				// use property name
				sortedResults = results.sort((resA, resB) =>
					resA.property_name > resB.property_name ? 1 : resA.property_name < resB.property_name ? -1 : 0
				);
			} else {
				// use type name
				sortedResults = results.sort((resA, resB) => (resA.type_name > resB.type_name ? 1 : resA.type_name < resB.type_name ? -1 : 0));
			}
			sortedResults.forEach(async (i) => {
				// if search string is Type, search for ElementInType results
				if (searchType === 'Type') {
					elementsInTypeResults = await getElementInType(i.ns_prefix + ':' + i.type_name);
				}

				addSSGTResult({
					prefix: i.ns_prefix,
					name: searchType === 'Property' ? i.property_name : i.type_name,
					typePrefix: i.type_prefix,
					typeName: i.type_name,
					definition: i.definition,
					elementsInType: elementsInTypeResults,
				});
			});
		} else {
			setNoResults(true);
		}

		setIsLoadingActive(false);
	}

	async function mapTypeFromProperty(propertyData) {
		// Fetch type data based on property data
		const typeDataToParse = await getType(release, propertyData.typePrefix + ':' + propertyData.typeName);
		let typeExistsInSheet = false;
		let keyToOverwrite;

		// Determine whether the type is present within the Type Sheet or if it is missing as a result of a migration
		for (const row of typeSheet) {
			if (typeDataToParse.name === row.targetTypeName) {
				typeExistsInSheet = true;
			} else if (typeDataToParse.name === row.sourceTypeName && !row.targetDefinition) {
				typeExistsInSheet = true;
				keyToOverwrite = row.key;
			}
		}

		// Parse the raw Type data and add it to the Type Sheet
		const typeDataToAdd = {
			sourceNSPrefix: typeDataToParse.prefix,
			sourceTypeName: typeDataToParse.name,
			targetNSPrefix: typeDataToParse.prefix,
			targetTypeName: typeDataToParse.name,
			targetDefinition: typeDataToParse.definition,
			version: typeDataToParse.version.niemVersionNumber,
			isAbstract: typeDataToParse.hasOwnProperty('isAbstract') ? typeDataToParse.isAbstract : false,
			isReference: typeDataToParse.hasOwnProperty('isReference') ? typeDataToParse.isReference : false,
			elementsInType: [],
		};

		// Add the Type to the Type Sheet
		if (!typeExistsInSheet) {
			addRowToSheet(mapDocSheetNames.typeSheet, typeDataToAdd);
			return typeDataToAdd;
		} else if (keyToOverwrite !== undefined) {
			// entry is missing as a result of a migration; overwrite the existing row data instead of adding new entry
			UpdateMapDocRow('Type', typeSheet, keyToOverwrite, typeDataToParse, [], []);
			return typeDataToAdd;
		} else {
			return null;
		}
	}

	async function mapPropertyFromType(propertyData) {
		let propertyInSheet = false;
		let keyToOverwrite;
		let addedProperty = false;
		let addedType = false;

		// Determine whether the property is present within the Property Sheet or if it is missing as a result of a migration
		for (const row of propertySheet) {
			if (propertyData.name === row.targetPropertyName) {
				propertyInSheet = true;
			} else if (propertyData.name === row.sourcePropertyName && !row.targetDefinition) {
				propertyInSheet = true;
				keyToOverwrite = row.key;
			}
		}

		// Add the property to the Property Sheet
		if (!propertyInSheet) {
			// Parse the raw Property data and add it to the Property Sheet
			const propertyDataToAdd = {
				sourceNSPrefix: propertyData.prefix,
				sourcePropertyName: propertyData.name,
				targetNSPrefix: propertyData.prefix,
				targetPropertyName: propertyData.name,
				targetDefinition: propertyData.definition,
				isAbstract: propertyData.hasOwnProperty('isAbstract') ? propertyData.isAbstract : false,
				isReference: propertyData.hasOwnProperty('isReference') ? propertyData.isReference : false,
				qualifiedDataType: !!propertyData.type ? propertyData.type.name : '',
				typePrefix: !!propertyData.type ? propertyData.type.prefix : '',
				version: propertyData.version.niemDataVersion ? propertyData.version.niemDataVersion : '',
			};

			addRowToSheet(mapDocSheetNames.propertySheet, propertyDataToAdd);
			addedProperty = true;
		} else if (keyToOverwrite !== undefined) {
			// entry is missing as a result of a migration; overwrite the existing row data instead of adding new entry
			UpdateMapDocRow('Property', propertySheet, keyToOverwrite, propertyData, [], []);
			addedProperty = true;
		}

		// If the property has a type, attempt to add it to the Type Sheet
		if (!!propertyData.type) {
			let addedTypeData = await mapTypeFromProperty({
				typePrefix: propertyData.type.prefix,
				typeName: propertyData.type.name,
			});
			addedTypeData ? (addedType = true) : (addedType = false);
		}

		let result;
		if (addedProperty && addedType) {
			result = { propertyAdded: 1, typeAdded: 1 };
		} else if (!addedProperty && addedType) {
			result = { propertyAdded: 0, typeAdded: 1 };
		} else if (addedProperty && !addedType) {
			result = { propertyAdded: 1, typeAdded: 0 };
		} else {
			result = { propertyAdded: 0, typeAdded: 0 };
		}
		return result;
	}

	async function mapTypeNestedElements(selectedElementsInType) {
		var addedPropertyCount = 0;
		var addedTypeCount = 0;

		for (var nestedElement of selectedElementsInType) {
			// Fetch property data for the current nested element
			let propertyDataToParse = await getProperty(release, nestedElement.name);

			// Attempt to add the nested element to the Property Sheet; updating the running counts
			// During this process, if the nested element has a type associated with it, that type will be mapped
			if (propertyDataToParse) {
				let { propertyAdded, typeAdded } = await mapPropertyFromType(propertyDataToParse);
				addedPropertyCount += propertyAdded;
				addedTypeCount += typeAdded;
			}
		}
		return { addedPropertyCount, addedTypeCount };
	}

	async function handleMapSubmit() {
		// If subset schema is already generated, remove subset schema files on map submit
		if (isRequiredArtifactUploaded.subset) {
			deleteSubsetTranslate(true, false);
		}
		const sheetToUpdate =
			searchType === 'Property' ? propertySheet : searchType === 'Type' ? typeSheet : searchType === 'Namespace' ? namespaceSheet : null;

		// Search GTRI Api for data not in DB if the Common Components DB was searched
		let updatedSelectedRowData = selectedRowData;
		if (searchingCommon) {
			setIsLoadingActive(true);

			let dataToParse;
			if (searchType === 'Property') {
				dataToParse = await getProperty(release, selectedRowData.prefix + ':' + selectedRowData.name);
			} else {
				dataToParse = await getType(release, selectedRowData.prefix + ':' + selectedRowData.name);
			}

			if (!dataToParse) {
				setNotPartOfRelease(true);
				setIsLoadingActive(false);
			} else {
				setNotPartOfRelease(false);
				updatedSelectedRowData = {
					prefix: selectedRowData.prefix,
					name: selectedRowData.name,
					typePrefix: selectedRowData.typePrefix,
					typeName: selectedRowData.typeName,
					definition: selectedRowData.definition,
					version: dataToParse.version.niemVersionNumber ? dataToParse.version.niemVersionNumber : '',
					isAbstract: dataToParse.hasOwnProperty('isAbstract') ? dataToParse.isAbstract : '',
					isReference: dataToParse.hasOwnProperty('isReference') ? dataToParse.isReference : '',
					elementsInType: selectedRowData.elementsInType,
				};
				UpdateMapDocRow(searchType, sheetToUpdate, keyToMap, updatedSelectedRowData, checkedElementsInType, selectedCardinality);
				handleCancel();
			}
		} else {
			UpdateMapDocRow(searchType, sheetToUpdate, keyToMap, updatedSelectedRowData, checkedElementsInType, selectedCardinality);

			// if mapping a property, and that property has an associated type, automatically add that type to the type sheet
			if (searchType === 'Property' && !!updatedSelectedRowData.typeName && !!updatedSelectedRowData.typePrefix) {
				setIsMappingActive(true);
				const addedTypeData = await mapTypeFromProperty({
					typePrefix: updatedSelectedRowData.typePrefix,
					typeName: updatedSelectedRowData.typeName,
				});
				if (addedTypeData) {
					// update data for info message to present
					dispatch({
						type: actionTypes.UPDATE_AUTO_ADDED_TYPE_QNAME,
						payload: addedTypeData.targetNSPrefix + ':' + addedTypeData.targetTypeName,
					});
					setTimeout(() => {
						dispatch({ type: actionTypes.UPDATE_AUTO_ADDED_TYPE_QNAME, payload: '' });
					}, 10 * 1000); // clear message after 10 seconds
				}
				setIsMappingActive(false);
			} else if (searchType === 'Type' && checkedElementsInType.length > 0) {
				// if mapping a type, and there are selected nested elements, automatically add them to the Property Sheet
				setIsMappingActive(true);
				let { addedPropertyCount, addedTypeCount } = await mapTypeNestedElements(checkedElementsInType);

				// update data for info message to present
				dispatch({ type: actionTypes.UPDATE_AUTO_ADDED_PROPERTY_COUNT, payload: addedPropertyCount });
				dispatch({ type: actionTypes.UPDATE_AUTO_ADDED_TYPE_COUNT, payload: addedTypeCount });
				setTimeout(() => {
					dispatch({ type: actionTypes.UPDATE_AUTO_ADDED_PROPERTY_COUNT, payload: 0 });
					dispatch({ type: actionTypes.UPDATE_AUTO_ADDED_TYPE_COUNT, payload: 0 });
				}, 15 * 1000); // clear message after 15 seconds
				setIsMappingActive(false);
			}
			handleCancel();
		}
	}

	const handleCancel = () => {
		dispatch({ type: actionTypes.UPDATE_SSGT_MAPPING_MODAL_OPEN });
		setSsgtResults([]);
		setSubmittedSearchType('');
		setNoResults(false);
		setNotPartOfRelease(false);
		setIsLoadingActive(false);
		handleResetSearch();
	};

	const handleRowSelection = (rowData, i) => {
		setCheckedRadioIndex(i);
		setSelectedRowData(rowData);
	};

	const handleResetSearch = () => {
		setCheckedRadioIndex('');
		setSelectedRowData('');
		setSsgtConnError(false);
		setCheckedElementsInType([]);
		setSelectedCardinality([]);
	};

	const searchCommonComponents = () => {
		if (!systemErrorOccurred) {
			return axios
				.post(baseURL + 'MongoRepo/getCommonComponents', {
					searchString: searchString,
					searchType: searchType,
				})
				.then((response) => {
					return response.data.commonComponents;
				})
				.catch((error) => {
					handleError(error, trackedErrorSources.ssgt);
					setSsgtConnError(true);
					setIsLoadingActive(false);
				});
		}
	};

	const getProperty = async (version, qname) => {
		if (!systemErrorOccurred) {
			return axios
				.get(baseURL + `GTRIAPI/getProperty/${version}/${qname}`)
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error);
				});
		}
	};

	const getType = async (version, qname) => {
		if (!systemErrorOccurred) {
			return axios
				.get(baseURL + `GTRIAPI/getType/${version}/${qname}`)
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error);
				});
		}
	};

	const getTypeSubproperties = async (version, qname) => {
		if (!systemErrorOccurred) {
			return axios
				.get(baseURL + `GTRIAPI/getTypeSubproperties/${version}/${qname}`)
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error);
				});
		} else {
			return [];
		}
	};

	async function getElementInType(typePrefixName) {
		const elementResults = await getTypeSubproperties(release, typePrefixName);
		const elementsInTypeParseArray = [];
		try {
			if (elementResults.length > 0) {
				const elementsInType = elementResults.filter(
					(element) => element.property.category === 'element' || element.property.category === 'abstract_element'
				);

				elementsInType.forEach((element) => {
					elementsInTypeParseArray.push({
						name: element.property.qname,
						isReference: element.hasOwnProperty('isReference') ? element.isReference : false,
					});
				});
			}
		} catch (error) {
			// This type does not have any Elements In Type. This is not a true error.
		}
		return elementsInTypeParseArray;
	}

	const addSSGTResult = (newResult) => {
		setSsgtResults((state) => [...state, newResult]);
	};

	const searchProperties = async (release, text) => {
		if (!systemErrorOccurred) {
			return axios
				.post(baseURL + `GTRIAPI/searchProperties`, {
					niemVersionNumber: release,
					substring: text,
				})
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error);
				});
		}
	};

	const searchTypes = async (release, text) => {
		if (!systemErrorOccurred) {
			return axios
				.post(baseURL + `GTRIAPI/searchTypes`, {
					niemVersionNumber: release,
					substring: text,
				})
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					handleError(error);
				});
		}
	};

	async function mapElements(rawResults) {
		let resultsArr = [];

		try {
			let gtriResultsToParse = rawResults;
			// check if there were any results
			if (typeof gtriResultsToParse !== 'undefined') {
				setNoResults(false);
				let elementsInTypeResults = [];
				if (Array.isArray(gtriResultsToParse)) {
					for (const row of gtriResultsToParse) {
						// if search string is Type, search for ElementInType results
						if (searchType === 'Type') {
							elementsInTypeResults = await getElementInType(row.prefix + ':' + row.name);
						}

						resultsArr.push({
							prefix: row.prefix,
							name: row.name,
							typePrefix: row.hasOwnProperty('type') && row.type !== null ? row.type.prefix : undefined,
							typeName: row.hasOwnProperty('type') && row.type !== null ? row.type.name : undefined,
							definition: row.definition,
							version: row.version.niemVersionNumber,
							isAbstract: row.isAbstract,
							isReference: row.hasOwnProperty('isReference') ? row.isReference : false,
							elementsInType: elementsInTypeResults,
						});
					}
				}
			} else {
				setNoResults(true);
			}
			setSsgtResults(resultsArr);
		} catch (error) {
			setSsgtConnError(true);
			setIsLoadingActive(false);
			console.error(error);
		}
	}

	const renderUncommonHeaders = () => {
		switch (submittedSearchType) {
			case 'Property':
				return (
					<>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>Type Prefix</Table.HeaderCell>
						<Table.HeaderCell>Type Name</Table.HeaderCell>
					</>
				);
			case 'Type':
				return <Table.HeaderCell>Name</Table.HeaderCell>;
			case 'Namespace':
				return <Table.HeaderCell>Version</Table.HeaderCell>;
			default:
				return null;
		}
	};

	const renderRows = () => {
		return ssgtResults.map((row, i) => {
			return (
				<Table.Row key={i}>
					<Table.Cell textAlign='center'>
						<Radio name='ssgtModalRadioGroup' checked={i === checkedRadioIndex} onClick={() => handleRowSelection(row, i)} />
					</Table.Cell>
					<Table.Cell>{row.prefix}</Table.Cell>
					{renderUncommonRows(row, i)}
					<Table.Cell>{row.definition}</Table.Cell>
				</Table.Row>
			);
		});
	};

	const cardinalityOptions = [
		{ key: 0, value: '0..unbounded', text: '0..unbounded' },
		{ key: 1, value: '0..1', text: '0..1' },
		{ key: 2, value: '1..1', text: '1..1' },
		{ key: 3, value: '1..unbounded', text: '1..unbounded' },
	];

	const handleElementInTypeChange = (isChecked, rowData, typeName) => {
		if (isChecked) {
			// add
			setCheckedElementsInType((checkedElementsInType) => [
				...checkedElementsInType,
				{ type: typeName, name: rowData.name, isReference: rowData.isReference },
			]);
		} else {
			// remove
			const tempElementArray = [...checkedElementsInType];
			const index = tempElementArray.findIndex((obj) => obj.type === typeName && obj.name === rowData.name);
			if (index > -1) {
				tempElementArray.splice(index, 1);
				setCheckedElementsInType(tempElementArray);
			}
		}
	};

	const handleCardinalityChange = (cardinality, rowData, typeName) => {
		// find if this element already has a mapped cardinality
		const tempCardinalityArray = [...selectedCardinality];
		const index = tempCardinalityArray.findIndex((obj) => obj.type === typeName && obj.element === rowData.name);
		if (index > -1) {
			// update already existing entry
			tempCardinalityArray[index].cardinality = cardinality;
			setSelectedCardinality(tempCardinalityArray);
		} else {
			// create entry
			tempCardinalityArray.push({ type: typeName, element: rowData.name, cardinality: cardinality });
			setSelectedCardinality(tempCardinalityArray);
		}
	};

	const renderElementsInType = (elementsInType, typeName) => {
		return elementsInType.map((row, i) => {
			return (
				<Table.Row key={i}>
					<Table.Cell>
						<Checkbox onChange={(e, d) => handleElementInTypeChange(d.checked, row, typeName)} />
					</Table.Cell>
					<Table.Cell>{row.name}</Table.Cell>
					<Table.Cell>
						<Dropdown
							defaultValue='0..unbounded'
							search
							selection
							options={cardinalityOptions}
							onChange={(e, d) => handleCardinalityChange(d.value, row, typeName)}
						/>
					</Table.Cell>
				</Table.Row>
			);
		});
	};

	const renderUncommonRows = (rowData, i) => {
		switch (submittedSearchType) {
			case 'Property':
				return (
					<>
						<Table.Cell>{rowData.name}</Table.Cell>
						<Table.Cell>{rowData.typePrefix}</Table.Cell>
						<Table.Cell>{rowData.typeName}</Table.Cell>
					</>
				);
			case 'Type':
				return (
					<Table.Cell>
						{rowData.elementsInType.length > 0 ? (
							<Accordion>
								<Accordion.Title
									active={accordionActive === i && checkedRadioIndex === i}
									onClick={() => {
										handleRowSelection(rowData, i);
										if (accordionActive !== i) {
											setAccordionActive(i);
										} else {
											setAccordionActive(null);
										}
									}}
								>
									<Icon name='dropdown' />
									{rowData.name}
								</Accordion.Title>
								<Accordion.Content active={accordionActive === i && checkedRadioIndex === i}>
									<Table striped>
										<Table.Header>
											<Table.Row>
												<Table.HeaderCell>Add</Table.HeaderCell>
												<Table.HeaderCell>Element Name</Table.HeaderCell>
												<Table.HeaderCell>Cardinality</Table.HeaderCell>
											</Table.Row>
										</Table.Header>
										<Table.Body>{renderElementsInType(rowData.elementsInType, rowData.name)}</Table.Body>
									</Table>
								</Accordion.Content>
							</Accordion>
						) : (
							rowData.name
						)}
					</Table.Cell>
				);
			case 'Namespace':
				return <Table.Cell>{rowData.version}</Table.Cell>;
			default:
				return null;
		}
	};

	return (
		<Modal open={ssgtModalOpen} id='ssgtModal' size='fullscreen'>
			<Modal.Header>Map NIEM Components</Modal.Header>
			<Modal.Content scrolling>
				{ssgtConnError ? (
					<Message
						error
						header='Connection Error'
						content='There was an issue with the API performing the generation. Please try again later.'
					/>
				) : null}
				{notPartOfRelease ? (
					<Message
						error
						header='Selection Not Part of Current NIEM Release'
						content='The selection you have made is not part of the currently selected NIEM Release. Please choose a different item to map.'
					/>
				) : null}
				<Form error={formError} warning={noResults}>
					<Message error header='Invalid Form' content='Search String is required.' />
					<Grid columns={3} verticalAlign='middle'>
						<Grid.Column>
							<Form.Field>
								<label>Search Type</label>
								{searchType}
							</Form.Field>
						</Grid.Column>
						<Grid.Column>
							<Form.Input
								label='Search String'
								defaultValue={propertyToMap}
								onChange={(e, d) => dispatch({ type: actionTypes.UPDATE_SSGT_SEARCH_STRING, payload: d.value })}
							/>
						</Grid.Column>
						<Grid.Column>
							<Tooltip
								content={tooltipContent.searchSSGTButton}
								position='top center'
								inverted={true}
								trigger={
									<Button
										content={isLoadingActive ? 'Searching ...' : 'Search'}
										className='primaryButton'
										onClick={async () => {
											handleResetSearch();
											await handleSSGTSearchSubmit();
										}}
									/>
								}
							/>
							<Tooltip
								content={tooltipContent.searchCommonComponentsButton}
								position='top center'
								inverted={true}
								trigger={
									<Button
										content='Search Common Components'
										className='primaryButton'
										onClick={async () => {
											handleResetSearch();
											await handleCommonComponentsSearchSubmit();
										}}
									/>
								}
							/>
						</Grid.Column>
					</Grid>
					<Message warning header='No Results' content='No results found with these parameters. Please try another search.' />
					<LoaderModal active={isLoadingActive} text={'Loading results...'} />
				</Form>

				{ssgtResults.length > 0 && !isLoadingActive ? (
					<>
						<LoaderModal active={isMappingActive} text={'Mapping elements...'} />
						<Table celled striped selectable>
							<Table.Header>
								<Table.Row>
									<Table.HeaderCell colSpan={6}>{tableTitle}</Table.HeaderCell>
								</Table.Row>
								<Table.Row>
									<Table.HeaderCell>Select to Map</Table.HeaderCell>
									<Table.HeaderCell>Prefix</Table.HeaderCell>
									{renderUncommonHeaders()}
									<Table.HeaderCell>Definition</Table.HeaderCell>
								</Table.Row>
							</Table.Header>
							<Table.Body>{renderRows()}</Table.Body>
						</Table>
					</>
				) : null}
			</Modal.Content>
			<Modal.Actions>
				{selectedRowData !== '' ? (
					<Message info>
						<Message.Header>{mapMessageTitle}</Message.Header>
						Map '{selectedRowData.prefix}
						{searchType !== 'Namespace' ? ':' + selectedRowData.name : null}' to '{propertyToMap}'?
					</Message>
				) : null}
				<Button className='primaryButton' onClick={handleMapSubmit} disabled={selectedRowData === ''}>
					Map
				</Button>
				<Button className='secondaryButton' onClick={handleCancel} disabled={isLoadingActive}>
					Cancel
				</Button>
			</Modal.Actions>
		</Modal>
	);
};

export default SSGTMappingModal;
