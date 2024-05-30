import * as mongoose from 'mongoose';
export declare const MetadataComponentSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    key?: number;
    packageId?: string;
    mappingCode?: string;
    sourceMetadataNS?: string;
    sourceMetadataTypeName?: string;
    sourceAppliesToNS?: string;
    sourceAppliesToTypeName?: string;
    targetMetadataNS?: string;
    targetMetadataTypeName?: string;
    targetAppliesToNS?: string;
    targetAppliesToTypeName?: string;
}>;
