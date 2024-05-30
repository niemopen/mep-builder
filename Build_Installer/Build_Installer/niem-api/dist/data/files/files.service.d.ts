import { Model } from 'mongoose';
import { FileRepo } from './schemas/files.interface';
import { FileBlob } from './schemas/fileblob.interface';
import { AuditLogService } from 'src/audit/audit.log.service';
import { MongoRepoService } from '../mongorepository/mongorepo.service';
import { GTRIService } from 'src/GTRIAPI2.0/gtri.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { ArtifactTreeService } from '../../artifactree/artifacttree.service';
import { Package } from '../mongorepository/schemas/package.interface';
import { TranslateDto } from './dto/files.dto';
export declare class FilesService {
    private FileBlobModel;
    private PackageModel;
    private AuditLogService;
    private ArtifactTreeService;
    private MongoRepoService;
    private GTRIService;
    private ErrorLogService;
    constructor(FileBlobModel: Model<FileBlob>, PackageModel: Model<Package>, AuditLogService: AuditLogService, ArtifactTreeService: ArtifactTreeService, MongoRepoService: MongoRepoService, GTRIService: GTRIService, ErrorLogService: ErrorLogService);
    saveFileToDB(file: any, FileRepo: FileRepo): Promise<any>;
    createUpdateFile(FileRepo: any, fileObj: any, fileName: any, parentNodeId?: any): Promise<any>;
    retrieveFile(fileId: any): Promise<any>;
    translateToJsonLd(FileRepo: FileRepo): Promise<any>;
    translateViaCMF(TranslateDto: TranslateDto): Promise<any>;
    generateCMFFile(packageId: any, auditUser: any): Promise<any>;
    copySaveFile(FileRepo: FileRepo): Promise<any>;
    deleteFileFromDB(FileRepo: FileRepo): Promise<any>;
}
