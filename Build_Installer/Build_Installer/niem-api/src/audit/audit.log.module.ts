import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogController } from './audit.log.controller';
import { AuditLogService } from './audit.log.service';
import { AuditLogSchema } from './schemas/audit.log.schema';
import { ErrorLogModule } from 'src/error/error.log.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AuditLog', schema: AuditLogSchema }]),
    ErrorLogModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
