import { Button, Modal } from 'semantic-ui-react';
import { isStringFieldValid } from '../Util/FieldValidationUtil';
import * as dateFormat from 'dateformat';
import { niemContactEmail } from '../config/config';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { trackedErrorSources } from '../Util/ErrorHandleUtil';

const ApiErrorDetailsModal = () => {
	const dispatch = useDispatch();
	const apiErrorModalOpen = useSelector((state) => state.error.apiErrorDetailsModalOpen);
	const errorDetails = useSelector((state) => state.error.apiErrorDetails);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);

	const handleDownloadErrorReport = () => {
		if (isStringFieldValid(errorDetails.errorMessage)) {
			// Get filename for download, including date and time in UTC
			const currentDate = dateFormat(new Date(), 'UTC:mm-dd-yyyy HHMM');
			var filename;
			switch (errorDetails.errorSource) {
				case trackedErrorSources.system:
					filename = 'System Notification Report ' + currentDate + '.txt';
					break;
				case trackedErrorSources.subset:
				case trackedErrorSources.wantlist:
					filename = 'Schema Generation Error Report ' + currentDate + '.txt';
					break;
				case trackedErrorSources.translate:
					filename = 'Format Translation Error Report ' + currentDate + '.txt';
					break;
				case trackedErrorSources.transfer:
					filename = 'Package Transfer Error Report ' + currentDate + '.txt';
					break;
				case trackedErrorSources.generic:
					filename = 'Error Report ' + currentDate + '.txt';
					break;
				default:
					filename = 'Untracked Error Report ' + currentDate + '.txt';
			}

			// Construct contents of Error Report
			const errorReport = `Error DB ID: ${errorDetails.errorId}\nError Summary: ${errorDetails.errorSummary}\nResponse Message:\n${errorDetails.errorMessage}`;

			const element = document.createElement('a');
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + errorReport);
			element.setAttribute('download', filename);

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		} else {
			// Error with data download
			alert('There was an issue downloading this file.');
		}
	};

	return (
		<Modal
			open={apiErrorModalOpen || systemErrorOccurred}
			size='mini'
			closeIcon
			onClose={() => {
				dispatch({ type: actionTypes.UPDATE_API_ERROR_DETAILS_MODAL_OPEN, payload: false });
				if (systemErrorOccurred) {
					dispatch({ type: actionTypes.SET_SYSTEM_ERROR_OCCURRED, payload: false });
				}
			}}
			closeOnDimmerClick={false}
		>
			<Modal.Header>{errorDetails.errorSource === trackedErrorSources.system ? 'System Notification' : 'Error Details'}</Modal.Header>
			<Modal.Content>
				<Modal.Description>
					{errorDetails.errorSource === trackedErrorSources.system ? (
						<p>The MEP Builder is having difficulty connecting to its servers.</p>
					) : errorDetails.errorSource === trackedErrorSources.subset || errorDetails.errorSource === trackedErrorSources.wantlist ? (
						<p>Subset Schema generation failed due to the following:</p>
					) : errorDetails.errorSource === trackedErrorSources.translate ? (
						<p>Format translation failed due to the following:</p>
					) : errorDetails.errorSource === trackedErrorSources.transfer ? (
						<p>Package transfer failed due to the following:</p>
					) : errorDetails.errorSource === trackedErrorSources.generic ? (
						<p>The MEP Builder is having difficulty performing this procedure.</p>
					) : errorDetails.errorSource === trackedErrorSources.upload ? (
						<p>The MEP Builder is having difficulty importing the file.</p>
					) : (
						<p>Untracked error occured due to the following:</p>
					)}

					{errorDetails.errorSource !== trackedErrorSources.system && errorDetails.errorSource !== trackedErrorSources.generic ? (
						<div style={{ textAlign: 'center' }}>
							<p>
								<b>{errorDetails.errorSummary}</b>
							</p>
							<Button basic className='secondaryButton' onClick={handleDownloadErrorReport}>
								<b>Download Error Report</b>
							</Button>
						</div>
					) : (
						<p>
							If this issue persists, please contact NIEMOpen at <strong>{niemContactEmail}</strong> and attach a copy of the Error
							Report
						</p>
					)}
					{errorDetails.errorSource !== trackedErrorSources.system && errorDetails.errorSource !== trackedErrorSources.generic ? (
						<br />
					) : null}
					{errorDetails.errorSource !== trackedErrorSources.system && errorDetails.errorSource !== trackedErrorSources.generic ? (
						<p>
							Please contact <b>{niemContactEmail}</b> and attach a copy of the Error Report.
						</p>
					) : (
						<p>
							To view error details and download a copy of the Error Report, please click{' '}
							<span className='basicLinkWithColor' onClick={handleDownloadErrorReport}>
								here
							</span>
							.
						</p>
					)}
				</Modal.Description>
			</Modal.Content>
			<Modal.Actions>
				<Button
					className='primaryButton'
					onClick={() => {
						dispatch({ type: actionTypes.UPDATE_API_ERROR_DETAILS_MODAL_OPEN, payload: false });
						if (systemErrorOccurred) {
							dispatch({ type: actionTypes.SET_SYSTEM_ERROR_OCCURRED, payload: false });
						}
					}}
				>
					{errorDetails.errorSource === trackedErrorSources.system || errorDetails.errorSource === trackedErrorSources.generic
						? 'Ok'
						: 'Close'}
				</Button>
			</Modal.Actions>
		</Modal>
	);
};

export default ApiErrorDetailsModal;
