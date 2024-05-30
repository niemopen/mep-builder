import { Controller, Res, Post, Body, HttpStatus } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { AuditLogService } from './audit.log.service';

@Controller('Audit')
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly userService: UserService,
    private readonly errorLogService: ErrorLogService,
  ) {}

  @Post('/getActivityLog')
  async getActivityLog(
    @Res() res,
    @Body('auditUser') auditUser: string,
    @Body('query') query: any,
  ) {
    const userHasAccess: boolean = await this.userService.userHasAccess(
      auditUser,
      'Admin',
    );
    if (userHasAccess) {
      const fetchResult = await this.auditLogService.fetchActivityLog(
        auditUser,
        query,
        this.userService,
      );
      if (fetchResult.isSuccess) {
        const cleanedResults = fetchResult.data.map((entry) => {
          return {
            dateTime: new Date(entry.event_date).toUTCString(), // convert back to Date after data cleaning
            eventType: entry.event_type ? entry.event_type : 'null',
            collection: entry.collection_name ? entry.collection_name : 'null',
            modifiedData: entry.modified_data ? entry.modified_data : 'null',
            originalData: entry.original_data ? entry.original_data : 'null',
            email: entry.email,
          };
        });
        return res.status(HttpStatus.OK).json(cleanedResults);
      } else {
        return this.errorLogService.errorControllerResponse(
          res,
          fetchResult.data,
        );
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Post('/userLastEvent')
  async getUserLastEvent(
    @Res() res,
    @Body('auditUser') auditUser,
    @Body('userId') userId,
  ) {
    const userHasAccess: boolean = await this.userService.userHasAccess(
      auditUser,
      'Admin',
    );

    if (userHasAccess) {
      const fetchResult = await this.auditLogService.getUserMostRecentEvent(
        auditUser,
        userId,
      );

      if (fetchResult.isSuccess) {
        return res.status(HttpStatus.OK).json(fetchResult.data);
      } else {
        return this.errorLogService.errorControllerResponse(
          res,
          fetchResult.data,
        );
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Post('/userStatusChange')
  async getUserStatusChange(
    @Res() res,
    @Body('auditUser') auditUser,
    @Body('userId') userId,
  ) {
    const userHasAccess: boolean = await this.userService.userHasAccess(
      auditUser,
      'Admin',
    );

    if (userHasAccess) {
      // get last status change event for the userId
      const fetchResult = await this.auditLogService.getLastStatusUpdate(
        userId,
        auditUser,
      );

      if (fetchResult.isSuccess) {
        return res.status(HttpStatus.OK).json(fetchResult.data);
      } else {
        return this.errorLogService.errorControllerResponse(
          res,
          fetchResult.data,
        );
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }
}
