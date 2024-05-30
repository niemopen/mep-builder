"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStringValid = exports.getStringValue = void 0;
const getStringValue = (string, stringType = null) => {
    if (string === '' || string === undefined || string === null) {
        return stringType;
    }
    else {
        return string;
    }
};
exports.getStringValue = getStringValue;
const isStringValid = (string) => {
    if (string === '' || string === undefined || string === null) {
        return false;
    }
    else {
        return true;
    }
};
exports.isStringValid = isStringValid;
//# sourceMappingURL=dataValidation.util.js.map