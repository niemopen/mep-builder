import * as mongoose from 'mongoose';

export const NamespaceComponentSchema = new mongoose.Schema({
  packageId: String,
  key: Number,
  sourceNSPrefix: String,
  sourceURI: String,
  sourceDefinition: String,
  mappingCode: String,
  targetNSPrefix: String,
  targetStyle: String,
  targetURI: String,
  targetDefinition: String,
  ndrVersion: String,
  ndrTarget: String,
  fileName: String,
  relativePath: String,
  draftVersion: String,
});
