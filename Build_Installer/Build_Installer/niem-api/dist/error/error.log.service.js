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
exports.ErrorLogService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const collection = require("../util/collection.name.util");
const stringify = require('json-stringify-safe');
let ErrorLogService = class ErrorLogService {
    constructor(ErrorLogModel) {
        this.ErrorLogModel = ErrorLogModel;
    }
    scrubData(s) {
        let resultString = s;
        if (s.includes('salt') && s.includes('password_created')) {
            const startIndex = s.indexOf('salt');
            const endIndex = s.indexOf('password_created');
            const substring = s.substring(startIndex, endIndex);
            resultString = s.replace(substring, '');
        }
        if (resultString.includes('password') && resultString.includes('code')) {
            const startIndex = resultString.lastIndexOf('password');
            const endIndex = resultString.lastIndexOf('code');
            const substring = resultString.substring(startIndex, endIndex);
            resultString = resultString.replace(substring, '');
        }
        return resultString;
    }
    async logError(collectionName, userId = null, eventDescription) {
        return await this.ErrorLogModel.create({
            event_date: new Date(),
            collection_name: collectionName,
            userId: userId === '' ? null : userId,
            event_description: this.scrubData(eventDescription),
        });
    }
    async getErrorLog(auditUser, query, userService) {
        try {
            if (query.email) {
                const userResult = await userService.findByEmail(query.email);
                delete query.email;
                query['userId'] = userResult.data._id;
            }
            const data = await this.ErrorLogModel.find(query);
            const cleanData = async (obj) => {
                const userInfo = await userService.findById(obj.userId);
                const s = JSON.stringify(obj);
                if (s.includes('userId') && s.includes('event_description')) {
                    const startIndex = s.indexOf('userId');
                    const endIndex = s.indexOf('event_description');
                    const substring = s.substring(startIndex, endIndex);
                    if (userInfo) {
                        return s.replace(substring, `email":"${userInfo.email}","`);
                    }
                    else {
                        return s.replace(substring, `email":"","`);
                    }
                }
            };
            const cleanedData = [];
            for (const entry of data) {
                const cleanedEntry = await cleanData(entry);
                cleanedData.push(JSON.parse(cleanedEntry));
            }
            return { isSuccess: true, data: cleanedData };
        }
        catch (error) {
            return await this.errorServiceResponse(error, auditUser, collection.errorlog);
        }
    }
    errorControllerResponse(res, data) {
        if (data.errorStatus !== undefined) {
            return res.status(data.errorStatus).json(data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorId: null,
                errorStatus: 500,
                errorMessage: 'Internal Server Error',
            });
        }
    }
    async errorServiceResponse(error, auditUser, collection = '') {
        console.error(error);
        const dbRecord = await this.logError(collection, auditUser, stringify(error));
        return {
            isSuccess: false,
            data: {
                errorId: dbRecord._id,
                errorStatus: error.status,
                errorMessage: error,
            },
        };
    }
};
ErrorLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('ErrorLog')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ErrorLogService);
exports.ErrorLogService = ErrorLogService;
//# sourceMappingURL=error.log.service.js.map