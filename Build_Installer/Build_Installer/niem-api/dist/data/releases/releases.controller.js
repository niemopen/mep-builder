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
exports.ReleasesController = void 0;
const common_1 = require("@nestjs/common");
const releases_service_1 = require("./releases.service");
const releases_dto_1 = require("./dto/releases.dto");
const error_log_service_1 = require("../../error/error.log.service");
let ReleasesController = class ReleasesController {
    constructor(ReleasesService, ErrorLogService) {
        this.ReleasesService = ReleasesService;
        this.ErrorLogService = ErrorLogService;
    }
    async getParentType(res, ParentTypeDto) {
        const result = await this.ReleasesService.getParentType(ParentTypeDto);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                parentType: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getAugmentations(res, AugmentationDto) {
        const result = await this.ReleasesService.getAugmentations(AugmentationDto);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                augmentations: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getAssociations(res, AssociationDto) {
        const result = await this.ReleasesService.getAssociations(AssociationDto);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                associations: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async migrateRelease(res, MigrationDto) {
        const result = await this.ReleasesService.migrateRelease(MigrationDto);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Release migrated successfully',
                status: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async migrateReleaseViaGTRI(res, MigrationDto) {
        const result = await this.ReleasesService.migrateReleasViaGTRI(MigrationDto);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json(result.data);
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
    async getNamespaceData(res, ReleaseDto) {
        const result = await this.ReleasesService.getNamespaceData(ReleaseDto);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Namespace found successfully',
                status: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getDomainItems(res, DomainDto) {
        const result = await this.ReleasesService.getDomainElements(DomainDto);
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Domain elements found successfully',
                status: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async getReleaseProgressStatus(res) {
        const result = this.ReleasesService.getReleaseProgressStatus();
        if (result) {
            return res.status(common_1.HttpStatus.OK).json({
                status: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async updateReleaseViaNiem(res, userId, currentRelease) {
        const result = await this.ReleasesService.updateReleaseViaNiem(userId, currentRelease);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json({
                result: result.data,
            });
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async checkAvailableReleases(res) {
        const result = await this.ReleasesService.checkAvailableReleases();
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json({
                releases: result,
            });
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
    async getLoadedReleases(res) {
        const result = await this.ReleasesService.getLoadedReleases();
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json({
                releases: result.data,
            });
        }
        else {
            return this.ErrorLogService.errorControllerResponse(res, result.data);
        }
    }
};
__decorate([
    (0, common_1.Post)('/getParentType'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, releases_dto_1.ParentTypeDto]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "getParentType", null);
__decorate([
    (0, common_1.Post)('/getAugmentations'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, releases_dto_1.AugmentationDto]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "getAugmentations", null);
__decorate([
    (0, common_1.Post)('/getAssociations'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, releases_dto_1.AssociationDto]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "getAssociations", null);
__decorate([
    (0, common_1.Post)('/migrateRelease'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, releases_dto_1.MigrationDto]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "migrateRelease", null);
__decorate([
    (0, common_1.Post)('/migrateReleaseViaGTRI'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, releases_dto_1.MigrationDto]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "migrateReleaseViaGTRI", null);
__decorate([
    (0, common_1.Post)('/getNamespaceData'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, releases_dto_1.ReleaseDto]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "getNamespaceData", null);
__decorate([
    (0, common_1.Post)('/getDomainElements'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, releases_dto_1.DomainDto]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "getDomainItems", null);
__decorate([
    (0, common_1.Get)('/getReleaseProgressStatus'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "getReleaseProgressStatus", null);
__decorate([
    (0, common_1.Post)('/updateReleaseViaNiem'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('currentRelease')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "updateReleaseViaNiem", null);
__decorate([
    (0, common_1.Get)('/checkAvailableReleases'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "checkAvailableReleases", null);
__decorate([
    (0, common_1.Get)('/getLoadedReleases'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReleasesController.prototype, "getLoadedReleases", null);
ReleasesController = __decorate([
    (0, common_1.Controller)('Releases'),
    __metadata("design:paramtypes", [releases_service_1.ReleasesService,
        error_log_service_1.ErrorLogService])
], ReleasesController);
exports.ReleasesController = ReleasesController;
//# sourceMappingURL=releases.controller.js.map