export declare class ParentTypeDto {
    readonly searchString: string;
}
export declare class AugmentationDto {
    readonly searchString: string;
}
export declare class AssociationDto {
    readonly searchString: string;
}
export declare class NiemDataDto {
    readonly userId: string;
    readonly releases: string[];
}
export declare class MigrationDto {
    readonly packageId: string;
    readonly auditUser: string;
    readonly releases: string[];
    readonly startingRelease: string;
    readonly endRelease: string;
}
export declare class ReleaseDto {
    readonly release: string;
    readonly element: string;
}
export declare class DomainDto {
    readonly release: string;
    readonly domainPrefix: string;
}
