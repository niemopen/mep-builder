"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogSchema = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.AuditLogSchema = new mongoose.Schema({
    event_date: Date,
    event_type: String,
    collection_name: String,
    userId: String,
    modified_data: String,
    original_data: String,
});
//# sourceMappingURL=audit.log.schema.js.map