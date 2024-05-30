import React, { useRef } from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { getFileInfo } from '../Util/UploadFileUtil';

const BrowseArtifact = () => {
	const inputFile = useRef(null);

	const transformSelectedFile = (e) => {
		const { files } = e.target;
		getFileInfo(files);
	};

	const openFileDialog = () => {
		inputFile.current.click();
	};

	return (
		<div>
			<input style={{ display: 'none' }} ref={inputFile} onChange={transformSelectedFile} type='file' />
			<Button className='primaryButton' onClick={openFileDialog}>
				<Icon name='folder open outline' />
				Browse
			</Button>
		</div>
	);
};

export default BrowseArtifact;
