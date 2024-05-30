import { Controller, Res, Post, Body, HttpStatus } from '@nestjs/common';
import { CreateAuthDto } from './auth.dto';
import { LocalStrategy } from './local.strategy';
import { UserService } from 'src/user/user.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';
import { User } from 'src/user/schemas/user.interface';

@Controller('Auth')
export class AuthController {
  constructor(
    private readonly LocalStrategy: LocalStrategy,
    private readonly UserService: UserService,
    private readonly ErrorLogService: ErrorLogService,
  ) {}

  @Post('/login')
  async login(@Res() res, @Body() CreateAuthDto: CreateAuthDto) {
    // Get user via provided email
    const userResult: ErrorFrameworkServiceResult =
      await this.UserService.findByEmail(CreateAuthDto.username);

    if (userResult.isSuccess) {
      const user: User = userResult.data;
      // Encrypt password with user's existing salt
      const encryptResult: ErrorFrameworkServiceResult =
        await this.LocalStrategy.rehashPassword(
          CreateAuthDto.password,
          user.salt,
        );
      if (encryptResult.isSuccess) {
        const encryptedPassword: string = encryptResult.data;
        // Validate user
        const validationResult: ErrorFrameworkServiceResult =
          await this.LocalStrategy.validate(
            CreateAuthDto.username,
            user._id,
            encryptedPassword,
          );
        if (validationResult.isSuccess) {
          const isValid: boolean = validationResult.data;
          // Get current user account status
          const statusResult: ErrorFrameworkServiceResult =
            await this.LocalStrategy.accountStatus(
              CreateAuthDto.username,
              user._id,
            );

          if (statusResult.isSuccess) {
            const status: boolean = statusResult.data;
            // return authentication result
            return res.status(HttpStatus.OK).json({
              isUserValidated: isValid,
              userId: user._id,
              status: status,
            });
          } else {
            // Error occurred while gathering user status
            return this.ErrorLogService.errorControllerResponse(
              res,
              statusResult.data,
            );
          }
        } else {
          // Error occurred during user validation
          return this.ErrorLogService.errorControllerResponse(
            res,
            validationResult.data,
          );
        }
      } else {
        // Error occurred during password encryption
        return this.ErrorLogService.errorControllerResponse(
          res,
          encryptResult.data,
        );
      }
    } else {
      // Error occurred while gathering user information
      return this.ErrorLogService.errorControllerResponse(res, userResult.data);
    }
  }

  @Post('/validateUser')
  async validateUser(@Res() res, @Body() CreateAuthDto: CreateAuthDto) {
    const isValid = await this.LocalStrategy.validateById(
      CreateAuthDto.userId,
      CreateAuthDto.password,
    );
    return res.status(HttpStatus.OK).json({
      isUserValidated: isValid,
    });
  }

  @Post('/accountStatus')
  async accountStatus(@Res() res, @Body() CreateAuthDto: CreateAuthDto) {
    const statusResult = await this.LocalStrategy.accountStatus(
      CreateAuthDto.username,
      CreateAuthDto.userId,
    );
    if (statusResult.isSuccess) {
      return res.status(HttpStatus.OK).json(statusResult.data);
    } else {
      return this.ErrorLogService.errorControllerResponse(
        res,
        statusResult.data,
      );
    }
  }
}
