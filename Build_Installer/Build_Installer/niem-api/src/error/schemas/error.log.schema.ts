import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;
export const ErrorLogSchema = new mongoose.Schema({
  event_date: Date,
  collection_name: String,
  userId: String,
  event_description: String,
});
