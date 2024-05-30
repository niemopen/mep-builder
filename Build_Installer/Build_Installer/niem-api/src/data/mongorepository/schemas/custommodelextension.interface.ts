import { Document } from 'mongoose';

export interface CustomModelExtension extends Document {
  readonly packageId: string;
  readonly elementType: string;
  readonly elementName: string;
  readonly elementLabel: string;
  readonly specificType: string;
  readonly dataType: string;
  readonly elementDefinition: string;
  readonly containerElements: Array<Object>;
  readonly code: Array<Object>;
}
