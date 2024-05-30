"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.UserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    organization: String,
    user_role: String,
    login_attempts: Number,
    salt: String,
    hash: String,
    password_created: String,
    account_pending: Boolean,
    account_denied: Boolean,
    account_locked: Boolean,
    account_revoked: Boolean,
    status_change_reason: String,
    denial_reason: String,
    denial_details: String,
    forceLogOut: Boolean,
});
//# sourceMappingURL=user.schema.js.map