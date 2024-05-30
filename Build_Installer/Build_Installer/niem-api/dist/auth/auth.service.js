"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const crypto = require("crypto");
const error_log_service_1 = require("../error/error.log.service");
let AuthService = class AuthService {
    constructor(usersService, ErrorLogService) {
        this.usersService = usersService;
        this.ErrorLogService = ErrorLogService;
    }
    async validateUser(username, userId, pass) {
        try {
            let user;
            if (username.toLocaleLowerCase() === 'sysadmin') {
                user = await this.usersService.findByDisplayName(username);
            }
            else {
                user = await this.usersService.findPasswordById(userId);
            }
            return { isSuccess: true, data: user && user.hash == pass };
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, userId);
        }
    }
    async validateUserById(userId, pass) {
        let user;
        user = await this.usersService.findPasswordById(userId);
        if (user && user.hash == pass) {
            const { password } = user, result = __rest(user, ["password"]);
            return result;
        }
        return null;
    }
    async accountStatus(username, userId) {
        try {
            let user;
            if (username.toLocaleLowerCase() === 'sysadmin') {
                user = await this.usersService.findByDisplayName(username);
            }
            else {
                user = await this.usersService.findById(userId);
            }
            if (user === null) {
                return { isSuccess: true, data: false };
            }
            let accountStatus = {
                isAccountLocked: false,
                isPasswordExpired: false,
                isPasswordExpiring: false,
                daysUntilLocked: 0,
            };
            const numOfWarningDays = 10;
            const expirationDay = 90;
            const warningDay = expirationDay - numOfWarningDays;
            const splitDate = user.password_created.split('-');
            const date = new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);
            const timeElapsed = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
            const daysLeft = Math.ceil(expirationDay - timeElapsed);
            if (user.account_locked || user.account_revoked) {
                accountStatus = Object.assign(Object.assign({}, accountStatus), { isAccountLocked: true });
            }
            else if (timeElapsed >= expirationDay) {
                accountStatus = Object.assign(Object.assign({}, accountStatus), { isAccountLocked: true, isPasswordExpired: true });
                await this.usersService.updateById(user._id, {
                    account_locked: true,
                }, 'sys');
            }
            else {
                accountStatus = Object.assign(Object.assign({}, accountStatus), { isAccountLocked: false });
            }
            if (timeElapsed >= warningDay) {
                accountStatus = Object.assign(Object.assign({}, accountStatus), { isPasswordExpiring: true, daysUntilLocked: daysLeft });
            }
            else {
                accountStatus = Object.assign(Object.assign({}, accountStatus), { isPasswordExpiring: false, daysUntilLocked: daysLeft });
            }
            return { isSuccess: true, data: accountStatus };
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, userId);
        }
    }
    async cryptoRehash(passwordToReHash, savedSalt) {
        const ITERATIONS = 10000;
        const PASSWORD_LENGTH = 256;
        const DIGEST = 'sha256';
        const BYTE_TO_STRING_ENCODING = 'base64';
        const normalizedPassword = passwordToReHash.normalize('NFC');
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(normalizedPassword, savedSalt, ITERATIONS, PASSWORD_LENGTH, DIGEST, (err, hash) => {
                if (err) {
                    reject(new Error(err.toString()));
                }
                else {
                    resolve(hash.toString(BYTE_TO_STRING_ENCODING));
                }
            });
        });
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        error_log_service_1.ErrorLogService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map