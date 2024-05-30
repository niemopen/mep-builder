import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly ErrorLogService: ErrorLogService,
  ) {
    super();
  }

  async validate(
    username: string,
    userId: string,
    password: string,
  ): Promise<ErrorFrameworkServiceResult> {
    try {
      return await this.authService.validateUser(username, userId, password);
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, userId);
    }
  }

  async validateById(userId: string, password: string): Promise<boolean> {
    const user = await this.authService.validateUserById(userId, password);
    if (!user) {
      //   throw new UnauthorizedException();
      return false;
    }
    return true;
  }

  async accountStatus(
    username: string,
    userId: string,
  ): Promise<ErrorFrameworkServiceResult> {
    try {
      return await this.authService.accountStatus(username, userId);
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, userId);
    }
  }

  async rehashPassword(
    passwordToReHash: string,
    savedSalt: string,
  ): Promise<ErrorFrameworkServiceResult> {
    try {
      const result = await this.authService.cryptoRehash(
        passwordToReHash,
        savedSalt,
      );
      return { isSuccess: true, data: result };
    } catch (error) {
      return this.ErrorLogService.errorServiceResponse(error, null);
    }
  }
}
