import * as mongoose from 'mongoose';

export const CodesFacetsComponentSchema = new mongoose.Schema({
  packageId: String,
  key: Number,
  sourceNSPrefix: String,
  sourceTypeName: String,
  sourceValue: String,
  sourceDefinition: String,
  sourceKindOfFacet: String,
  mappingCode: String,
  targetNSPrefix: String,
  targetTypeName: String,
  targetValue: String,
  targetDefinition: String,
  targetKindOfFacet: String,
});
