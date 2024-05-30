"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageSchema = void 0;
const mongoose = require("mongoose");
exports.PackageSchema = new mongoose.Schema({
    userId: String,
    packageName: String,
    niemRelease: String,
    version: String,
    status: String,
    statusNo: String,
    poc: String,
    pocEmail: String,
    description: String,
    orgName: String,
    orgType: String,
    coiTags: String,
    exchangeTags: String,
    format: String,
    isReleaseLocked: Boolean,
    isRequiredArtifactUploaded: String,
    cmeData: String,
    isPublished: Boolean,
    isCopiedPackage: Boolean,
    isMigratedPackage: Boolean,
    isTranslationGenerated: Boolean,
    validationArtifacts: Array,
    showValidationResults: Boolean,
});
//# sourceMappingURL=pacakage.schema.js.map