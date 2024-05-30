import * as actionTypes from '../actions';

const initialState = {
	isTransferPackagesModalOpen: false,
	transferFromUser: {
		denialDetails: '',
		denialReason: '',
		email: '',
		firstName: '',
		lastName: '',
		key: 0,
		organization: '',
		phone: '',
		role: '',
		status: '',
		tableData: {},
		userId: '',
	},
	transferedPackageCount: null,
	numberOfPackagesToTransfer: 0,
};

function TransferPackagesModalReducer(state = initialState, action) {
	switch (action.type) {
		case actionTypes.TRANSFER_PACKAGES_MODAL_OPEN:
			return {
				...state,
				isTransferPackagesModalOpen: action.payload,
			};
		case actionTypes.UPDATE_PACKAGE_TRANSFER_FROM_USER:
			return {
				...state,
				transferFromUser: action.payload,
			};
		case actionTypes.RESET_TRANSFER_PACKAGES_MODAL:
			return {
				...state,
				transferFromUser: {
					denialDetails: '',
					denialReason: '',
					email: '',
					firstName: '',
					lastName: '',
					key: 0,
					organization: '',
					phone: '',
					role: '',
					status: '',
					tableData: {},
					userId: '',
				},
				numberOfPackagesToTransfer: 0,
				isTransferPackagesModalOpen: false,
			};
		case actionTypes.UPDATE_NUMBER_OF_PACKAGES_TO_TRANSFER:
			return {
				...state,
				numberOfPackagesToTransfer: action.payload,
			};
		case actionTypes.UPDATE_TRANSFERED_PACKAGES_COUNT:
			return {
				...state,
				transferedPackageCount: action.payload,
			};
		default:
			return state;
	}
}

export default TransferPackagesModalReducer;
