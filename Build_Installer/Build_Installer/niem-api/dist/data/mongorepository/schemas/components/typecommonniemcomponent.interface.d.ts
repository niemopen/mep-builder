import { Document } from 'mongoose';
export interface TypeCommonNIEMComponent extends Document {
    readonly ns_prefix: string;
    readonly type_name: string;
    readonly definition: string;
}
