import React from 'react';
import { Dimmer, Progress } from 'semantic-ui-react';

const LoaderModal = (props) => {
	// total = total number of items
	// value = current number of completed items
	return (
		<Dimmer active={props.active} inverted>
			<div className='progressBarModal'>
				<Progress value={props.value} total={props.total} label={props.label} progress indicating />
			</div>
		</Dimmer>
	);
};

export default LoaderModal;
