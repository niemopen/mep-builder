import { Document } from 'mongoose';
export interface TypeComponent extends Document {
    readonly packageId: string;
    readonly key: number;
    readonly sourceNSPrefix: string;
    readonly sourceTypeName: string;
    readonly sourceParentBaseType: string;
    readonly sourceDefinition: string;
    readonly mappingCode: string;
    readonly targetNSPrefix: string;
    readonly targetTypeName: string;
    readonly targetElementInType: string;
    readonly targetParentBaseType: string;
    readonly targetDefinition: string;
    readonly targetStyle: string;
}
