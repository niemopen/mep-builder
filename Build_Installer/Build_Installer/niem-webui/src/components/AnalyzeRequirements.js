import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, Button, Card, Radio, Container, Divider, Dropdown, Grid, Segment } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { ParseExcel } from '../Util/MappingDocumentUtil';
import { artifactTags, getFilesByTag } from '../Util/ArtifactTreeUtil';
import MappingGrid from '../Shared/MappingGrid';
import UploadCard from '../Shared/UploadCard';
import CustomMappingSpreadSheetModal from '../Shared/CustomMappingSheetModal';
import { loadMappingSpreadsheetFile } from '../Util/UploadFileUtil';
import { clearValidationResults } from '../Util/ValidationUtil';

const AnalyzeRequirements = () => {
	const dispatch = useDispatch();
	const [isMappingDocLoadButtonActive, setIsMappingDocLoadButtonActive] = useState(false);
	const infoAccordionOpen = useSelector((state) => state.analyze.infoAccordionOpen);
	const artifactTree = useSelector((state) => state.artifact.treeItems);
	const artifactTreeStr = JSON.stringify(artifactTree);
	const [toggleImportOptions, setToggleImportOptions] = useState(false);
	const [selectedImportMapSheet, setSelectedImportMapSheet] = useState({});
	const [niemSpreadsheet, setNiemSpreadsheet] = useState(true);
	const [spreadsheetOptions, setSpreadsheetOptions] = useState([]);

	const getMappingOptions = useCallback(() => {
		const mappingOptions = [{ key: 0, text: '-', value: 0, id: '' }];
		const files = getFilesByTag(JSON.parse(artifactTreeStr), artifactTags.mappingSpreadsheet);

		files.forEach((file, i) => {
			// increasing i by 1 because mappingOptions is initiated with an object with an index of 0
			mappingOptions.push({ key: i + 1, text: file.label, value: i + 1, id: file.fileBlobId });
		});
		return mappingOptions;
	}, [artifactTreeStr]); // string used to update each time a change occurs

	// Ensures every uploaded mapping spreadsheet is populated properly into dropdown
	useEffect(() => {
		const options = getMappingOptions();
		setSpreadsheetOptions(options);
	}, [getMappingOptions]);

	const showMoreLessInfo = [
		{
			active: infoAccordionOpen,
			title: infoAccordionOpen ? 'Show Less' : 'Show More',
			content: [
				<Grid.Row>
					<Segment>
						<Grid columns='two' divided>
							<Grid.Column>
								<h3>
									In this phase, the information exchange scenario will be broken down into finer detail to understand the data
									requirements.
								</h3>
							</Grid.Column>
							<Grid.Column>
								<p>
									Define your business rules and requirements, which define the exchange, as well as the expectations of the
									exchange.
								</p>
							</Grid.Column>
						</Grid>
					</Segment>
					<Divider hidden />
				</Grid.Row>,
				<Grid.Row>
					<p>
						In this phase, you may upload supporting documentation as well as begin to document data requirements. To assist in the
						collection of these data requirements, you may utilize any of the following methods:
					</p>
					<ul>
						<li key={0}>Download a standardized data mapping spreadsheet to record data requirements</li>
						<li key={1}>Import data requirements from a standardized data mapping spreadsheet</li>
						<li key={2}>Enter data requirements via an online form or table</li>
					</ul>
				</Grid.Row>,
			],
		},
	];

	const handleImportMapSheetDropDownChange = (selectedMappingOption) => {
		// update variable with name of chosen spreadsheet to track which mapping spreadsheet will be loaded
		setSelectedImportMapSheet({
			name: selectedMappingOption.options[selectedMappingOption.value].text,
			id: selectedMappingOption.options[selectedMappingOption.value].id,
		});

		// If a valid mapping spreadsheet is selected, enable Load button
		// Otherwise, if empty option is selected, disable load button
		if (selectedMappingOption.value > 0) {
			setIsMappingDocLoadButtonActive(true);
		} else {
			setIsMappingDocLoadButtonActive(false);
		}
	};

	async function handleLoadMappingSpreadsheet() {
		const fileBuff = await loadMappingSpreadsheetFile(selectedImportMapSheet.id);

		// only parse file if error hasn't occurred
		if (fileBuff) {
			ParseExcel(fileBuff);
		}
	}

	return (
		<>
			<CustomMappingSpreadSheetModal header={'Map Custom Headers - ' + selectedImportMapSheet.name} customSheet={selectedImportMapSheet} />
			<Grid className='contentPage' columns='two'>
				<Grid.Row>
					<Grid.Column width='4' textAlign='center'>
						<UploadCard cardName='Data Requirements' />
					</Grid.Column>
					<Grid.Column width='12'>
						<Grid className='infoBox'>
							<Grid.Row>
								<Grid.Column width='10'>
									<h2>Analyze Requirements</h2>
								</Grid.Column>
							</Grid.Row>
							<Grid.Row>
								<Grid.Column>
									<Accordion
										as={Container}
										panels={showMoreLessInfo}
										onClick={() =>
											dispatch({
												type: actionTypes.ANALYZE_INFO_BANNER_SHOW_LESS,
											})
										}
									></Accordion>
								</Grid.Column>
							</Grid.Row>
						</Grid>
					</Grid.Column>
				</Grid.Row>
				<Divider hidden />
				<Grid.Row columns='1'>
					<Dropdown
						text='Import Mapping Spreadsheet'
						floating
						button
						direction='left'
						className=' primaryButton MappingSpreadsheetMenu'
						onClick={(e) => {
							setToggleImportOptions(true);
							clearValidationResults();
						}}
					>
						<Dropdown.Menu position='right' open={toggleImportOptions} onMouseLeave={() => setToggleImportOptions(false)}>
							<Card>
								<Card.Content>
									<Dropdown
										fluid
										options={spreadsheetOptions}
										selection
										direction='left'
										className='MappingSpreadsheetOptions'
										placeholder=''
										onChange={(e, d) => handleImportMapSheetDropDownChange(d)}
									/>
								</Card.Content>
								<Card.Content>
									<Radio
										label='NIEM Mapping Spreadsheet'
										name='niem'
										value='true'
										checked={niemSpreadsheet}
										onChange={() => setNiemSpreadsheet(true)}
									/>
									<br />
									<Radio
										label='Custom Mapping Spreadsheet'
										name='custom'
										value='false'
										checked={!niemSpreadsheet}
										onChange={() => setNiemSpreadsheet(false)}
									/>
								</Card.Content>
								<Card.Content textAlign='center'>
									<Button
										className={`primaryButton ${isMappingDocLoadButtonActive ? '' : 'disabled'}`}
										onClick={
											niemSpreadsheet
												? handleLoadMappingSpreadsheet
												: () =>
														dispatch({
															type: actionTypes.CUSTOM_MAPPING_SPREADSHEET_OPEN,
														})
										}
									>
										Load
									</Button>
								</Card.Content>
							</Card>
						</Dropdown.Menu>
					</Dropdown>
				</Grid.Row>
				<Grid.Row columns='1'>
					<Grid.Column>
						<MappingGrid />
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</>
	);
};

export default AnalyzeRequirements;
