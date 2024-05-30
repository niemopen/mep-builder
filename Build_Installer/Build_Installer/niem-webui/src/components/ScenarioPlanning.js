import React from 'react';
import UploadCard from '../Shared/UploadCard';
import * as key from '../Shared/KVstore';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';

import { Grid, Container, Segment, Accordion, Divider } from 'semantic-ui-react';

const ScenarioPlanning = () => {
	const infoAccordionOpen = useSelector((state) => state.planning.infoAccordionOpen);
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
								<h3>Scenario Planning is the first step in the {key.packageName} development process.</h3>
							</Grid.Column>
							<Grid.Column>
								<ul>
									<li key={0}>Develop a high level scope and goal of the intended information exchange</li>
									<li key={1}>Decide what information needs to be included</li>
								</ul>
							</Grid.Column>
						</Grid>
					</Segment>
					<Divider hidden />
				</Grid.Row>,
				<p>
					To help visualize the information flow and content, you can graphically show the actors and information flow for your scenario. A
					visual representation can be useful especially if the scenario is complex.
				</p>,
			],
		},
	];

	return (
		<Grid className='contentPage' columns='two'>
			<Grid.Column width='4'>
				<UploadCard cardName='Diagrams & Documents' />
			</Grid.Column>
			<Grid.Column width='12'>
				<Grid className='infoBox'>
					<Grid.Row>
						<Grid.Column width='10'>
							<h2>Scenario Planning</h2>
						</Grid.Column>
					</Grid.Row>
					<Grid.Row>
						<Grid.Column>
							<Accordion
								as={Container}
								panels={showMoreLessInfo}
								onClick={() =>
									dispatch({
										type: actionTypes.PLANNING_INFO_BANNER_SHOW_LESS,
									})
								}
							></Accordion>
						</Grid.Column>
					</Grid.Row>
				</Grid>
			</Grid.Column>
		</Grid>
	);
};

export default ScenarioPlanning;
