export declare const convertToAugmentationString: (string: string) => string;
export declare const convertToAssociationString: (string: string) => string;
export declare const getPreviousRelease: (releases: any, fileRelease: any) => any;
export declare const parseChangelogFileViaNiem: (releases: any, fileRelease: any, fileBuffer: any) => {
    previousRelease: any;
    fileRelease: any;
};
export declare const addChangelogPropertyToDb: (fileRelease: any, previousRelease: any, property: any, NiemChangelogPropertyModel: any) => Promise<any[]>;
export declare const addChangelogTypeToDb: (fileRelease: any, previousRelease: any, type: any, NiemChangelogTypeModel: any) => Promise<any[]>;
export declare const addChangelogTypeContainsPropertyToDb: (fileRelease: any, previousRelease: any, tcp: any, NiemChangelogTypeContainsPropertyModel: any) => Promise<any[]>;
export declare const addChangelogFacetToDb: (fileRelease: any, previousRelease: any, facet: any, NiemChangelogFacetModel: any) => Promise<any[]>;
export declare const addChangelogNamespaceToDb: (fileRelease: any, previousRelease: any, ns: any, NiemChangelogNamespaceModel: any) => Promise<any[]>;
export declare const releaseUploadStatus: {
    label: string;
    totalCompleted: number;
    totalItems: number;
};
export declare const resetReleaseUploadStatusValues: () => void;
export declare const parseReleaseFileViaNiem: (releaseNumber: any, fileBuffer: any) => {
    releaseNumber: any;
    data: unknown[];
};
export declare const downloadFile: (url: any) => Promise<any>;
export declare const scrape: (url: any) => Promise<any>;
export declare const addReleaseFacetToDb: (NiemFacetModel: any, releaseData: any) => Promise<any[]>;
export declare const addReleaseLocalTermToDb: (NiemLocalTerm: any, releaseData: any) => Promise<any[]>;
export declare const addReleaseMetadataToDb: (NiemMetadataModel: any, releaseData: any) => Promise<any[]>;
export declare const addReleaseNamespaceToDb: (NiemNamespaceModel: any, releaseData: any) => Promise<any[]>;
export declare const addReleasePropertyToDb: (NiemPropertyModel: any, releaseData: any) => Promise<any[]>;
export declare const addReleaseTypeToDb: (NiemTypeModel: any, releaseData: any) => Promise<any[]>;
export declare const addReleaseTypeContainsPropertyToDb: (NiemTypeContainsPropertyModel: any, releaseData: any) => Promise<any[]>;
export declare const addReleaseTypeUnionToDb: (NiemTypeUnionModel: any, releaseData: any) => Promise<any[]>;
