"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileBlobSchema = void 0;
const mongoose = require("mongoose");
exports.FileBlobSchema = new mongoose.Schema({
    packageId: String,
    fileBlob: Object,
});
//# sourceMappingURL=fileblob.schema.js.map