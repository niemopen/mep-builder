"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomModelExtensionSchema = void 0;
const mongoose = require("mongoose");
exports.CustomModelExtensionSchema = new mongoose.Schema({
    packageId: String,
    elementType: String,
    elementName: String,
    elementLabel: String,
    specificType: String,
    dataType: String,
    elementDefinition: String,
    containerElements: Array,
    code: Array,
});
//# sourceMappingURL=custommodelextension.schema.js.map