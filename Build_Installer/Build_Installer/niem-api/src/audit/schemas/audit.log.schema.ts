import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;
export const AuditLogSchema = new mongoose.Schema({
  event_date: Date,
  event_type: String,
  collection_name: String,
  userId: String,
  modified_data: String,
  original_data: String,
});
