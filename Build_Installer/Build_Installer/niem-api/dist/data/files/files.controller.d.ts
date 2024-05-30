/// <reference types="multer" />
import { FilesService } from './files.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { CreateFileDto } from './dto/files.dto';
import { TranslateDto } from './dto/files.dto';
import { DeleteFileDto } from './dto/files.dto';
import { UserService } from 'src/user/user.service';
import { MongoRepoService } from '../mongorepository/mongorepo.service';
export declare class FilesController {
    private readonly FilesService;
    private readonly UserService;
    private readonly MongoRepoService;
    private readonly ErrorLogService;
    constructor(FilesService: FilesService, UserService: UserService, MongoRepoService: MongoRepoService, ErrorLogService: ErrorLogService);
    uploadFile(file: Express.Multer.File, CreateFileDto: CreateFileDto, res: any): Promise<any>;
    retrieveFile(CreateFileDto: CreateFileDto, res: any): Promise<any>;
    translateToJsonLd(CreateFileDto: CreateFileDto, res: any): Promise<any>;
    translateViaCMF(TranslateDto: TranslateDto, res: any): Promise<any>;
    generateCMFFile(TranslateDto: TranslateDto, res: any): Promise<any>;
    copySaveFile(CreateFileDto: CreateFileDto, res: any): Promise<any>;
    deleteFile(DeleteFileDto: DeleteFileDto, res: any): Promise<any>;
}
