import React from 'react';
import { Button, Divider, Grid, Icon, List } from 'semantic-ui-react';
import * as key from '../Shared/KVstore';
import { Link } from 'react-router-dom';
import { setActiveSidebarTab } from '../Navigation/LeftNavContent';
import { useDispatch } from 'react-redux';

const MEPBuilderGraphic = () => {
	const dispatch = useDispatch();

	return (
		<>
			<Divider hidden></Divider>
			<Grid className='phase'>
				<Grid.Row>
					<Grid.Column className='phaseLabel' width={4}>
						<Button
							as={Link}
							to='/PackageBuilder/ScenarioPlanning'
							size='big'
							color='blue'
							onClick={() => setActiveSidebarTab('ScenarioPlanning', dispatch)}
						>
							<Grid.Row>
								<Grid.Column className='phaseIcon' width={1}>
									<Icon name='pencil' size='large' />
								</Grid.Column>
								<Grid.Column className='phaseText' width={2}>
									<Grid.Column>
										Scenario
										<br />
										Planning
									</Grid.Column>
								</Grid.Column>
							</Grid.Row>
						</Button>
					</Grid.Column>

					<Grid.Column className='phaseDescription' width={12}>
						<List as='ul' size='large'>
							<List.Item as='li'>Business Process Diagrams</List.Item>
							<List.Item as='li'>Use Case Diagrams</List.Item>
							<List.Item as='li'>Sequence Diagrams</List.Item>
						</List>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Grid className='phase'>
				<Grid.Row>
					<Grid.Column className='phaseLabel' width={4}>
						<Button
							as={Link}
							to='/PackageBuilder/AnalyzeRequirements'
							size='big'
							color='orange'
							onClick={() => setActiveSidebarTab('AnalyzeRequirements', dispatch)}
						>
							<Grid.Row>
								<Grid.Column className='phaseIcon' width={1}>
									<Icon name='search' size='large' />
								</Grid.Column>
								<Grid.Column className='phaseText' width={2}>
									<Grid.Column>
										Analyze
										<br />
										Requirements
									</Grid.Column>
								</Grid.Column>
							</Grid.Row>
						</Button>
					</Grid.Column>
					<Grid.Column className='phaseDescription' width={12}>
						<List as='ul' size='large'>
							<List.Item as='li'>Sample XML Instances</List.Item>
							<List.Item as='li'>Business Requirements</List.Item>
						</List>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Grid className='phase'>
				<Grid.Row>
					<Grid.Column className='phaseLabel' width={4}>
						<Button
							as={Link}
							to='/PackageBuilder/MapModel'
							size='big'
							color='teal'
							onClick={() => setActiveSidebarTab('MapModel', dispatch)}
						>
							<Grid.Row>
								<Grid.Column className='phaseIcon' width={1}>
									<Icon name='globe' size='large' />
								</Grid.Column>
								<Grid.Column className='phaseText' width={2}>
									<Grid.Column>
										Map &<br />
										Model
									</Grid.Column>
								</Grid.Column>
							</Grid.Row>
						</Button>
					</Grid.Column>
					<Grid.Column className='phaseDescription' width={12}>
						<List as='ul' size='large'>
							<List.Item as='li'>Exchange Content Model</List.Item>
							<List.Item as='li'>Mapping Document</List.Item>
						</List>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Grid className='phase'>
				<Grid.Row>
					<Grid.Column className='phaseLabel' width={4}>
						<Button
							as={Link}
							to='/PackageBuilder/BuildValidate'
							size='big'
							color='blue'
							onClick={() => setActiveSidebarTab('BuildValidate', dispatch)}
						>
							<Grid.Row>
								<Grid.Column className='phaseIcon' width={1}>
									<Icon name='cogs' size='large' />
								</Grid.Column>
								<Grid.Column className='phaseText' width={2}>
									<Grid.Column>
										Build &<br />
										Validate
									</Grid.Column>
								</Grid.Column>
							</Grid.Row>
						</Button>
					</Grid.Column>
					<Grid.Column className='phaseDescription' width={12}>
						<Grid>
							<Grid.Column width={5}>
								<List as='ul' size='large'>
									<List.Item as='li'>Wantlist</List.Item>
									<List.Item as='li'>Subset Schema</List.Item>
								</List>
							</Grid.Column>
							<Grid.Column width={5}>
								<List as='ul' size='large'>
									<List.Item as='li'>Build Custom Model Extensions</List.Item>
									<List.Item as='li'>Validate package artifacts for conformance</List.Item>
								</List>
							</Grid.Column>
						</Grid>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Grid className='phase'>
				<Grid.Row>
					<Grid.Column className='phaseLabel' width={4}>
						<Button
							as={Link}
							to='/PackageBuilder/AssembleDocument'
							size='big'
							color='orange'
							onClick={() => setActiveSidebarTab('AssembleDocument', dispatch)}
						>
							<Grid.Row>
								<Grid.Column className='phaseIcon' width={1}>
									<Icon name='paperclip' size='large' />
								</Grid.Column>
								<Grid.Column className='phaseText' width={2}>
									<Grid.Column>
										Assemble &<br />
										Document
									</Grid.Column>
								</Grid.Column>
							</Grid.Row>
						</Button>
					</Grid.Column>
					<Grid.Column className='phaseDescription' width={12}>
						<Grid>
							<Grid.Column width={5}>
								<List as='ul' size='large'>
									<List.Item as='li'>Master Document</List.Item>
									<List.Item as='li'>Catalog</List.Item>
								</List>
							</Grid.Column>
							<Grid.Column width={5}>
								<List as='ul' size='large'>
									<List.Item as='li'>Change Log</List.Item>
									<List.Item as='li'>Business Rules</List.Item>
								</List>
							</Grid.Column>
						</Grid>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Grid className='phase'>
				<Grid.Row>
					<Grid.Column className='phaseLabel' width={4}>
						<Button
							as={Link}
							to='/PackageBuilder/PublishImplement'
							size='big'
							color='teal'
							onClick={() => setActiveSidebarTab('PublishImplement', dispatch)}
						>
							<Grid.Row>
								<Grid.Column className='phaseIcon' width={1}>
									<Icon name='print' size='large' />
								</Grid.Column>
								<Grid.Column className='phaseText' width={2}>
									<Grid.Column>
										Publish &<br />
										Implement
									</Grid.Column>
								</Grid.Column>
							</Grid.Row>
						</Button>
					</Grid.Column>
					<Grid.Column className='phaseDescription' width={12}>
						<List as='ul' size='large'>
							<List.Item as='li'>Conformance Assertion</List.Item>
							<List.Item as='li'>Publish the {key.packageNameAcronymn} to a repository and implement the exchange.</List.Item>
						</List>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</>
	);
};

export default MEPBuilderGraphic;
