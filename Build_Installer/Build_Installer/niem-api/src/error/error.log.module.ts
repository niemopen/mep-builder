import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorLogService } from './error.log.service';
import { ErrorLogSchema } from './schemas/error.log.schema';
import { ErrorLogController } from './error.log.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: 'ErrorLog', schema: ErrorLogSchema }]),
  ],
  providers: [ErrorLogService],
  exports: [ErrorLogService],
  controllers: [ErrorLogController],
})
export class ErrorLogModule {}
