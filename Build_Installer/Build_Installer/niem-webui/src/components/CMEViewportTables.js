import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Accordion, Button, Table, Icon, Grid, Message } from 'semantic-ui-react';
import { createCodeImportReportFile, fieldNames } from '../Util/CMEBuilderUtil';
import {
	handleDeleteElementFromViewport,
	handleDeleteCodeItemFromViewport,
	handleDeleteContainerElementParentFromViewport,
	handleDeleteContainerElementChildFromViewport,
} from '../Util/CMEBuilderUtil';
import configData from '.././config/config.json';

export const CMEDataElementsViewportTable = (props) => {
	const dispatch = useDispatch();
	const cmeData = useSelector((state) => state.cme.cmeData);
	const isEditMode = useSelector((state) => state.cme.isEditMode);
	const existingFormData = useSelector((state) => state.cme.existingFormData);
	const existingCodeData = useSelector((state) => state.cme.existingCodeData);
	const isFullscreenModalOpen = useSelector((state) => state.cme.isFullscreenModalOpen);
	const [listOfDataElements, setListOfDataElements] = useState([]);
	const [dataElementActiveIndex, setDataElementActiveIndex] = useState();

	// checks cmeData's children, adds only dataElements to listOfDataElements
	useEffect(() => {
		let updatedListOfDataElements = [];
		cmeData.children.forEach((obj) => {
			if (obj.elementType === fieldNames.dataElement) {
				updatedListOfDataElements.push(obj);
			}
		});
		setListOfDataElements(updatedListOfDataElements);
	}, [cmeData]); // runs each time cmeData is updated

	function renderDataElementRows() {
		return listOfDataElements.map((obj, i) => {
			return (
				<Table.Row
					key={i}
					colSpan='3'
					active={
						isEditMode &&
						Object.values(existingFormData).length !== 0 &&
						i === dataElementActiveIndex &&
						existingFormData.elementName === obj.elementName
							? true
							: false
					}
				>
					<Table.Cell width='14'>
						{obj.elementLabel}:{obj.elementName}
					</Table.Cell>
					<Table.Cell
						selectable
						collapsing
						textAlign='center'
						width='1'
						/* if existingFormData contains data, the the form is in edit mode and the user is editing the "Code" viewport data. While editing that particular row, disable the 'edit' cell */
						disabled={
							isEditMode &&
							Object.values(existingFormData).length !== 0 &&
							obj.index === dataElementActiveIndex &&
							existingFormData.elementName === obj.elementName
								? true
								: false
						}
					>
						<span
							style={{ cursor: 'pointer' }}
							onClick={() => {
								setDataElementActiveIndex(obj.index); // set index for highliting the active row

								// clear out any existing "add codes" section field values - for the case of users having clicked to edit a code list item, and then selecting a different data element to edit
								if (Object.values(existingCodeData).length !== 0) {
									dispatch({
										type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CODE_DATA,
										payload: {},
									});
								}
								// enable edit mode and send latest data to be read in CMEBuilderModal.js file (replaces initial form values with dispatched data)
								dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_EDIT_MODE, payload: true });
								dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_FORM_DATA, payload: obj, index: obj['index'] });

								// if editMode is accessed while in fullscreen, close fullscreen modal
								if (isFullscreenModalOpen) {
									dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: false });
								}
							}}
						>
							<Icon
								name='pencil'
								/* if editing that particular row, disable the pencil icon */
								disabled={
									isEditMode &&
									Object.values(existingFormData).length !== 0 &&
									obj.index === dataElementActiveIndex &&
									existingFormData.elementName === obj.elementName
										? true
										: false
								}
							/>
						</span>
					</Table.Cell>
					<Table.Cell
						selectable
						collapsing
						textAlign='center'
						width='1'
						/* if editing that particular row, disable the 'delete' cell */
						disabled={
							isEditMode &&
							Object.values(existingFormData).length !== 0 &&
							obj.index === dataElementActiveIndex &&
							existingFormData.elementName === obj.elementName
								? true
								: false
						}
					>
						<span
							style={{ cursor: 'pointer' }}
							onClick={() => {
								handleDeleteElementFromViewport(obj); // see CMEBuilderUtil.js
							}}
						>
							<Icon
								name='trash'
								/* if editing that particular row, disable the trashcan icon */
								disabled={
									isEditMode &&
									Object.values(existingFormData).length !== 0 &&
									obj.index === dataElementActiveIndex &&
									existingFormData.elementName === obj.elementName
										? true
										: false
								}
							/>
						</span>
					</Table.Cell>
				</Table.Row>
			);
		});
	}

	return (
		<>
			{/* BEGIN VIEWPORT TABLE */}
			<Table striped className={props.className}>
				{/* Allows the table body to scroll when there are more than 4 items in the listOfDataElements array with the use of the 'scrollable' className stlying in App.css */}
				<Table.Header className={listOfDataElements.length > 4 ? 'scrollable' : 'nonScrollable'}>
					<Table.Row>
						<Table.HeaderCell width='14'>Name</Table.HeaderCell>
						<Table.HeaderCell width='1'>Edit</Table.HeaderCell>
						<Table.HeaderCell width='1'>Delete</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				{/* Allows the table body to scroll when there are more than 4 items in the listOfDataElements array with the use of the 'scrollable' className stlying in App.css */}
				<Table.Body className={listOfDataElements.length > 4 ? 'scrollable' : 'nonScrollable'}>{renderDataElementRows()}</Table.Body>

				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell colSpan='3'>
							<Grid columns={2}>
								<Grid.Row>
									<Grid.Column style={{ margin: 'auto' }}>
										<b>Total</b>: {listOfDataElements.length}
									</Grid.Column>
									<Grid.Column textAlign='right'>
										<Button
											basic
											icon
											className={isFullscreenModalOpen ? 'hiddenButton' : ''}
											onClick={() => {
												dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: true });
												dispatch({
													type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_VIEWPORT_TYPE,
													payload: fieldNames.dataElement,
												});
											}}
										>
											<Icon name='expand' />
											&nbsp; Fullscreen
										</Button>
									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>
		</>
	);
};

export const CMECodeViewportTable = (props) => {
	const dispatch = useDispatch();
	const isFullscreenModalOpen = useSelector((state) => state.cme.isFullscreenModalOpen);
	const listOfCodeObjs = useSelector((state) => state.cme.listOfCodeObjs); // listOfCodeObjs is a global temporary array that stores code as it's added via the form and is only utilized while completeing the CME Builder form.
	const showCodeImportFile = useSelector((state) => state.cme.showCodeImportFile);
	const isEditMode = useSelector((state) => state.cme.isEditMode);
	const existingCodeData = useSelector((state) => state.cme.existingCodeData);
	const [activeIndex, setActiveIndex] = useState();
	const cmeSourceCodeFile = useSelector((state) => state.cme.cmeSourceCodeFile);
	const codeImportSummary = useSelector((state) => state.cme.codeImportSummary);

	function renderCodeRows() {
		return listOfCodeObjs.map((row, i) => {
			return (
				<Table.Row key={i} active={isEditMode && Object.values(existingCodeData).length !== 0 && i === activeIndex ? true : false}>
					<Table.Cell width='14'>
						{row.codeKey}:{row.codeValue}
					</Table.Cell>
					<Table.Cell
						width='1'
						selectable
						collapsing
						textAlign='center'
						/* if existingCodeData contains data, the the form is in edit mode and the user is editing the "Code" viewport data. While editing that particular row, disable the 'edit' cell */
						disabled={Object.values(existingCodeData).length !== 0 && i === activeIndex ? true : false}
					>
						<span
							style={{ cursor: 'pointer' }}
							onClick={() => {
								row['index'] = i;
								setActiveIndex(i); // set index for highliting the active row

								// update "add codes" section of the form, with the data of the code item selected for edits
								dispatch({
									type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CODE_DATA,
									payload: { index: row.index, codeType: row.codeType, codeKey: row.codeKey, codeValue: row.codeValue },
								});

								// if editMode is accessed while in fullscreen, close fullscreen modal
								if (isFullscreenModalOpen) {
									dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: false });
								}
							}}
						>
							<Icon
								name='pencil'
								/* if editing that particular row, disable the pencil icon */
								disabled={Object.values(existingCodeData).length !== 0 && i === activeIndex ? true : false}
							/>
						</span>
					</Table.Cell>
					<Table.Cell
						width='1'
						selectable
						collapsing
						textAlign='center' /* if editing that particular row, disable the 'delete' cell icon */
						disabled={Object.values(existingCodeData).length !== 0 && i === activeIndex ? true : false}
					>
						<span
							style={{ cursor: 'pointer' }}
							onClick={() => {
								row['index'] = i;
								handleDeleteCodeItemFromViewport(row); // see CMEBuilderUtil.js
							}}
						>
							<Icon
								name='trash'
								/* if editing that particular row, disable the trashcan icon */
								disabled={Object.values(existingCodeData).length !== 0 && i === activeIndex ? true : false}
							/>
						</span>
					</Table.Cell>
				</Table.Row>
			);
		});
	}

	const handleMessageDismiss = () => {
		// return message to default values and hide message
		dispatch({ type: actionTypes.CME_CODE_IMPORT_SUMMARY, payload: { messageState: null, total: 0, imported: 0, unsuccessful: 0 } });
	};

	return (
		<>
			{/* displays file name of imported code list */}
			<Button
				basic
				className='resetCodeList'
				onClick={() => {
					dispatch({ type: actionTypes.UPDATE_CME_BUILDER_RESET_CODELIST_MODAL_OPEN, payload: true });
				}}
				visible={listOfCodeObjs.length > 0 ? 'true' : 'false'}
			>
				Reset Code List
			</Button>
			{showCodeImportFile ? (
				<>
					{codeImportSummary.messageState === 'warning' ? (
						<Message warning onDismiss={handleMessageDismiss} style={{ textAlign: 'center' }}>
							<Message.Header>Code List Import Summary</Message.Header>
							<p>Some/all codes could not be imported from this file.</p>
							<p>
								<b>Total:</b> {codeImportSummary.total}
							</p>
							<p>
								<b>Imported:</b> {codeImportSummary.imported}
							</p>
							<p>
								<b>Unsuccessful:</b> {codeImportSummary.unsuccessful}
							</p>
							<p>
								To download a copy of the Code List Import results, please click &nbsp;
								<span className='basicLinkWithColor' onClick={createCodeImportReportFile}>
									here
								</span>
							</p>
							{codeImportSummary.unsuccessful > 0 ? (
								<p>
									Some codes did not import successfully. Visit{' '}
									<a
										href={
											configData.niemReferenceBaseURL +
											'specification/naming-and-design-rules/5.0/niem-ndr-5.0.html#section_10.2.4'
										}
										className='basicLink'
										target='_blank'
										rel='noreferrer'
									>
										NDR Guidelines
									</a>{' '}
									for more information.
								</p>
							) : null}
						</Message>
					) : codeImportSummary.messageState === 'success' ? (
						<Message success onDismiss={handleMessageDismiss} style={{ textAlign: 'center' }}>
							<Message.Header>Code List Import Summary</Message.Header>
							<p>All codes were imported successfully.</p>
							<p>
								<b>Total:</b> {codeImportSummary.total}
							</p>
							<p>
								<b>Imported:</b> {codeImportSummary.imported}
							</p>
							<p>
								<b>Unsuccessful:</b> {codeImportSummary.unsuccessful}
							</p>
						</Message>
					) : null}

					<div className='codeFileCard'>
						{/* Imported Code file view */}
						<div className='codeFileText'>
							Imported Code List: <b>{cmeSourceCodeFile}</b>
						</div>
					</div>
				</>
			) : null}
			{/* BEGIN VIEWPORT TABLE */}
			<Table striped className={props.className}>
				{/* Allows the table body to scroll when there are more than 4 items in the listOfDataElements array with the use of the 'scrollable' className stlying in App.css */}
				<Table.Header className={listOfCodeObjs.length > 4 ? 'scrollable' : 'nonScrollable'}>
					<Table.Row>
						<Table.HeaderCell width='14'>Name</Table.HeaderCell>
						<Table.HeaderCell width='1'>Edit</Table.HeaderCell>
						<Table.HeaderCell width='1'>Delete</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				{/* Allows the table body to scroll when there are more than 4 items in the codeList array with the use of the 'scrollable' className stlying in App.css */}
				<Table.Body className={listOfCodeObjs.length > 4 ? 'scrollable' : 'nonScrollable'}>{renderCodeRows()}</Table.Body>

				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell colSpan='3'>
							<Grid columns={2}>
								<Grid.Row>
									<Grid.Column style={{ margin: 'auto' }}>
										<b>Total</b>: {listOfCodeObjs.length}
									</Grid.Column>
									<Grid.Column textAlign='right'>
										<Button
											basic
											icon
											className={isFullscreenModalOpen ? 'hiddenButton' : ''}
											onClick={() => {
												dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: true });
												dispatch({
													type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_VIEWPORT_TYPE,
													payload: fieldNames.code,
												});
											}}
										>
											<Icon name='expand' />
											&nbsp; Fullscreen
										</Button>
									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>
		</>
	);
};

export const CMEContainersViewportTable = (props) => {
	const dispatch = useDispatch();
	const isFullscreenModalOpen = useSelector((state) => state.cme.isFullscreenModalOpen);
	const cmeData = useSelector((state) => state.cme.cmeData);
	const isEditMode = useSelector((state) => state.cme.isEditMode);
	const existingFormData = useSelector((state) => state.cme.existingFormData);
	const [listOfContainers, setListOfContainers] = useState([]);
	const [containerActiveIndex, setContainerActiveIndex] = useState();

	// checks cmeData's children, adds only containers to listOfContainers
	useEffect(() => {
		let updatedListOfContainers = [];
		cmeData.children.forEach((obj) => {
			if (obj.elementType === fieldNames.container) {
				updatedListOfContainers.push(obj);
			}
		});
		setListOfContainers(updatedListOfContainers);
	}, [cmeData]); // runs each time cmeData is updated

	function renderContainerRows(elementChildren) {
		// used to get the total count of container elements, btwn all container element objs, for each container in the viewport (container(#))
		return listOfContainers.map((obj, i) => {
			const childrenArray = [];
			Object.values(obj.containerElements).forEach((child) => {
				let elements = Object.values(child.containerElements);
				elements.forEach((item) => {
					childrenArray.push(item);
				});
			});

			return (
				<Table.Row
					key={i}
					active={isEditMode && Object.values(existingFormData).length !== 0 && obj.index === containerActiveIndex ? true : false}
				>
					<Table.Cell width='14'>
						{obj.elementName}&nbsp;({childrenArray.length})
					</Table.Cell>
					<Table.Cell
						width='1'
						selectable
						collapsing
						textAlign='center'
						/* if existingFormData contains data, the the form is in edit mode and the user is editing the "Code" viewport data. While editing that particular row, disable the 'edit' cell */
						disabled={Object.values(existingFormData).length !== 0 && obj.index === containerActiveIndex ? true : false}
					>
						<span
							style={{ cursor: 'pointer' }}
							onClick={() => {
								setContainerActiveIndex(obj.index); // set index for highliting the active row
								// enable edit mode and send latest data to be read in CMEBuilderModal.js file (replaces initial form values with dispatched data)
								dispatch({ type: actionTypes.UPDATE_CME_BUILDER_IS_EDIT_MODE, payload: true });
								dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CONTAINER_ELEMENT_DATA, payload: {} });
								dispatch({ type: actionTypes.CME_BUILDER_UPDATE_LIST_OF_CONTAINER_ELEMENT_OBJS, payload: [] });
								dispatch({ type: actionTypes.UPDATE_CME_BUILDER_EXISTING_FORM_DATA, payload: obj, index: obj['index'] });

								// if editMode is accessed while in fullscreen, close fullscreen modal
								if (isFullscreenModalOpen) {
									dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: false });
								}
							}}
						>
							<Icon
								name='pencil'
								/* if editing that particular row, disable the pencil icon */
								disabled={Object.values(existingFormData).length !== 0 && obj.index === containerActiveIndex ? true : false}
							/>
						</span>
					</Table.Cell>
					<Table.Cell
						width='1'
						selectable
						collapsing
						textAlign='center'
						/* if editing that particular row, disable the 'delete' cell */
						disabled={Object.values(existingFormData).length !== 0 && obj.index === containerActiveIndex ? true : false}
					>
						<span
							onClick={() => {
								handleDeleteElementFromViewport(obj); // see CMEBuilderUtil.js
							}}
						>
							<Icon
								name='trash'
								/* if editing that particular row, disable the trashcan icon */
								disabled={Object.values(existingFormData).length !== 0 && obj.index === containerActiveIndex ? true : false}
							/>
						</span>
					</Table.Cell>
				</Table.Row>
			);
		});
	}

	return (
		<>
			{/* BEGIN VIEWPORT TABLE */}
			<Table striped className={props.className}>
				{/* Allows the table body to scroll when there are more than 4 items in the listOfDataElements array with the use of the 'scrollable' className stlying in App.css */}
				<Table.Header className={listOfContainers.length > 4 ? 'scrollable' : 'nonScrollable'}>
					<Table.Row>
						<Table.HeaderCell width='14'>Name</Table.HeaderCell>
						<Table.HeaderCell width='1'>Edit</Table.HeaderCell>
						<Table.HeaderCell width='1'>Delete</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				{/* Allows the table body to scroll when there are more than 4 items in the listOfDataElements array with the use of the 'scrollable' className stlying in App.css */}
				<Table.Body className={listOfContainers.length > 4 ? 'scrollable' : 'nonScrollable'}>{renderContainerRows()}</Table.Body>

				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell colSpan='3'>
							<Grid columns={2}>
								<Grid.Row>
									<Grid.Column style={{ margin: 'auto' }}>
										<b>Total</b>: {listOfContainers.length}
									</Grid.Column>
									<Grid.Column textAlign='right'>
										<Button
											basic
											icon
											className={isFullscreenModalOpen ? 'hiddenButton' : ''}
											onClick={() => {
												dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: true });
												dispatch({
													type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_VIEWPORT_TYPE,
													payload: fieldNames.container,
												});
											}}
										>
											<Icon name='expand' />
											&nbsp; Fullscreen
										</Button>
									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>
		</>
	);
};

export const CMEContainerElementsViewportTable = (props) => {
	const dispatch = useDispatch();
	const isFullscreenModalOpen = useSelector((state) => state.cme.isFullscreenModalOpen);
	// listOfContainerElementObjs is a global temporary array that stores container element objs as they are added via the form and is only utilized while completeing the CME Builder form.
	const listOfContainerElementObjs = useSelector((state) => state.cme.listOfContainerElementObjs); // stores entire object for each parent (niemDomain) and its children (container elements)
	const isEditMode = useSelector((state) => state.cme.isEditMode);
	const existingContainerElementData = useSelector((state) => state.cme.existingContainerElementData);
	const listOfAllContainerElementChildren = [];
	const [checkedRadioIndex, setCheckedRadioIndex] = useState('');
	const [accordionActive, setAccordionActive] = useState();
	const [activeIndex, setActiveIndex] = useState();

	function renderContainerElementParent() {
		const handleRowSelection = (elementParent, i) => {
			setCheckedRadioIndex(i);
		};

		return listOfContainerElementObjs.map((obj, i) => {
			const elementParent = obj.niemDomain;
			const elementChildren = obj.containerElements;

			// used to get the total count of container elements, btwn all container element objs, in the viewport table footer (total: #)
			Object.values(elementChildren).forEach((child) => {
				listOfAllContainerElementChildren.push(child);
			});

			return (
				<Table.Row
					key={i}
					active={isEditMode && Object.values(existingContainerElementData).length !== 0 && i === activeIndex ? true : false}
				>
					<Table.Cell colSpan='3' className='containerElementParentAccordion'>
						<Accordion key={i}>
							<Accordion.Title
								active={accordionActive === checkedRadioIndex}
								onClick={() => {
									handleRowSelection(elementParent, i);
									if (accordionActive !== i) {
										setAccordionActive(i);
									} else {
										setAccordionActive(null);
									}
								}}
							>
								<Grid>
									<Grid.Row>
										<Grid.Column width={11}>
											<Icon name='dropdown' />
											{obj.niemDomain}&nbsp;({elementChildren.length})
										</Grid.Column>
										<Grid.Column
											width={2}
											textAlign='center'
											// if editing that particular row, disable the pencil icon
											disabled={
												Object.values(existingContainerElementData).length !== 0 && obj['index'] === activeIndex
													? true
													: false
											}
										>
											<span
												style={{ cursor: 'pointer' }}
												onClick={() => {
													obj['index'] = i;
													setActiveIndex(i); // set index for highliting the active row

													// update "add container elements" section of the form only, with the data of the container element selected for edits
													dispatch({
														type: actionTypes.UPDATE_CME_BUILDER_EXISTING_CONTAINER_ELEMENT_DATA,
														payload: obj,
													});

													// if editMode is accessed while in fullscreen, close fullscreen modal
													if (isFullscreenModalOpen) {
														dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: false });
													}
												}}
											>
												<Icon
													name='pencil'
													/* if existingContainerElementData contains data, the the form is in edit mode and the user is editing the "Container Elements" viewport data. While editing that particular row, disable the pencil icon */
													disabled={
														Object.values(existingContainerElementData).length !== 0 && obj['index'] === activeIndex
															? true
															: false
													}
												/>
											</span>
										</Grid.Column>
										<Grid.Column
											width={3}
											textAlign='center' // if editing that particular row, disable the trashcan icon
											disabled={
												Object.values(existingContainerElementData).length !== 0 && obj['index'] === activeIndex
													? true
													: false
											}
										>
											<span
												style={{ cursor: 'pointer' }}
												onClick={() => {
													obj['index'] = i;
													handleDeleteContainerElementParentFromViewport(obj); // see CMEBuilderUtil.js
												}}
											>
												<Icon
													name='trash'
													// if editing that particular row, disable the trashcan icon
													disabled={
														Object.values(existingContainerElementData).length !== 0 && obj['index'] === activeIndex
															? true
															: false
													}
												/>
											</span>
										</Grid.Column>
									</Grid.Row>
								</Grid>
							</Accordion.Title>
							<Accordion.Content active={accordionActive === i && checkedRadioIndex === i}>
								<Table>
									<Table.Body
										className={
											listOfContainerElementObjs.length > 3
												? 'containerElements children scrollable'
												: 'containerElements children nonScrollable'
										}
									>
										{renderContainerElementChildren(elementChildren, obj)}
									</Table.Body>
								</Table>
							</Accordion.Content>
						</Accordion>
					</Table.Cell>
				</Table.Row>
			);
		});
	}

	function renderContainerElementChildren(elementChildren, obj) {
		return elementChildren.map((child, i) => {
			return (
				<Table.Row key={i}>
					<Table.Cell>{child.value}</Table.Cell>

					<Table.Cell selectable collapsing textAlign='center'>
						<span
							style={{ cursor: 'pointer' }}
							onClick={() => {
								handleDeleteContainerElementChildFromViewport(obj, child); // see CMEBuilderUtil.js
							}}
						>
							<Icon name='trash' />
						</span>
					</Table.Cell>
				</Table.Row>
			);
		});
	}

	return (
		<>
			{/* BEGIN VIEWPORT TABLE */}
			<Table striped className={props.className}>
				{/* Allows the table body to scroll when there are more than 4 items in the elementList array with the use of the 'scrollable' className stlying in App.css */}
				<Table.Header className={listOfContainerElementObjs.length > 4 ? 'containerElements scrollable' : 'containerElements nonScrollable'}>
					<Table.Row>
						<Table.HeaderCell width='12'>Name</Table.HeaderCell>
						<Table.HeaderCell width='2'>Edit</Table.HeaderCell>
						<Table.HeaderCell width='3'>Delete</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				{/* Allows the table body to scroll when there are more than 4 items in the elementList array with the use of the 'scrollable' className stlying in App.css */}
				<Table.Body className={listOfContainerElementObjs.length > 4 ? 'containerElements scrollable' : ' containerElements nonScrollable'}>
					{renderContainerElementParent()}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.HeaderCell colSpan='3'>
							<Grid columns={2}>
								<Grid.Row>
									<Grid.Column style={{ margin: 'auto' }}>
										<b>Total</b>:&nbsp;{listOfAllContainerElementChildren.length}
									</Grid.Column>
									<Grid.Column textAlign='right'>
										<Button
											basic
											icon
											className={isFullscreenModalOpen ? 'hiddenButton' : ''}
											onClick={() => {
												dispatch({ type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_MODAL_OPEN, payload: true });
												dispatch({
													type: actionTypes.UPDATE_CME_BUILDER_FULLSCREEN_VIEWPORT_TYPE,
													payload: fieldNames.containerElements,
												});
											}}
										>
											<Icon name='expand' />
											&nbsp; Fullscreen
										</Button>
									</Grid.Column>
								</Grid.Row>
							</Grid>
						</Table.HeaderCell>
					</Table.Row>
				</Table.Footer>
			</Table>
		</>
	);
};
