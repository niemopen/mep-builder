export interface LocalRepo {
    readonly isStandAloneSys: boolean;
    readonly username: string;
    readonly packageName: string;
    readonly artifactTree: string;
    readonly mpdData: string;
    readonly mappingDoc: string;
    readonly filePath: string;
}
