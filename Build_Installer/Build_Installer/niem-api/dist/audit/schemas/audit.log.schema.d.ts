import * as mongoose from 'mongoose';
export declare const AuditLogSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    userId?: string;
    event_date?: Date;
    collection_name?: string;
    event_type?: string;
    modified_data?: string;
    original_data?: string;
}>;
