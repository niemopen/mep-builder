import { ErrorLogService } from './error.log.service';
import { UserService } from 'src/user/user.service';
export declare class ErrorLogController {
    private readonly ErrorLogService;
    private UserService;
    constructor(ErrorLogService: ErrorLogService, UserService: UserService);
    logWebuiError(res: any, error: any, auditUser: string): Promise<any>;
    getErrorLog(res: any, auditUser: string, query: any): Promise<any>;
}
