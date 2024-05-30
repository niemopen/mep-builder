import { ApiProperty } from '@nestjs/swagger';
export class UserDto {
  @ApiProperty()
  readonly first_name: string;
  @ApiProperty()
  readonly last_name: string;
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  readonly phone: string;
  @ApiProperty()
  readonly organization: string;
  @ApiProperty()
  readonly user_role: string;
  @ApiProperty()
  readonly login_attempts: number;
  @ApiProperty()
  readonly salt: string;
  @ApiProperty()
  readonly hash: string;
  @ApiProperty()
  readonly password_created: string;
  @ApiProperty()
  readonly account_pending: boolean;
  @ApiProperty()
  readonly account_denied: boolean;
  @ApiProperty()
  readonly account_locked: boolean;
  @ApiProperty()
  readonly account_revoked: boolean;
  @ApiProperty()
  readonly status_change_reason: string;
  @ApiProperty()
  readonly denial_reason: string;
  @ApiProperty()
  readonly denial_details: string;
  @ApiProperty()
  readonly forceLogOut: boolean;
}
