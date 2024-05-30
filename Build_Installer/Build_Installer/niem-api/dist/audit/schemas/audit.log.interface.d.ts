import { Document } from 'mongoose';
export interface AuditLog extends Document {
    readonly event_date: Date;
    readonly event_type: string;
    readonly collection_name: string;
    readonly userId: string;
    readonly modified_data: string;
    readonly original_data: string;
}
