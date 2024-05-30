import { ApiProperty } from '@nestjs/swagger';
export class SSGTDTO {
  @ApiProperty()
  readonly auditUser: string;
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly value: string;
  @ApiProperty()
  readonly searchString: string;
  @ApiProperty()
  readonly release: string;
  @ApiProperty()
  readonly wantlist: string;
  @ApiProperty()
  readonly includeDocumentation: boolean;
  @ApiProperty()
  readonly includeWantlist: boolean;
}
