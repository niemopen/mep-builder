import React from 'react';
import { Message } from 'semantic-ui-react';
import { niemContactEmail } from '../config/config.json';
import { useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';

const ApiErrorNotification = () => {
	const dispatch = useDispatch();
	return (
		<Message
			error
			onDismiss={() => {
				dispatch({ type: actionTypes.UPDATE_SHOW_API_ERROR_NOTIFICATION, payload: false });
				dispatch({ type: actionTypes.RESET_API_ERROR_DETAILS });
			}}
		>
			<Message.Header>Error</Message.Header>
			<p>There was an issue with the API performing this action.</p>
			<p>
				Please contact <strong>{niemContactEmail}</strong> and attach a copy of the Error Report for further assistance
			</p>
			<p>
				To view error details and download a copy of the Error Report, please click{' '}
				<span
					className='basicLinkWithColor'
					onClick={() => dispatch({ type: actionTypes.UPDATE_API_ERROR_DETAILS_MODAL_OPEN, payload: true })}
				>
					here
				</span>
			</p>
		</Message>
	);
};

export default ApiErrorNotification;
