import React from 'react';
import { Message } from 'semantic-ui-react';

const EmptyPagePlaceholderContent = () => {
	return (
		<div id='emptyPagePlaceholder'>
			<Message info>
				<Message.Header>This page is currently unavailable</Message.Header>
				<p>The content for this page will be available in a future release.</p>
			</Message>
		</div>
	);
};

export default EmptyPagePlaceholderContent;
