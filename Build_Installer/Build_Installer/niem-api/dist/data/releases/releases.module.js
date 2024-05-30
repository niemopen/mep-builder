"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleasesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const releases_controller_1 = require("./releases.controller");
const releases_service_1 = require("./releases.service");
const releases_schema_1 = require("./schemas/releases.schema");
const error_log_module_1 = require("../../error/error.log.module");
const files_module_1 = require("../files/files.module");
const gtri_module_1 = require("../../GTRIAPI2.0/gtri.module");
const mappingdoc_schema_1 = require("../mongorepository/schemas/mappingdoc.schema");
let ReleasesModule = class ReleasesModule {
};
ReleasesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            error_log_module_1.ErrorLogModule,
            files_module_1.FilesModule,
            gtri_module_1.GTRIModule,
            mongoose_1.MongooseModule.forFeature([
                { name: 'NiemProperty', schema: releases_schema_1.NiemPropertySchema },
            ]),
            mongoose_1.MongooseModule.forFeature([{ name: 'NiemType', schema: releases_schema_1.NiemTypeSchema }]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'NiemNamespace', schema: releases_schema_1.NiemNamspaceSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([{ name: 'NiemFacet', schema: releases_schema_1.NiemFacetSchema }]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'NiemLocalTerm', schema: releases_schema_1.NiemLocalTermSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'NiemMetadata', schema: releases_schema_1.NiemMetadataSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'NiemTypeContainsProperty',
                    schema: releases_schema_1.NiemTypeContainsPropertySchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'NiemTypeUnion', schema: releases_schema_1.NiemTypeUnionSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'NiemChangelogProperty', schema: releases_schema_1.NiemChangelogPropertySchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'NiemChangelogType', schema: releases_schema_1.NiemChangelogTypeSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'NiemChangelogTypeContainsProperty',
                    schema: releases_schema_1.NiemChangelogTypeContainsPropertySchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'NiemChangelogFacet', schema: releases_schema_1.NiemChangelogFacetSchema },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'NiemChangelogNamespace',
                    schema: releases_schema_1.NiemChangelogNamespaceSchema,
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                { name: 'MappingDoc', schema: mappingdoc_schema_1.MappingDocSchema },
            ]),
        ],
        controllers: [releases_controller_1.ReleasesController],
        providers: [releases_service_1.ReleasesService],
        exports: [releases_service_1.ReleasesService],
    })
], ReleasesModule);
exports.ReleasesModule = ReleasesModule;
//# sourceMappingURL=releases.module.js.map