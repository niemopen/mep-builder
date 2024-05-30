import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import { AuthMechanism } from 'mongodb';
export declare const config: () => {
    nodeEnv: string;
    port: string | number;
    database: {
        uri: string;
        useNewUrlParser: boolean;
        useUnifiedTopology: boolean;
        authMechanism: AuthMechanism;
        user: string;
        pass: string;
        auth: {
            user: string;
            password: string;
        };
        authSource: string;
    };
};
export declare class DatabaseConfig implements MongooseOptionsFactory {
    private configService;
    constructor(configService: ConfigService);
    createMongooseOptions(): MongooseModuleOptions | Promise<MongooseModuleOptions>;
}
