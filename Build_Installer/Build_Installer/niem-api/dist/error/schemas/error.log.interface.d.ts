import { Document } from 'mongoose';
export interface ErrorLog extends Document {
    readonly event_date: Date;
    readonly collection_name: string;
    readonly userId: string;
    readonly event_description: string;
}
