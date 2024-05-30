import { ApiProperty } from '@nestjs/swagger';
export class SearchPropertiesDto {
  @ApiProperty()
  readonly niemVersionNumber: string;
  @ApiProperty()
  readonly token: string;
  @ApiProperty()
  readonly substring: string;
  @ApiProperty()
  readonly prefix: string;
  @ApiProperty()
  readonly type: string;
  @ApiProperty()
  readonly isAbstract: boolean;
  @ApiProperty()
  readonly isElement: boolean;
  @ApiProperty()
  readonly offset: number;
  @ApiProperty()
  readonly limit: number;
}

export class SearchTypesDto {
  @ApiProperty()
  readonly niemVersionNumber: string;
  @ApiProperty()
  readonly token: string;
  @ApiProperty()
  readonly substring: string;
  @ApiProperty()
  readonly prefix: string;
  @ApiProperty()
  readonly offset: number;
  @ApiProperty()
  readonly limit: number;
}

export class ValidationDto {
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly fileBlobId: string;
  @ApiProperty()
  readonly schemaFileBlobId: string;
  @ApiProperty()
  readonly auditUser: string;
}
