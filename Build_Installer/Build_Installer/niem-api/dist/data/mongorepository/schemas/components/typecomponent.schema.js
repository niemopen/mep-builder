"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeComponentSchema = void 0;
const mongoose = require("mongoose");
exports.TypeComponentSchema = new mongoose.Schema({
    packageId: String,
    key: Number,
    sourceNSPrefix: String,
    sourceTypeName: String,
    sourceParentBaseType: String,
    sourceDefinition: String,
    mappingCode: String,
    targetNSPrefix: String,
    targetTypeName: String,
    targetElementInType: String,
    targetParentBaseType: String,
    targetDefinition: String,
    targetStyle: String,
});
//# sourceMappingURL=typecomponent.schema.js.map