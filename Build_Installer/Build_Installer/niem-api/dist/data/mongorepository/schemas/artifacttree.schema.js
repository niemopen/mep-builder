"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactTreeSchema = void 0;
const mongoose = require("mongoose");
exports.ArtifactTreeSchema = new mongoose.Schema({
    packageId: String,
    artifactTreeJSON: String,
});
//# sourceMappingURL=artifacttree.schema.js.map