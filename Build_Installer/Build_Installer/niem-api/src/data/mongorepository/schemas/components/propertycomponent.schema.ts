import * as mongoose from 'mongoose';

export const PropertyComponentSchema = new mongoose.Schema({
  packageId: String,
  key: Number,
  sourceNSPrefix: String,
  sourcePropertyName: String,
  sourceDataType: String,
  sourceDefinition: String,
  mappingCode: String,
  targetNSPrefix: String,
  targetPropertyName: String,
  targetQualifiedDataType: String,
  targetDefinition: String,
  targetSubstitutionGroup: String,
  targetIsAbstract: String,
  targetStyle: String,
  targetKeywords: String,
  targetExampleContent: String,
  targetUsageInfo: String,
});
