import React from 'react';
import * as key from '../Shared/KVstore';
import { niemReferenceBaseURL } from '../config/config';

const GettingStarted = () => {
	const examplesUrl = niemReferenceBaseURL + 'specification/model-package-description/3.0.1/iepd-examples/';
	return (
		<div id='gettingStarted' className='contentPage'>
			<h1>Getting Started</h1>
			<a className='basicLink' href={examplesUrl} target='_blank' rel='noopener noreferrer'>
				Example {key.packageName}
			</a>
		</div>
	);
};

export default GettingStarted;
