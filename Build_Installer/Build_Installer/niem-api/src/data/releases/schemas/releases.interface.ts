import { Document } from 'mongoose';

export interface NiemProperty extends Document {
  readonly Release: number;
  readonly PropertyNamespacePrefix: string;
  readonly PropertyName: string;
  readonly QualifiedProperty: string;
  readonly IsElement: number;
  readonly IsAbstract: number;
  readonly Keywords: string;
  readonly ExampleContent: string;
  readonly UsageInfo: string;
  readonly Definition: string;
  readonly TypeNamespacePrefix: string;
  readonly TypeName: string;
  readonly QualifedType: string;
  readonly SubstitutionGroupPropertyNamespacePrefix: string;
  readonly SubstitutionGroupPropertyName: string;
  readonly SubstitutionGroupQualifiedProperty: string;
}

export interface NiemType extends Document {
  readonly Release: number;
  readonly TypeNamespacePrefix: string;
  readonly TypeName: string;
  readonly QualifiedType: string;
  readonly ContentStyle: string;
  readonly SimpleStyle: string;
  readonly IsMetadata: number;
  readonly IsAdapter: number;
  readonly IsAugmentation: number;
  readonly Keywords: string;
  readonly ExampleContent: string;
  readonly UsageInfo: string;
  readonly Definition: string;
  readonly SimpleTypeNamespacePrefix: string;
  readonly SimpleTypeName: string;
  readonly SimpleQualifiedType: string;
  readonly ParentTypeNamespacePrefix: string;
  readonly ParentTypeName: string;
  readonly ParentQualifiedType: string;
}

export interface NiemNamespace extends Document {
  readonly Release: number;
  readonly NamespacePrefix: string;
  readonly NamespaceFile: string;
  readonly VersionURI: string;
  readonly VersionReleaseNumber: number | string; // some version release numbers are formated "1.0.0"
  readonly NamespaceStyle: string;
  readonly NamespaceIsExternallyGenerated: string | number;
  readonly IsConformant: string | number;
  readonly Definition: string;
}

export interface NiemFacet extends Document {
  readonly Release: number;
  readonly TypeNamespacePrefix: string;
  readonly TypeName: string;
  readonly QualifiedType: string;
  readonly FacetName: string;
  readonly FacetValue: string;
  readonly Definition: string;
}

export interface NiemLocalTerm extends Document {
  readonly Release: number;
  readonly NamespacePrefix: string;
  readonly LocalTerm: string;
  readonly Literal: string;
  readonly Definition: string;
}

export interface NiemMetadata extends Document {
  readonly Release: number;
  readonly MetadataTypeNamespacePrefix: string;
  readonly MetadataTypeName: string;
  readonly MetadataQualfiedType: string;
  readonly AppliesToTypeNamespacePrefix: string;
  readonly AppliesToTypeName: string;
  readonly AppliesToQualifiedType: string;
}

export interface NiemTypeContainsProperty extends Document {
  readonly Release: number;
  readonly TypeNamespacePrefix: string;
  readonly TypeName: string;
  readonly QualifiedType: string;
  readonly PropertyNamespacePrefix: string;
  readonly PropertyName: string;
  readonly QualifiedProperty: string;
  readonly MinOccurs: number;
  readonly MaxOccurs: number | string;
  readonly Definition: string;
  readonly SequenceNumber: number;
}

export interface NiemTypeUnion extends Document {
  Release: number;
  UnionTypeNamespacePrefix: string;
  UnionTypeName: string;
  UnionQualifiedType: string;
  MemberTypeNamespacePrefix: string;
  MemberTypeName: string;
  MemberQualifiedType: string;
}

export interface NiemChangelogProperty extends Document {
  readonly originalRelease: number;
  readonly originalNamespace: string;
  readonly originalPropertyName: string;
  readonly changeCode: string;
  readonly issue: string;
  readonly release: number;
  readonly namespace: string;
  readonly propertyName: string;
  readonly definition: string;
  readonly dataType: string;
  readonly substitutionGroupHead: string;
  readonly elementOrAttribute: string;
  readonly concreteOrAbstract: string;
  readonly isAbstract: string;
}

export interface NiemChangelogType extends Document {
  readonly originalRelease: number;
  readonly originalNamespace: string;
  readonly originalTypeName: string;
  readonly changeCode: string;
  readonly issue: string;
  readonly release: number;
  readonly namespace: string;
  readonly typeName: string;
  readonly definition: string;
  readonly parentType: string;
  readonly baseType: string;
  readonly contentStyle: string;
  readonly simpleStyle: string;
  readonly isAssociation: boolean;
  readonly isAugmentation: boolean;
  readonly isAdapter: boolean;
  readonly isMetadata: boolean;
}

export interface NiemChangelogTypeContainsProperty extends Document {
  readonly originalRelease: number;
  readonly originalNamespace: string;
  readonly originalTypeName: string;
  readonly originalProperty: string;
  readonly changeCode: string;
  readonly issue: string;
  readonly release: number;
  readonly namespace: string;
  readonly typeName: string;
  readonly property: string;
  readonly minOccurs: number;
  readonly maxOccurs: string;
}

export interface NiemChangelogFacet extends Document {
  readonly originalRelease: number;
  readonly originalNamespace: string;
  readonly originalTypeName: string;
  readonly originalFacetValue: string;
  readonly originalDefinition: string;
  readonly changeCode: string;
  readonly issue: string;
  readonly release: number;
  readonly namespace: string;
  readonly typeName: string;
  readonly facetValue: string;
  readonly definition: string;
  readonly kindOfFacet: string;
}

export interface NiemChangelogNamespace extends Document {
  readonly originalRelease: number;
  readonly originalPrefix: string;
  readonly originalVersionNumber: string;
  readonly changeCode: string;
  readonly issue: string;
  readonly draft: string;
  readonly release: number;
  readonly newPrefix: string;
  readonly newVersionNumber: string;
  readonly newURI: string;
}
