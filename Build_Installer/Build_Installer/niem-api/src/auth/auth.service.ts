import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as crypto from 'crypto';
import { ErrorLogService } from 'src/error/error.log.service';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private readonly ErrorLogService: ErrorLogService,
  ) {}

  async validateUser(
    username: string,
    userId: string,
    pass: string,
  ): Promise<ErrorFrameworkServiceResult> {
    try {
      let user;
      if (username.toLocaleLowerCase() === 'sysadmin') {
        user = await this.usersService.findByDisplayName(username);
      } else {
        user = await this.usersService.findPasswordById(userId);
      }

      // using '==' due to user.hash having a different byte size than input
      return { isSuccess: true, data: user && user.hash == pass };
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, userId);
    }
  }

  async validateUserById(userId: string, pass: string): Promise<any> {
    let user;
    user = await this.usersService.findPasswordById(userId);
    // using '==' due to user.hash having a different byte size than input
    if (user && user.hash == pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async accountStatus(
    username: string,
    userId: string,
  ): Promise<ErrorFrameworkServiceResult> {
    try {
      let user;
      if (username.toLocaleLowerCase() === 'sysadmin') {
        user = await this.usersService.findByDisplayName(username);
      } else {
        user = await this.usersService.findById(userId);
      }

      if (user === null) {
        return { isSuccess: true, data: false };
      }

      let accountStatus = {
        isAccountLocked: false,
        isPasswordExpired: false,
        isPasswordExpiring: false,
        daysUntilLocked: 0,
      };

      const numOfWarningDays = 10; // warning period before password locks
      const expirationDay = 90; // day when password locks
      const warningDay = expirationDay - numOfWarningDays; // expiring warning begins on this day

      const splitDate = user.password_created.split('-');
      const date = new Date(splitDate[0], splitDate[1] - 1, splitDate[2]); // year, month, day

      // how old is the password (in ms) and convert to days
      const timeElapsed = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      const daysLeft = Math.ceil(expirationDay - timeElapsed);

      // check account status and update DB
      if (user.account_locked || user.account_revoked) {
        accountStatus = { ...accountStatus, isAccountLocked: true };
      } else if (timeElapsed >= expirationDay) {
        accountStatus = {
          ...accountStatus,
          isAccountLocked: true,
          isPasswordExpired: true,
        };
        await this.usersService.updateById(
          user._id,
          {
            account_locked: true,
          },
          'sys',
        );
      } else {
        accountStatus = { ...accountStatus, isAccountLocked: false };
      }

      if (timeElapsed >= warningDay) {
        accountStatus = {
          ...accountStatus,
          isPasswordExpiring: true,
          daysUntilLocked: daysLeft,
        };
      } else {
        accountStatus = {
          ...accountStatus,
          isPasswordExpiring: false,
          daysUntilLocked: daysLeft,
        };
      }

      return { isSuccess: true, data: accountStatus };
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, userId);
    }
  }

  async cryptoRehash(
    passwordToReHash: string,
    savedSalt: string,
  ): Promise<any> {
    // hashing parameters
    const ITERATIONS = 10000;
    const PASSWORD_LENGTH = 256;
    const DIGEST = 'sha256';
    const BYTE_TO_STRING_ENCODING = 'base64';
    const normalizedPassword = passwordToReHash.normalize('NFC');

    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        normalizedPassword,
        savedSalt,
        ITERATIONS,
        PASSWORD_LENGTH,
        DIGEST,
        (err, hash) => {
          if (err) {
            reject(new Error(err.toString()));
          } else {
            resolve(hash.toString(BYTE_TO_STRING_ENCODING));
          }
        },
      );
    });
  }
}
