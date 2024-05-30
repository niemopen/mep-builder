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
exports.GTRIAPIController = void 0;
const common_1 = require("@nestjs/common");
const gtri_service_1 = require("./gtri.service");
const error_log_service_1 = require("../error/error.log.service");
const gtri_api_2_0_dto_1 = require("./dto/gtri.api.2.0.dto");
let GTRIAPIController = class GTRIAPIController {
    constructor(GTRIService, ErrorLogService) {
        this.GTRIService = GTRIService;
        this.ErrorLogService = ErrorLogService;
    }
    async transformModels(res, from, to, file, userId) {
        const result = await this.GTRIService.transformModel(from, to, file, userId);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async getAllProperties(res, version) {
        const result = await this.GTRIService.getAllProperties(version);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).send(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getProperty(res, version, qname) {
        const result = await this.GTRIService.getProperty(version, qname);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).send(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getPropertiesByNamespace(res, version, prefix) {
        const result = await this.GTRIService.getPropertiesByNamespace(version, prefix);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).send(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getType(res, version, qname) {
        const result = await this.GTRIService.getType(version, qname);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).send(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getTypesByNamespace(res, version, prefix) {
        const result = await this.GTRIService.getTypesByNamespace(version, prefix);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).send(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getTypeSubproperties(res, version, qname) {
        const result = await this.GTRIService.getTypeSubproperties(version, qname);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).send(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getAllNamespaces(res, version) {
        const result = await this.GTRIService.getAllNamespaces(version);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).send(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getNamespace(res, version, prefix) {
        const result = await this.GTRIService.getNamespace(version, prefix);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).send(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getFacets(res, version, qname) {
        const result = await this.GTRIService.getFacets(version, qname);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).send(result.data);
        }
        else {
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async searchProperties(res, SearchPropertiesDto) {
        const result = await this.GTRIService.searchProperties(SearchPropertiesDto);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async searchTypes(res, SearchTypesDto) {
        const result = await this.GTRIService.searchTypes(SearchTypesDto);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async validationMessageSpecification(res, ValidationDto) {
        const result = await this.GTRIService.validateMessageSpecification(ValidationDto.packageId, ValidationDto.auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async validationMessageCatalog(res, ValidationDto) {
        const result = await this.GTRIService.validateMessageCatalog(ValidationDto.fileBlobId, ValidationDto.auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async validationSchemaNDR(res, ValidationDto) {
        const result = await this.GTRIService.validateSchemaNDR(ValidationDto.packageId, ValidationDto.auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async validationSchemaXML(res, ValidationDto) {
        const result = await this.GTRIService.validateSchemaXML(ValidationDto.packageId, ValidationDto.auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async validationCmfXML(res, ValidationDto) {
        const result = await this.GTRIService.validateCmfXML(ValidationDto.fileBlobId, ValidationDto.auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async validationInstanceJSON(res, ValidationDto) {
        if (!ValidationDto.schemaFileBlobId) {
            const stringify = require('json-stringify-safe');
            const dbRecord = await this.ErrorLogService.logError('', ValidationDto.auditUser, stringify('Schema not found to validate this instance file.'));
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorId: dbRecord._id,
                errorStatus: 500,
                errorMessage: 'Internal Server Error - Schema not found to validate this instance file. Try translating the package to JSON Schema.',
            });
        }
        const result = await this.GTRIService.validateInstanceJSON(ValidationDto.fileBlobId, ValidationDto.schemaFileBlobId, ValidationDto.auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async validationInstanceXML(res, ValidationDto) {
        const result = await this.GTRIService.validateInstanceXML(ValidationDto.packageId, ValidationDto.fileBlobId, ValidationDto.auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
};
__decorate([
    (0, common_1.Post)('/transformModels'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('from')),
    __param(2, (0, common_1.Body)('to')),
    __param(3, (0, common_1.Body)('file')),
    __param(4, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Buffer, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "transformModels", null);
__decorate([
    (0, common_1.Get)('/getAllProperties/:version'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "getAllProperties", null);
__decorate([
    (0, common_1.Get)('/getProperty/:version/:qname'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('version')),
    __param(2, (0, common_1.Param)('qname')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "getProperty", null);
__decorate([
    (0, common_1.Get)('/getPropertiesByNamespace/:version/:prefix'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('version')),
    __param(2, (0, common_1.Param)('prefix')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "getPropertiesByNamespace", null);
__decorate([
    (0, common_1.Get)('/getType/:version/:qname'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('version')),
    __param(2, (0, common_1.Param)('qname')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "getType", null);
__decorate([
    (0, common_1.Get)('/getTypesByNamespace/:version/:prefix'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('version')),
    __param(2, (0, common_1.Param)('prefix')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "getTypesByNamespace", null);
__decorate([
    (0, common_1.Get)('/getTypeSubproperties/:version/:qname'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('version')),
    __param(2, (0, common_1.Param)('qname')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "getTypeSubproperties", null);
__decorate([
    (0, common_1.Get)('/getAllNamespaces/:version'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "getAllNamespaces", null);
__decorate([
    (0, common_1.Get)('/getNamespace/:version/:prefix'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('version')),
    __param(2, (0, common_1.Param)('prefix')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "getNamespace", null);
__decorate([
    (0, common_1.Get)('/getFacets/:version/:qname'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('version')),
    __param(2, (0, common_1.Param)('qname')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "getFacets", null);
__decorate([
    (0, common_1.Post)('/searchProperties'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gtri_api_2_0_dto_1.SearchPropertiesDto]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "searchProperties", null);
__decorate([
    (0, common_1.Post)('/searchTypes'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gtri_api_2_0_dto_1.SearchTypesDto]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "searchTypes", null);
__decorate([
    (0, common_1.Post)('/validation/message-specification'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gtri_api_2_0_dto_1.ValidationDto]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "validationMessageSpecification", null);
__decorate([
    (0, common_1.Post)('/validation/message-catalog'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gtri_api_2_0_dto_1.ValidationDto]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "validationMessageCatalog", null);
__decorate([
    (0, common_1.Post)('/validation/schemas/ndr'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gtri_api_2_0_dto_1.ValidationDto]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "validationSchemaNDR", null);
__decorate([
    (0, common_1.Post)('/validation/schemas/xml'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gtri_api_2_0_dto_1.ValidationDto]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "validationSchemaXML", null);
__decorate([
    (0, common_1.Post)('/validation/cmf/xml'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gtri_api_2_0_dto_1.ValidationDto]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "validationCmfXML", null);
__decorate([
    (0, common_1.Post)('/validation/instances/json'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gtri_api_2_0_dto_1.ValidationDto]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "validationInstanceJSON", null);
__decorate([
    (0, common_1.Post)('/validation/instances/xml'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, gtri_api_2_0_dto_1.ValidationDto]),
    __metadata("design:returntype", Promise)
], GTRIAPIController.prototype, "validationInstanceXML", null);
GTRIAPIController = __decorate([
    (0, common_1.Controller)('GTRIAPI'),
    __metadata("design:paramtypes", [gtri_service_1.GTRIService,
        error_log_service_1.ErrorLogService])
], GTRIAPIController);
exports.GTRIAPIController = GTRIAPIController;
//# sourceMappingURL=gtri.controller.js.map