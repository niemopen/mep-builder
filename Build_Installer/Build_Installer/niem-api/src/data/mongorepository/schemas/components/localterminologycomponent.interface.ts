import { Document } from 'mongoose';

export interface LocalTerminologyComponent extends Document {
  readonly packageId: string;
  readonly key: number;
  readonly sourceNSPrefix: string;
  readonly sourceTerm: string;
  readonly sourceLiteral: string;
  readonly sourceDefinition: string;
  readonly mappingCode: string;
  readonly targetNSPrefix: string;
  readonly targetTerm: string;
  readonly targetLiteral: string;
  readonly targetDefinition: string;
}
