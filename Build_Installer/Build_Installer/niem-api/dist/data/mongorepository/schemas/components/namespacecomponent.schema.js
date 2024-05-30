"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamespaceComponentSchema = void 0;
const mongoose = require("mongoose");
exports.NamespaceComponentSchema = new mongoose.Schema({
    packageId: String,
    key: Number,
    sourceNSPrefix: String,
    sourceURI: String,
    sourceDefinition: String,
    mappingCode: String,
    targetNSPrefix: String,
    targetStyle: String,
    targetURI: String,
    targetDefinition: String,
    ndrVersion: String,
    ndrTarget: String,
    fileName: String,
    relativePath: String,
    draftVersion: String,
});
//# sourceMappingURL=namespacecomponent.schema.js.map