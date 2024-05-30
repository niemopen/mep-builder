import { React, useState } from 'react';
import { Container, Header, Button, Icon, Grid, Message } from 'semantic-ui-react';
import ArtifactValidatorMenu from './ArtifactValidatorMenu';
import { useSelector } from 'react-redux';
import LoaderModal from '../Shared/LoaderModal';
import { handleDownloadResults, handleValidation } from '../Util/ValidationUtil';
import { validatorMessageContent, validatiorMessageHeader } from '../Shared/TooltipContent';
import Tooltip from '../Shared/Tooltip';

const ArtifactValidator = ({ subsetSchemaGenerated }) => {
	const isValidationLoading = useSelector((state) => state.build.isValidationLoading);
	const artifactTree = useSelector((state) => state.artifact.treeItems);
	const showValidationResults = useSelector((state) => state.mpd.showValidationResults);
	const [infoMessageVisible, setInfoMessageVisible] = useState(true);

	const handleValidateButton = async () => {
		await handleValidation(artifactTree);
	};

	const ValidationMessage = () => {
		if (infoMessageVisible) {
			return (
				<Message
					info
					onDismiss={() => {
						setInfoMessageVisible(false);
					}}
				>
					<Message.Header>{validatiorMessageHeader}</Message.Header>
					<p>{validatorMessageContent}</p>
				</Message>
			);
		}
		return null;
	};

	return (
		<Container>
			<LoaderModal active={isValidationLoading} />
			{infoMessageVisible ? (
				<Header className='validatorHeaders' as='h3' textAlign='left'>
					Artifact Validator
				</Header>
			) : (
				<Grid>
					<Grid.Row className='artifactValidatorHeaderRow'>
						<Grid.Column width={4}>
							<Header className='validatorHeaders' as='h3' textAlign='left'>
								Artifact Validator
							</Header>
						</Grid.Column>
						<Grid.Column width={6}>
							<Tooltip
								header={validatiorMessageHeader}
								content={validatorMessageContent}
								position='right center'
								trigger={
									<span className='basicLinkWithColor' style={{ float: 'right' }}>
										Why did my results erase?
									</span>
								}
								wide
							/>
						</Grid.Column>
					</Grid.Row>
				</Grid>
			)}
			{showValidationResults ? (
				<>
					<ValidationMessage />
					<Grid>
						<Grid.Row columns={2} className='downloadResultsButtonGroup'>
							<Grid.Column width={4}>
								<Button className='primaryButton' onClick={() => handleValidateButton()}>
									Validate Again
								</Button>
							</Grid.Column>
							<Grid.Column width={4}>
								<Button style={{ float: 'right' }} className='primaryButton' onClick={async () => handleDownloadResults()}>
									Download Results
								</Button>
							</Grid.Column>
						</Grid.Row>
					</Grid>
					<ArtifactValidatorMenu />
				</>
			) : (
				<Container textAlign='center'>
					<Icon name='tasks' size='big'></Icon>
					{subsetSchemaGenerated ? (
						<p>To run validation, please click "Validate Artifacts".</p>
					) : (
						<p>To run validation, please first generate a Subset Schema.</p>
					)}
					<Button className='primaryButton' onClick={() => handleValidateButton()} disabled={!subsetSchemaGenerated}>
						Validate Artifacts
					</Button>
				</Container>
			)}
		</Container>
	);
};

export default ArtifactValidator;
