import { ApiProperty } from '@nestjs/swagger';

export class ParentTypeDto {
  @ApiProperty()
  readonly searchString: string;
}

export class AugmentationDto {
  @ApiProperty()
  readonly searchString: string;
}

export class AssociationDto {
  @ApiProperty()
  readonly searchString: string;
}

export class NiemDataDto {
  @ApiProperty()
  readonly userId: string;
  @ApiProperty()
  readonly releases: string[];
}

export class MigrationDto {
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly auditUser: string;
  @ApiProperty()
  readonly releases: string[];
  @ApiProperty()
  readonly startingRelease: string;
  @ApiProperty()
  readonly endRelease: string;
}

export class ReleaseDto {
  @ApiProperty()
  readonly release: string;
  @ApiProperty()
  readonly element: string;
}

export class DomainDto {
  @ApiProperty()
  readonly release: string;
  @ApiProperty()
  readonly domainPrefix: string;
}
