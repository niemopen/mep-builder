import { UserService } from '../user/user.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';
export declare class AuthService {
    private usersService;
    private readonly ErrorLogService;
    constructor(usersService: UserService, ErrorLogService: ErrorLogService);
    validateUser(username: string, userId: string, pass: string): Promise<ErrorFrameworkServiceResult>;
    validateUserById(userId: string, pass: string): Promise<any>;
    accountStatus(username: string, userId: string): Promise<ErrorFrameworkServiceResult>;
    cryptoRehash(passwordToReHash: string, savedSalt: string): Promise<any>;
}
