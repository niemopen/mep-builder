import * as mongoose from 'mongoose';

export const TypeUnionComponentSchema = new mongoose.Schema({
  packageId: String,
  key: Number,
  sourceUnionNS: String,
  sourceUnionTypeName: String,
  sourceMemberNS: String,
  sourceMemberTypeName: String,
  mappingCode: String,
  targetUnionNS: String,
  targetUnionTypeName: String,
  targetMemberNS: String,
  targetMemberTypeName: String,
});
