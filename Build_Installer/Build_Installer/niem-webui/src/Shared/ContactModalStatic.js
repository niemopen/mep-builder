import { React } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Modal } from 'semantic-ui-react';
import Draggable from 'react-draggable';
import { niemContactEmail } from '../config/config';

const ContactModalStatic = () => {
	const dispatch = useDispatch();
	const contactModalOpen = useSelector((state) => state.contact.contactModalOpen);

	return (
		<Draggable handle='#draggable-modal-title'>
			<Modal
				open={contactModalOpen}
				onClose={() => {
					dispatch({ type: actionTypes.CONTACT_MODAL_OPEN });
				}}
				aria-labelledby='draggable-modal-title'
				centered={false}
				size='mini'
				closeIcon
			>
				<Modal.Header style={{ cursor: 'move' }} id='draggable-modal-title'>
					Contact Us
				</Modal.Header>
				<Modal.Content>
					<Modal.Description>
						<p>Have questions or comments? Please let us know by contacting us at:</p>
						<p style={{ textAlign: 'center' }}>
							<b>{niemContactEmail}</b>
						</p>
						<p>Questions will be answered in a timely manner based on the level of complexity.</p>
						<p>We look forward to hearing from you.</p>
					</Modal.Description>
				</Modal.Content>
			</Modal>
		</Draggable>
	);
};

export default ContactModalStatic;
