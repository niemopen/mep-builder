import { ApiProperty } from '@nestjs/swagger';
export class DeleteUserDto {
  @ApiProperty()
  readonly emailArray: string[];
  readonly userId: string;
  readonly auditUser: string;
}
