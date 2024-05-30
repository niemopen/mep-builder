// it is an object because we need to wait that the app loads all the environment variables

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
//import{ TypeOrmOptionFactory} from '@nestjs/typeorm'
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { AuthMechanism } from 'mongodb';

export const config = () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 9090,
  database: {
    //uri: process.env.REPOSITORY_MONGO_URL || 'mongodb://localhost:27017' + '/' + process.env.REPOSITORY_MONGO_DB || 'niemdb',
    uri:
      process.env.REPOSITORY_MONGO_URL + '/' + process.env.REPOSITORY_MONGO_DB,
    // url: process.env.REPOSITORY_MONGO_URL || 'mongodb://mongodb:27017',
    // db: process.env.REPOSITORY_MONGO_DB || '/niemdb?retryWrites=true&w=majority',
    //options: {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    authMechanism: (process.env.MDB_AUTH_MECHANISM ||
      'SCRAM-SHA-256') as AuthMechanism,
    user: process.env.MDB_USERNAME,
    pass: process.env.MDB_PASSWORD,
    auth: {
      user: process.env.MDB_USERNAME || 'niemuser',
      password: process.env.MDB_PASSWORD || 'example',
    },
    authSource: process.env.MDB_AUTH_SOURCE || 'niemdb',
  },
  ///}
});

@Injectable()
export class DatabaseConfig implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) {}
  createMongooseOptions():
    | MongooseModuleOptions
    | Promise<MongooseModuleOptions> {
    const x = config().database;
    console.log(` ---- ${JSON.stringify(x)}`);
    return x; //this.configService.get('database')
  }
}
