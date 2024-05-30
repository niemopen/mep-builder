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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("./files.service");
const error_log_service_1 = require("../../error/error.log.service");
const files_dto_1 = require("./dto/files.dto");
const files_dto_2 = require("./dto/files.dto");
const files_dto_3 = require("./dto/files.dto");
const user_service_1 = require("../../user/user.service");
const mongorepo_service_1 = require("../mongorepository/mongorepo.service");
let FilesController = class FilesController {
    constructor(FilesService, UserService, MongoRepoService, ErrorLogService) {
        this.FilesService = FilesService;
        this.UserService = UserService;
        this.MongoRepoService = MongoRepoService;
        this.ErrorLogService = ErrorLogService;
    }
    async uploadFile(file, CreateFileDto, res) {
        const result = await this.FilesService.saveFileToDB(file, CreateFileDto);
        if (result != false || result.isSuccess == true) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                fileBlobId: result.fileBlobId,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async retrieveFile(CreateFileDto, res) {
        const userHasAccess = await this.UserService.userHasAccess(CreateFileDto.auditUser);
        const userOwnsPackage = await this.MongoRepoService.isPackageOwner(CreateFileDto.auditUser, CreateFileDto.packageId);
        if (userHasAccess && userOwnsPackage) {
            const file = await this.FilesService.retrieveFile(CreateFileDto.fileId);
            const fileBuffer = file.buffer;
            if (fileBuffer) {
                const json = JSON.stringify({
                    blob: fileBuffer.toString(CreateFileDto.encoding),
                });
                return res.status(common_1.HttpStatus.OK).json({
                    message: 'Post has been created successfully',
                    fileData: json,
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
    async translateToJsonLd(CreateFileDto, res) {
        const userHasAccess = await this.UserService.userHasAccess(CreateFileDto.auditUser);
        const userOwnsPackage = await this.MongoRepoService.isPackageOwner(CreateFileDto.auditUser, CreateFileDto.packageId);
        if (userHasAccess && userOwnsPackage) {
            const result = await this.FilesService.translateToJsonLd(CreateFileDto);
            if (result.isSuccess) {
                return res.status(common_1.HttpStatus.OK).send();
            }
            else {
                return this.ErrorLogService.errorControllerResponse(res, result.data);
            }
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async translateViaCMF(TranslateDto, res) {
        const userHasAccess = await this.UserService.userHasAccess(TranslateDto.auditUser);
        const userOwnsPackage = await this.MongoRepoService.isPackageOwner(TranslateDto.auditUser, TranslateDto.packageId);
        if (userHasAccess && userOwnsPackage) {
            const result = await this.FilesService.translateViaCMF(TranslateDto);
            if (TranslateDto.translateType === 'cmf') {
                await this.FilesService.generateCMFFile(TranslateDto.packageId, TranslateDto.auditUser);
            }
            if (result.isSuccess) {
                return res.status(common_1.HttpStatus.OK).send();
            }
            else {
                return this.ErrorLogService.errorControllerResponse(res, result.data);
            }
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async generateCMFFile(TranslateDto, res) {
        const userHasAccess = await this.UserService.userHasAccess(TranslateDto.auditUser);
        const userOwnsPackage = await this.MongoRepoService.isPackageOwner(TranslateDto.auditUser, TranslateDto.packageId);
        if (userHasAccess && userOwnsPackage) {
            const result = await this.FilesService.generateCMFFile(TranslateDto.packageId, TranslateDto.auditUser);
            if (result.isSuccess) {
                return res.status(common_1.HttpStatus.OK).json(result.data);
            }
            else {
                return this.ErrorLogService.errorControllerResponse(res, result.data);
            }
        }
        else {
            return res.status(common_1.HttpStatus.FORBIDDEN).send();
        }
    }
    async copySaveFile(CreateFileDto, res) {
        const result = await this.FilesService.copySaveFile(CreateFileDto);
        if (result.isSuccess) {
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                data: result,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
    async deleteFile(DeleteFileDto, res) {
        const userHasAccess = await this.UserService.userHasAccess(DeleteFileDto.auditUser);
        const userOwnsPackage = await this.MongoRepoService.isPackageOwner(DeleteFileDto.auditUser, DeleteFileDto.packageId);
        if (userHasAccess && userOwnsPackage) {
            const result = await this.FilesService.deleteFileFromDB(DeleteFileDto);
            if (result.isSuccess) {
                return res.status(common_1.HttpStatus.OK).json({
                    message: 'File has been deleted successfully',
                    data: result,
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
    (0, common_1.Post)('/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, files_dto_1.CreateFileDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('/retrieveFile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [files_dto_1.CreateFileDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "retrieveFile", null);
__decorate([
    (0, common_1.Post)('/translateToJsonLd'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [files_dto_1.CreateFileDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "translateToJsonLd", null);
__decorate([
    (0, common_1.Post)('/translateViaCMF'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [files_dto_2.TranslateDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "translateViaCMF", null);
__decorate([
    (0, common_1.Post)('/generateCMFFile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [files_dto_2.TranslateDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "generateCMFFile", null);
__decorate([
    (0, common_1.Post)('/copySaveFile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [files_dto_1.CreateFileDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "copySaveFile", null);
__decorate([
    (0, common_1.Delete)('/deleteFile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [files_dto_3.DeleteFileDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
FilesController = __decorate([
    (0, common_1.Controller)('Files'),
    __metadata("design:paramtypes", [files_service_1.FilesService,
        user_service_1.UserService,
        mongorepo_service_1.MongoRepoService,
        error_log_service_1.ErrorLogService])
], FilesController);
exports.FilesController = FilesController;
//# sourceMappingURL=files.controller.js.map