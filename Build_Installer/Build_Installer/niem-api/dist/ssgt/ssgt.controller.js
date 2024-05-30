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
exports.SSGTController = void 0;
const common_1 = require("@nestjs/common");
const ssgt_service_1 = require("./ssgt.service");
const ssgt_dto_1 = require("./dto/ssgt.dto");
const mongorepo_service_1 = require("../data/mongorepository/mongorepo.service");
const error_log_service_1 = require("../error/error.log.service");
let SSGTController = class SSGTController {
    constructor(SSGTService, MongoRepoService, ErrorLogService) {
        this.SSGTService = SSGTService;
        this.MongoRepoService = MongoRepoService;
        this.ErrorLogService = ErrorLogService;
    }
    async search(res, SSGTDTO) {
        const results = await this.SSGTService.search(SSGTDTO);
        return res.status(common_1.HttpStatus.OK).send(results);
    }
    async getElement(res, SSGTDTO) {
        const results = await this.SSGTService.getElement(SSGTDTO);
        return res.status(common_1.HttpStatus.OK).send(results);
    }
    async getElementType(res, SSGTDTO) {
        const results = await this.SSGTService.getElementType(SSGTDTO);
        return res.status(common_1.HttpStatus.OK).send(results);
    }
    async getSubsetSchema(res, SSGTDTO) {
        const subsetSchemaResult = await this.SSGTService.getSubsetSchema(SSGTDTO);
        if (subsetSchemaResult.isSuccess) {
            const encodedResponse = subsetSchemaResult.data['SOAP-ENV:Envelope']['SOAP-ENV:Body']['nm:GenerateSchemaResponse']['nm:Response']['nm:DataFile'];
            let cleanedEncodedResponse = encodedResponse.replace(/&amp;#13;/g, '');
            cleanedEncodedResponse = cleanedEncodedResponse.replace(/\s/g, '');
            const saveSubsetResult = await this.MongoRepoService.saveSubsetSchema(cleanedEncodedResponse, SSGTDTO);
            if (saveSubsetResult.isSuccess) {
                return res.status(common_1.HttpStatus.OK).send(cleanedEncodedResponse);
            }
            else {
                return this.ErrorLogService.errorControllerResponse(res, saveSubsetResult.data);
            }
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, subsetSchemaResult.data);
        }
    }
};
__decorate([
    (0, common_1.Post)('/search'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ssgt_dto_1.SSGTDTO]),
    __metadata("design:returntype", Promise)
], SSGTController.prototype, "search", null);
__decorate([
    (0, common_1.Post)('/getElement'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ssgt_dto_1.SSGTDTO]),
    __metadata("design:returntype", Promise)
], SSGTController.prototype, "getElement", null);
__decorate([
    (0, common_1.Post)('/getElementType'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ssgt_dto_1.SSGTDTO]),
    __metadata("design:returntype", Promise)
], SSGTController.prototype, "getElementType", null);
__decorate([
    (0, common_1.Post)('/getSubsetSchema'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ssgt_dto_1.SSGTDTO]),
    __metadata("design:returntype", Promise)
], SSGTController.prototype, "getSubsetSchema", null);
SSGTController = __decorate([
    (0, common_1.Controller)('SSGT'),
    __metadata("design:paramtypes", [ssgt_service_1.SSGTService,
        mongorepo_service_1.MongoRepoService,
        error_log_service_1.ErrorLogService])
], SSGTController);
exports.SSGTController = SSGTController;
//# sourceMappingURL=ssgt.controller.js.map