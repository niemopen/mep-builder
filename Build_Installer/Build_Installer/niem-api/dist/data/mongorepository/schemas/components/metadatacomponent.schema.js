"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataComponentSchema = void 0;
const mongoose = require("mongoose");
exports.MetadataComponentSchema = new mongoose.Schema({
    packageId: String,
    key: Number,
    sourceMetadataNS: String,
    sourceMetadataTypeName: String,
    sourceAppliesToNS: String,
    sourceAppliesToTypeName: String,
    mappingCode: String,
    targetMetadataNS: String,
    targetMetadataTypeName: String,
    targetAppliesToNS: String,
    targetAppliesToTypeName: String,
});
//# sourceMappingURL=metadatacomponent.schema.js.map