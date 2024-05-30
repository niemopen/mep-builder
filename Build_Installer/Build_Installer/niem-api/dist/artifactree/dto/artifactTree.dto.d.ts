export declare class DeleteByFolderDto {
    readonly packageId: string;
    readonly parentNodeId: string;
    readonly initialTree: object[];
    readonly auditUser: string;
}
export declare class DeleteItemDto {
    readonly packageId: string;
    readonly nodeId: string;
    readonly deleteFileBlob: boolean;
    readonly auditUser: string;
}
