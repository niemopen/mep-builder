import * as mongoose from 'mongoose';
export declare const CodesFacetsComponentSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    key?: number;
    packageId?: string;
    sourceNSPrefix?: string;
    sourceDefinition?: string;
    mappingCode?: string;
    targetNSPrefix?: string;
    targetDefinition?: string;
    sourceTypeName?: string;
    targetTypeName?: string;
    sourceValue?: string;
    sourceKindOfFacet?: string;
    targetValue?: string;
    targetKindOfFacet?: string;
}>;
