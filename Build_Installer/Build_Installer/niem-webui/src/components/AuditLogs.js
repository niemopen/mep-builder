import { React, useEffect, useState, useCallback } from 'react';
import { Modal, Button, Form, Menu, Grid, Segment, Icon, Divider } from 'semantic-ui-react';
import MaterialTable from 'material-table';
import { TableIcons } from '../Shared/MaterialTableGridSettings';
import { isStringFieldValid } from '../Util/FieldValidationUtil';
import * as httpStatus from 'http-status';
import { getActivityLogApi, getErrorLogApi } from '../Util/AdminModuleUtil';

const AuditLogs = () => {
	const initialFilters = {
		dateRange: 'today',
		startDate: new Date(),
		endDate: new Date(),
		eventType: '',
		collection: '',
		modifiedData: '',
		originalData: '',
		eventStatus: '',
		eventStatusSummary: '',
		eventDescription: '',
		email: '',
	};

	// used for setting default values for custom date field; form: YYYY-MM-DD
	const todaysDateYYYYMMDD = `${initialFilters.endDate.getFullYear()}-${
		initialFilters.endDate.getMonth() + 1 <= 9 // Date months are zero-indexed; add 1
			? `0${initialFilters.endDate.getMonth() + 1}` // single digit months need a leading zero
			: `${initialFilters.endDate.getMonth() + 1}`
	}-${
		initialFilters.endDate.getDate() <= 9
			? `0${initialFilters.endDate.getDate()}` // single digit dates need a leading zero
			: `${initialFilters.endDate.getDate()}`
	}`;

	// data structure to map Audit Log tabs to numeric index
	const auditLogTabs = {
		activityLog: 0,
		errorLog: 1,
	};

	const [detailsModalData, setDetailsModalData] = useState({}); // contains rowData to display in event details modal
	const [eventDetailsModalOpen, setEventDetailsModalOpen] = useState(false); // flag to display event details modal
	const [activeTabIndex, setActiveTabIndex] = useState(auditLogTabs.activityLog); // tracks active tab index
	const [filtersCollapsed, setFiltersCollapsed] = useState(false); // flag to display filter options
	const [activityLogData, setActivityLogData] = useState([]); // contains fetched activity log data for table
	const [errorLogData, setErrorLogData] = useState([]); // contains fetched error log data for table
	const [loadingModalActive, setLoadingModalActive] = useState(false); // flag for loading results
	const [unappliedFiltersExist, setUnappliedFiltersExist] = useState(false); // flag to communicate unapplied filters
	const [applyFilters, setApplyFilters] = useState(true); // flag to update rendered results
	const [httpStatusOptions, setHttpStatusOptions] = useState([]); // contains list of error status options for dropdown
	const [minEndDate, setMinEndDate] = useState(null); // contains dynamic minimum custom end date (cannot precede custom start date)
	const [maxStartDate, setMaxStartDate] = useState(todaysDateYYYYMMDD); // contains dynamic maximum custom start date (cannot exceed custom end date)
	const [filterOptions, setFilterOptions] = useState(initialFilters); // contains selected filter options to build DB queries and filter fetched data

	// fetches and filters activity and error log data; reevaluates when filter options change
	const filterTableData = useCallback(async () => {
		// build query for activity log
		const activityLogFilterQuery = {};
		activityLogFilterQuery['event_date'] = {
			$gte: new Date(filterOptions.startDate.getFullYear(), filterOptions.startDate.getMonth(), filterOptions.startDate.getDate()),
			// add one to end date to encompass all possible times in the selected date
			$lt: new Date(filterOptions.endDate.getFullYear(), filterOptions.endDate.getMonth(), filterOptions.endDate.getDate() + 1),
		};
		if (isStringFieldValid(filterOptions.eventType)) {
			activityLogFilterQuery['event_type'] = filterOptions.eventType;
		}
		if (isStringFieldValid(filterOptions.collection)) {
			activityLogFilterQuery['collection_name'] = filterOptions.collection;
		}
		if (isStringFieldValid(filterOptions.email)) {
			activityLogFilterQuery['email'] = filterOptions.email;
		}

		// query activity log data
		let queriedFilteredActivityLogData;
		const activityLogResult = await getActivityLogApi(activityLogFilterQuery);
		if (activityLogResult) {
			// filter further with text input fields (excluding email)
			queriedFilteredActivityLogData = activityLogResult.filter(
				(entry) =>
					JSON.stringify(entry.modifiedData).toLowerCase().includes(filterOptions.modifiedData.toLowerCase()) &&
					JSON.stringify(entry.originalData).toLowerCase().includes(filterOptions.originalData.toLowerCase())
			);
		} else {
			// error occurred while fetching activity log
			queriedFilteredActivityLogData = [];
		}

		// build query for error log
		const errorLogFilterQuery = {};
		errorLogFilterQuery['event_date'] = {
			$gte: new Date(filterOptions.startDate.getFullYear(), filterOptions.startDate.getMonth(), filterOptions.startDate.getDate()),
			// add one to end date to encompass all possible times in the selected date
			$lt: new Date(filterOptions.endDate.getFullYear(), filterOptions.endDate.getMonth(), filterOptions.endDate.getDate() + 1),
		};
		if (isStringFieldValid(filterOptions.eventStatus)) {
			errorLogFilterQuery['event_status'] = filterOptions.eventStatus;
		}
		if (isStringFieldValid(filterOptions.email)) {
			errorLogFilterQuery['email'] = filterOptions.email;
		}

		// query error log data
		let queriedFilteredErrorLogData;
		const errorLogResult = await getErrorLogApi(errorLogFilterQuery);
		if (errorLogResult) {
			// filter further with text input fields (excluding email)
			queriedFilteredErrorLogData = errorLogResult.filter((entry) => {
				entry['eventStatusSummary'] = httpStatus[entry.eventStatus];
				if (
					entry.eventStatusSummary.toLowerCase().includes(filterOptions.eventStatusSummary.toLowerCase()) &&
					JSON.stringify(entry.eventDescription).toLowerCase().includes(filterOptions.eventDescription.toLowerCase())
				) {
					return entry;
				} else {
					return null;
				}
			});
		} else {
			// error occurred while fetching error log
			queriedFilteredErrorLogData = [];
		}
		// reset unapplied filter message
		setUnappliedFiltersExist(false);
		return { activityLogData: queriedFilteredActivityLogData, errorLogData: queriedFilteredErrorLogData };
	}, [
		filterOptions.collection,
		filterOptions.email,
		filterOptions.endDate,
		filterOptions.eventDescription,
		filterOptions.eventStatus,
		filterOptions.eventStatusSummary,
		filterOptions.eventType,
		filterOptions.modifiedData,
		filterOptions.originalData,
		filterOptions.startDate,
	]);

	// used to define dropdown options for Event Status filter
	const generateErrorStatusOptions = () => {
		const statuses = [{ key: '', value: '', text: '' }];
		for (var i = 400; i < 600; i++) {
			// error status codes are in the range 400-599
			if (!!httpStatus[i]) {
				statuses.push({
					key: `${i}${httpStatus[i]}`, // used to search and filter dropdown options
					value: `${i}`,
					text: (
						<div key={`${i}${httpStatus[i]}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
							<span>{i}</span>
							<span>({httpStatus[i]})</span>
						</div>
					),
				});
			}
		}
		setHttpStatusOptions(statuses);
	};

	// runs when rendered results need to be updated
	useEffect(() => {
		async function filterData() {
			setLoadingModalActive(true);
			const { activityLogData, errorLogData } = await filterTableData();
			setLoadingModalActive(false);
			setActivityLogData(activityLogData);
			setErrorLogData(errorLogData);
		}
		if (applyFilters) {
			filterData();
			generateErrorStatusOptions();
			setApplyFilters(false);
		}
	}, [filterTableData, applyFilters]);

	// resets filter options to initial values
	const resetFilterOptions = () => {
		setFilterOptions(initialFilters);
		setUnappliedFiltersExist(true);
	};

	// used to define the dropdown options for date range filter
	const dateRangeOptions = [
		{ key: 'today', value: 'today', text: 'Today' },
		{ key: 'this week', value: 'this week', text: 'This week' },
		{ key: 'last week', value: 'last week', text: 'Last week' },
		{ key: 'last month', value: 'last month', text: 'Last month' },
		{ key: 'custom', value: 'custom', text: 'Custom' },
	];

	// used to define dropdown options for event type filter
	const eventTypeOptions = [
		{ key: '', value: '', text: '' },
		{ key: 'create', value: 'create', text: 'create' },
		{ key: 'update', value: 'update', text: 'update' },
		{ key: 'delete', value: 'delete', text: 'delete' },
		// read events aren't logged
	];

	// used to define dropdown options for collection filter
	const collectionOptions = [
		{ key: '', value: '', text: '' },
		{ key: 'artifacttrees', value: 'artifacttrees', text: 'artifacttrees' },
		{ key: 'auditlogs', value: 'auditlogs', text: 'auditlogs' },
		{ key: 'errorlogs', value: 'errorlogs', text: 'errorlogs' },
		{ key: 'fileblobs', value: 'fileblobs', text: 'fileblobs' },
		{ key: 'mappingdocs', value: 'mappingdocs', text: 'mappingdocs' },
		{ key: 'packages', value: 'packages', text: 'packages' },
		{ key: 'users', value: 'users', text: 'users' },
		// includes all DB collections not associated with NIEM data
	];

	// sets the appropriate start and end time when Date Range field changes
	const updateStartEndDates = (dateRange) => {
		let updatedStartDate = new Date();
		let updatedEndDate = new Date();
		const thisYear = updatedStartDate.getFullYear();

		// used to determine the number of days in each month; months are zero-indexed
		const daysInMonth = {
			0: 31, // January
			1: thisYear % 4 === 0 ? 28 : 29, // February; mod 4 to account for leap year
			2: 31, // March
			3: 30, // April
			4: 31, // May
			5: 30, // June
			6: 31, // July
			7: 31, // August
			8: 30, // September
			9: 31, // October
			10: 30, // November
			11: 31, // December
		};

		// start and end date are Date objects
		switch (dateRange) {
			case 'this week':
				// subtract 7 days worth of milliseconds from the current timestamp
				// (7 days * 24 hrs / day * 60 min / hr * 60 sec / min * 1000 ms / sec)
				updatedStartDate = new Date(updatedStartDate.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case 'last week':
				// subtract 14 days worth of milliseconds from the current timestamp for start date
				// subtract 7 days worth of milliseconds from the current timestamp for end date
				// (7 days * 24 hrs / day * 60 min / hr * 60 sec / min * 1000 ms / sec)
				updatedStartDate = new Date(updatedStartDate.getTime() - 14 * 24 * 60 * 60 * 1000);
				updatedEndDate = new Date(updatedEndDate.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case 'last month':
				// subtract the number of days in last month worth of milliseconds from the current timestamp
				// (daysInLastMonth * 24 hrs / day * 60 min / hr * 60 sec / min * 1000 ms / sec) = current date in last month
				updatedStartDate = new Date(updatedStartDate.getTime() - daysInMonth[(updatedStartDate.getMonth() - 1) % 12] * 24 * 60 * 60 * 1000);
				break;
			default:
			//do nothing
		}

		// update selected filter options
		setFilterOptions({
			...filterOptions,
			dateRange: dateRange,
			startDate: updatedStartDate,
			endDate: updatedEndDate,
		});
		setUnappliedFiltersExist(true);
	};

	// parses form-generated date string into Date object
	const parseFormDateString = (dateString) => {
		// form-generated date string is in the format: yyyy-mm-dd
		const splitDateString = dateString.split('-');
		const selectedYear = Number.parseInt(splitDateString[0]);
		const selectedMonth = Number.parseInt(splitDateString[1]) - 1; // months for Date are zero-indexed
		const selectedDate = Number.parseInt(splitDateString[2]);
		return new Date(selectedYear, selectedMonth, selectedDate);
	};

	// Modal component for event details
	const EventDetailsModal = ({ rowData }) => {
		return (
			<Modal open={eventDetailsModalOpen}>
				<Modal.Header>{activeTabIndex === auditLogTabs.activityLog ? 'Activity Event Details' : 'Error Event Details'}</Modal.Header>
				<Modal.Content>
					{activeTabIndex === auditLogTabs.activityLog ? (
						<>
							{/* Activity log event details modal content */}
							<p style={{ marginBottom: '1px' }}>
								<strong>Date/Time</strong>:&emsp;{rowData.dateTime ? rowData.dateTime : ''}
							</p>
							<p style={{ marginBottom: '1px' }}>
								<strong>Event Type</strong>:&ensp;&nbsp;&nbsp;{rowData.eventType ? rowData.eventType : ''}
							</p>
							<p style={{ marginBottom: '1px' }}>
								<strong>Collection</strong>:&emsp;&nbsp;{rowData.collection ? rowData.collection : ''}
							</p>
							<p style={{ marginBottom: '1px' }}>
								<strong>User</strong>:&ensp;&emsp;&emsp;&emsp;&nbsp;
								{rowData.email ? rowData.email : ''}
							</p>
						</>
					) : (
						<>
							{/* Error log event details modal content */}
							<p style={{ marginBottom: '1px' }}>
								<strong>Date/Time</strong>:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;{rowData.dateTime ? rowData.dateTime : ''}
							</p>
							<p style={{ marginBottom: '1px' }}>
								<strong>Event Status</strong>:&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;&nbsp;
								{rowData.eventStatus ? rowData.eventStatus : ''}
							</p>
							<p style={{ marginBottom: '1px' }}>
								<strong>Event Status Summary</strong>:&emsp;&nbsp;{rowData.eventStatusSummary ? rowData.eventStatusSummary : ''}
							</p>
							<p style={{ marginBottom: '1px' }}>
								<strong>User</strong>:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;
								{rowData.email ? rowData.email : ''}
							</p>
						</>
					)}

					<br />
					<Grid>
						{activeTabIndex === auditLogTabs.activityLog ? (
							<>
								{/* Activity log event data modal content */}
								<Grid.Row>
									<div>
										<strong>Modified Data</strong>:
									</div>
									<Segment className='activityEventDetailsData'>{rowData.modifiedData}</Segment>
								</Grid.Row>
								<Grid.Row>
									<div>
										<strong>Original Data</strong>:
									</div>
									<Segment className='activityEventDetailsData'>{rowData.originalData}</Segment>
								</Grid.Row>
							</>
						) : (
							<>
								{/* Error log event data modal content */}
								<Grid.Row>
									<div>
										<strong>Event Description:</strong>
									</div>
									<Segment className='errorEventDetailsData'>{rowData.eventDescription}</Segment>
								</Grid.Row>
							</>
						)}
					</Grid>
				</Modal.Content>
				<Modal.Actions>
					<Button className='primaryButton' onClick={() => setEventDetailsModalOpen(false)}>
						Close
					</Button>
				</Modal.Actions>
			</Modal>
		);
	};

	// start audit logs component
	return (
		<>
			<EventDetailsModal rowData={detailsModalData} />
			<Grid>
				<Grid.Column width={2}>
					<Menu fluid vertical tabular>
						{/* Selectable Audit Log tabs */}
						<Menu.Item
							index={auditLogTabs.activityLog}
							active={activeTabIndex === auditLogTabs.activityLog}
							onClick={() => setActiveTabIndex(auditLogTabs.activityLog)}
						>
							<strong>Activity Log</strong>
						</Menu.Item>
						<Menu.Item
							index={auditLogTabs.errorLog}
							active={activeTabIndex === auditLogTabs.errorLog}
							onClick={() => setActiveTabIndex(auditLogTabs.errorLog)}
						>
							<strong>Error Log</strong>
						</Menu.Item>
					</Menu>
				</Grid.Column>
				<Grid.Column width={14}>
					<Grid>
						<Grid.Column>
							<Grid.Row>
								<Segment fluid style={{ backgroundColor: '#f2f2f2f2' }}>
									{/* Filter menu header */}
									<div className='AuditLogFilters' style={{ display: 'flex', justifyContent: 'space-between' }}>
										<strong>Filters</strong>
										<span>
											<Button
												className='auditLog-filter-showmore-button'
												onClick={() => setFiltersCollapsed(!filtersCollapsed)}
											>
												<Icon name={filtersCollapsed ? 'caret down' : 'caret up'} />{' '}
												{filtersCollapsed ? 'Expand' : 'Collpase'}
											</Button>
										</span>
									</div>
									{!filtersCollapsed ? (
										<>
											{/* Start filter options */}
											<Form fluid>
												<Form.Group widths={2}>
													{/* Date Range filter field */}
													<Form.Select
														className='auditLogSelect'
														label='Date Range'
														options={dateRangeOptions}
														defaultValue='today'
														value={filterOptions['dateRange']}
														onChange={(e, d) => {
															updateStartEndDates(d.value);
														}}
													/>
													{filterOptions['dateRange'] === 'custom' ? (
														<>
															{/* Start Date filter field */}
															<Form.Input
																label='Start Date'
																type='date'
																// default value for date input should be in the form: yyyy-mm-dd
																defaultValue={todaysDateYYYYMMDD}
																max={maxStartDate}
																onChange={(e, d) => {
																	const parsedDate = parseFormDateString(d.value);
																	setFilterOptions({ ...filterOptions, startDate: parsedDate });
																	setMinEndDate(d.value);
																	setUnappliedFiltersExist(true);
																}}
															/>
															{/* End Date filter field */}
															<Form.Input
																label='End Date'
																type='date'
																// default value for date input should be in the form: yyyy-mm-dd
																defaultValue={todaysDateYYYYMMDD}
																max={todaysDateYYYYMMDD}
																min={minEndDate}
																onChange={(e, d) => {
																	const parsedDate = parseFormDateString(d.value);
																	setFilterOptions({ ...filterOptions, endDate: parsedDate });
																	setMaxStartDate(d.value);
																	setUnappliedFiltersExist(true);
																}}
															/>
														</>
													) : null}
													{activeTabIndex === auditLogTabs.activityLog ? (
														<>
															{/* Activity Log specific filter options */}
															{/* Event Type filter field */}
															<Form.Select
																className='auditLogSelect'
																label='Event Type'
																value={filterOptions['eventType']}
																options={eventTypeOptions}
																onChange={(e, d) => {
																	setFilterOptions({ ...filterOptions, eventType: d.value });
																	setUnappliedFiltersExist(true);
																}}
															/>
															{/* Collection filter field */}
															<Form.Select
																className='auditLogSelect'
																label='Collection'
																search
																value={filterOptions['collection']}
																options={collectionOptions}
																onChange={(e, d) => {
																	setFilterOptions({ ...filterOptions, collection: d.value });
																	setUnappliedFiltersExist(true);
																}}
															/>
															{/* Modified Date filter field */}
															<Form.Input
																label='Modified Data'
																placeholder='contains'
																value={filterOptions['modifiedData']}
																onChange={(e, d) => {
																	setFilterOptions({ ...filterOptions, modifiedData: d.value });
																	setUnappliedFiltersExist(true);
																}}
															/>
															{/* Original Data filter field */}
															<Form.Input
																label='Original Data'
																placeholder='contains'
																value={filterOptions['originalData']}
																onChange={(e, d) => {
																	setFilterOptions({ ...filterOptions, originalData: d.value });
																	setUnappliedFiltersExist(true);
																}}
															/>
														</>
													) : (
														<>
															{/* Error Log specific filter options */}
															{/* Event Status filter field */}
															<Form.Select
																className='auditLogSelect'
																label='Event Status'
																search={(e, d) => {
																	// search filter options based on key instead of text
																	const currentOptions = httpStatusOptions;
																	return currentOptions.filter((option) => {
																		if (option.key.toLowerCase().includes(d.toLowerCase())) {
																			return option;
																		} else {
																			return null;
																		}
																	});
																}}
																options={httpStatusOptions}
																value={filterOptions['eventStatus']}
																text={filterOptions['eventStatus']}
																onChange={(e, d) => {
																	// automatically populate Event Status Summary based on selected Event Status
																	const eventStatusSummary = d.value !== '' ? httpStatus[d.value] : '';
																	setFilterOptions({ ...filterOptions, eventStatus: d.value, eventStatusSummary });
																	setUnappliedFiltersExist(true);
																}}
															/>
															{/* Event Status Summary filter field */}
															<Form.Input
																label='Event Status Summary'
																value={filterOptions['eventStatusSummary']}
																placeholder='contains'
																onChange={(e, d) => {
																	setFilterOptions({ ...filterOptions, eventStatusSummary: d.value });
																	setUnappliedFiltersExist(true);
																}}
															/>
															{/* Event Description filter field */}
															<Form.Input
																label='Event Description'
																placeholder='contains'
																value={filterOptions['eventDescription']}
																onChange={(e, d) => {
																	setFilterOptions({ ...filterOptions, eventDescription: d.value });
																	setUnappliedFiltersExist(true);
																}}
															/>
														</>
													)}
													{/* Email filter field */}
													<Form.Input
														label='Email'
														placeholder='search users'
														value={filterOptions['email']}
														onChange={(e, d) => {
															setFilterOptions({ ...filterOptions, email: d.value });
															setUnappliedFiltersExist(true);
														}}
													/>
												</Form.Group>
												<div style={{ display: 'flex', justifyContent: 'space-between' }}>
													{/* Unapplied filter notification */}
													<span style={{ color: '#0000008f' }}>
														{unappliedFiltersExist ? (
															<>
																<Icon name='circle info' /> Click 'Apply' to filter results
															</>
														) : (
															''
														)}
													</span>
													{/* Filter action buttons */}
													<span>
														<Button
															className='primaryButton'
															size='tiny'
															content='Apply'
															onClick={() => setApplyFilters(true)}
														/>
														<Button
															className='secondaryButton'
															size='tiny'
															content='Reset'
															onClick={resetFilterOptions}
														/>
													</span>
												</div>
											</Form>
											{/* End filter options */}
										</>
									) : null}
								</Segment>
							</Grid.Row>
							<Divider hidden />
							<Grid.Row>
								{/* Start data table */}
								<MaterialTable
									title={
										//
										activeTabIndex === auditLogTabs.activityLog ? 'Activity Log' : 'Error Log'
									}
									isLoading={loadingModalActive}
									icons={TableIcons}
									columns={
										activeTabIndex === auditLogTabs.activityLog
											? [
													// Activity log columns
													{
														title: 'Date/Time',
														field: 'dateTime',
														customSort: (d1, d2) => {
															// sort dates chronologically
															const date1 = new Date(d1.dateTime);
															const date2 = new Date(d2.dateTime);
															return date1 > date2 ? 1 : date1 < date2 ? -1 : 0;
														},
														defaultSort: 'desc', // most recent events appear on top by default
													},
													{
														title: 'Event Type',
														field: 'eventType',
													},
													{
														title: 'Collection',
														field: 'collection',
													},
													{
														title: 'Modified Data',
														field: 'modifiedData',
														render: (rowData) => (
															<div
																style={{
																	display: '-webkit-box',
																	WebkitBoxOrient: 'vertical',
																	WebkitLineClamp: 3,
																	textOverflow: 'ellipsis',
																	overflow: 'hidden',
																	overflowWrap: 'break-word',
																	maxWidth: '30ch',
																}}
															>
																{rowData.modifiedData}
															</div>
														),
													},
													{
														title: 'Original Data',
														field: 'originalData',
														render: (rowData) => (
															<div
																style={{
																	display: '-webkit-box',
																	WebkitBoxOrient: 'vertical',
																	WebkitLineClamp: 3,
																	textOverflow: 'ellipsis',
																	overflow: 'hidden',
																	overflowWrap: 'break-word',
																	maxWidth: '30ch',
																}}
															>
																{rowData.originalData}
															</div>
														),
													},
													{
														title: 'Email',
														field: 'email',
													},
											  ]
											: [
													// Error log columns
													{
														title: 'Date/Time',
														field: 'dateTime',
														customSort: (d1, d2) => {
															// sort dates chronologically
															const date1 = new Date(d1.dateTime);
															const date2 = new Date(d2.dateTime);
															return date1 > date2 ? 1 : date1 < date2 ? -1 : 0;
														},
														defaultSort: 'desc', // most recent events appear on top by default
													},
													{
														title: 'Event Status',
														field: 'eventStatus',
													},
													{
														title: 'Event Status Summary',
														field: 'eventStatusSummary',
													},
													{
														title: 'Event Description',
														field: 'eventDescription',
														render: (rowData) => (
															<div
																style={{
																	display: '-webkit-box',
																	WebkitBoxOrient: 'vertical',
																	WebkitLineClamp: 3,
																	textOverflow: 'ellipsis',
																	overflow: 'hidden',
																	overflowWrap: 'break-word',
																	maxWidth: '60ch',
																}}
															>
																{rowData.eventDescription}
															</div>
														),
													},
													{
														title: 'Email',
														field: 'email',
													},
											  ]
									}
									actions={[
										{
											icon: () => <Button className='secondaryButton' content='View' />,
											isCustom: true,
											onClick: (e, rowData) => {
												setDetailsModalData(rowData);
												setEventDetailsModalOpen(true);
											},
										},
									]}
									data={activeTabIndex === auditLogTabs.activityLog ? activityLogData : errorLogData}
									options={{
										columnsButton: false,
										draggable: false,
										exportButton: true,
										exportAllData: true,
										exportFileName:
											// creation date in format: MM-DD-YYYY
											activeTabIndex === auditLogTabs.activityLog
												? `Activity_Log_${new Date().toDateString().substring(4).replaceAll(' ', '-')}`
												: `Error_Log_${new Date().toDateString().substring(4).replaceAll(' ', '-')}`,
										exportPdf: () => {
											// data format not readable in PDF
											alert('Export as PDF not available for Audit Logs.');
										},
										filtering: false,
										maxBodyHeight: filtersCollapsed ? 480 : 360,
										minBodyHeight: 100,
										padding: 'dense',
										paging: true,
										pageSize: 10,
										rowStyle: (rowData, index) => {
											if (index % 2 === 0) {
												return { backgroundColor: '#f2f2f2f2' };
											}
										},
										search: false,
										sorting: true,
										showFirstLastPageButtons: false,
										showTitle: false,
										toolbarButtonAlignment: 'left',
										thirdSortClick: false,
									}}
								/>
								{/* End data table */}
							</Grid.Row>
						</Grid.Column>
					</Grid>
				</Grid.Column>
			</Grid>
		</>
	);
};

export default AuditLogs;
