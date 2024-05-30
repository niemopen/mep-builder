import { Model } from 'mongoose';
import { ParentTypeDto, AugmentationDto, AssociationDto, MigrationDto, ReleaseDto, DomainDto } from './dto/releases.dto';
import { NiemProperty, NiemType, NiemNamespace, NiemFacet, NiemLocalTerm, NiemMetadata, NiemTypeContainsProperty, NiemTypeUnion, NiemChangelogProperty, NiemChangelogType, NiemChangelogTypeContainsProperty, NiemChangelogFacet, NiemChangelogNamespace } from './schemas/releases.interface';
import { ErrorLogService } from 'src/error/error.log.service';
import { FilesService } from '../files/files.service';
import { GTRIService } from 'src/GTRIAPI2.0/gtri.service';
import { MappingDoc } from '../mongorepository/schemas/mappingdoc.interface';
export declare class ReleasesService {
    private ErrorLogService;
    private FilesService;
    private GTRIService;
    private NiemPropertyModel;
    private NiemTypeModel;
    private NiemNamespaceModel;
    private NiemFacetModel;
    private NiemLocalTermModel;
    private NiemMetadataModel;
    private NiemTypeContainsPropertyModel;
    private NiemTypeUnionModel;
    private NiemChangelogPropertyModel;
    private NiemChangelogTypeModel;
    private NiemChangelogTypeContainsPropertyModel;
    private NiemChangelogFacetModel;
    private NiemChangelogNamespaceModel;
    private MappingDocModel;
    constructor(ErrorLogService: ErrorLogService, FilesService: FilesService, GTRIService: GTRIService, NiemPropertyModel: Model<NiemProperty>, NiemTypeModel: Model<NiemType>, NiemNamespaceModel: Model<NiemNamespace>, NiemFacetModel: Model<NiemFacet>, NiemLocalTermModel: Model<NiemLocalTerm>, NiemMetadataModel: Model<NiemMetadata>, NiemTypeContainsPropertyModel: Model<NiemTypeContainsProperty>, NiemTypeUnionModel: Model<NiemTypeUnion>, NiemChangelogPropertyModel: Model<NiemChangelogProperty>, NiemChangelogTypeModel: Model<NiemChangelogType>, NiemChangelogTypeContainsPropertyModel: Model<NiemChangelogTypeContainsProperty>, NiemChangelogFacetModel: Model<NiemChangelogFacet>, NiemChangelogNamespaceModel: Model<NiemChangelogNamespace>, MappingDocModel: Model<MappingDoc>);
    getParentType(ParentTypeDto: ParentTypeDto): Promise<any>;
    getAugmentations(AugmentationDto: AugmentationDto): Promise<any>;
    getAssociations(AssociationDto: AssociationDto): Promise<any>;
    updateErrorLog: (errorLogs: any, userId: any, collectionName: any) => void;
    migrateRelease(MigrationDto: MigrationDto): Promise<false | {
        originalMappingDoc: any;
        newMappingDoc: {
            propertySheet: any[];
            typeSheet: any[];
            typeHasPropertySheet: any[];
            codesFacetsSheet: any[];
            namespaceSheet: any[];
            localTerminologySheet: any[];
            typeUnionSheet: any[];
            metadataSheet: any[];
        };
        niemChanges: {};
    }>;
    migrateReleasViaGTRI(MigrationDto: MigrationDto): Promise<any>;
    getNamespaceData(ReleaseDto: ReleaseDto): Promise<(NiemNamespace & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getDomainElements(DomainDto: DomainDto): Promise<{
        property: (NiemProperty & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        type: (NiemType & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    getReleaseProgressStatus(): {
        label: string;
        totalCompleted: number;
        totalItems: number;
    };
    addReleaseDataToDb: (NiemDataDto: any, releaseData: any) => Promise<import("../../error/interfaces/error-framework-result.interface").ErrorFrameworkServiceResult>;
    addChangelogDataToDb: (NiemDataDto: any, changelogDataObj: any) => Promise<import("../../error/interfaces/error-framework-result.interface").ErrorFrameworkServiceResult>;
    checkAvailableReleases(userId?: string): Promise<any>;
    updateReleaseViaNiem(userId: any, currentRelease: any): Promise<any>;
    getLoadedReleases(): Promise<import("../../error/interfaces/error-framework-result.interface").ErrorFrameworkServiceResult>;
}
