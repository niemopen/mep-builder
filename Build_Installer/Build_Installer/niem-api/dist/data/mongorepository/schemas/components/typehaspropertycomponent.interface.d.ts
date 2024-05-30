import { Document } from 'mongoose';
export interface TypeHasPropertyComponent extends Document {
    readonly packageId: string;
    readonly key: number;
    readonly sourceTypeNS: string;
    readonly sourceTypeName: string;
    readonly sourcePropertyNS: string;
    readonly sourcePropertyName: string;
    readonly sourceMin: string;
    readonly sourceMax: string;
    readonly mappingCode: string;
    readonly targetTypeNS: string;
    readonly targetTypeName: string;
    readonly targetPropertyNS: string;
    readonly targetPropertyName: string;
    readonly targetMin: string;
    readonly targetMax: string;
    readonly targetDefinition: string;
}
