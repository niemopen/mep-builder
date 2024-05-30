import {
  Controller,
  Res,
  Get,
  HttpStatus,
  Post,
  Body,
  Param,
  NotFoundException,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { DeleteUserDto } from './dto/deleteuser.dto';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';
import { ErrorLogService } from 'src/error/error.log.service';

@Controller('User')
export class UserController {
  constructor(
    private readonly UserService: UserService,
    private readonly ErrorLogService: ErrorLogService,
  ) {}

  @Post('/create')
  async createUser(
    @Res() res,
    @Body('userData') UserDto: UserDto,
    @Body('auditUser') auditUser: string,
  ) {
    const createResponse = await this.UserService.create(UserDto, auditUser);

    if (createResponse.isSuccessful) {
      return res.status(HttpStatus.OK).json({ userId: createResponse.userId }); // status 200
    } else if (createResponse.message === 'userExists') {
      return res.status(HttpStatus.CONFLICT).send(); // status 409
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/:auditUser')
  async findAll(@Res() res, @Param('auditUser') auditUser: string) {
    const userHasAccess: boolean = await this.UserService.userHasAccess(
      auditUser,
      'Admin',
    );
    if (userHasAccess) {
      // Requires Admin or above permissions; cannot be locked, denied, or pending
      const lists = await this.UserService.findAll();
      return res.status(HttpStatus.OK).json(lists);
    } else {
      return res.status(HttpStatus.FORBIDDEN).send(); // status 403
    }
  }

  @Get('/pending/:auditUser')
  async findAllPending(@Res() res, @Param('auditUser') auditUser: string) {
    const userHasAccess: boolean = await this.UserService.userHasAccess(
      auditUser,
      'Admin',
    );
    if (userHasAccess) {
      // Requires Admin or above permissions; cannot be locked, denied, or pending
      const lists = await this.UserService.findAllPending();
      return res.status(HttpStatus.OK).json(lists);
    } else {
      return res.status(HttpStatus.FORBIDDEN).send(); // status 403
    }
  }

  @Get('/exists/:email')
  async doesUserExist(@Res() res, @Param('email') email: string) {
    const result: ErrorFrameworkServiceResult =
      await this.UserService.findByEmail(email);
    if (result.isSuccess) {
      if (result.data) {
        return res.status(HttpStatus.OK).json({ userExists: true });
      } else {
        return res.status(HttpStatus.OK).json({ userExists: false });
      }
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Get('/findUserById/:userId')
  async findById(@Res() res, @Param('userId') userId: string) {
    const lists = await this.UserService.findById(userId);
    if (!lists) throw new NotFoundException('Id does not exist!');
    return res.status(HttpStatus.OK).json(lists);
  }

  @Put('/updateById/:userId')
  async updateById(
    @Res() res,
    @Param('userId')
    userId: string,
    @Body('userData') UserDto: UserDto,
    @Body('auditUser') auditUser: string,
  ) {
    const lists = await this.UserService.updateById(userId, UserDto, auditUser);
    if (!lists) throw new NotFoundException('Id does not exist!');
    return res.status(HttpStatus.OK).json({
      message: 'Post has been successfully updated',
      lists,
    });
  }

  @Delete('/deleteById')
  async deleteById(@Res() res, @Body() DeleteUserDto: DeleteUserDto) {
    const userHasAccess = await this.UserService.userHasAccess(
      DeleteUserDto.auditUser,
      'Admin',
    );
    if (userHasAccess) {
      const isSuccess = await this.UserService.deleteById(DeleteUserDto);

      if (isSuccess) {
        return res.status(HttpStatus.OK).json({
          message: 'User deleted successfully',
          isSuccess,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }
}
