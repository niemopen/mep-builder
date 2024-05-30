import { Model } from 'mongoose';
import { AuditLog } from './schemas/audit.log.interface';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';
import { ErrorLogService } from 'src/error/error.log.service';
import { UserService } from 'src/user/user.service';
export declare class AuditLogService {
    private AuditLogModel;
    private readonly errorLogService;
    constructor(AuditLogModel: Model<AuditLog>, errorLogService: ErrorLogService);
    scrubData(obj: any): string;
    create(collectionName: any, userId: any, modifiedData: any): Promise<any>;
    read(collectionName: any, userId: any, originalData: any): Promise<any>;
    update(collectionName: any, userId: any, modifiedData: any, originalData: any): Promise<any>;
    delete(collectionName: any, userId: any, originalData: any): Promise<any>;
    fetchActivityLog(auditUser: string, query: any, userService: UserService): Promise<ErrorFrameworkServiceResult>;
    getUserMostRecentEvent(auditUser: string, userId: string): Promise<ErrorFrameworkServiceResult>;
    getLastStatusUpdate(userId: string, auditUser: string): Promise<ErrorFrameworkServiceResult>;
}
