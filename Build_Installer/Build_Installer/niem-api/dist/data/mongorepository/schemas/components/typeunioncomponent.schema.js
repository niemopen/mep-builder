"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeUnionComponentSchema = void 0;
const mongoose = require("mongoose");
exports.TypeUnionComponentSchema = new mongoose.Schema({
    packageId: String,
    key: Number,
    sourceUnionNS: String,
    sourceUnionTypeName: String,
    sourceMemberNS: String,
    sourceMemberTypeName: String,
    mappingCode: String,
    targetUnionNS: String,
    targetUnionTypeName: String,
    targetMemberNS: String,
    targetMemberTypeName: String,
});
//# sourceMappingURL=typeunioncomponent.schema.js.map