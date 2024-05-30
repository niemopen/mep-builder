import { Model } from 'mongoose';
import { AuditLogService } from 'src/audit/audit.log.service';
import { ArtifactTree } from 'src/data/mongorepository/schemas/artifacttree.interface';
export declare class ArtifactTreeService {
    private AuditLogService;
    private ArtifactTreeModel;
    constructor(AuditLogService: AuditLogService, ArtifactTreeModel: Model<ArtifactTree>);
    saveArtifactTreeToDB(packageId: any, artifactTree: any, auditUser: any): Promise<any>;
    getArtifactTreeJSON(packageId: any): Promise<any>;
    getNodeIdByLabel(branch: any, label: any): Promise<any>;
    getBranchChildren(branch: any, parentNodeId: any): Promise<any>;
    getNextNodePart(items: any): number;
    AddArtifactToTree(packageId: any, artifact: any, parentNodeId: any, auditUser: any): Promise<any>;
}
