import * as mongoose from 'mongoose';
export declare const TypeComponentSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    key?: number;
    packageId?: string;
    sourceNSPrefix?: string;
    sourceDefinition?: string;
    mappingCode?: string;
    targetNSPrefix?: string;
    targetDefinition?: string;
    targetStyle?: string;
    sourceTypeName?: string;
    sourceParentBaseType?: string;
    targetTypeName?: string;
    targetElementInType?: string;
    targetParentBaseType?: string;
}>;
