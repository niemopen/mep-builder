export declare const getReleaseRange: (MigrationDto: any) => any;
export declare const getMappingDocItemName: (mappingCode: any, sourceName: any, targetName: any) => any;
export declare const removePrefix: (string: any) => any;
export declare const migratePropertySheet: (release: any, mappingDoc: any, NiemChangelogPropertyModel: any) => Promise<{
    propertyObj: any[];
    changesObj: {
        changelogRelease: any;
        add: any[];
        edit: any[];
        delete: any[];
        notFound: any[];
        noChange: any[];
    };
}>;
export declare const migrateTypeSheet: (release: any, mappingDoc: any, NiemChangelogTypeModel: any) => Promise<{
    typeObj: any[];
    changesObj: {
        changelogRelease: any;
        add: any[];
        edit: any[];
        delete: any[];
        notFound: any[];
        noChange: any[];
    };
}>;
export declare const migrateTypeHasPropertySheet: (release: any, mappingDoc: any, NiemChangelogTypeContainsPropertyModel: any) => Promise<{
    typeHasPropertyObj: any[];
    changesObj: {
        changelogRelease: any;
        add: any[];
        edit: any[];
        delete: any[];
        notFound: any[];
        noChange: any[];
    };
}>;
export declare const migrateFacetSheet: (release: any, mappingDoc: any, NiemChangelogFacetModel: any) => Promise<{
    facetObj: any[];
    changesObj: {
        changelogRelease: any;
        add: any[];
        edit: any[];
        delete: any[];
        notFound: any[];
        noChange: any[];
    };
}>;
export declare const migrateNamespaceSheet: (release: any, mappingDoc: any, NiemChangelogNamespaceModel: any) => Promise<{
    namespaceObj: any[];
    changesObj: {
        changelogRelease: any;
        add: any[];
        edit: any[];
        delete: any[];
        notFound: any[];
        noChange: any[];
    };
}>;
