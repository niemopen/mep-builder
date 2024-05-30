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
exports.ErrorLogController = void 0;
const common_1 = require("@nestjs/common");
const error_log_service_1 = require("./error.log.service");
const user_service_1 = require("../user/user.service");
let ErrorLogController = class ErrorLogController {
    constructor(ErrorLogService, UserService) {
        this.ErrorLogService = ErrorLogService;
        this.UserService = UserService;
    }
    async logWebuiError(res, error, auditUser) {
        const userHasAccess = await this.UserService.userHasAccess(auditUser);
        if (userHasAccess || error.status === 403) {
            const serviceResult = await this.ErrorLogService.errorServiceResponse(error, auditUser);
            return this.ErrorLogService.errorControllerResponse(res, serviceResult.data);
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async getErrorLog(res, auditUser, query) {
        const userHasAccess = await this.UserService.userHasAccess(auditUser, 'Admin');
        if (userHasAccess) {
            const fetchResult = await this.ErrorLogService.getErrorLog(auditUser, query, this.UserService);
            if (fetchResult.isSuccess) {
                const cleanedData = [];
                for (const entry of fetchResult.data) {
                    const errorDescriptionJson = JSON.parse(entry.event_description);
                    cleanedData.push({
                        dateTime: new Date(entry.event_date).toUTCString(),
                        eventStatus: errorDescriptionJson.status
                            ? errorDescriptionJson.status
                            : 500,
                        collection: entry.collection_name ? entry.collection_name : 'null',
                        eventDescription: entry.event_description
                            ? entry.event_description
                            : 'null',
                        email: entry.email ? entry.email : 'null',
                    });
                }
                return res.status(common_1.HttpStatus.OK).json(cleanedData);
            }
            else {
                return this.ErrorLogService.errorControllerResponse(res, fetchResult.data);
            }
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
};
__decorate([
    (0, common_1.Post)('/log'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('errorData')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ErrorLogController.prototype, "logWebuiError", null);
__decorate([
    (0, common_1.Post)('/getErrorLog'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('auditUser')),
    __param(2, (0, common_1.Body)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ErrorLogController.prototype, "getErrorLog", null);
ErrorLogController = __decorate([
    (0, common_1.Controller)('Error'),
    __metadata("design:paramtypes", [error_log_service_1.ErrorLogService,
        user_service_1.UserService])
], ErrorLogController);
exports.ErrorLogController = ErrorLogController;
//# sourceMappingURL=error.log.controller.js.map