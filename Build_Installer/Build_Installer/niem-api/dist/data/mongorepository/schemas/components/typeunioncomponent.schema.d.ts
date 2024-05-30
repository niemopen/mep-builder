import * as mongoose from 'mongoose';
export declare const TypeUnionComponentSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    key?: number;
    packageId?: string;
    mappingCode?: string;
    sourceUnionNS?: string;
    sourceUnionTypeName?: string;
    sourceMemberNS?: string;
    sourceMemberTypeName?: string;
    targetUnionNS?: string;
    targetUnionTypeName?: string;
    targetMemberNS?: string;
    targetMemberTypeName?: string;
}>;
