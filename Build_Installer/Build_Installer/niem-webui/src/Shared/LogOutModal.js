import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Button, Modal } from 'semantic-ui-react';
import Draggable from 'react-draggable';
import { setActiveTab } from '../Navigation/HeaderNavMenu';
import { setLogOut } from '../Util/localStorageUtil';

const LogOutModal = () => {
	const dispatch = useDispatch();
	const isModalOpen = useSelector((state) => state.logout.isModalOpen);

	return (
		<>
			<Draggable handle='#draggable-modal-title'>
				<Modal
					open={isModalOpen}
					size='tiny'
					onClose={() => dispatch({ type: actionTypes.LOG_OUT_MODAL_OPEN })}
					aria-labelledby='draggable-modal-title'
				>
					<Modal.Header style={{ cursor: 'move' }} id='draggable-modal-title'>
						Leave site?
					</Modal.Header>
					<Modal.Content>
						<p>Changes you made may not be saved.</p>
					</Modal.Content>

					<Modal.Actions>
						<Button
							className='secondaryButton'
							onClick={() => {
								dispatch({ type: actionTypes.LOG_OUT_MODAL_OPEN });
							}}
						>
							Cancel
						</Button>
						<Button
							primary
							onClick={() => {
								dispatch({ type: actionTypes.LOG_OUT_MODAL_OPEN });
								setLogOut(dispatch);
								setActiveTab('MyHome');
							}}
						>
							Leave
						</Button>
					</Modal.Actions>
				</Modal>
			</Draggable>
		</>
	);
};

export default LogOutModal;
