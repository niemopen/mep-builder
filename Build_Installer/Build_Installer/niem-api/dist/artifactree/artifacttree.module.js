"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactTreeModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const artifacttree_controller_1 = require("./artifacttree.controller");
const artifacttree_service_1 = require("./artifacttree.service");
const audit_log_module_1 = require("../audit/audit.log.module");
const artifacttree_schema_1 = require("../data/mongorepository/schemas/artifacttree.schema");
const files_module_1 = require("../data/files/files.module");
const user_module_1 = require("../user/user.module");
const mongorepo_module_1 = require("../data/mongorepository/mongorepo.module");
let ArtifactTreeModule = class ArtifactTreeModule {
};
ArtifactTreeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            audit_log_module_1.AuditLogModule,
            user_module_1.UserModule,
            (0, common_1.forwardRef)(() => files_module_1.FilesModule),
            (0, common_1.forwardRef)(() => mongorepo_module_1.MongoRepoModule),
            mongoose_1.MongooseModule.forFeature([
                { name: 'ArtifactTree', schema: artifacttree_schema_1.ArtifactTreeSchema },
            ]),
        ],
        controllers: [artifacttree_controller_1.ArtifactTreeController],
        providers: [artifacttree_service_1.ArtifactTreeService],
        exports: [artifacttree_service_1.ArtifactTreeService],
    })
], ArtifactTreeModule);
exports.ArtifactTreeModule = ArtifactTreeModule;
//# sourceMappingURL=artifacttree.module.js.map