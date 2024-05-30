import { UserService } from 'src/user/user.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { AuditLogService } from './audit.log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    private readonly userService;
    private readonly errorLogService;
    constructor(auditLogService: AuditLogService, userService: UserService, errorLogService: ErrorLogService);
    getActivityLog(res: any, auditUser: string, query: any): Promise<any>;
    getUserLastEvent(res: any, auditUser: any, userId: any): Promise<any>;
    getUserStatusChange(res: any, auditUser: any, userId: any): Promise<any>;
}
