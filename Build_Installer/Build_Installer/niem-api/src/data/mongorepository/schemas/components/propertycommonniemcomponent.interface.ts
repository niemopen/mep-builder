import { Document } from 'mongoose';

export interface PropertyCommonNIEMComponent extends Document {
  readonly ns_prefix: string;
  readonly parent_property_name: string;
  readonly property_name: string;
  readonly type_prefix: string;
  readonly type_name: string;
  readonly definition: string;
}
