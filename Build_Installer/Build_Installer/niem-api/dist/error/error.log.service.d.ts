import { Model } from 'mongoose';
import { ErrorLog } from './schemas/error.log.interface';
import { ErrorFrameworkServiceResult } from './interfaces/error-framework-result.interface';
import { UserService } from 'src/user/user.service';
export declare class ErrorLogService {
    private ErrorLogModel;
    constructor(ErrorLogModel: Model<ErrorLog>);
    scrubData(s: string): string;
    logError(collectionName: any, userId: any, eventDescription: any): Promise<any>;
    getErrorLog(auditUser: string, query: any, userService: UserService): Promise<ErrorFrameworkServiceResult>;
    errorControllerResponse(res: any, data: any): any;
    errorServiceResponse(error: any, auditUser: any, collection?: string): Promise<ErrorFrameworkServiceResult>;
}
