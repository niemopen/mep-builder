import { Document } from 'mongoose';
export interface FileBlob extends Document {
    readonly fileBlob: object;
}
