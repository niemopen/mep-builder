import * as mongoose from 'mongoose';

export const ArtifactTreeSchema = new mongoose.Schema({
  packageId: String,
  artifactTreeJSON: String,
});
