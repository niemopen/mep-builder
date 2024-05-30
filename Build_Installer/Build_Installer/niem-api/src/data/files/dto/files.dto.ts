import { ApiProperty } from '@nestjs/swagger';
export class CreateFileDto {
  @ApiProperty()
  readonly fileId: string;
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly auditUser: string;
  @ApiProperty()
  readonly encoding: string;
}

export class TranslateDto {
  @ApiProperty()
  readonly translateType: string;
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly auditUser: string;
}

export class DeleteFileDto {
  @ApiProperty()
  readonly fileId: string;
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly auditUser: string;
}
