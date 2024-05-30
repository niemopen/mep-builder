import React from 'react';
import { Grid, Container, Segment, Accordion, Divider } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import AssembleDocumentTab from '../Shared/AssembleDocumentTab';
import ArtifactChecklist from '../Shared/ArtifactChecklist';

const PublishImplement = () => {
	const infoAccordionOpen = useSelector((state) => state.publish.infoAccordionOpen);

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
									During the last phase, the Publish and Implement phase, you implement the MEP into production and publish the MEP
									for search, discovery, and reuse
								</h3>
							</Grid.Column>
							<Grid.Column>
								<ul>
									<li key={0}>
										If you haven’t already done so, complete and/or generate any remaining artifacts for a MEP by completing the
										following forms:
										<ul>
											<li key={0}>ReadMe</li>
											<li key={1}>Change Log</li>
											<li key={2}>Business Rules</li>
											<li key={3}>
												Conformance Assertion <b>(required)*</b>
											</li>
										</ul>
									</li>
									<li key={1}>Internally publish a MEP</li>
									<li key={2}>Publish MEP metadata directly to the publicly-hosted NIEM MEP Registry</li>
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
									<h2>Publish & Implement</h2>
								</Grid.Column>
							</Grid.Row>
							<Grid.Row>
								<Grid.Column>
									<Accordion
										as={Container}
										panels={showMoreLessInfo}
										onClick={() =>
											dispatch({
												type: actionTypes.PUBLISH_INFO_BANNER_SHOW_LESS,
											})
										}
									></Accordion>
								</Grid.Column>
							</Grid.Row>
						</Grid>
					</Grid.Column>
				</Grid.Row>
				<Grid.Row>
					<Grid.Column width='10'>
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

export default PublishImplement;
