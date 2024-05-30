import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtifactTreeController } from './artifacttree.controller';
import { ArtifactTreeService } from './artifacttree.service';
import { AuditLogModule } from 'src/audit/audit.log.module';
import { ArtifactTreeSchema } from 'src/data/mongorepository/schemas/artifacttree.schema';
import { FilesModule } from 'src/data/files/files.module';
import { UserModule } from 'src/user/user.module';
import { MongoRepoModule } from 'src/data/mongorepository/mongorepo.module';

@Module({
  imports: [
    AuditLogModule,
    UserModule,
    forwardRef(() => FilesModule),
    forwardRef(() => MongoRepoModule),
    MongooseModule.forFeature([
      { name: 'ArtifactTree', schema: ArtifactTreeSchema },
    ]),
  ],
  controllers: [ArtifactTreeController],
  providers: [ArtifactTreeService],
  exports: [ArtifactTreeService],
})
export class ArtifactTreeModule {}
