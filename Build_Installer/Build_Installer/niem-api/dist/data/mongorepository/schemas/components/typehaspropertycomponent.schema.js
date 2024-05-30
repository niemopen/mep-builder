"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeHasPropertyComponentSchema = void 0;
const mongoose = require("mongoose");
exports.TypeHasPropertyComponentSchema = new mongoose.Schema({
    packageId: String,
    key: Number,
    sourceTypeNS: String,
    sourceTypeName: String,
    sourcePropertyNS: String,
    sourcePropertyName: String,
    sourceMin: String,
    sourceMax: String,
    mappingCode: String,
    targetTypeNS: String,
    targetTypeName: String,
    targetPropertyNS: String,
    targetPropertyName: String,
    targetMin: String,
    targetMax: String,
    targetDefinition: String,
});
//# sourceMappingURL=typehaspropertycomponent.schema.js.map