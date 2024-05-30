/// <reference types="node" />
import { Model } from 'mongoose';
import { SavePackageDto, SaveCMEDataDto, ExportPackageDto, MappingComponentDto, CommonComponentsDto, DeletePackageDto, TransferPackagesDto } from './dto/mongorepo.dto';
import { AuditLogService } from 'src/audit/audit.log.service';
import { ArtifactTreeService } from 'src/artifactree/artifacttree.service';
import { FilesService } from '../files/files.service';
import { GTRIService } from 'src/GTRIAPI2.0/gtri.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { UserService } from 'src/user/user.service';
import { Package } from './schemas/package.interface';
import { ArtifactTree } from './schemas/artifacttree.interface';
import { FileBlob } from '../files/schemas/fileblob.interface';
import { MappingDoc } from './schemas/mappingdoc.interface';
import { PropertyComponent } from './schemas/components/propertycomponent.interface';
import { TypeComponent } from './schemas/components/typecomponent.interface';
import { TypeHasPropertyComponent } from './schemas/components/typehaspropertycomponent.interface';
import { CodesFacetsComponent } from './schemas/components/codesfacetscomponent.interface';
import { NamespaceComponent } from './schemas/components/namespacecomponent.interface';
import { LocalTerminologyComponent } from './schemas/components/localterminologycomponent.interface';
import { TypeUnionComponent } from './schemas/components/typeunioncomponent.interface';
import { MetadataComponent } from './schemas/components/metadatacomponent.interface';
import { PropertyCommonNIEMComponent } from './schemas/components/propertycommonniemcomponent.interface';
import { TypeCommonNIEMComponent } from './schemas/components/typecommonniemcomponent.interface';
import { CustomModelExtension } from './schemas/custommodelextension.interface';
export declare class MongoRepoService {
    private AuditLogService;
    private ArtifactTreeService;
    private FilesService;
    private GTRIService;
    private ErrorLogService;
    private UserService;
    private PackageModel;
    private ArtifactTreeModel;
    private FileBlobModel;
    private MappingDocModel;
    private PropertyComponentModel;
    private TypeComponentModel;
    private TypeHasPropertyComponentModel;
    private CodesFacetsComponentModel;
    private NamespaceComponentModel;
    private LocalTerminologyComponentModel;
    private TypeUnionComponentModel;
    private MetadataComponentModel;
    private PropertyCommonNIEMComponentModel;
    private TypeCommonNIEMComponentModel;
    private CMEModel;
    constructor(AuditLogService: AuditLogService, ArtifactTreeService: ArtifactTreeService, FilesService: FilesService, GTRIService: GTRIService, ErrorLogService: ErrorLogService, UserService: UserService, PackageModel: Model<Package>, ArtifactTreeModel: Model<ArtifactTree>, FileBlobModel: Model<FileBlob>, MappingDocModel: Model<MappingDoc>, PropertyComponentModel: Model<PropertyComponent>, TypeComponentModel: Model<TypeComponent>, TypeHasPropertyComponentModel: Model<TypeHasPropertyComponent>, CodesFacetsComponentModel: Model<CodesFacetsComponent>, NamespaceComponentModel: Model<NamespaceComponent>, LocalTerminologyComponentModel: Model<LocalTerminologyComponent>, TypeUnionComponentModel: Model<TypeUnionComponent>, MetadataComponentModel: Model<MetadataComponent>, PropertyCommonNIEMComponentModel: Model<PropertyCommonNIEMComponent>, TypeCommonNIEMComponentModel: Model<TypeCommonNIEMComponent>, CMEModel: Model<CustomModelExtension>);
    savePackage(SavePackageDto: SavePackageDto, auditUser: any): Promise<any>;
    createArtifactFileForDB(file: any, SSGTDTO: any, currentPath: any): Promise<any>;
    saveSubsetSchema(encodedString: any, SSGTDTO: any): Promise<any>;
    getChildren(items: any, nestedFolder: any): Promise<void>;
    generateZip(artifactNode: any): Promise<Buffer>;
    getExportFileData(ExportPackageDto: ExportPackageDto): Promise<any>;
    deletePackage(DeletePackageDto: DeletePackageDto): Promise<any>;
    findPackagesByUserId(userId: any, auditUser?: string): Promise<any>;
    findPublishedPackages(): Promise<{
        response: boolean;
        publishedPackages: any[];
    } | {
        response: boolean;
        publishedPackages?: undefined;
    }>;
    findMPDData(userId?: string, findingPublished?: boolean): Promise<any>;
    getSortedMpdData(userId?: string): Promise<{
        unpublished: any;
        published: any;
    }>;
    findByPackageId(packageId: any): Promise<any>;
    saveComponents(MappingComponentDto: MappingComponentDto, auditUser: any): Promise<any>;
    getCommonComponents(CommonComponentsDto: CommonComponentsDto): Promise<any>;
    getArtifactChecklist(packageId: string): Promise<false | {
        isChecklistComplete: boolean;
        checklist: any;
    }>;
    updateArtifactStatus(SavePackageDto: SavePackageDto, auditUser: any): Promise<false | (Package & {
        _id: import("mongoose").Types.ObjectId;
    })>;
    getTranslationGenerationStatus(packageId: string): Promise<{
        response: boolean;
        isTranslationGenerated: boolean;
    } | {
        response: boolean;
        isTranslationGenerated?: undefined;
    }>;
    updateTranslationGenerationStatus(SavePackageDto: SavePackageDto, auditUser: any): Promise<false | (Package & {
        _id: import("mongoose").Types.ObjectId;
    })>;
    transferPackages(transferData: TransferPackagesDto, auditUser: string): Promise<any>;
    isPackageOwner(userId: string, packageId: string): Promise<boolean>;
    getAllCustomModelExtensions(packageId: any): Promise<(CustomModelExtension & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getCMERootInfo(packageId: any): Promise<{
        version: string;
        elementName: any;
        elementType: any;
        uri: any;
        definition: any;
    }>;
    saveCMEData(SaveCMEDataDto: SaveCMEDataDto, auditUser: any): Promise<any>;
    extractExstensionSchema(dataStream: any, packageId: any, auditUser: any): Promise<any>;
    buildCMEData(SaveCMEDataDto: SaveCMEDataDto, auditUser: any): Promise<any>;
}
