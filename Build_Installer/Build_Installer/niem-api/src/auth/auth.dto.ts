import { ApiProperty } from '@nestjs/swagger';
export class CreateAuthDto {
  @ApiProperty()
  readonly userId: string;
  @ApiProperty()
  readonly username: string;
  @ApiProperty()
  readonly password: string;
}
