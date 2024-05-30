import { Document } from 'mongoose';

export interface ArtifactTree extends Document {
  readonly packageId: string;
  readonly artifactTreeJSON: string;
}
