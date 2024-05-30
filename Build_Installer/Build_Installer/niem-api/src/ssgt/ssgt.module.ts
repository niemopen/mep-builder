import { Module } from '@nestjs/common';
import { SSGTController } from './ssgt.controller';
import { SSGTService } from './ssgt.service';
import { AuditLogModule } from 'src/audit/audit.log.module';
import { MongoRepoModule } from 'src/data/mongorepository/mongorepo.module';
import { ErrorLogModule } from 'src/error/error.log.module';

@Module({
  imports: [AuditLogModule, MongoRepoModule, ErrorLogModule],
  controllers: [SSGTController],
  providers: [SSGTService],
})
export class SsgtModule {}
