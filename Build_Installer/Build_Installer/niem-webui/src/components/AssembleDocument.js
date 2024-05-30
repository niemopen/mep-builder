import React from 'react';
import { Grid, Container, Segment, Accordion, Divider } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import AssembleDocumentTab from '../Shared/AssembleDocumentTab';
import ArtifactChecklist from '../Shared/ArtifactChecklist';

const AssembleDocument = () => {
	const infoAccordionOpen = useSelector((state) => state.assemble.infoAccordionOpen);

	const dispatch = useDispatch();

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
									During the Assemble and Document Phase, you prepare and package all related files for the MEP into a single,
									self-contained, self-documented, portable archive file. You then should perform a peer review to ensure artifact
									consistency within the MEP and with other MEPs
								</h3>
							</Grid.Column>
							<Grid.Column>
								<ul>
									<li key={0}>
										Generate and upload the remaining artifacts for a MEP by completing the following forms:
										<ul>
											<li key={0}>ReadMe</li>
											<li key={1}>Change Log</li>
											<li key={2}>Business Rules</li>
										</ul>
									</li>
									<li key={1}>Generate a Model Package Description (MPD) Catalog</li>
									<li key={2}>Assemble MEP using the default MPD Specification package structure</li>
								</ul>
							</Grid.Column>
						</Grid>
					</Segment>
					<Divider hidden />
				</Grid.Row>,
			],
		},
	];

	return (
		<>
			<Grid className='contentPage' columns='two'>
				<Grid.Row>
					<Grid.Column width='15'>
						<Grid className='infoBox'>
							<Grid.Row>
								<Grid.Column width='10'>
									<h2>Assemble & Document</h2>
								</Grid.Column>
							</Grid.Row>
							<Grid.Row>
								<Grid.Column>
									<Accordion
										as={Container}
										panels={showMoreLessInfo}
										onClick={() =>
											dispatch({
												type: actionTypes.ASSEMBLE_INFO_BANNER_SHOW_LESS,
											})
										}
									></Accordion>
								</Grid.Column>
							</Grid.Row>
						</Grid>
					</Grid.Column>
				</Grid.Row>
				<Grid.Row>
					<Grid.Column width='12'>
						<AssembleDocumentTab />
					</Grid.Column>
					<Grid.Column width='4'>
						<ArtifactChecklist />
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</>
	);
};

export default AssembleDocument;
