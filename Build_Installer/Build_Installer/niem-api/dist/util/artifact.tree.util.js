"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArtifactTreeJSON = void 0;
async function getArtifactTreeJSON(packageId) {
    const artifactTreeDBResult = await this.ArtifactTreeModel.findOne({ packageId: packageId }, { artifactTreeJSON: 1 });
    const artifactTree = JSON.parse(artifactTreeDBResult['artifactTreeJSON']);
    return artifactTree;
}
exports.getArtifactTreeJSON = getArtifactTreeJSON;
//# sourceMappingURL=artifact.tree.util.js.map