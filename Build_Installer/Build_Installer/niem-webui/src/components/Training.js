import React from 'react';
import * as key from '../Shared/KVstore';
import TrainingPageGraphic from './TrainingPageGraphic';

const Training = () => {
	return (
		<div id='myHome' className='contentPage'>
			<h1>
				{key.packageName} ({key.packageNameAcronymn}) Training & Documentation
			</h1>
			<TrainingPageGraphic />
		</div>
	);
};

export default Training;
