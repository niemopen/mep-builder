import * as mongoose from 'mongoose';

export const FileBlobSchema = new mongoose.Schema({
  packageId: String,
  fileBlob: Object,
});
