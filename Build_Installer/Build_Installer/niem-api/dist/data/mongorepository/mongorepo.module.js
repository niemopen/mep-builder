"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoRepoModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongorepo_controller_1 = require("./mongorepo.controller");
const mongorepo_service_1 = require("./mongorepo.service");
const audit_log_module_1 = require("../../audit/audit.log.module");
const files_module_1 = require("../files/files.module");
const gtri_module_1 = require("../../GTRIAPI2.0/gtri.module");
const error_log_module_1 = require("../../error/error.log.module");
const artifacttree_module_1 = require("../../artifactree/artifacttree.module");
const user_module_1 = require("../../user/user.module");
const pacakage_schema_1 = require("./schemas/pacakage.schema");
const artifacttree_schema_1 = require("./schemas/artifacttree.schema");
const fileblob_schema_1 = require("../files/schemas/fileblob.schema");
const mappingdoc_schema_1 = require("./schemas/mappingdoc.schema");
const propertycomponent_schema_1 = require("./schemas/components/propertycomponent.schema");
const typecomponent_schema_1 = require("./schemas/components/typecomponent.schema");
const typehaspropertycomponent_schema_1 = require("./schemas/components/typehaspropertycomponent.schema");
const codesfacetscomponent_schema_1 = require("./schemas/components/codesfacetscomponent.schema");
const namespacecomponent_schema_1 = require("./schemas/components/namespacecomponent.schema");
const localterminologycomponent_schema_1 = require("./schemas/components/localterminologycomponent.schema");
const typeunioncomponent_schema_1 = require("./schemas/components/typeunioncomponent.schema");
const metadatacomponent_schema_1 = require("./schemas/components/metadatacomponent.schema");
const propertycommonniemcomponent_schema_1 = require("./schemas/components/propertycommonniemcomponent.schema");
const typecommonniemcomponent_schema_1 = require("./schemas/components/typecommonniemcomponent.schema");
const custommodelextension_schema_1 = require("./schemas/custommodelextension.schema");
let MongoRepoModule = class MongoRepoModule {
};
MongoRepoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            audit_log_module_1.AuditLogModule,
            artifacttree_module_1.ArtifactTreeModule,
            error_log_module_1.ErrorLogModule,
            user_module_1.UserModule,
            (0, common_1.forwardRef)(() => files_module_1.FilesModule),
            (0, common_1.forwardRef)(() => gtri_module_1.GTRIModule),
            mongoose_1.MongooseModule.forFeature([{ name: 'Package', schema: pacakage_schema_1.PackageSchema }]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'ArtifactTree', schema: artifacttree_schema_1.ArtifactTreeSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([{ name: 'FileBlob', schema: fileblob_schema_1.FileBlobSchema }]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'MappingDoc', schema: mappingdoc_schema_1.MappingDocSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'PropertyComponent', schema: propertycomponent_schema_1.PropertyComponentSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'TypeComponent', schema: typecomponent_schema_1.TypeComponentSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'TypeHasPropertyComponent',
                    schema: typehaspropertycomponent_schema_1.TypeHasPropertyComponentSchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'CodesFacetsComponent',
                    schema: codesfacetscomponent_schema_1.CodesFacetsComponentSchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'NamespaceComponent',
                    schema: namespacecomponent_schema_1.NamespaceComponentSchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'LocalTerminologyComponent',
                    schema: localterminologycomponent_schema_1.LocalTerminologyComponentSchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'TypeUnionComponent',
                    schema: typeunioncomponent_schema_1.TypeUnionComponentSchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'MetadataComponent',
                    schema: metadatacomponent_schema_1.MetadataComponentSchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'PropertyCommonNIEMComponent',
                    schema: propertycommonniemcomponent_schema_1.PropertyCommonNIEMComponentSchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'TypeCommonNIEMComponent',
                    schema: typecommonniemcomponent_schema_1.TypeCommonNIEMComponentSchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'CustomModelExtension',
                    schema: custommodelextension_schema_1.CustomModelExtensionSchema,
                },
            ]),
        ],
        controllers: [mongorepo_controller_1.MongoRepoController],
        providers: [mongorepo_service_1.MongoRepoService],
        exports: [mongorepo_service_1.MongoRepoService],
    })
], MongoRepoModule);
exports.MongoRepoModule = MongoRepoModule;
//# sourceMappingURL=mongorepo.module.js.map