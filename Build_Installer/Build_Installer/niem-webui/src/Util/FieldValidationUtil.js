import * as emailValidator from 'email-validator';

export const isStringFieldValid = (s) => {
	if (s === '' || s === undefined || s === null) {
		return false;
	} else {
		return true;
	}
};

export const isEmailFieldValid = (emailString) => {
	if (emailString === '' || emailString === undefined || emailString === null) {
		return false;
	} else {
		return emailValidator.validate(emailString);
	}
};

export const isPhoneFieldValid = (phoneString) => {
	// Validates phone number with area code
	/* Note: The regex below for the phone number allows the following phone number formats:
			1234567890
			123-456-7890
			(123) 456-7890
			123 456 7890
			123.456.7890
			+91 (123) 456-7890
		*/
	if (phoneString === '' || phoneString === undefined || phoneString === null) {
		return false;
	} else {
		return phoneString.match(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/);
	}
};

export const sortDropdownAlphabetically = (dropDownOptions) => {
	dropDownOptions.sort((a, b) => {
		let aText = a.text.toLowerCase();
		let bText = b.text.toLowerCase();

		if (aText < bText) {
			return -1;
		}

		if (aText > bText) {
			return 1;
		}
		return 0;
	});

	return dropDownOptions;
};
