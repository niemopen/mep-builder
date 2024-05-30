import { Document } from 'mongoose';
export interface MetadataComponent extends Document {
    readonly packageId: string;
    readonly key: number;
    readonly sourceMetadataNS: string;
    readonly sourceMetadataTypeName: string;
    readonly sourceAppliesToNS: string;
    readonly sourceAppliesToTypeName: string;
    readonly mappingCode: string;
    readonly targetMetadataNS: string;
    readonly targetMetadataTypeName: string;
    readonly targetAppliesToNS: string;
    readonly targetAppliesToTypeName: string;
}
