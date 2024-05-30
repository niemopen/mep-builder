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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainDto = exports.ReleaseDto = exports.MigrationDto = exports.NiemDataDto = exports.AssociationDto = exports.AugmentationDto = exports.ParentTypeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ParentTypeDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ParentTypeDto.prototype, "searchString", void 0);
exports.ParentTypeDto = ParentTypeDto;
class AugmentationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AugmentationDto.prototype, "searchString", void 0);
exports.AugmentationDto = AugmentationDto;
class AssociationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AssociationDto.prototype, "searchString", void 0);
exports.AssociationDto = AssociationDto;
class NiemDataDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], NiemDataDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], NiemDataDto.prototype, "releases", void 0);
exports.NiemDataDto = NiemDataDto;
class MigrationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MigrationDto.prototype, "packageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MigrationDto.prototype, "auditUser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], MigrationDto.prototype, "releases", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MigrationDto.prototype, "startingRelease", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MigrationDto.prototype, "endRelease", void 0);
exports.MigrationDto = MigrationDto;
class ReleaseDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReleaseDto.prototype, "release", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReleaseDto.prototype, "element", void 0);
exports.ReleaseDto = ReleaseDto;
class DomainDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DomainDto.prototype, "release", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], DomainDto.prototype, "domainPrefix", void 0);
exports.DomainDto = DomainDto;
//# sourceMappingURL=releases.dto.js.map