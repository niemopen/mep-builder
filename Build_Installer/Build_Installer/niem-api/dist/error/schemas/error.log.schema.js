"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogSchema = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.ErrorLogSchema = new mongoose.Schema({
    event_date: Date,
    collection_name: String,
    userId: String,
    event_description: String,
});
//# sourceMappingURL=error.log.schema.js.map