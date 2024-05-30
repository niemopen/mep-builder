import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorLog } from './schemas/error.log.interface';
import { ErrorFrameworkServiceResult } from './interfaces/error-framework-result.interface';
import { UserService } from 'src/user/user.service';
import * as collection from '../util/collection.name.util';
const stringify = require('json-stringify-safe');

@Injectable()
export class ErrorLogService {
  constructor(
    @InjectModel('ErrorLog') private ErrorLogModel: Model<ErrorLog>,
  ) {}

  scrubData(s: string) {
    let resultString = s;
    // scrub user salt from error data
    if (s.includes('salt') && s.includes('password_created')) {
      const startIndex = s.indexOf('salt');
      const endIndex = s.indexOf('password_created');

      const substring = s.substring(startIndex, endIndex);
      resultString = s.replace(substring, '');
    }

    // scrub login password from error data
    if (resultString.includes('password') && resultString.includes('code')) {
      const startIndex = resultString.lastIndexOf('password');
      const endIndex = resultString.lastIndexOf('code');

      const substring = resultString.substring(startIndex, endIndex);
      resultString = resultString.replace(substring, '');
    }
    return resultString;
  }

  async logError(
    collectionName,
    userId = null,
    eventDescription,
  ): Promise<any> {
    return await this.ErrorLogModel.create({
      event_date: new Date(),
      collection_name: collectionName,
      userId: userId === '' ? null : userId,
      event_description: this.scrubData(eventDescription),
    });
  }

  async getErrorLog(
    auditUser: string,
    query: any,
    userService: UserService,
  ): Promise<ErrorFrameworkServiceResult> {
    try {
      if (query.email) {
        const userResult = await userService.findByEmail(query.email);
        delete query.email;
        query['userId'] = userResult.data._id;
      }
      const data = await this.ErrorLogModel.find(query);

      const cleanData = async (obj) => {
        const userInfo = await userService.findById(obj.userId);
        const s = JSON.stringify(obj);

        if (s.includes('userId') && s.includes('event_description')) {
          const startIndex = s.indexOf('userId');
          const endIndex = s.indexOf('event_description');

          const substring = s.substring(startIndex, endIndex);
          if (userInfo) {
            return s.replace(substring, `email":"${userInfo.email}","`);
          } else {
            return s.replace(substring, `email":"","`);
          }
        }
      };

      const cleanedData = [];
      for (const entry of data) {
        const cleanedEntry = await cleanData(entry);
        cleanedData.push(JSON.parse(cleanedEntry));
      }

      return { isSuccess: true, data: cleanedData };
    } catch (error) {
      return await this.errorServiceResponse(
        error,
        auditUser,
        collection.errorlog,
      );
    }
  }

  errorControllerResponse(res, data) {
    // note: this function is used to retain the error framework, to be called from controller classes
    // needs to be called with a 'return'
    // parameters include:
    // - controller response decorator
    // - the data attribute from result.data which contains the error details json
    if (data.errorStatus !== undefined) {
      return res.status(data.errorStatus).json(data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorId: null,
        errorStatus: 500,
        errorMessage: 'Internal Server Error',
      });
    }
  }

  async errorServiceResponse(
    error,
    auditUser,
    collection = '',
  ): Promise<ErrorFrameworkServiceResult> {
    // note: this function is used to retain the error framework, to be called from within the catch block of service classes
    // needs to be called with a 'return await'
    console.error(error);
    // Log error to db
    const dbRecord = await this.logError(
      collection,
      auditUser,
      stringify(error),
    );
    return {
      isSuccess: false,
      data: {
        errorId: dbRecord._id,
        errorStatus: error.status,
        errorMessage: error,
      },
    };
  }
}
