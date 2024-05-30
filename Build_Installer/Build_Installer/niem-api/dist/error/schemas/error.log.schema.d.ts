import * as mongoose from 'mongoose';
export declare const ErrorLogSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    userId?: string;
    event_date?: Date;
    collection_name?: string;
    event_description?: string;
}>;
