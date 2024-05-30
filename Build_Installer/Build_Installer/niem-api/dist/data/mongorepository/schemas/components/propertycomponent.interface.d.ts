import { Document } from 'mongoose';
export interface PropertyComponent extends Document {
    readonly packageId: string;
    readonly key: number;
    readonly sourceNSPrefix: string;
    readonly sourcePropertyName: string;
    readonly sourceDataType: string;
    readonly sourceDefinition: string;
    readonly mappingCode: string;
    readonly targetNSPrefix: string;
    readonly targetPropertyName: string;
    readonly targetQualifiedDataType: string;
    readonly targetDefinition: string;
    readonly targetSubstitutionGroup: string;
    readonly targetIsAbstract: string;
    readonly targetStyle: string;
    readonly targetKeywords: string;
    readonly targetExampleContent: string;
    readonly targetUsageInfo: string;
}
