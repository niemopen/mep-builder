import React from 'react';
import { Button, Divider, Grid, Icon } from 'semantic-ui-react';
import * as key from '../Shared/KVstore';
import { Link } from 'react-router-dom';
import { setActiveTab } from '../Navigation/HeaderNavMenu';

const TrainingPageGraphic = () => {
	return (
		<>
			<Divider hidden></Divider>
			<Grid className='trainingLink'>
				<Grid.Row>
					<Grid.Column className='linkLabel' width={4}>
						<Button as='a' href='https://niem.github.io/training/' target='_blank' rel='noopener noreferrer' size='big' color='blue'>
							<Grid.Row>
								<Grid.Column className='linkIcon' width={1}>
									<Icon name='graduation' size='large' />
								</Grid.Column>
								<Grid.Column className='linkText' width={2}>
									<Grid.Column>NIEM Training</Grid.Column>
								</Grid.Column>
							</Grid.Row>
						</Button>
					</Grid.Column>

					<Grid.Column className='linkDescription' width={12}>
						<p>
							This link will take you to training tools to include user-driven tutorials and reference content for both experienced and
							first-time NIEM users.
						</p>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Grid className='trainingLink'>
				<Grid.Row>
					<Grid.Column className='linkLabel' width={4}>
						<Button as='a' href='/NIEMOpen_MEP_Builder_Tool_UserGuide.pdf' target='_blank' rel='noopener noreferrer' size='big' color='orange'>
							<Grid.Row>
								<Grid.Column className='linkIcon' width={1}>
									<Icon name='file alternate' size='large' />
								</Grid.Column>
								<Grid.Column className='linkText' width={2}>
									<Grid.Column>
										NIEM {key.packageNameAcronymn} Builder <br />
										User's Guide
									</Grid.Column>
								</Grid.Column>
							</Grid.Row>
						</Button>
					</Grid.Column>
					<Grid.Column className='linkDescription' width={12}>
						<p>
							The {key.packageNameAcronymn} Builder user’s guide is a resource that contains system requirements, guidance and
							information about NIEM {key.packageNameAcronymn} Builder features.
						</p>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Grid className='trainingLink'>
				<Grid.Row>
					<Grid.Column className='linkLabel' width={4}>
						<Button as={Link} to='/PackageBuilder/EditPackage' size='big' color='teal' onClick={() => setActiveTab('PackageBuilder')}>
							<Grid.Row>
								<Grid.Column className='linkIcon' width={1}>
									<Icon name='wrench' size='large' />
								</Grid.Column>
								<Grid.Column className='linkText' width={2}>
									<Grid.Column>Begin Building a {key.packageNameAcronymn}</Grid.Column>
								</Grid.Column>
							</Grid.Row>
						</Button>
					</Grid.Column>
					<Grid.Column className='linkDescription' width={12}>
						<p>
							Click this link to begin building a {key.packageName} ({key.packageNameAcronymn}).
						</p>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</>
	);
};

export default TrainingPageGraphic;
