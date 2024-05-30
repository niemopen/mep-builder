import { Controller, Body, Res, Post, HttpStatus } from '@nestjs/common';
import { ErrorLogService } from './error.log.service';
import { UserService } from 'src/user/user.service';
import { ErrorFrameworkServiceResult } from './interfaces/error-framework-result.interface';
import { ErrorLog } from './schemas/error.log.interface';

@Controller('Error')
export class ErrorLogController {
  constructor(
    private readonly ErrorLogService: ErrorLogService,
    private UserService: UserService,
  ) {}

  @Post('/log')
  async logWebuiError(
    @Res() res,
    @Body('errorData') error: any,
    @Body('auditUser') auditUser: string,
  ) {
    const userHasAccess: boolean = await this.UserService.userHasAccess(
      auditUser,
    );
    if (userHasAccess || error.status === 403) {
      // If forbidden error already occurred, it should be logged
      const serviceResult: ErrorFrameworkServiceResult =
        await this.ErrorLogService.errorServiceResponse(error, auditUser);
      return this.ErrorLogService.errorControllerResponse(
        res,
        serviceResult.data,
      );
    } else {
      // this branch is only reachable when a non-user attempts to log an error through the API
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Post('/getErrorLog')
  async getErrorLog(
    @Res() res,
    @Body('auditUser') auditUser: string,
    @Body('query') query: any,
  ) {
    const userHasAccess: boolean = await this.UserService.userHasAccess(
      auditUser,
      'Admin',
    );
    if (userHasAccess) {
      const fetchResult = await this.ErrorLogService.getErrorLog(
        auditUser,
        query,
        this.UserService,
      );
      if (fetchResult.isSuccess) {
        const cleanedData = [];
        for (const entry of fetchResult.data) {
          const errorDescriptionJson = JSON.parse(entry.event_description);

          cleanedData.push({
            dateTime: new Date(entry.event_date).toUTCString(),
            eventStatus: errorDescriptionJson.status
              ? errorDescriptionJson.status
              : 500,
            collection: entry.collection_name ? entry.collection_name : 'null',
            eventDescription: entry.event_description
              ? entry.event_description
              : 'null',
            email: entry.email ? entry.email : 'null',
          });
        }
        return res.status(HttpStatus.OK).json(cleanedData);
      } else {
        return this.ErrorLogService.errorControllerResponse(
          res,
          fetchResult.data,
        );
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }
}
