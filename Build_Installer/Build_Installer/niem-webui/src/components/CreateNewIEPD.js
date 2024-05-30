import React from 'react';
import MEPBuilderGraphic from '../components/MEPBuilderGraphic';
import * as key from '../Shared/KVstore';

const CreateNewIEPD = () => {
	return (
		<div id='createNewIEPD' className='contentPage'>
			<h1>Create a New {key.packageName}</h1>
			<h2>Welcome to the {key.packageName} Creation Guide</h2>
			<p>
				This view will help guide you through each of the six {key.packageName} Lifecycle phases where you will create and compile the
				artifacts needed for your new {key.packageName}.
			</p>
			<p>When you're ready to get started, select Scenario Planning from the left side navigation pane or from the diagram below.</p>
			<MEPBuilderGraphic />
		</div>
	);
};

export default CreateNewIEPD;
