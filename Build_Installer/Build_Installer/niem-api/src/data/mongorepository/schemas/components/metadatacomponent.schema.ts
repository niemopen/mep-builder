import * as mongoose from 'mongoose';

export const MetadataComponentSchema = new mongoose.Schema({
  packageId: String,
  key: Number,
  sourceMetadataNS: String,
  sourceMetadataTypeName: String,
  sourceAppliesToNS: String,
  sourceAppliesToTypeName: String,
  mappingCode: String,
  targetMetadataNS: String,
  targetMetadataTypeName: String,
  targetAppliesToNS: String,
  targetAppliesToTypeName: String,
});
