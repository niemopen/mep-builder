import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import {
  NiemPropertySchema,
  NiemTypeSchema,
  NiemNamspaceSchema,
  NiemFacetSchema,
  NiemLocalTermSchema,
  NiemMetadataSchema,
  NiemTypeContainsPropertySchema,
  NiemTypeUnionSchema,
  NiemChangelogPropertySchema,
  NiemChangelogTypeSchema,
  NiemChangelogTypeContainsPropertySchema,
  NiemChangelogFacetSchema,
  NiemChangelogNamespaceSchema,
} from './schemas/releases.schema';
import { ErrorLogModule } from 'src/error/error.log.module';
import { FilesModule } from '../files/files.module';
import { GTRIModule } from 'src/GTRIAPI2.0/gtri.module';
import { MappingDocSchema } from '../mongorepository/schemas/mappingdoc.schema';

@Module({
  imports: [
    ErrorLogModule,
    FilesModule,
    GTRIModule,
    MongooseModule.forFeature([
      { name: 'NiemProperty', schema: NiemPropertySchema },
    ]),
    MongooseModule.forFeature([{ name: 'NiemType', schema: NiemTypeSchema }]),
    MongooseModule.forFeature([
      { name: 'NiemNamespace', schema: NiemNamspaceSchema },
    ]),
    MongooseModule.forFeature([{ name: 'NiemFacet', schema: NiemFacetSchema }]),
    MongooseModule.forFeature([
      { name: 'NiemLocalTerm', schema: NiemLocalTermSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'NiemMetadata', schema: NiemMetadataSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: 'NiemTypeContainsProperty',
        schema: NiemTypeContainsPropertySchema,
      },
    ]),
    MongooseModule.forFeature([
      { name: 'NiemTypeUnion', schema: NiemTypeUnionSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'NiemChangelogProperty', schema: NiemChangelogPropertySchema },
    ]),
    MongooseModule.forFeature([
      { name: 'NiemChangelogType', schema: NiemChangelogTypeSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: 'NiemChangelogTypeContainsProperty',
        schema: NiemChangelogTypeContainsPropertySchema,
      },
    ]),
    MongooseModule.forFeature([
      { name: 'NiemChangelogFacet', schema: NiemChangelogFacetSchema },
    ]),
    MongooseModule.forFeature([
      {
        name: 'NiemChangelogNamespace',
        schema: NiemChangelogNamespaceSchema,
      },
    ]),
    MongooseModule.forFeature([
      { name: 'MappingDoc', schema: MappingDocSchema },
    ]),
  ],
  controllers: [ReleasesController],
  providers: [ReleasesService],
  exports: [ReleasesService],
})
export class ReleasesModule {}
