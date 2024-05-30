export interface FileRepo {
    readonly isStandAloneSys: string;
    readonly username: string;
    readonly fileName: string;
    readonly packageName: string;
    readonly nodeId: string;
    readonly artifactTree: string;
}
