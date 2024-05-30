"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const user_module_1 = require("./user/user.module");
const mongorepo_module_1 = require("./data/mongorepository/mongorepo.module");
const files_module_1 = require("./data/files/files.module");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const config_service_1 = require("./config/config.service");
const auth_module_1 = require("./auth/auth.module");
const audit_log_module_1 = require("./audit/audit.log.module");
const ssgt_module_1 = require("./ssgt/ssgt.module");
const releases_module_1 = require("./data/releases/releases.module");
const error_log_module_1 = require("./error/error.log.module");
let AppModule = class AppModule {
    configure(consumer) {
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            mongorepo_module_1.MongoRepoModule,
            files_module_1.FilesModule,
            auth_module_1.AuthModule,
            audit_log_module_1.AuditLogModule,
            releases_module_1.ReleasesModule,
            error_log_module_1.ErrorLogModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_service_1.config],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useClass: config_service_1.DatabaseConfig,
            }),
            ssgt_module_1.SsgtModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map