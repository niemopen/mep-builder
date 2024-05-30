import { CreateAuthDto } from './auth.dto';
import { LocalStrategy } from './local.strategy';
import { UserService } from 'src/user/user.service';
import { ErrorLogService } from 'src/error/error.log.service';
export declare class AuthController {
    private readonly LocalStrategy;
    private readonly UserService;
    private readonly ErrorLogService;
    constructor(LocalStrategy: LocalStrategy, UserService: UserService, ErrorLogService: ErrorLogService);
    login(res: any, CreateAuthDto: CreateAuthDto): Promise<any>;
    validateUser(res: any, CreateAuthDto: CreateAuthDto): Promise<any>;
    accountStatus(res: any, CreateAuthDto: CreateAuthDto): Promise<any>;
}
