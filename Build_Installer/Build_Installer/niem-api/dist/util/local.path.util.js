"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalPath = void 0;
const getLocalPath = (isStandAloneSys, username = null) => {
    return isStandAloneSys
        ? require('os').homedir() + '/NIEM_DATA/'
        : '/NIEM_DATA/' + username + '/';
};
exports.getLocalPath = getLocalPath;
//# sourceMappingURL=local.path.util.js.map