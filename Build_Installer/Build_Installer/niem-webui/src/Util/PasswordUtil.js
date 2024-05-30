import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { getSessionValue } from './localStorageUtil';
import * as session from '../Util/SessionVar';
import { handleError, trackedErrorSources } from './ErrorHandleUtil';
import store from '../redux/store';
const crypto = require('crypto');

// Using Node built-in Crypto module. Documentation can be found here - https://nodejs.org/api/crypto.html#cryptopbkdf2password-salt-iterations-keylen-digest-callback

// hashing parameters
const SALT_LENGTH = 64;
const ITERATIONS = 10000;
const PASSWORD_LENGTH = 256;
const DIGEST = 'sha256';
const BYTE_TO_STRING_ENCODING = 'base64';

// salt and hash password
const cryptoSaltHash = async (password) => {
	const normalizedPassword = password.normalize('NFC');

	const salt = crypto.randomBytes(SALT_LENGTH).toString(BYTE_TO_STRING_ENCODING);

	return new Promise((resolve, reject) => {
		crypto.pbkdf2(normalizedPassword, salt, ITERATIONS, PASSWORD_LENGTH, DIGEST, (err, hash) => {
			if (err) {
				reject(new Error(err));
			} else {
				resolve({
					salt: salt,
					hash: hash.toString(BYTE_TO_STRING_ENCODING),
				});
			}
		});
	});
};

// hash password with stored parameters
const cryptoRehash = async (passwordToReHash, savedSalt) => {
	const normalizedPassword = passwordToReHash.normalize('NFC');
	return new Promise((resolve, reject) => {
		crypto.pbkdf2(normalizedPassword, savedSalt, ITERATIONS, PASSWORD_LENGTH, DIGEST, (err, hash) => {
			if (err) {
				reject(new Error(err));
			} else {
				resolve(hash.toString(BYTE_TO_STRING_ENCODING));
			}
		});
	});
};

// Password is salted and hashed
export const encryptPassword = async (password) => {
	return await cryptoSaltHash(password)
		.then((hashParameters) => {
			return hashParameters;
		})
		.catch((err) => {
			console.log('Err: ' + err);
		});
};

export const rehashPassword = async (passwordToReHash, savedSalt) => {
	return await cryptoRehash(passwordToReHash, savedSalt)
		.then((hash) => {
			return hash;
		})
		.catch((err) => {
			console.log('Err: ' + err);
		});
};

const formatCurrentDate = () => {
	const date = new Date();
	const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	return formattedDate;
};

const validatePasswordById = async (userId, password) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.post(baseURL + 'Auth/validateUser', {
				userId: userId,
				password: password,
			})
			.then((response) => {
				if (response.data.isUserValidated) {
					return true; // user is valid
				} else {
					return false; // user is not valid
				}
			})
			.catch((error) => handleError(error, trackedErrorSources.user));
	}
};

export const updatePasswordById = async (userInfo, userId, newPassword, exisitngPassword) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		const encryptNewPassword = await encryptPassword(newPassword);
		const rehashNewPass = await rehashPassword(newPassword, userInfo.salt);
		const rehashExistingPass = await rehashPassword(exisitngPassword, userInfo.salt);
		const userValidateExistingPassword = await validatePasswordById(userId, rehashExistingPass);
		const isPassReused = await validatePasswordById(userId, rehashNewPass);
		const currentDate = formatCurrentDate();

		// password validation by the user, if passwords match, update the password in db
		if (userValidateExistingPassword) {
			if (!isPassReused) {
				return axios
					.put(baseURL + 'User/updateById/' + userId, {
						userData: {
							salt: encryptNewPassword.salt,
							hash: encryptNewPassword.hash,
							password_created: currentDate,
							account_locked: false,
							status_change_reason: 'Password updated',
						},
						auditUser: getSessionValue(session.user_id),
					})
					.then((response) => {
						if (response.status === 200) {
							return { boolean: true, message: 'success' };
						}
					})
					.catch((error) => {
						handleError(error, trackedErrorSources.user);
						return { boolean: false, message: 'error' };
					});
			} else {
				return { boolean: false, message: 'reusedPassword' };
			}
		} else {
			return { boolean: false, message: 'incorrectPassword' };
		}
	} else {
		return { boolean: false, message: 'error' };
	}
};
