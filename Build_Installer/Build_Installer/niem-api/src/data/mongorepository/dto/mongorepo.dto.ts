import { ApiProperty } from '@nestjs/swagger';

export class SavePackageDto {
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly userId: string;
  @ApiProperty()
  readonly packageName: string;
  @ApiProperty()
  readonly niemRelease: string;
  @ApiProperty()
  readonly version: string;
  @ApiProperty()
  readonly status: string;
  @ApiProperty()
  readonly statusNo: string;
  @ApiProperty()
  readonly poc: string;
  @ApiProperty()
  readonly pocEmail: string;
  @ApiProperty()
  readonly description: string;
  @ApiProperty()
  readonly orgName: string;
  @ApiProperty()
  readonly orgType: string;
  @ApiProperty()
  readonly coiTags: string;
  @ApiProperty()
  readonly exchangeTags: string;
  @ApiProperty()
  readonly format: string;
  @ApiProperty()
  readonly isReleaseLocked: boolean;
  @ApiProperty()
  readonly isRequiredArtifactUploaded: string;
  @ApiProperty()
  readonly cmeData: string;
  @ApiProperty()
  readonly artifactTree: string;
  @ApiProperty()
  readonly mappingDoc: string;
  @ApiProperty()
  readonly isPublished: boolean;
  @ApiProperty()
  readonly isCopiedPackage: boolean;
  @ApiProperty()
  readonly isMigratedPackage: boolean;
  @ApiProperty()
  readonly isTranslationGenerated: boolean;
  @ApiProperty()
  readonly validationArtifacts: Array<Object>;
  @ApiProperty()
  readonly showValidationResults: boolean;
}

export class SaveCMEDataDto {
  @ApiProperty()
  readonly cmeData: string;
  @ApiProperty()
  readonly packageId: string;
}

export class ExportPackageDto {
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly nodeId: string;
  @ApiProperty()
  readonly auditUser: string;
}

export class DeletePackageDto {
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly auditUser: string;
}

export class MappingComponentDto {
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly propertySheet: string;
  @ApiProperty()
  readonly typeSheet: string;
  @ApiProperty()
  readonly typeHasPropertySheet: string;
  @ApiProperty()
  readonly codesFacetsSheet: string;
  @ApiProperty()
  readonly namespaceSheet: string;
  @ApiProperty()
  readonly localTerminologySheet: string;
  @ApiProperty()
  readonly typeUnionSheet: string;
  @ApiProperty()
  readonly metadataSheet: string;
}

export class CommonComponentsDto {
  @ApiProperty()
  readonly searchString: string;
  @ApiProperty()
  readonly searchType: string;
}

export class TransferPackagesDto {
  @ApiProperty()
  readonly transferToUserId: string;
  @ApiProperty()
  readonly transferFromUserId: string;
  @ApiProperty()
  readonly packagesToTransfer: Array<Object>;
  @ApiProperty()
  readonly packagePocMap: Object;
  @ApiProperty()
  readonly packagePocEmailMap: Object;
}
