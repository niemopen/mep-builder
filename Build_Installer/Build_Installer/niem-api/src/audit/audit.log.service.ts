import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schemas/audit.log.interface';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';
import { ErrorLogService } from 'src/error/error.log.service';
import { UserService } from 'src/user/user.service';
import * as collection from '../util/collection.name.util';
import { start } from 'repl';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel('AuditLog') private AuditLogModel: Model<AuditLog>,
    private readonly errorLogService: ErrorLogService,
  ) {}

  scrubData(obj) {
    const s = JSON.stringify(obj);

    if (s.includes('salt') && s.includes('password_created')) {
      const startIndex = s.indexOf('salt');
      const endIndex = s.indexOf('password_created');

      const substring = s.substring(startIndex, endIndex);

      return s.replace(substring, '');
    } else {
      return s;
    }
  }

  async create(collectionName, userId, modifiedData): Promise<any> {
    await this.AuditLogModel.create({
      event_date: new Date(),
      event_type: 'create',
      collection_name: collectionName,
      userId: userId,
      modified_data: this.scrubData(modifiedData),
      original_data: null,
    });
  }

  async read(collectionName, userId, originalData): Promise<any> {
    await this.AuditLogModel.create({
      event_date: new Date(),
      event_type: 'read',
      collection_name: collectionName,
      userId: userId,
      modified_data: null,
      original_data: this.scrubData(originalData),
    });
  }

  async update(
    collectionName,
    userId,
    modifiedData,
    originalData,
  ): Promise<any> {
    await this.AuditLogModel.create({
      event_date: new Date(),
      event_type: 'update',
      collection_name: collectionName,
      userId: userId,
      modified_data: this.scrubData(modifiedData),
      original_data: this.scrubData(originalData),
    });
  }

  async delete(collectionName, userId, originalData): Promise<any> {
    await this.AuditLogModel.create({
      event_date: new Date(),
      event_type: 'delete',
      collection_name: collectionName,
      userId: userId,
      modified_data: null,
      original_data: this.scrubData(originalData),
    });
  }

  async fetchActivityLog(
    auditUser: string,
    query: any,
    userService: UserService,
  ): Promise<ErrorFrameworkServiceResult> {
    try {
      let data;
      let email;
      if (query.email) {
        email = query.email;
        const userResult = await userService.findByEmail(query.email);
        delete query.email;
        query['userId'] = userResult.data._id;
      }
      data = await this.AuditLogModel.find(query);

      // remove userId and insert email
      const cleanData = async (obj) => {
        if (!query.email) {
          // only retrieve email if it wasn't passed in through query
          if (!!obj.userId && obj.userId.length === 24) {
            /**
             * NOTE: String length check in place due to underlying issue with event logging.
             * Certain actions result in userId field being populated with values that can't be cast to a
             * MongoDB Object ID. In order to attempt type casting, the string must be 12 bytes (24 chars) long
             */
            const userInfo = await userService.findById(obj.userId);
            if (userInfo) {
              email = userInfo.email;
            } else {
              email = '';
            }
          } else {
            email = '';
          }
        }

        const cleanedObj = { ...obj._doc, email: email };
        if (!!cleanedObj.userId) {
          delete cleanedObj.userId;
        }
        return cleanedObj;
      };
      const cleanedData = [];
      for (const entry of data) {
        const cleanedEntry = await cleanData(entry);
        cleanedData.push(cleanedEntry);
      }
      return { isSuccess: true, data: cleanedData };
    } catch (error) {
      return await this.errorLogService.errorServiceResponse(
        error,
        auditUser,
        collection.auditlog,
      );
    }
  }

  async getUserMostRecentEvent(
    auditUser: string,
    userId: string,
  ): Promise<ErrorFrameworkServiceResult> {
    try {
      const data = await this.AuditLogModel.find({
        userId: userId,
      });
      if (data.length > 0) {
        // most recent udpate event is at the end of the collection
        const mostRecentEvent = data[data.length - 1];
        return { isSuccess: true, data: mostRecentEvent };
      } else {
        return { isSuccess: true, data: false };
      }
    } catch (error) {
      return this.errorLogService.errorServiceResponse(error, auditUser);
    }
  }

  async getLastStatusUpdate(
    userId: string,
    auditUser: string,
  ): Promise<ErrorFrameworkServiceResult> {
    try {
      // query audit log model
      const data = await this.AuditLogModel.find({
        collection_name: 'users',
        event_type: 'update',
      });

      // filter entries based on status updates to a specific user
      const filteredData = data.filter((entry) => {
        // parse original and modified data back into JSON
        const {
          account_locked: ogAccountLocked,
          account_revoked: ogAccountRevoked,
          account_denied: ogAccountDenied,
          _id: entryUserId,
        } = JSON.parse(entry.original_data);
        const {
          account_locked: modAccountLocked,
          account_revoked: modAccountRevoked,
          account_denied: modAccountDenied,
        } = JSON.parse(entry.modified_data);

        // user parsed data to determine what action occured
        if (entryUserId === userId) {
          if (!ogAccountLocked && modAccountLocked) {
            // account locked
            return entry;
          } else if (!ogAccountRevoked && modAccountRevoked) {
            // account revoked
            return entry;
          } else if (!ogAccountDenied && modAccountDenied) {
            // account denied
            return entry;
          } else if (
            ogAccountLocked &&
            (!modAccountLocked || !modAccountRevoked)
          ) {
            // account unlocked
            return entry;
          } else {
            return null;
          }
        } else {
          return null;
        }
      });

      if (filteredData.length > 0) {
        return { isSuccess: true, data: filteredData[filteredData.length - 1] };
      } else {
        return { isSuccess: true, data: false };
      }
    } catch (error) {
      return this.errorLogService.errorServiceResponse(error, auditUser);
    }
  }
}
