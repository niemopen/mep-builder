import * as mongoose from 'mongoose';

export const TypeHasPropertyComponentSchema = new mongoose.Schema({
  packageId: String,
  key: Number,
  sourceTypeNS: String,
  sourceTypeName: String,
  sourcePropertyNS: String,
  sourcePropertyName: String,
  sourceMin: String,
  sourceMax: String,
  mappingCode: String,
  targetTypeNS: String,
  targetTypeName: String,
  targetPropertyNS: String,
  targetPropertyName: String,
  targetMin: String,
  targetMax: String,
  targetDefinition: String,
});
