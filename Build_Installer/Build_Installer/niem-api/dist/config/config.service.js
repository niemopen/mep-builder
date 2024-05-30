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
exports.DatabaseConfig = exports.config = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const config = () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 9090,
    database: {
        uri: process.env.REPOSITORY_MONGO_URL + '/' + process.env.REPOSITORY_MONGO_DB,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        authMechanism: (process.env.MDB_AUTH_MECHANISM ||
            'SCRAM-SHA-256'),
        user: process.env.MDB_USERNAME,
        pass: process.env.MDB_PASSWORD,
        auth: {
            user: process.env.MDB_USERNAME || 'niemuser',
            password: process.env.MDB_PASSWORD || 'example',
        },
        authSource: process.env.MDB_AUTH_SOURCE || 'niemdb',
    },
});
exports.config = config;
let DatabaseConfig = class DatabaseConfig {
    constructor(configService) {
        this.configService = configService;
    }
    createMongooseOptions() {
        const x = (0, exports.config)().database;
        console.log(` ---- ${JSON.stringify(x)}`);
        return x;
    }
};
DatabaseConfig = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseConfig);
exports.DatabaseConfig = DatabaseConfig;
//# sourceMappingURL=config.service.js.map