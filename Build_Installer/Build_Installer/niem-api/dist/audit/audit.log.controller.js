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
exports.AuditLogController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const error_log_service_1 = require("../error/error.log.service");
const audit_log_service_1 = require("./audit.log.service");
let AuditLogController = class AuditLogController {
    constructor(auditLogService, userService, errorLogService) {
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.errorLogService = errorLogService;
    }
    async getActivityLog(res, auditUser, query) {
        const userHasAccess = await this.userService.userHasAccess(auditUser, 'Admin');
        if (userHasAccess) {
            const fetchResult = await this.auditLogService.fetchActivityLog(auditUser, query, this.userService);
            if (fetchResult.isSuccess) {
                const cleanedResults = fetchResult.data.map((entry) => {
                    return {
                        dateTime: new Date(entry.event_date).toUTCString(),
                        eventType: entry.event_type ? entry.event_type : 'null',
                        collection: entry.collection_name ? entry.collection_name : 'null',
                        modifiedData: entry.modified_data ? entry.modified_data : 'null',
                        originalData: entry.original_data ? entry.original_data : 'null',
                        email: entry.email,
                    };
                });
                return res.status(common_1.HttpStatus.OK).json(cleanedResults);
            }
            else {
                return this.errorLogService.errorControllerResponse(res, fetchResult.data);
            }
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async getUserLastEvent(res, auditUser, userId) {
        const userHasAccess = await this.userService.userHasAccess(auditUser, 'Admin');
        if (userHasAccess) {
            const fetchResult = await this.auditLogService.getUserMostRecentEvent(auditUser, userId);
            if (fetchResult.isSuccess) {
                return res.status(common_1.HttpStatus.OK).json(fetchResult.data);
            }
            else {
                return this.errorLogService.errorControllerResponse(res, fetchResult.data);
            }
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async getUserStatusChange(res, auditUser, userId) {
        const userHasAccess = await this.userService.userHasAccess(auditUser, 'Admin');
        if (userHasAccess) {
            const fetchResult = await this.auditLogService.getLastStatusUpdate(userId, auditUser);
            if (fetchResult.isSuccess) {
                return res.status(common_1.HttpStatus.OK).json(fetchResult.data);
            }
            else {
                return this.errorLogService.errorControllerResponse(res, fetchResult.data);
            }
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
};
__decorate([
    (0, common_1.Post)('/getActivityLog'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('auditUser')),
    __param(2, (0, common_1.Body)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "getActivityLog", null);
__decorate([
    (0, common_1.Post)('/userLastEvent'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('auditUser')),
    __param(2, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "getUserLastEvent", null);
__decorate([
    (0, common_1.Post)('/userStatusChange'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('auditUser')),
    __param(2, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "getUserStatusChange", null);
AuditLogController = __decorate([
    (0, common_1.Controller)('Audit'),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService,
        user_service_1.UserService,
        error_log_service_1.ErrorLogService])
], AuditLogController);
exports.AuditLogController = AuditLogController;
//# sourceMappingURL=audit.log.controller.js.map