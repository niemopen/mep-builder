import { Document } from 'mongoose';
export interface Package extends Document {
    readonly userId: string;
    readonly packageName: string;
    readonly niemRelease: string;
    readonly version: string;
    readonly status: string;
    readonly statusNo: string;
    readonly poc: string;
    readonly pocEmail: string;
    readonly description: string;
    readonly orgName: string;
    readonly orgType: string;
    readonly coiTags: string;
    readonly exchangeTags: string;
    readonly format: string;
    readonly isReleaseLocked: boolean;
    readonly isRequiredArtifactUploaded: string;
    readonly cmeData: string;
    readonly isPublished: boolean;
    readonly isCopiedPackage: boolean;
    readonly isMigratedPackage: boolean;
    readonly isTranslationGenerated: boolean;
    readonly validationArtifacts: Array<Object>;
    readonly showValidationResults: boolean;
}
