import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { User } from './schemas/user.interface';
import { AuditLogService } from 'src/audit/audit.log.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';
import { DeleteUserDto } from './dto/deleteuser.dto';
export declare class UserService {
    private UserModel;
    private AuditLogService;
    private readonly ErrorLogService;
    constructor(UserModel: Model<User>, AuditLogService: AuditLogService, ErrorLogService: ErrorLogService);
    userHasAccess(userId: string, requiredRole?: string): Promise<boolean>;
    caseInsensitiveRegEx(regStr: string): RegExp;
    create(UserDto: UserDto, auditUser: any): Promise<any>;
    findAll(): Promise<any>;
    findAllPending(): Promise<any>;
    findByEmail(email: any): Promise<ErrorFrameworkServiceResult>;
    findById(userId: any): Promise<User> | undefined;
    findPasswordById(userId: any): Promise<User | ErrorFrameworkServiceResult> | null;
    findByDisplayName(username: any): Promise<User> | undefined;
    find(req: any): Promise<any>;
    updateById(userId: any, UserDto: any, auditUser: any): Promise<any>;
    deleteById(DeleteUserDto: DeleteUserDto): Promise<boolean>;
}
