"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingDocSchema = void 0;
const mongoose = require("mongoose");
exports.MappingDocSchema = new mongoose.Schema({
    packageId: String,
    mappingDocJSON: String,
});
//# sourceMappingURL=mappingdoc.schema.js.map