import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Grid, Segment, Divider, Accordion, Container } from 'semantic-ui-react';
import MappingGrid from '../Shared/MappingGrid';

const MapModel = () => {
	const infoAccordionOpen = useSelector((state) => state.mapping.infoAccordionOpen);
	const isRequiredArtifactUploaded = useSelector((state) => state.mpd.isRequiredArtifactUploaded);
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
								<h3>With the basic data requirements identified, now is the time to match them to NIEM data components.</h3>
							</Grid.Column>
							<Grid.Column>
								<ul>
									<li key={0}>Map user data requirements to NIEM data components</li>
									<li key={1}>Create custom model extensions</li>
									<li key={2}>Validate NIEM conformance on individual extension components</li>
									<li key={3}>Search for results for type or property</li>
									<li key={4}>Search Common NIEM Components for popular types or properties</li>
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

	useEffect(() => {
		// display MEP Change Warning Modal on load if Subset Schema is already generated
		if (isRequiredArtifactUploaded.subset) {
			dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_OPEN, payload: true });
			dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_TRIGGER, payload: 'mapping' });
			dispatch({ type: actionTypes.MEP_CONTAINS_SUBSET_TEXT_TRUE });
			dispatch({ type: actionTypes.GENERATE_SUBSET_TEXT_TRUE });
		}
	}, [isRequiredArtifactUploaded, dispatch]);

	return (
		<Grid className='contentPage' columns='one'>
			<Grid.Row>
				<Grid.Column width='11'>
					<Grid className='infoBox'>
						<Grid.Row>
							<Grid.Column width='10'>
								<h2>Map and Model</h2>
							</Grid.Column>
						</Grid.Row>
						<Grid.Row>
							<Grid.Column>
								<Accordion
									as={Container}
									panels={showMoreLessInfo}
									onClick={() =>
										dispatch({
											type: actionTypes.MAPPING_INFO_BANNER_SHOW_LESS,
										})
									}
								></Accordion>
							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Grid.Column>
			</Grid.Row>
			<Divider hidden />
			<Grid.Row>
				<Grid.Column>
					<MappingGrid />
				</Grid.Column>
			</Grid.Row>
		</Grid>
	);
};

export default MapModel;
