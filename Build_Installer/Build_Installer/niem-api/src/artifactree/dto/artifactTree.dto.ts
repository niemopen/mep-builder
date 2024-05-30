import { ApiProperty } from '@nestjs/swagger';
export class DeleteByFolderDto {
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly parentNodeId: string;
  @ApiProperty()
  readonly initialTree: object[];
  @ApiProperty()
  readonly auditUser: string;
}

export class DeleteItemDto {
  @ApiProperty()
  readonly packageId: string;
  @ApiProperty()
  readonly nodeId: string;
  @ApiProperty()
  readonly deleteFileBlob: boolean;
  @ApiProperty()
  readonly auditUser: string;
}
