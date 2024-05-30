import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongoRepoModule } from './data/mongorepository/mongorepo.module';
import { FilesModule } from './data/files/files.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { config, DatabaseConfig } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { AuditLogModule } from './audit/audit.log.module';
import { SsgtModule } from './ssgt/ssgt.module';
import { ReleasesModule } from './data/releases/releases.module';
import { ErrorLogModule } from './error/error.log.module';

@Module({
  imports: [
    UserModule,
    MongoRepoModule,
    FilesModule,
    AuthModule,
    AuditLogModule,
    ReleasesModule,
    ErrorLogModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    SsgtModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // throw new Error('Method not implemented.');
  }
}
