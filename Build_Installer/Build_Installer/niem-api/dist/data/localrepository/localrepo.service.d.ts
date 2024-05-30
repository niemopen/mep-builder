import { LocalRepo } from './schemas/localrepo.interface';
export declare const createLocalTreeStructure: (localPath: any, packageName: any, artifactTree: any) => void;
export declare class LocalRepoService {
    getSubsetSchemaZip(LocalRepo: LocalRepo): Promise<any>;
    deletePackage(LocalRepo: LocalRepo): Promise<any>;
}
