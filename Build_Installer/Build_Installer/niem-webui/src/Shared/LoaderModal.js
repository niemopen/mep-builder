import React from 'react';
import spinner from '../images/loadingspinner.svg';
import { Dimmer } from 'semantic-ui-react';

const LoaderModal = (props) => {
	return (
		<Dimmer active={props.active} inverted>
			<img src={spinner} alt='loading...' />
			<span class='spinnerText'>{props.text}</span>
		</Dimmer>
	);
};

export default LoaderModal;
