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
exports.ArtifactTreeController = void 0;
const common_1 = require("@nestjs/common");
const artifacttree_service_1 = require("./artifacttree.service");
let ArtifactTreeController = class ArtifactTreeController {
    constructor(ArtifactTreeService) {
        this.ArtifactTreeService = ArtifactTreeService;
    }
    async retrieveArtifactTree(packageId, res) {
        const artifactTreeJSON = await this.ArtifactTreeService.getArtifactTreeJSON(packageId);
        if (artifactTreeJSON) {
            const jsonString = JSON.stringify(artifactTreeJSON);
            return res.status(common_1.HttpStatus.OK).json({
                message: 'Post has been created successfully',
                data: jsonString,
            });
        }
        else {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send();
        }
    }
};
__decorate([
    (0, common_1.Get)('/:packageId'),
    __param(0, (0, common_1.Param)('packageId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArtifactTreeController.prototype, "retrieveArtifactTree", null);
ArtifactTreeController = __decorate([
    (0, common_1.Controller)('ArtifactTree'),
    __metadata("design:paramtypes", [artifacttree_service_1.ArtifactTreeService])
], ArtifactTreeController);
exports.ArtifactTreeController = ArtifactTreeController;
//# sourceMappingURL=artifacttree.controller.js.map