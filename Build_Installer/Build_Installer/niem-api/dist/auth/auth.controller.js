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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_dto_1 = require("./auth.dto");
const local_strategy_1 = require("./local.strategy");
const user_service_1 = require("../user/user.service");
const error_log_service_1 = require("../error/error.log.service");
let AuthController = class AuthController {
    constructor(LocalStrategy, UserService, ErrorLogService) {
        this.LocalStrategy = LocalStrategy;
        this.UserService = UserService;
        this.ErrorLogService = ErrorLogService;
    }
    async login(res, CreateAuthDto) {
        const userResult = await this.UserService.findByEmail(CreateAuthDto.username);
        if (userResult.isSuccess) {
            const user = userResult.data;
            const encryptResult = await this.LocalStrategy.rehashPassword(CreateAuthDto.password, user.salt);
            if (encryptResult.isSuccess) {
                const encryptedPassword = encryptResult.data;
                const validationResult = await this.LocalStrategy.validate(CreateAuthDto.username, user._id, encryptedPassword);
                if (validationResult.isSuccess) {
                    const isValid = validationResult.data;
                    const statusResult = await this.LocalStrategy.accountStatus(CreateAuthDto.username, user._id);
                    if (statusResult.isSuccess) {
                        const status = statusResult.data;
                        return res.status(common_1.HttpStatus.OK).json({
                            isUserValidated: isValid,
                            userId: user._id,
                            status: status,
                        });
                    }
                    else {
                        return this.ErrorLogService.errorControllerResponse(res, statusResult.data);
                    }
                }
                else {
                    return this.ErrorLogService.errorControllerResponse(res, validationResult.data);
                }
            }
            else {
                return this.ErrorLogService.errorControllerResponse(res, encryptResult.data);
            }
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, userResult.data);
        }
    }
    async validateUser(res, CreateAuthDto) {
        const isValid = await this.LocalStrategy.validateById(CreateAuthDto.userId, CreateAuthDto.password);
        return res.status(common_1.HttpStatus.OK).json({
            isUserValidated: isValid,
        });
    }
    async accountStatus(res, CreateAuthDto) {
        const statusResult = await this.LocalStrategy.accountStatus(CreateAuthDto.username, CreateAuthDto.userId);
        if (statusResult.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(statusResult.data);
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, statusResult.data);
        }
    }
};
__decorate([
    (0, common_1.Post)('/login'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.CreateAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('/validateUser'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.CreateAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateUser", null);
__decorate([
    (0, common_1.Post)('/accountStatus'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.CreateAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "accountStatus", null);
AuthController = __decorate([
    (0, common_1.Controller)('Auth'),
    __metadata("design:paramtypes", [local_strategy_1.LocalStrategy,
        user_service_1.UserService,
        error_log_service_1.ErrorLogService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map