import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { ErrorFrameworkServiceResult } from 'src/error/interfaces/error-framework-result.interface';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    private readonly ErrorLogService;
    constructor(authService: AuthService, ErrorLogService: ErrorLogService);
    validate(username: string, userId: string, password: string): Promise<ErrorFrameworkServiceResult>;
    validateById(userId: string, password: string): Promise<boolean>;
    accountStatus(username: string, userId: string): Promise<ErrorFrameworkServiceResult>;
    rehashPassword(passwordToReHash: string, savedSalt: string): Promise<ErrorFrameworkServiceResult>;
}
export {};
