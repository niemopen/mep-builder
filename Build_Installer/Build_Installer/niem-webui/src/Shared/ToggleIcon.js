import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Icon } from 'semantic-ui-react';

export default class ToggleIcon extends React.Component {
	render() {
		return (
			<div>
				<Icon
					className='functionalityUnavailable'
					link={this.props.link}
                    name={this.props.isOn ? 'toggle on' : 'toggle off'}
                    // NOTE - Reserved for future implementation
                    // color={'green'}
				/>
			</div>
		);
	}
}
