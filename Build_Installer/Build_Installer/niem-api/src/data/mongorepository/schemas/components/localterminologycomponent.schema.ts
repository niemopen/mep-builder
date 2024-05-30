import * as mongoose from 'mongoose';

export const LocalTerminologyComponentSchema = new mongoose.Schema({
  packageId: String,
  key: Number,
  sourceNSPrefix: String,
  sourceTerm: String,
  sourceLiteral: String,
  sourceDefinition: String,
  mappingCode: String,
  targetNSPrefix: String,
  targetTerm: String,
  targetLiteral: String,
  targetDefinition: String,
});
