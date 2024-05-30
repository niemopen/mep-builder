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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_dto_1 = require("./dto/user.dto");
const deleteuser_dto_1 = require("./dto/deleteuser.dto");
const error_log_service_1 = require("../error/error.log.service");
let UserController = class UserController {
    constructor(UserService, ErrorLogService) {
        this.UserService = UserService;
        this.ErrorLogService = ErrorLogService;
    }
    async createUser(res, UserDto, auditUser) {
        const createResponse = await this.UserService.create(UserDto, auditUser);
        if (createResponse.isSuccessful) {
            return res.status(common_1.HttpStatus.OK).json({ userId: createResponse.userId });
        }
        else if (createResponse.message === 'userExists') {
            return res.status(common_1.HttpStatus.CONFLICT).send();
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async findAll(res, auditUser) {
        const userHasAccess = await this.UserService.userHasAccess(auditUser, 'Admin');
        if (userHasAccess) {
            const lists = await this.UserService.findAll();
            return res.status(common_1.HttpStatus.OK).json(lists);
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async findAllPending(res, auditUser) {
        const userHasAccess = await this.UserService.userHasAccess(auditUser, 'Admin');
        if (userHasAccess) {
            const lists = await this.UserService.findAllPending();
            return res.status(common_1.HttpStatus.OK).json(lists);
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async doesUserExist(res, email) {
        const result = await this.UserService.findByEmail(email);
        if (result.isSuccess) {
            if (result.data) {
                return res.status(common_1.HttpStatus.OK).json({ userExists: true });
            }
            else {
                return res.status(common_1.HttpStatus.OK).json({ userExists: false });
            }
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async findById(res, userId) {
        const lists = await this.UserService.findById(userId);
        if (!lists)
            throw new common_1.NotFoundException('Id does not exist!');
        return res.status(common_1.HttpStatus.OK).json(lists);
    }
    async updateById(res, userId, UserDto, auditUser) {
        const lists = await this.UserService.updateById(userId, UserDto, auditUser);
        if (!lists)
            throw new common_1.NotFoundException('Id does not exist!');
        return res.status(common_1.HttpStatus.OK).json({
            message: 'Post has been successfully updated',
            lists,
        });
    }
    async deleteById(res, DeleteUserDto) {
        const userHasAccess = await this.UserService.userHasAccess(DeleteUserDto.auditUser, 'Admin');
        if (userHasAccess) {
            const isSuccess = await this.UserService.deleteById(DeleteUserDto);
            if (isSuccess) {
                return res.status(common_1.HttpStatus.OK).json({
                    message: 'User deleted successfully',
                    isSuccess,
                });
            }
            else {
                return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
            }
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
};
__decorate([
    (0, common_1.Post)('/create'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('userData')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_dto_1.UserDto, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('/:auditUser'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('/pending/:auditUser'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAllPending", null);
__decorate([
    (0, common_1.Get)('/exists/:email'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "doesUserExist", null);
__decorate([
    (0, common_1.Get)('/findUserById/:userId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)('/updateById/:userId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)('userData')),
    __param(3, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, user_dto_1.UserDto, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateById", null);
__decorate([
    (0, common_1.Delete)('/deleteById'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, deleteuser_dto_1.DeleteUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteById", null);
UserController = __decorate([
    (0, common_1.Controller)('User'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        error_log_service_1.ErrorLogService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map