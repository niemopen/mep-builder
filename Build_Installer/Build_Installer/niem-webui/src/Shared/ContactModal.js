// THIS FILE IS CURRENTLY NOT IN USE AND IS BEING SAVED FOR POTENIAL FUTURE USE //

import { React, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { Button, Modal, Divider, Form, Message } from 'semantic-ui-react';
import Draggable from 'react-draggable';

const ContactModal = () => {
	const initialForm = {
		firstName: '',
		lastName: '',
		email: '',
		organization: '',
		description: '',
	};

	const initialErrorForm = {
		firstName: true,
		lastName: true,
		email: true,
		organization: true,
		description: true,
	};

	const dispatch = useDispatch();
	const contactModalOpen = useSelector((state) => state.contact.contactModalOpen);
	const [submitClickedOnce, setSubmitClickedOnce] = useState(false);
	const [isSuccessful, setIsSuccessful] = useState(false);
	const [errorForm, setErrorForm] = useState(initialErrorForm);
	const [contactForm, setContactForm] = useState(initialForm);

	const formValidation = () => {
		const payload = {
			firstName: contactForm.firstName === '',
			lastName: contactForm.lastName === '',
			email: contactForm.email === '',
			organization: contactForm.organization === '',
			description: contactForm.description === '',
		};
		setErrorForm(payload);
	};

	const handleSubmit = () => {
		setSubmitClickedOnce(true);

		formValidation();

		const invalidFields = Object.keys(contactForm).filter((value) => contactForm[value] === '');
		if (invalidFields.length === 0) {
			setIsSuccessful(true);
		} else {
			setIsSuccessful(false);
		}
	};

	const resetContactForm = () => {
		setContactForm(initialForm);
		setErrorForm(initialErrorForm);
		setIsSuccessful(false);
		setSubmitClickedOnce(false);
	};

	return (
		<Draggable handle='#draggable-modal-title'>
			<Modal
				open={contactModalOpen}
				onClose={() => {
					dispatch({ type: actionTypes.CONTACT_MODAL_OPEN });
					resetContactForm();
				}}
				aria-labelledby='draggable-modal-title'
				closeIcon
			>
				<Modal.Header style={{ cursor: 'move' }} id='draggable-modal-title'>
					Contact Us
				</Modal.Header>
				{isSuccessful ? (
					<Modal.Content>
						<Message success header='Thank you for contacting us.' content='Your feedback is valued and appreciated!' />
					</Modal.Content>
				) : (
					<>
						<Modal.Content>
							<Modal.Description>
								Have questions or comments? Please let us know by filling out the inquiry form below. Questions will be answered in a
								timely manner, based on the level of complexity. We look forward to hearing from you.
							</Modal.Description>
							<Divider hidden />
							<Form>
								<Form.Group widths='equal'>
									<Form.Input
										error={
											errorForm.firstName &&
											submitClickedOnce && {
												content: 'First Name required',
												pointing: 'below',
											}
										}
										onChange={(e, d) => {
											setContactForm({
												...contactForm,
												firstName: d.value,
											});
											if (submitClickedOnce) {
												formValidation();
											}
										}}
										name='firstName'
										label='First name'
										placeholder='Please enter your first name'
										required={true}
									/>
									<Form.Input
										error={
											errorForm.lastName &&
											submitClickedOnce && {
												content: 'Last Name required',
												pointing: 'below',
											}
										}
										onChange={(e, d) => {
											setContactForm({
												...contactForm,
												lastName: d.value,
											});
											if (submitClickedOnce) {
												formValidation();
											}
										}}
										name='lastName'
										label='Last name'
										placeholder='Please enter your last name'
										required={true}
									/>
								</Form.Group>
								<Form.Input
									error={
										errorForm.email &&
										submitClickedOnce && {
											content: 'Email Address required',
											pointing: 'below',
										}
									}
									onChange={(e, d) => {
										setContactForm({
											...contactForm,
											email: d.value,
										});
										if (submitClickedOnce) {
											formValidation();
										}
									}}
									name='email'
									label='Email'
									placeholder='Please enter your email address'
									required={true}
								/>
								<Form.Input
									error={
										errorForm.organization &&
										submitClickedOnce && {
											content: 'Organization required',
											pointing: 'below',
										}
									}
									onChange={(e, d) => {
										setContactForm({
											...contactForm,
											organization: d.value,
										});
										if (submitClickedOnce) {
											formValidation();
										}
									}}
									label='Organization'
									placeholder='Please enter your organization'
									required={true}
								/>
								<Form.TextArea
									error={
										errorForm.description &&
										submitClickedOnce && {
											content: 'Description required',
											pointing: 'below',
										}
									}
									onChange={(e, d) => {
										setContactForm({
											...contactForm,
											description: d.value,
										});
										if (submitClickedOnce) {
											formValidation();
										}
									}}
									label='Description'
									placeholder='Please provide a description of your inquiry'
									maxLength='500'
									required={true}
								/>
							</Form>{' '}
						</Modal.Content>

						<Modal.Actions>
							<Button className='primaryButton' type='submit' onClick={() => handleSubmit()}>
								Submit
							</Button>
							<Button
								className='secondaryButton'
								onClick={() => {
									dispatch({ type: actionTypes.CONTACT_MODAL_OPEN });
									resetContactForm();
								}}
							>
								Cancel
							</Button>
						</Modal.Actions>
					</>
				)}
			</Modal>
		</Draggable>
	);
};

export default ContactModal;
