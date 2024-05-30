import { MongoRepoService } from './mongorepo.service';
import { SavePackageDto, SaveCMEDataDto, ExportPackageDto, DeletePackageDto, MappingComponentDto, CommonComponentsDto, TransferPackagesDto } from './dto/mongorepo.dto';
import { ErrorLogService } from 'src/error/error.log.service';
import { UserService } from 'src/user/user.service';
export declare class MongoRepoController {
    private readonly MongoRepoService;
    private readonly ErrorLogService;
    private readonly UserService;
    constructor(MongoRepoService: MongoRepoService, ErrorLogService: ErrorLogService, UserService: UserService);
    savePackage(res: any, SavePackageDto: SavePackageDto, auditUser: string): Promise<any>;
    deletePackage(res: any, DeletePackageDto: DeletePackageDto): Promise<any>;
    findPackagesByUserId(res: any, userId: string): Promise<any>;
    findPublishedPackages(res: any, auditUser: string): Promise<any>;
    findMPDData(res: any, userId: string): Promise<any>;
    getSortedMpdDataStandlone(res: any, auditUser: string): Promise<any>;
    getSortedMpdData(res: any, userId: string): Promise<any>;
    findByPackageId(res: any, packageId: string, auditUser: string): Promise<any>;
    saveComponents(res: any, MappingComponentDto: MappingComponentDto, auditUser: string): Promise<any>;
    saveCMEData(res: any, SaveCMEDataDto: SaveCMEDataDto, auditUser: string): Promise<any>;
    buildCMEData(res: any, SaveCMEDataDto: SaveCMEDataDto, auditUser: string): Promise<any>;
    getExportFileData(res: any, ExportPackageDto: ExportPackageDto): Promise<any>;
    getCommonComponents(res: any, CommonComponentsDto: CommonComponentsDto): Promise<any>;
    updateArtifactStatus(res: any, SavePackageDto: SavePackageDto, auditUser: string): Promise<any>;
    getArtifactChecklist(res: any, packageId: string): Promise<any>;
    getTransaltionGenerationStatus(res: any, packageId: string): Promise<any>;
    updateTranslationGenerationStatus(res: any, SavePackageDto: SavePackageDto, auditUser: string): Promise<any>;
    getCustomExtensionsById(res: any, packageId: string): Promise<any>;
    transferPackages(res: any, transferPackagesDto: TransferPackagesDto, auditUser: string): Promise<any>;
}
