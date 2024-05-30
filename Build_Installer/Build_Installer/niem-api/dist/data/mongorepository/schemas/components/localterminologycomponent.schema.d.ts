import * as mongoose from 'mongoose';
export declare const LocalTerminologyComponentSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    key?: number;
    packageId?: string;
    sourceNSPrefix?: string;
    sourceDefinition?: string;
    mappingCode?: string;
    targetNSPrefix?: string;
    targetDefinition?: string;
    sourceTerm?: string;
    sourceLiteral?: string;
    targetTerm?: string;
    targetLiteral?: string;
}>;
