import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { AuditLogModule } from 'src/audit/audit.log.module';
import { ErrorLogModule } from 'src/error/error.log.module';

@Module({
  imports: [
    AuditLogModule,
    ErrorLogModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
