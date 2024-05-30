"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalTerminologyComponentSchema = void 0;
const mongoose = require("mongoose");
exports.LocalTerminologyComponentSchema = new mongoose.Schema({
    packageId: String,
    key: Number,
    sourceNSPrefix: String,
    sourceTerm: String,
    sourceLiteral: String,
    sourceDefinition: String,
    mappingCode: String,
    targetNSPrefix: String,
    targetTerm: String,
    targetLiteral: String,
    targetDefinition: String,
});
//# sourceMappingURL=localterminologycomponent.schema.js.map