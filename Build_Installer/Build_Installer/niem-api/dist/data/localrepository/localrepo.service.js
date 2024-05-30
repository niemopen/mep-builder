"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalRepoService = exports.createLocalTreeStructure = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs-extra");
const local_path_util_1 = require("../../util/local.path.util");
const zipper = require("zip-local");
const createTreeDir = (localPath, rootFolder, parentFolderPath) => {
    fs.mkdirSync(localPath + rootFolder + parentFolderPath, { recursive: true });
};
const createLocalTreeStructure = (localPath, packageName, artifactTree) => {
    const packageFolderPathName = packageName;
    let nodeNameLib = {};
    const loopThrough = (items) => {
        items.forEach((item) => {
            if (item.nodeId != 0 &&
                item.fileType === 'folder' &&
                item.isVisible === true) {
                nodeNameLib[item.nodeId] = item.label;
                let parentFolderPath = '/';
                let nodeParts = item.nodeId.split('.');
                let currentNode = '';
                for (let i = 0; i < nodeParts.length; i++) {
                    if (i === 0) {
                        currentNode = currentNode + nodeParts[i];
                    }
                    else {
                        currentNode = currentNode + '.' + nodeParts[i];
                    }
                    parentFolderPath = parentFolderPath + nodeNameLib[currentNode] + '/';
                }
                createTreeDir(localPath, packageFolderPathName, parentFolderPath);
            }
            const children = item.children;
            if (children && children.length > 0) {
                loopThrough(children);
            }
        });
    };
    loopThrough(artifactTree);
};
exports.createLocalTreeStructure = createLocalTreeStructure;
let LocalRepoService = class LocalRepoService {
    async getSubsetSchemaZip(LocalRepo) {
        const localPath = (0, local_path_util_1.getLocalPath)(LocalRepo.isStandAloneSys, LocalRepo.username);
        try {
            const zipBuffer = zipper.sync
                .zip(localPath + LocalRepo.packageName + '/base-xsd/niem/')
                .compress()
                .memory();
            return zipBuffer;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
    async deletePackage(LocalRepo) {
        const localPath = (0, local_path_util_1.getLocalPath)(LocalRepo.isStandAloneSys, LocalRepo.username);
        try {
            fs.rmdirSync(localPath + '/' + LocalRepo.packageName, {
                recursive: true,
            });
            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
};
LocalRepoService = __decorate([
    (0, common_1.Injectable)()
], LocalRepoService);
exports.LocalRepoService = LocalRepoService;
//# sourceMappingURL=localrepo.service.js.map