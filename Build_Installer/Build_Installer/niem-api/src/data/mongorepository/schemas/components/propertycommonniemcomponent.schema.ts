import * as mongoose from 'mongoose';

export const PropertyCommonNIEMComponentSchema = new mongoose.Schema({
  ns_prefix: String,
  parent_property_name: String,
  property_name: String,
  type_prefix: String,
  type_name: String,
  definition: String,
});
