import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;
export const UserSchema = new mongoose.Schema({
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
