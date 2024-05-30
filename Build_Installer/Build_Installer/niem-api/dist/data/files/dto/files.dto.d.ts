export declare class CreateFileDto {
    readonly fileId: string;
    readonly packageId: string;
    readonly auditUser: string;
    readonly encoding: string;
}
export declare class TranslateDto {
    readonly translateType: string;
    readonly packageId: string;
    readonly auditUser: string;
}
export declare class DeleteFileDto {
    readonly fileId: string;
    readonly packageId: string;
    readonly auditUser: string;
}
