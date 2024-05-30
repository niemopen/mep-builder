import { Module, forwardRef } from '@nestjs/common';
import { GTRIService } from './gtri.service';
import { GTRIAPIController } from './gtri.controller';
import { ErrorLogModule } from 'src/error/error.log.module';
import { FilesModule } from 'src/data/files/files.module';
import { MongoRepoModule } from 'src/data/mongorepository/mongorepo.module';

@Module({
  imports: [
    ErrorLogModule,
    forwardRef(() => MongoRepoModule),
    forwardRef(() => FilesModule),
  ],
  controllers: [GTRIAPIController],
  providers: [GTRIService],
  exports: [GTRIService],
})
export class GTRIModule {}
