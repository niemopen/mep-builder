"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodesFacetsComponentSchema = void 0;
const mongoose = require("mongoose");
exports.CodesFacetsComponentSchema = new mongoose.Schema({
    packageId: String,
    key: Number,
    sourceNSPrefix: String,
    sourceTypeName: String,
    sourceValue: String,
    sourceDefinition: String,
    sourceKindOfFacet: String,
    mappingCode: String,
    targetNSPrefix: String,
    targetTypeName: String,
    targetValue: String,
    targetDefinition: String,
    targetKindOfFacet: String,
});
//# sourceMappingURL=codesfacetscomponent.schema.js.map