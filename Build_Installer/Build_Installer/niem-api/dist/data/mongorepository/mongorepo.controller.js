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
exports.MongoRepoController = void 0;
const common_1 = require("@nestjs/common");
const mongorepo_service_1 = require("./mongorepo.service");
const mongorepo_dto_1 = require("./dto/mongorepo.dto");
const error_log_service_1 = require("../../error/error.log.service");
const user_service_1 = require("../../user/user.service");
let MongoRepoController = class MongoRepoController {
    constructor(MongoRepoService, ErrorLogService, UserService) {
        this.MongoRepoService = MongoRepoService;
        this.ErrorLogService = ErrorLogService;
        this.UserService = UserService;
    }
    async savePackage(res, SavePackageDto, auditUser) {
        const result = await this.MongoRepoService.savePackage(SavePackageDto, auditUser);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                packageId: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async deletePackage(res, DeletePackageDto) {
        const userHasAccess = await this.UserService.userHasAccess(DeletePackageDto.auditUser);
        if (userHasAccess) {
            const isSuccess = await this.MongoRepoService.deletePackage(DeletePackageDto);
            if (isSuccess) {
                return res.status(common_1.HttpStatus.OK).json({
                    message: 'Package deleted successfully',
                    isSuccess,
                });
            }
            else {
                return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
            }
        }
        else {
            res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async findPackagesByUserId(res, userId) {
        const result = await this.MongoRepoService.findPackagesByUserId(userId);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return await this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async findPublishedPackages(res, auditUser) {
        const userHasAccess = await this.UserService.userHasAccess(auditUser, 'User');
        const result = await this.MongoRepoService.findPublishedPackages();
        if (userHasAccess) {
            if (result.response) {
                return res.status(common_1.HttpStatus.OK).json({
                    message: 'Post has been created successfully',
                    publishedPackages: result.publishedPackages,
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
    async findMPDData(res, userId) {
        const mpdData = await this.MongoRepoService.findMPDData(userId);
        return res.status(common_1.HttpStatus.OK).json(mpdData);
    }
    async getSortedMpdDataStandlone(res, auditUser) {
        const userHasAccess = await this.UserService.userHasAccess(auditUser, 'User');
        if (userHasAccess) {
            const mpdData = await this.MongoRepoService.getSortedMpdData();
            return res.status(common_1.HttpStatus.OK).json(mpdData);
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async getSortedMpdData(res, userId) {
        const userHasAccess = await this.UserService.userHasAccess(userId, 'User');
        if (userHasAccess) {
            const mpdData = await this.MongoRepoService.getSortedMpdData(userId);
            return res.status(common_1.HttpStatus.OK).json(mpdData);
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async findByPackageId(res, packageId, auditUser) {
        const userHasAccess = await this.UserService.userHasAccess(auditUser, 'User');
        if (userHasAccess) {
            const packageData = await this.MongoRepoService.findByPackageId(packageId);
            return res.status(common_1.HttpStatus.OK).json(packageData);
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async saveComponents(res, MappingComponentDto, auditUser) {
        const result = await this.MongoRepoService.saveComponents(MappingComponentDto, auditUser);
        return res.status(common_1.HttpStatus.OK).json({
            message: 'Post has been created successfully',
            packageId: result,
        });
    }
    async saveCMEData(res, SaveCMEDataDto, auditUser) {
        const result = await this.MongoRepoService.saveCMEData(SaveCMEDataDto, auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        else if (result.data.errorStatus !== undefined) {
            return res.status(result.data.errorStatus).json(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorId: null,
                errorStatus: 500,
                errorMessage: 'Internal Server Error',
            });
        }
    }
    async buildCMEData(res, SaveCMEDataDto, auditUser) {
        const result = await this.MongoRepoService.buildCMEData(SaveCMEDataDto, auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        else if (result.data.errorStatus !== undefined) {
            return res.status(result.data.errorStatus).json(result.data);
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorId: null,
                errorStatus: 500,
                errorMessage: 'Internal Server Error',
            });
        }
    }
    async getExportFileData(res, ExportPackageDto) {
        const userHasAccess = await this.UserService.userHasAccess(ExportPackageDto.auditUser);
        if (userHasAccess) {
            const fileDataBuffer = await this.MongoRepoService.getExportFileData(ExportPackageDto);
            if (fileDataBuffer.data === false) {
                return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
            }
            else {
                const json = JSON.stringify({
                    blob: fileDataBuffer.data.toString('base64'),
                    type: fileDataBuffer.type,
                });
                return res.status(common_1.HttpStatus.OK).json(json);
            }
        }
        else {
            res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async getCommonComponents(res, CommonComponentsDto) {
        const result = await this.MongoRepoService.getCommonComponents(CommonComponentsDto);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                commonComponents: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async updateArtifactStatus(res, SavePackageDto, auditUser) {
        const result = await this.MongoRepoService.updateArtifactStatus(SavePackageDto, auditUser);
        if (result !== false) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                artifactChecklist: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getArtifactChecklist(res, packageId) {
        const result = await this.MongoRepoService.getArtifactChecklist(packageId);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                artifactChecklist: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getTransaltionGenerationStatus(res, packageId) {
        const result = await this.MongoRepoService.getTranslationGenerationStatus(packageId);
        if (result.response) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                isTranslationGenerated: result.isTranslationGenerated,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async updateTranslationGenerationStatus(res, SavePackageDto, auditUser) {
        const result = await this.MongoRepoService.updateTranslationGenerationStatus(SavePackageDto, auditUser);
        if (result !== false) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                translationGenerationStaus: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getCustomExtensionsById(res, packageId) {
        const result = await this.MongoRepoService.getAllCustomModelExtensions(packageId);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Data has been retrieved successfully',
                customExtensions: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async transferPackages(res, transferPackagesDto, auditUser) {
        const result = await this.MongoRepoService.transferPackages(transferPackagesDto, auditUser);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
        }
        else {
            return await this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
};
__decorate([
    (0, common_1.Post)('/savePackage'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('packageData')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.SavePackageDto, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "savePackage", null);
__decorate([
    (0, common_1.Delete)('/deletePackage'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.DeletePackageDto]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "deletePackage", null);
__decorate([
    (0, common_1.Get)('/packages/:userId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "findPackagesByUserId", null);
__decorate([
    (0, common_1.Post)('/publishedPackages/'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "findPublishedPackages", null);
__decorate([
    (0, common_1.Get)('/mpdData/:userId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "findMPDData", null);
__decorate([
    (0, common_1.Get)('/sortedMpdData/'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "getSortedMpdDataStandlone", null);
__decorate([
    (0, common_1.Get)('/sortedMpdData/:userId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "getSortedMpdData", null);
__decorate([
    (0, common_1.Post)('/getPackageData/:packageId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('packageId')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "findByPackageId", null);
__decorate([
    (0, common_1.Post)('/saveComponents'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('componentData')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.MappingComponentDto, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "saveComponents", null);
__decorate([
    (0, common_1.Post)('/saveCMEData'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('cmeData')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.SaveCMEDataDto, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "saveCMEData", null);
__decorate([
    (0, common_1.Post)('/buildCMEData'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('cmeData')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.SaveCMEDataDto, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "buildCMEData", null);
__decorate([
    (0, common_1.Post)('/export'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.ExportPackageDto]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "getExportFileData", null);
__decorate([
    (0, common_1.Post)('/getCommonComponents'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.CommonComponentsDto]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "getCommonComponents", null);
__decorate([
    (0, common_1.Post)('/updateArtifactChecklist'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('packageData')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.SavePackageDto, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "updateArtifactStatus", null);
__decorate([
    (0, common_1.Get)('/getArtifactChecklist/:packageId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('packageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "getArtifactChecklist", null);
__decorate([
    (0, common_1.Get)('/getTranslationGenerationStatus/:packageId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('packageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "getTransaltionGenerationStatus", null);
__decorate([
    (0, common_1.Patch)('/updateTranslationGenerationStatus'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('packageData')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.SavePackageDto, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "updateTranslationGenerationStatus", null);
__decorate([
    (0, common_1.Get)('/getCustomExtensions/:packageId'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('packageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "getCustomExtensionsById", null);
__decorate([
    (0, common_1.Post)('/transferPackages/'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('transferData')),
    __param(2, (0, common_1.Body)('auditUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mongorepo_dto_1.TransferPackagesDto, String]),
    __metadata("design:returntype", Promise)
], MongoRepoController.prototype, "transferPackages", null);
MongoRepoController = __decorate([
    (0, common_1.Controller)('MongoRepo'),
    __metadata("design:paramtypes", [mongorepo_service_1.MongoRepoService,
        error_log_service_1.ErrorLogService,
        user_service_1.UserService])
], MongoRepoController);
exports.MongoRepoController = MongoRepoController;
//# sourceMappingURL=mongorepo.controller.js.map