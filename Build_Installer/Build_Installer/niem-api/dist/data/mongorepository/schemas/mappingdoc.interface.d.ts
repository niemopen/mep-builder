import { Document } from 'mongoose';
export interface MappingDoc extends Document {
    readonly packageId: string;
    readonly mappingDocJSON: string;
}
