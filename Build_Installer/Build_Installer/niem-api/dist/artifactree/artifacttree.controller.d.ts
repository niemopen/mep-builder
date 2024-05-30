import { ArtifactTreeService } from './artifacttree.service';
import { DeleteItemDto, DeleteByFolderDto } from './dto/artifactTree.dto';
import { UserService } from 'src/user/user.service';
import { MongoRepoService } from 'src/data/mongorepository/mongorepo.service';
export declare class ArtifactTreeController {
    private readonly ArtifactTreeService;
    private readonly UserService;
    private readonly MongoRepoService;
    constructor(ArtifactTreeService: ArtifactTreeService, UserService: UserService, MongoRepoService: MongoRepoService);
    retrieveArtifactTree(packageId: string, auditUser: string, res: any): Promise<any>;
    deleteItemFromTree(DeleteItemDto: DeleteItemDto, res: any): Promise<any>;
    deleteItemsByFolder(DeleteByFolderDto: DeleteByFolderDto, res: any): Promise<any>;
}
