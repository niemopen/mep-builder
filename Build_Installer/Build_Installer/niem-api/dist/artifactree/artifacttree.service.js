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
const files_service_1 = require("../data/files/files.service");
const dataValidation_util_1 = require("../util/dataValidation.util");
let ArtifactTreeService = class ArtifactTreeService {
    constructor(AuditLogService, ArtifactTreeModel, FilesService) {
        this.AuditLogService = AuditLogService;
        this.ArtifactTreeModel = ArtifactTreeModel;
        this.FilesService = FilesService;
    }
    async saveArtifactTreeToDB(packageId, artifactTree, auditUser) {
        const ogArtifactTree = await this.ArtifactTreeModel.findOne({
            packageId: packageId,
        });
        const modArtifactTree = await this.ArtifactTreeModel.findOneAndUpdate({ packageId: packageId }, { artifactTreeJSON: JSON.stringify(artifactTree) }, { new: true });
        if (!_.isEqual(ogArtifactTree, modArtifactTree)) {
            this.AuditLogService.update(collection.artifacttrees, auditUser, modArtifactTree, ogArtifactTree);
        }
    }
    async makeBranchVisible(nodeId, packageId, auditUser, recursive = false) {
        let artifactTree = await this.getArtifactTreeJSON(packageId);
        const loopThrough = async (items, nodeBranch) => {
            for (let i = 0; i < items.length; i++) {
                if (items[i].nodeId === nodeBranch) {
                    items[i].isVisible = true;
                    return true;
                }
                else if (items[i].children && items[i].children.length > 0) {
                    await loopThrough(items[i].children, nodeBranch);
                }
            }
            artifactTree = items;
        };
        if (recursive) {
            const allBranchNodes = await this.getBranchChildren(artifactTree, nodeId);
            for (let i = 0; i < allBranchNodes.length; i++) {
                await loopThrough(artifactTree, allBranchNodes[i]);
            }
        }
        else {
            await loopThrough(artifactTree, nodeId);
        }
        await this.saveArtifactTreeToDB(packageId, artifactTree, auditUser);
    }
    async getArtifactTreeJSON(packageId) {
        let artifactTree;
        const artifactTreeDBResult = await this.ArtifactTreeModel.findOne({ packageId: packageId }, { artifactTreeJSON: 1 });
        if (artifactTreeDBResult) {
            artifactTree = JSON.parse(artifactTreeDBResult.artifactTreeJSON);
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
            for (let i = 0; i < items.length; i++) {
                if (items[i].nodeId == parentNodeId) {
                    returningChildren = items[i].children;
                }
                const children = items[i].children;
                if (children && children.length > 0) {
                    loopThrough(children);
                }
            }
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
        nodeMax = nodeMax * 1 + 1;
        return nodeMax + 1;
    }
    async AddArtifactToTree(packageId, artifact, parentNodeId, auditUser) {
        const artifactTree = await this.getArtifactTreeJSON(packageId);
        let newNode = '';
        const loopThroughToFindParentFolder = (items) => {
            items.map((item) => {
                if (item.nodeId === parentNodeId) {
                    const index = item.children.findIndex((itemData) => itemData.label === artifact.label);
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
                            label: artifact.label,
                            fileType: artifact.fileType,
                            fileBlobId: artifact.fileBlobId,
                            tag: artifact.tag,
                            needsReview: false,
                            isVisible: true,
                            children: [],
                        });
                    }
                    else {
                        item.children[index].fileBlobId = artifact.fileBlobId;
                        item.children[index].isVisible = true;
                        newNode = item.children[index].nodeId;
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
        await this.makeBranchVisible(parentNodeId, packageId, auditUser);
        return newNode;
    }
    getParentNodeId(nodeId) {
        let parentNodeId = '';
        if (nodeId.length === 1) {
            parentNodeId = nodeId;
        }
        else {
            const splitNodeId = nodeId.split('.');
            const removeLastItem = splitNodeId.slice(0, splitNodeId.length - 1);
            parentNodeId = removeLastItem.join('.');
        }
        return parentNodeId;
    }
    async getArtifactsByFileType(packageId, fileType) {
        const artifactTree = await this.getArtifactTreeJSON(packageId);
        const artifactTreeFiles = [];
        const loopThrough = (items) => {
            items.forEach((item) => {
                if (item.fileType.toLowerCase() === fileType.toLowerCase()) {
                    artifactTreeFiles.push(item);
                }
                const children = item.children;
                if (children && children.length > 0) {
                    loopThrough(children);
                }
            });
        };
        loopThrough(artifactTree[0].children);
        return artifactTreeFiles;
    }
    async getArtifactFileBlobId(packageId, label, parentNodeId = '0') {
        const artifactTree = await this.getArtifactTreeJSON(packageId);
        let fileBlobId = null;
        let branch;
        if (parentNodeId !== '0') {
            branch = await this.getBranchChildren(artifactTree, parentNodeId);
        }
        else {
            branch = artifactTree;
        }
        const loopThrough = (items) => {
            for (let i = 0; i < items.length; i++) {
                if (items[i].label === label) {
                    if (items[i].fileBlobId) {
                        fileBlobId = items[i].fileBlobId;
                    }
                }
                const children = items[i].children;
                if (children && children.length > 0) {
                    loopThrough(children);
                }
            }
        };
        loopThrough(branch);
        return fileBlobId;
    }
    async getFilesAll(artifactTree) {
        const files = [];
        const loopThrough = (items) => {
            items.forEach((item) => {
                if (item.fileType !== 'folder') {
                    files.push(item);
                }
                const children = item.children;
                if (children && children.length > 0) {
                    loopThrough(children);
                }
            });
        };
        loopThrough(artifactTree);
        return files;
    }
    async deleteItemFromTree(DeleteItemDto) {
        try {
            const artifactTree = await this.getArtifactTreeJSON(DeleteItemDto.packageId);
            const loopThrough = async (items) => {
                for (const item of items) {
                    if (item.nodeId === DeleteItemDto.nodeId) {
                        const index = items.findIndex(function (child, i) {
                            return child.nodeId === DeleteItemDto.nodeId;
                        });
                        items.splice(index, 1);
                        if ((0, dataValidation_util_1.isStringValid)(item.fileBlobId) &&
                            DeleteItemDto.deleteFileBlob) {
                            const FileRepo = {
                                fileId: item.fileBlobId,
                                packageId: DeleteItemDto.packageId,
                                auditUser: DeleteItemDto.auditUser,
                            };
                            await this.FilesService.deleteFileFromDB(FileRepo);
                        }
                    }
                    const children = item.children;
                    if (children && children.length > 0) {
                        loopThrough(children);
                    }
                }
                return items;
            };
            const latestTree = await loopThrough(artifactTree);
            await this.saveArtifactTreeToDB(DeleteItemDto.packageId, latestTree, DeleteItemDto.auditUser);
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    async deleteItemsByFolder(DeleteByFolderDto) {
        try {
            let artifactTree = await this.getArtifactTreeJSON(DeleteByFolderDto.packageId);
            const folderItems = await this.getBranchChildren(artifactTree, DeleteByFolderDto.parentNodeId);
            const branchFiles = await this.getFilesAll(folderItems);
            for (const file of branchFiles) {
                if ((0, dataValidation_util_1.isStringValid)(file.fileBlobId)) {
                    let FileRepo = {
                        fileId: file.fileBlobId,
                        packageId: DeleteByFolderDto.packageId,
                        auditUser: DeleteByFolderDto.auditUser,
                    };
                    await this.FilesService.deleteFileFromDB(FileRepo);
                }
            }
            const loopThrough = async (items) => {
                let artifactTree = items;
                artifactTree.forEach((item) => {
                    if (item.nodeId === DeleteByFolderDto.parentNodeId) {
                        item.children = [];
                    }
                    const children = item.children;
                    if (children && children.length > 0) {
                        loopThrough(children);
                    }
                });
                return artifactTree;
            };
            const parentFolderEmptied = await loopThrough(artifactTree);
            const latestArtifactTree = await this.resetBranch(parentFolderEmptied, DeleteByFolderDto.parentNodeId, DeleteByFolderDto.initialTree);
            await this.saveArtifactTreeToDB(DeleteByFolderDto.packageId, latestArtifactTree, DeleteByFolderDto.auditUser);
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    async resetBranch(artifactTree, parentNodeId, initialTree) {
        let updatedArtifactTree = artifactTree;
        const initialTreeBranchChildren = await this.getBranchChildren(initialTree, parentNodeId);
        if (initialTreeBranchChildren.length > 0) {
            const loopThrough = (updatedArtifactTree) => {
                updatedArtifactTree.every((item, index) => {
                    if (item.nodeId === parentNodeId) {
                        updatedArtifactTree[index].children = initialTreeBranchChildren;
                        return false;
                    }
                    const children = item.children;
                    if (children && children.length > 0) {
                        loopThrough(children);
                    }
                    return true;
                });
            };
            loopThrough(updatedArtifactTree);
        }
        return updatedArtifactTree;
    }
};
ArtifactTreeService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)('ArtifactTree')),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => files_service_1.FilesService))),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService,
        mongoose_2.Model,
        files_service_1.FilesService])
], ArtifactTreeService);
exports.ArtifactTreeService = ArtifactTreeService;
//# sourceMappingURL=artifacttree.service.js.map