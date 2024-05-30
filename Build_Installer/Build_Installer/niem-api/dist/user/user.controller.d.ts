import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { DeleteUserDto } from './dto/deleteuser.dto';
import { ErrorLogService } from 'src/error/error.log.service';
export declare class UserController {
    private readonly UserService;
    private readonly ErrorLogService;
    constructor(UserService: UserService, ErrorLogService: ErrorLogService);
    createUser(res: any, UserDto: UserDto, auditUser: string): Promise<any>;
    findAll(res: any, auditUser: string): Promise<any>;
    findAllPending(res: any, auditUser: string): Promise<any>;
    doesUserExist(res: any, email: string): Promise<any>;
    findById(res: any, userId: string): Promise<any>;
    updateById(res: any, userId: string, UserDto: UserDto, auditUser: string): Promise<any>;
    deleteById(res: any, DeleteUserDto: DeleteUserDto): Promise<any>;
}
