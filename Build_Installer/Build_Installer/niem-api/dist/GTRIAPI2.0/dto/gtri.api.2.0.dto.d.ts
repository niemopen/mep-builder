export declare class SearchPropertiesDto {
    readonly niemVersionNumber: string;
    readonly token: string;
    readonly substring: string;
    readonly prefix: string;
    readonly type: string;
    readonly isAbstract: boolean;
    readonly isElement: boolean;
    readonly offset: number;
    readonly limit: number;
}
export declare class SearchTypesDto {
    readonly niemVersionNumber: string;
    readonly token: string;
    readonly substring: string;
    readonly prefix: string;
    readonly offset: number;
    readonly limit: number;
}
export declare class ValidationDto {
    readonly packageId: string;
    readonly fileBlobId: string;
    readonly schemaFileBlobId: string;
    readonly auditUser: string;
}
