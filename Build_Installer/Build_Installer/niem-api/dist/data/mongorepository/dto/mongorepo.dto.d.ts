export declare class SavePackageDto {
    readonly packageId: string;
    readonly userId: string;
    readonly packageName: string;
    readonly niemRelease: string;
    readonly version: string;
    readonly status: string;
    readonly statusNo: string;
    readonly poc: string;
    readonly pocEmail: string;
    readonly description: string;
    readonly orgName: string;
    readonly orgType: string;
    readonly coiTags: string;
    readonly exchangeTags: string;
    readonly format: string;
    readonly isReleaseLocked: boolean;
    readonly isRequiredArtifactUploaded: string;
    readonly cmeData: string;
    readonly artifactTree: string;
    readonly mappingDoc: string;
    readonly isPublished: boolean;
    readonly isCopiedPackage: boolean;
    readonly isMigratedPackage: boolean;
    readonly isTranslationGenerated: boolean;
    readonly validationArtifacts: Array<Object>;
    readonly showValidationResults: boolean;
}
export declare class SaveCMEDataDto {
    readonly cmeData: string;
    readonly packageId: string;
}
export declare class ExportPackageDto {
    readonly packageId: string;
    readonly nodeId: string;
    readonly auditUser: string;
}
export declare class DeletePackageDto {
    readonly packageId: string;
    readonly auditUser: string;
}
export declare class MappingComponentDto {
    readonly packageId: string;
    readonly propertySheet: string;
    readonly typeSheet: string;
    readonly typeHasPropertySheet: string;
    readonly codesFacetsSheet: string;
    readonly namespaceSheet: string;
    readonly localTerminologySheet: string;
    readonly typeUnionSheet: string;
    readonly metadataSheet: string;
}
export declare class CommonComponentsDto {
    readonly searchString: string;
    readonly searchType: string;
}
export declare class TransferPackagesDto {
    readonly transferToUserId: string;
    readonly transferFromUserId: string;
    readonly packagesToTransfer: Array<Object>;
    readonly packagePocMap: Object;
    readonly packagePocEmailMap: Object;
}
