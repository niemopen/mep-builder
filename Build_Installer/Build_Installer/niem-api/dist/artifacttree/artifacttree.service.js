"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactTreeService = void 0;
const _ = require("lodash");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const collection = require("../util/collection.name.util");
const audit_log_service_1 = require("../audit/audit.log.service");
const artifacttree_interface_1 = require("../data/mongorepository/schemas/artifacttree.interface");
let ArtifactTreeService = class ArtifactTreeService {
    constructor(AuditLogService, ArtifactTreeModel) {
        this.AuditLogService = AuditLogService;
        this.ArtifactTreeModel = ArtifactTreeModel;
    }
    async saveArtifactTreeToDB(packageId, artifactTree, auditUser) {
        const ogArtifactTree = await this.ArtifactTreeModel.findOne({
            packageId: packageId,
        });
        const modArtifactTree = await this.ArtifactTreeModel.findOneAndUpdate({ packageId: packageId }, { artifactTreeJSON: artifactTree.toString() }, { new: true });
        if (!_.isEqual(ogArtifactTree, modArtifactTree)) {
            this.AuditLogService.update(collection.artifacttrees, auditUser, modArtifactTree, ogArtifactTree);
        }
        console.log('saved artifact tree to db');
    }
    async getArtifactTreeJSON(packageId) {
        let artifactTree;
        const artifactTreeDBResult = await this.ArtifactTreeModel.findOne({ packageId: packageId }, { artifactTreeJSON: 1 });
        if (artifactTreeDBResult) {
            console.log('about to cast');
            artifactTree = JSON.parse(artifactTreeDBResult.artifactTreeJSON);
            console.log('casted as: ', artifactTree);
        }
        return artifactTree;
    }
    async getNodeIdByLabel(branch, label) {
        let nodeId = -1;
        const loopThrough = (items) => {
            items.every((item) => {
                if (item.label === label) {
                    nodeId = item.nodeId;
                    return false;
                }
                const children = item.children;
                if (children && children.length > 0) {
                    loopThrough(children);
                }
                return true;
            });
        };
        loopThrough(branch);
        return nodeId;
    }
    async getBranchChildren(branch, parentNodeId) {
        let returningChildren = [];
        const loopThrough = (items) => {
            items.every((item) => {
                if (item.nodeId == parentNodeId) {
                    returningChildren = item.children;
                }
                const children = item.children;
                if (children && children.length > 0) {
                    loopThrough(children);
                }
            });
        };
        loopThrough(branch);
        return returningChildren;
    }
    getNextNodePart(items) {
        let nodeParts;
        let nodeMax = 0;
        items.forEach(function (item) {
            nodeParts = item.nodeId.split('.');
            if (parseInt(nodeParts[nodeParts.length - 1]) > nodeMax) {
                nodeMax = nodeParts[nodeParts.length - 1];
            }
        });
        nodeMax = nodeMax + 1;
        return nodeMax + 1;
    }
    async AddArtifactToTree(packageId, artifact, parentNodeId, auditUser) {
        const artifactTree = await this.getArtifactTreeJSON(packageId);
        let newNode = '';
        const loopThroughToFindParentFolder = (items) => {
            items.map((item) => {
                if (item.nodeId === parentNodeId) {
                    const index = item.children.findIndex((itemData) => itemData.label === artifact.name);
                    if (index === -1) {
                        if (parentNodeId === '0') {
                            newNode = this.getNextNodePart(item.children).toString();
                        }
                        else {
                            newNode =
                                parentNodeId.toString() +
                                    '.' +
                                    this.getNextNodePart(item.children).toString();
                        }
                        item.children.push({
                            key: newNode,
                            nodeId: newNode,
                            label: artifact.name,
                            fileType: artifact.type,
                            fileBlobId: artifact.fileBlobId,
                            tag: artifact.tag,
                            isVisible: true,
                            children: [],
                        });
                    }
                    else {
                        item.children[index] = {
                            fileBlobId: artifact.fileBlobId,
                            isVisible: true,
                        };
                    }
                    return false;
                }
                else if (item.children && item.children.length > 0) {
                    loopThroughToFindParentFolder(item.children);
                }
                return 0;
            });
        };
        loopThroughToFindParentFolder(artifactTree);
        await this.saveArtifactTreeToDB(packageId, artifactTree, auditUser);
        return newNode;
    }
};
ArtifactTreeService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)('ArtifactTree')),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService,
        mongoose_2.Model])
], ArtifactTreeService);
exports.ArtifactTreeService = ArtifactTreeService;
//# sourceMappingURL=artifacttree.service.js.map