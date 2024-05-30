import { Document } from 'mongoose';
export interface TypeUnionComponent extends Document {
    readonly packageId: string;
    readonly key: number;
    readonly sourceUnionNS: string;
    readonly sourceUnionTypeName: string;
    readonly sourceMemberNS: string;
    readonly sourceMemberTypeName: string;
    readonly mappingCode: string;
    readonly targetUnionNS: string;
    readonly targetUnionTypeName: string;
    readonly targetMemberNS: string;
    readonly targetMemberTypeName: string;
}
