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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_service_1 = require("../audit/audit.log.service");
const collections = require("../util/collection.name.util");
const error_log_service_1 = require("../error/error.log.service");
let UserService = class UserService {
    constructor(UserModel, AuditLogService, ErrorLogService) {
        this.UserModel = UserModel;
        this.AuditLogService = AuditLogService;
        this.ErrorLogService = ErrorLogService;
    }
    async userHasAccess(userId, requiredRole = 'User') {
        const roleTable = {
            User: 1,
            Admin: 2,
            SuperAdmin: 3,
            SysAdmin: 4,
        };
        const user = await this.UserModel.findById(userId);
        if (user) {
            return (!(user.account_pending ||
                user.account_denied ||
                user.account_locked ||
                user.account_revoked) && roleTable[user.user_role] >= roleTable[requiredRole]);
        }
        else {
            return false;
        }
    }
    caseInsensitiveRegEx(regStr) {
        return new RegExp('^' + regStr + '$', 'i');
    }
    async create(UserDto, auditUser) {
        const email = this.caseInsensitiveRegEx(UserDto.email);
        const existingUser = await this.UserModel.findOne({ email: email }).exec();
        if (existingUser !== null) {
            return { isSuccessful: false, message: 'userExists' };
        }
        else {
            try {
                const createdUser = await this.UserModel.create(UserDto);
                createdUser.save();
                if (auditUser === 'request') {
                    auditUser = createdUser._id;
                }
                this.AuditLogService.create(collections.users, auditUser, createdUser);
                return {
                    isSuccessful: true,
                    message: 'success',
                    userId: createdUser._id,
                };
            }
            catch (err) {
                console.error(err);
                return { isSuccessful: false, message: 'createFail' };
            }
        }
    }
    async findAll() {
        return await this.UserModel.find({}, { hash: 0 }).exec();
    }
    async findAllPending() {
        return await this.UserModel.find({ account_pending: true }, { hash: 0 }).exec();
    }
    async findByEmail(email) {
        try {
            const user = await this.UserModel.findOne({ email: this.caseInsensitiveRegEx(email) }, { hash: 0 }).exec();
            return { isSuccess: true, data: user };
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, null, 'User');
        }
    }
    async findById(userId) {
        const user = await this.UserModel.findOne({ _id: userId }, { hash: 0 }).exec();
        return user;
    }
    async findPasswordById(userId) {
        try {
            const user = await this.UserModel.findOne({ _id: userId }, { hash: 1 }).exec();
            return user;
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, userId, 'User');
        }
    }
    async findByDisplayName(username) {
        const user = await this.UserModel.findOne({
            display_name: this.caseInsensitiveRegEx(username),
        }).exec();
        return user;
    }
    async find(req) {
        return await this.UserModel.find(req).exec();
    }
    async updateById(userId, UserDto, auditUser) {
        const ogData = await this.UserModel.findOne({ _id: userId });
        const modData = await this.UserModel.findOneAndUpdate({ _id: userId }, UserDto, { new: true });
        const scrubbedModData = this.AuditLogService.scrubData(modData);
        this.AuditLogService.update(collections.users, auditUser, modData, ogData);
        return JSON.parse(scrubbedModData);
    }
    async deleteById(DeleteUserDto) {
        let isSuccess = true;
        try {
            if (DeleteUserDto.auditUser !== DeleteUserDto.userId) {
                const deletedUser = await this.UserModel.findByIdAndDelete(DeleteUserDto.userId).exec();
                await this.AuditLogService.delete(collections.users, DeleteUserDto.auditUser, deletedUser);
            }
            else {
                isSuccess = false;
            }
        }
        catch (error) {
            isSuccess = false;
        }
        return isSuccess;
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_log_service_1.AuditLogService,
        error_log_service_1.ErrorLogService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map