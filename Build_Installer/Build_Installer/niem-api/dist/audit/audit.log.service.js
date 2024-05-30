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
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const error_log_service_1 = require("../error/error.log.service");
const collection = require("../util/collection.name.util");
let AuditLogService = class AuditLogService {
    constructor(AuditLogModel, errorLogService) {
        this.AuditLogModel = AuditLogModel;
        this.errorLogService = errorLogService;
    }
    scrubData(obj) {
        const s = JSON.stringify(obj);
        if (s.includes('salt') && s.includes('password_created')) {
            const startIndex = s.indexOf('salt');
            const endIndex = s.indexOf('password_created');
            const substring = s.substring(startIndex, endIndex);
            return s.replace(substring, '');
        }
        else {
            return s;
        }
    }
    async create(collectionName, userId, modifiedData) {
        await this.AuditLogModel.create({
            event_date: new Date(),
            event_type: 'create',
            collection_name: collectionName,
            userId: userId,
            modified_data: this.scrubData(modifiedData),
            original_data: null,
        });
    }
    async read(collectionName, userId, originalData) {
        await this.AuditLogModel.create({
            event_date: new Date(),
            event_type: 'read',
            collection_name: collectionName,
            userId: userId,
            modified_data: null,
            original_data: this.scrubData(originalData),
        });
    }
    async update(collectionName, userId, modifiedData, originalData) {
        await this.AuditLogModel.create({
            event_date: new Date(),
            event_type: 'update',
            collection_name: collectionName,
            userId: userId,
            modified_data: this.scrubData(modifiedData),
            original_data: this.scrubData(originalData),
        });
    }
    async delete(collectionName, userId, originalData) {
        await this.AuditLogModel.create({
            event_date: new Date(),
            event_type: 'delete',
            collection_name: collectionName,
            userId: userId,
            modified_data: null,
            original_data: this.scrubData(originalData),
        });
    }
    async fetchActivityLog(auditUser, query, userService) {
        try {
            let data;
            let email;
            if (query.email) {
                email = query.email;
                const userResult = await userService.findByEmail(query.email);
                delete query.email;
                query['userId'] = userResult.data._id;
            }
            data = await this.AuditLogModel.find(query);
            const cleanData = async (obj) => {
                if (!query.email) {
                    if (!!obj.userId && obj.userId.length === 24) {
                        const userInfo = await userService.findById(obj.userId);
                        if (userInfo) {
                            email = userInfo.email;
                        }
                        else {
                            email = '';
                        }
                    }
                    else {
                        email = '';
                    }
                }
                const cleanedObj = Object.assign(Object.assign({}, obj._doc), { email: email });
                if (!!cleanedObj.userId) {
                    delete cleanedObj.userId;
                }
                return cleanedObj;
            };
            const cleanedData = [];
            for (const entry of data) {
                const cleanedEntry = await cleanData(entry);
                cleanedData.push(cleanedEntry);
            }
            return { isSuccess: true, data: cleanedData };
        }
        catch (error) {
            return await this.errorLogService.errorServiceResponse(error, auditUser, collection.auditlog);
        }
    }
    async getUserMostRecentEvent(auditUser, userId) {
        try {
            const data = await this.AuditLogModel.find({
                userId: userId,
            });
            if (data.length > 0) {
                const mostRecentEvent = data[data.length - 1];
                return { isSuccess: true, data: mostRecentEvent };
            }
            else {
                return { isSuccess: true, data: false };
            }
        }
        catch (error) {
            return this.errorLogService.errorServiceResponse(error, auditUser);
        }
    }
    async getLastStatusUpdate(userId, auditUser) {
        try {
            const data = await this.AuditLogModel.find({
                collection_name: 'users',
                event_type: 'update',
            });
            const filteredData = data.filter((entry) => {
                const { account_locked: ogAccountLocked, account_revoked: ogAccountRevoked, account_denied: ogAccountDenied, _id: entryUserId, } = JSON.parse(entry.original_data);
                const { account_locked: modAccountLocked, account_revoked: modAccountRevoked, account_denied: modAccountDenied, } = JSON.parse(entry.modified_data);
                if (entryUserId === userId) {
                    if (!ogAccountLocked && modAccountLocked) {
                        return entry;
                    }
                    else if (!ogAccountRevoked && modAccountRevoked) {
                        return entry;
                    }
                    else if (!ogAccountDenied && modAccountDenied) {
                        return entry;
                    }
                    else if (ogAccountLocked &&
                        (!modAccountLocked || !modAccountRevoked)) {
                        return entry;
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return null;
                }
            });
            if (filteredData.length > 0) {
                return { isSuccess: true, data: filteredData[filteredData.length - 1] };
            }
            else {
                return { isSuccess: true, data: false };
            }
        }
        catch (error) {
            return this.errorLogService.errorServiceResponse(error, auditUser);
        }
    }
};
AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('AuditLog')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        error_log_service_1.ErrorLogService])
], AuditLogService);
exports.AuditLogService = AuditLogService;
//# sourceMappingURL=audit.log.service.js.map