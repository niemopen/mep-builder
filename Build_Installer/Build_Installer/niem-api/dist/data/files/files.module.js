"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const files_controller_1 = require("./files.controller");
const files_service_1 = require("./files.service");
const mongoose_1 = require("@nestjs/mongoose");
const fileblob_schema_1 = require("./schemas/fileblob.schema");
const pacakage_schema_1 = require("../mongorepository/schemas/pacakage.schema");
const audit_log_module_1 = require("../../audit/audit.log.module");
const artifacttree_module_1 = require("../../artifactree/artifacttree.module");
const mongorepo_module_1 = require("../mongorepository/mongorepo.module");
const gtri_module_1 = require("../../GTRIAPI2.0/gtri.module");
const error_log_module_1 = require("../../error/error.log.module");
const user_module_1 = require("../../user/user.module");
let FilesModule = class FilesModule {
};
FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            audit_log_module_1.AuditLogModule,
            mongoose_1.MongooseModule.forFeature([{ name: 'FileBlob', schema: fileblob_schema_1.FileBlobSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'Package', schema: pacakage_schema_1.PackageSchema }]),
            artifacttree_module_1.ArtifactTreeModule,
            (0, common_1.forwardRef)(() => gtri_module_1.GTRIModule),
            error_log_module_1.ErrorLogModule,
            (0, common_1.forwardRef)(() => mongorepo_module_1.MongoRepoModule),
            user_module_1.UserModule,
        ],
        controllers: [files_controller_1.FilesController],
        providers: [files_service_1.FilesService],
        exports: [files_service_1.FilesService],
    })
], FilesModule);
exports.FilesModule = FilesModule;
//# sourceMappingURL=files.module.js.map