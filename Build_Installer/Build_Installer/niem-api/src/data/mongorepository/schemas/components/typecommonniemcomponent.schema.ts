import * as mongoose from 'mongoose';

export const TypeCommonNIEMComponentSchema = new mongoose.Schema({
  ns_prefix: String,
  type_name: String,
  definition: String,
});
