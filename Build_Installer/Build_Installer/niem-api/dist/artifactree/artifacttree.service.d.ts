import { Model } from 'mongoose';
import { AuditLogService } from 'src/audit/audit.log.service';
import { ArtifactTree } from 'src/data/mongorepository/schemas/artifacttree.interface';
import { DeleteByFolderDto, DeleteItemDto } from './dto/artifactTree.dto';
import { FilesService } from 'src/data/files/files.service';
export declare class ArtifactTreeService {
    private AuditLogService;
    private ArtifactTreeModel;
    private FilesService;
    constructor(AuditLogService: AuditLogService, ArtifactTreeModel: Model<ArtifactTree>, FilesService: FilesService);
    saveArtifactTreeToDB(packageId: any, artifactTree: any, auditUser: any): Promise<any>;
    makeBranchVisible(nodeId: any, packageId: any, auditUser: any, recursive?: boolean): Promise<any>;
    getArtifactTreeJSON(packageId: any): Promise<any>;
    getNodeIdByLabel(branch: any, label: any): Promise<any>;
    getBranchChildren(branch: any, parentNodeId: any): Promise<any>;
    getNextNodePart(items: any): number;
    AddArtifactToTree(packageId: any, artifact: any, parentNodeId: any, auditUser: any): Promise<any>;
    getParentNodeId(nodeId: any): string;
    getArtifactsByFileType(packageId: any, fileType: any): Promise<any[]>;
    getArtifactFileBlobId(packageId: any, label: any, parentNodeId?: string): Promise<any>;
    getFilesAll(artifactTree: any): Promise<any[]>;
    deleteItemFromTree(DeleteItemDto: DeleteItemDto): Promise<boolean>;
    deleteItemsByFolder(DeleteByFolderDto: DeleteByFolderDto): Promise<boolean>;
    resetBranch(artifactTree: any, parentNodeId: any, initialTree: any): Promise<any>;
}
