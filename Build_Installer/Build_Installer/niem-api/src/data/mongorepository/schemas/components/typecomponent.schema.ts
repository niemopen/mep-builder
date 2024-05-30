import * as mongoose from 'mongoose';

export const TypeComponentSchema = new mongoose.Schema({
  packageId: String,
  key: Number,
  sourceNSPrefix: String,
  sourceTypeName: String,
  sourceParentBaseType: String,
  sourceDefinition: String,
  mappingCode: String,
  targetNSPrefix: String,
  targetTypeName: String,
  targetElementInType: String,
  targetParentBaseType: String,
  targetDefinition: String,
  targetStyle: String,
});
