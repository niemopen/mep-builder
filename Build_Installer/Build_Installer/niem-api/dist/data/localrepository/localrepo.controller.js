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
exports.LocalRepoController = void 0;
const common_1 = require("@nestjs/common");
const localrepo_service_1 = require("./localrepo.service");
const localrepo_dto_1 = require("./dto/localrepo.dto");
let LocalRepoController = class LocalRepoController {
    constructor(LocalRepoService) {
        this.LocalRepoService = LocalRepoService;
    }
    async getSubsetSchemaZip(res, CreateLocalRepoDto) {
        const packageDataBuffer = await this.LocalRepoService.getSubsetSchemaZip(CreateLocalRepoDto);
        if (packageDataBuffer === false) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
        else {
            const json = JSON.stringify({
                blob: packageDataBuffer.toString('base64'),
            });
            return res.status(common_1.HttpStatus.OK).json(json);
        }
    }
    async deletePackage(res, CreateLocalRepoDto) {
        const isSuccess = await this.LocalRepoService.deletePackage(CreateLocalRepoDto);
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
};
__decorate([
    (0, common_1.Post)('/subsetSchemaZip'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, localrepo_dto_1.CreateLocalRepoDto]),
    __metadata("design:returntype", Promise)
], LocalRepoController.prototype, "getSubsetSchemaZip", null);
__decorate([
    (0, common_1.Delete)('/delete'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, localrepo_dto_1.CreateLocalRepoDto]),
    __metadata("design:returntype", Promise)
], LocalRepoController.prototype, "deletePackage", null);
LocalRepoController = __decorate([
    (0, common_1.Controller)('LocalRepo'),
    __metadata("design:paramtypes", [localrepo_service_1.LocalRepoService])
], LocalRepoController);
exports.LocalRepoController = LocalRepoController;
//# sourceMappingURL=localrepo.controller.js.map