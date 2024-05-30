import * as mongoose from 'mongoose';

export const CustomModelExtensionSchema = new mongoose.Schema({
  packageId: String,
  elementType: String,
  elementName: String,
  elementLabel: String,
  specificType: String,
  dataType: String,
  elementDefinition: String,
  containerElements: Array,
  code: Array,
});
