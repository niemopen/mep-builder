import * as mongoose from 'mongoose';
export declare const NamespaceComponentSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    key?: number;
    packageId?: string;
    sourceNSPrefix?: string;
    sourceDefinition?: string;
    mappingCode?: string;
    targetNSPrefix?: string;
    targetDefinition?: string;
    targetStyle?: string;
    sourceURI?: string;
    targetURI?: string;
    ndrVersion?: string;
    ndrTarget?: string;
    fileName?: string;
    relativePath?: string;
    draftVersion?: string;
}>;
