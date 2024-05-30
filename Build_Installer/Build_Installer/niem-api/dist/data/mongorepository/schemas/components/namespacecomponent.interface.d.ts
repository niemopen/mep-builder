import { Document } from 'mongoose';
export interface NamespaceComponent extends Document {
    readonly packageId: string;
    readonly key: number;
    readonly sourceNSPrefix: string;
    readonly sourceURI: string;
    readonly sourceDefinition: string;
    readonly mappingCode: string;
    readonly targetNSPrefix: string;
    readonly targetStyle: string;
    readonly targetURI: string;
    readonly targetDefinition: string;
    readonly ndrVersion: string;
    readonly ndrTarget: string;
    readonly fileName: string;
    readonly relativePath: string;
    readonly draftVersion: string;
}
