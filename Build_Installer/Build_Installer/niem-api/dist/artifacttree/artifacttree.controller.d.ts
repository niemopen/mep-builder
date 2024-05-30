import { ArtifactTreeService } from './artifacttree.service';
export declare class ArtifactTreeController {
    private readonly ArtifactTreeService;
    constructor(ArtifactTreeService: ArtifactTreeService);
    retrieveArtifactTree(packageId: string, res: any): Promise<any>;
}
