import { Document } from 'mongoose';

export interface CodesFacetsComponent extends Document {
  readonly packageId: string;
  readonly key: number;
  readonly sourceNSPrefix: string;
  readonly sourceTypeName: string;
  readonly sourceValue: string;
  readonly sourceDefinition: string;
  readonly sourceKindOfFacet: string;
  readonly mappingCode: string;
  readonly targetNSPrefix: string;
  readonly targetTypeName: string;
  readonly targetValue: string;
  readonly targetDefinition: string;
  readonly targetKindOfFacet: string;
}
