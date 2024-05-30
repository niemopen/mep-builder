import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoRepoController } from './mongorepo.controller';
import { MongoRepoService } from './mongorepo.service';
import { AuditLogModule } from 'src/audit/audit.log.module';
import { FilesModule } from '../files/files.module';
import { GTRIModule } from 'src/GTRIAPI2.0/gtri.module';
import { ErrorLogModule } from 'src/error/error.log.module';
import { ArtifactTreeModule } from 'src/artifactree/artifacttree.module';
import { UserModule } from 'src/user/user.module';
import { PackageSchema } from './schemas/pacakage.schema';
import { ArtifactTreeSchema } from './schemas/artifacttree.schema';
import { FileBlobSchema } from '../files/schemas/fileblob.schema';
import { MappingDocSchema } from './schemas/mappingdoc.schema';
import { PropertyComponentSchema } from './schemas/components/propertycomponent.schema';
import { TypeComponentSchema } from './schemas/components/typecomponent.schema';
import { TypeHasPropertyComponentSchema } from './schemas/components/typehaspropertycomponent.schema';
import { CodesFacetsComponentSchema } from './schemas/components/codesfacetscomponent.schema';
import { NamespaceComponentSchema } from './schemas/components/namespacecomponent.schema';
import { LocalTerminologyComponentSchema } from './schemas/components/localterminologycomponent.schema';
import { TypeUnionComponentSchema } from './schemas/components/typeunioncomponent.schema';
import { MetadataComponentSchema } from './schemas/components/metadatacomponent.schema';
import { PropertyCommonNIEMComponentSchema } from './schemas/components/propertycommonniemcomponent.schema';
import { TypeCommonNIEMComponentSchema } from './schemas/components/typecommonniemcomponent.schema';
import { CustomModelExtensionSchema } from './schemas/custommodelextension.schema';

@Module({
  imports: [
    AuditLogModule,
    ArtifactTreeModule,
    ErrorLogModule,
    UserModule,
    forwardRef(() => FilesModule),
    forwardRef(() => GTRIModule),
    MongooseModule.forFeature([{ name: 'Package', schema: PackageSchema }]),
    MongooseModule.forFeature([
      { name: 'ArtifactTree', schema: ArtifactTreeSchema },
    ]),
    MongooseModule.forFeature([{ name: 'FileBlob', schema: FileBlobSchema }]),
    MongooseModule.forFeature([
      { name: 'MappingDoc', schema: MappingDocSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'PropertyComponent', schema: PropertyComponentSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'TypeComponent', schema: TypeComponentSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: 'TypeHasPropertyComponent',
        schema: TypeHasPropertyComponentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'CodesFacetsComponent',
        schema: CodesFacetsComponentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'NamespaceComponent',
        schema: NamespaceComponentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'LocalTerminologyComponent',
        schema: LocalTerminologyComponentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'TypeUnionComponent',
        schema: TypeUnionComponentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'MetadataComponent',
        schema: MetadataComponentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'PropertyCommonNIEMComponent',
        schema: PropertyCommonNIEMComponentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'TypeCommonNIEMComponent',
        schema: TypeCommonNIEMComponentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: 'CustomModelExtension',
        schema: CustomModelExtensionSchema,
      },
    ]),
  ],
  controllers: [MongoRepoController],
  providers: [MongoRepoService],
  exports: [MongoRepoService],
})
export class MongoRepoModule {}
