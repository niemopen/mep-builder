"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFolderPath = void 0;
const getFolderPath = (artifactTree, nodeId) => {
    let folderPath = '';
    let nodeNameLib = {};
    let parentNodeId = '';
    if (nodeId.length === 1) {
        parentNodeId = nodeId;
    }
    else {
        const splitNodeId = nodeId.split('.');
        const removeLastItem = splitNodeId.slice(0, splitNodeId.length - 1);
        parentNodeId = removeLastItem.join('.');
    }
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
                    if (currentNode === parentNodeId) {
                        folderPath = parentFolderPath;
                        break;
                    }
                }
            }
            const children = item.children;
            if (children && children.length > 0) {
                loopThrough(children);
            }
        });
    };
    loopThrough(artifactTree);
    return folderPath;
};
exports.getFolderPath = getFolderPath;
//# sourceMappingURL=folder.path.util.js.map