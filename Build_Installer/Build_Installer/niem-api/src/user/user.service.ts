import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { User } from './schemas/user.interface';
import { AuditLogService } from 'src/audit/audit.log.service';
import * as collections from '../util/collection.name.util';
import { ErrorLogService } from 'src/error/error.log.service';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';
import { DeleteUserDto } from './dto/deleteuser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private UserModel: Model<User>,
    private AuditLogService: AuditLogService,
    private readonly ErrorLogService: ErrorLogService,
  ) {}

  async userHasAccess(
    userId: string,
    requiredRole: string = 'User',
  ): Promise<boolean> {
    // Used to check if the user's role is at or above the required role
    const roleTable = {
      User: 1,
      Admin: 2,
      SuperAdmin: 3,
      SysAdmin: 4,
    };
    const user = await this.UserModel.findById(userId);
    if (user) {
      // user exists within the DB, check user status and permissions
      return (
        !(
          user.account_pending ||
          user.account_denied ||
          user.account_locked ||
          user.account_revoked
        ) && roleTable[user.user_role] >= roleTable[requiredRole]
      );
    } else {
      // user was not found in DB, access to data denied
      return false;
    }
  }

  caseInsensitiveRegEx(regStr: string) {
    // checking case insensitivity and ensuring whole word
    return new RegExp('^' + regStr + '$', 'i');
  }

  async create(UserDto: UserDto, auditUser): Promise<any> {
    // check if user already exists
    const email = this.caseInsensitiveRegEx(UserDto.email);
    const existingUser = await this.UserModel.findOne({ email: email }).exec();
    if (existingUser !== null) {
      // user already exists
      return { isSuccessful: false, message: 'userExists' };
    } else {
      // create new user
      try {
        const createdUser = await this.UserModel.create(UserDto);
        createdUser.save();

        // get auditUser
        if (auditUser === 'request') {
          // user requested a new account and userId was just created
          auditUser = createdUser._id;
        }

        // create audit log entry
        this.AuditLogService.create(collections.users, auditUser, createdUser);

        return {
          isSuccessful: true,
          message: 'success',
          userId: createdUser._id,
        };
      } catch (err) {
        console.error(err);
        return { isSuccessful: false, message: 'createFail' };
      }
    }
  }

  async findAll(): Promise<any> {
    // dont return the hash field from the user document so that it is not passed to the webui
    return await this.UserModel.find({}, { hash: 0 }).exec();
  }

  async findAllPending(): Promise<any> {
    // dont return the hash field from the user document so that it is not passed to the webui
    return await this.UserModel.find(
      { account_pending: true },
      { hash: 0 },
    ).exec();
  }

  async findByEmail(email): Promise<ErrorFrameworkServiceResult> {
    try {
      const user = await this.UserModel.findOne(
        { email: this.caseInsensitiveRegEx(email) },
        { hash: 0 }, // dont return the hash field from the user document so that it is not passed to the webui
      ).exec();
      return { isSuccess: true, data: user };
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(
        error,
        null,
        'User',
      );
    }
  }

  async findById(userId): Promise<User> | undefined {
    const user = await this.UserModel.findOne(
      { _id: userId },
      { hash: 0 }, // dont return the hash field from the user document so that it is not passed to the webui
    ).exec();
    return user;
  }

  async findPasswordById(
    userId,
  ): Promise<User | ErrorFrameworkServiceResult> | null {
    try {
      const user = await this.UserModel.findOne(
        { _id: userId },
        { hash: 1 },
      ).exec();
      return user;
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(
        error,
        userId,
        'User',
      );
    }
  }

  async findByDisplayName(username): Promise<User> | undefined {
    const user = await this.UserModel.findOne({
      display_name: this.caseInsensitiveRegEx(username),
    }).exec();
    return user;
  }

  async find(req): Promise<any> {
    return await this.UserModel.find(req).exec();
  }

  async updateById(userId, UserDto, auditUser): Promise<any> {
    const ogData = await this.UserModel.findOne({ _id: userId });
    const modData = await this.UserModel.findOneAndUpdate(
      { _id: userId },
      UserDto,
      { new: true }, // returns the document after update
    );

    const scrubbedModData = this.AuditLogService.scrubData(modData);
    this.AuditLogService.update(collections.users, auditUser, modData, ogData);

    return JSON.parse(scrubbedModData);
  }

  async deleteById(DeleteUserDto: DeleteUserDto): Promise<boolean> {
    let isSuccess = true;

    try {
      // user cannot delete self
      if (DeleteUserDto.auditUser !== DeleteUserDto.userId) {
        const deletedUser = await this.UserModel.findByIdAndDelete(
          DeleteUserDto.userId,
        ).exec();

        await this.AuditLogService.delete(
          collections.users,
          DeleteUserDto.auditUser,
          deletedUser,
        );
      } else {
        isSuccess = false;
      }
    } catch (error) {
      isSuccess = false;
    }

    return isSuccess;
  }
}
