import { Module, forwardRef } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileBlobSchema } from './schemas/fileblob.schema';
import { PackageSchema } from '../mongorepository/schemas/pacakage.schema';
import { AuditLogModule } from 'src/audit/audit.log.module';
import { ArtifactTreeModule } from 'src/artifactree/artifacttree.module';
import { MongoRepoModule } from '../mongorepository/mongorepo.module';
import { GTRIModule } from 'src/GTRIAPI2.0/gtri.module';
import { ErrorLogModule } from 'src/error/error.log.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    AuditLogModule,
    MongooseModule.forFeature([{ name: 'FileBlob', schema: FileBlobSchema }]),
    MongooseModule.forFeature([{ name: 'Package', schema: PackageSchema }]),
    ArtifactTreeModule,
    forwardRef(() => GTRIModule),
    ErrorLogModule,
    forwardRef(() => MongoRepoModule),
    UserModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
