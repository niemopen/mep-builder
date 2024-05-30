import React from 'react';
import { Popup } from 'semantic-ui-react';
import { useSelector } from 'react-redux';

const Tooltip = (props) => {
	const tooltipsDisabled = useSelector((state) => state.top.tooltipsDisabled);

	return (
		<Popup
			header={props.header}
			content={props.content}
			position={props.position}
			on='hover'
			mouseEnterDelay={700}
			wide={props.wide}
			trigger={props.trigger}
			disabled={tooltipsDisabled}
			hoverable={true}
			inverted={props.inverted}
		/>
	);
};

export default Tooltip;
