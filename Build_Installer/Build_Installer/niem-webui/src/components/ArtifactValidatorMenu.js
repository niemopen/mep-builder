import { useState } from 'react';
import { Grid, Menu, Segment, Header, Label, Divider } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

const ArtifactValidatorMenu = () => {
	const [activeIndex, setActiveIndex] = useState(0);
	const validationArtifacts = useSelector((state) => state.mpd.validationArtifacts);

	const handleItemClick = (e, { index }) => {
		setActiveIndex(index);
	};

	const renderItems = () => {
		return validationArtifacts.map((artifact, i) => {
			return (
				<Menu.Item name={artifact.labelName} index={i} active={activeIndex === i} onClick={handleItemClick} textalign='left'>
					<Label color={artifact.isPass ? 'green' : 'red'}>{artifact.isPass ? 'PASS' : 'FAIL'}</Label>
					{artifact.labelName}
				</Menu.Item>
			);
		});
	};

	return (
		<Grid>
			<Grid.Column width={4}>
				<Menu fluid vertical tabular>
					{renderItems()}
				</Menu>
			</Grid.Column>

			<Grid.Column stretched width={12}>
				<Segment>
					<Grid>
						<Grid.Row columns={2}>
							<Grid.Column width={7}>
								<Header as='h4' textAlign='left'>
									Validation Results:{' '}
								</Header>
							</Grid.Column>
							<Grid.Column textAlign='right'></Grid.Column>
						</Grid.Row>
					</Grid>
					<Divider hidden />
					<div style={{ overflow: 'auto', maxHeight: 400 }}>
						<JsonView
							data={validationArtifacts[activeIndex].validationResults}
							shouldInitiallyExpand={allExpanded}
							style={defaultStyles}
						/>
					</div>
				</Segment>
			</Grid.Column>
		</Grid>
	);
};

export default ArtifactValidatorMenu;
