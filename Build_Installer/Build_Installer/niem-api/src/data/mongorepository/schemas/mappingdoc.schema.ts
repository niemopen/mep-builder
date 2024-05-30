import * as mongoose from 'mongoose';

export const MappingDocSchema = new mongoose.Schema({
  packageId: String,
  mappingDocJSON: String,
});
