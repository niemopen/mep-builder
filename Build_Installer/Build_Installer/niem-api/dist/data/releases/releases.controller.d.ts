import { ReleasesService } from './releases.service';
import { ParentTypeDto, AugmentationDto, AssociationDto, MigrationDto, ReleaseDto, DomainDto } from './dto/releases.dto';
import { ErrorLogService } from 'src/error/error.log.service';
export declare class ReleasesController {
    private readonly ReleasesService;
    private ErrorLogService;
    constructor(ReleasesService: ReleasesService, ErrorLogService: ErrorLogService);
    getParentType(res: any, ParentTypeDto: ParentTypeDto): Promise<any>;
    getAugmentations(res: any, AugmentationDto: AugmentationDto): Promise<any>;
    getAssociations(res: any, AssociationDto: AssociationDto): Promise<any>;
    migrateRelease(res: any, MigrationDto: MigrationDto): Promise<any>;
    migrateReleaseViaGTRI(res: any, MigrationDto: MigrationDto): Promise<any>;
    getNamespaceData(res: any, ReleaseDto: ReleaseDto): Promise<any>;
    getDomainItems(res: any, DomainDto: DomainDto): Promise<any>;
    getReleaseProgressStatus(res: any): Promise<any>;
    updateReleaseViaNiem(res: any, userId: string, currentRelease: string): Promise<any>;
    checkAvailableReleases(res: any): Promise<any>;
    getLoadedReleases(res: any): Promise<any>;
}
