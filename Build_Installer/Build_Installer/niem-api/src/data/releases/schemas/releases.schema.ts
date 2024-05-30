import * as mongoose from 'mongoose';

export const NiemPropertySchema = new mongoose.Schema({
  Release: Number,
  PropertyNamespacePrefix: String,
  PropertyName: String,
  QualifiedProperty: String,
  IsElement: Number,
  IsAbstract: Number,
  Keywords: String,
  ExampleContent: String,
  UsageInfo: String,
  Definition: String,
  TypeNamespacePrefix: String,
  TypeName: String,
  QualifedType: String,
  SubstitutionGroupPropertyNamespacePrefix: String,
  SubstitutionGroupPropertyName: String,
  SubstitutionGroupQualifiedProperty: String,
});

export const NiemTypeSchema = new mongoose.Schema({
  Release: Number,
  TypeNamespacePrefix: String,
  TypeName: String,
  QualifiedType: String,
  ContentStyle: String,
  SimpleStyle: String,
  IsMetadata: Number,
  IsAdapter: Number,
  IsAugmentation: Number,
  Keywords: String,
  ExampleContent: String,
  UsageInfo: String,
  Definition: String,
  SimpleTypeNamespacePrefix: String,
  SimpleTypeName: String,
  SimpleQualifiedType: String,
  ParentTypeNamespacePrefix: String,
  ParentTypeName: String,
  ParentQualifiedType: String,
});

export const NiemNamspaceSchema = new mongoose.Schema({
  Release: Number,
  NamespacePrefix: String,
  NamespaceFile: String,
  VersionURI: String,
  VersionReleaseNumber: String || Number, // some version release numbers are formated "1.0.0"
  NamespaceStyle: String,
  NamespaceIsExternallyGenerated: String || Number,
  IsConformant: String || Number,
  Definition: String,
});

export const NiemFacetSchema = new mongoose.Schema({
  Release: Number,
  TypeNamespacePrefix: String,
  TypeName: String,
  QualifiedType: String,
  FacetName: String,
  FacetValue: String,
  Definition: String,
});

export const NiemLocalTermSchema = new mongoose.Schema({
  Release: Number,
  NamespacePrefix: String,
  LocalTerm: String,
  Literal: String,
  Definition: String,
});

export const NiemMetadataSchema = new mongoose.Schema({
  Release: Number,
  MetadataTypeNamespacePrefix: String,
  MetadataTypeName: String,
  MetadataQualfiedType: String,
  AppliesToTypeNamespacePrefix: String,
  AppliesToTypeName: String,
  AppliesToQualifiedType: String,
});

export const NiemTypeContainsPropertySchema = new mongoose.Schema({
  Release: Number,
  TypeNamespacePrefix: String,
  TypeName: String,
  QualifiedType: String,
  PropertyNamespacePrefix: String,
  PropertyName: String,
  QualifiedProperty: String,
  MinOccurs: Number,
  MaxOccurs: String || Number,
  Definition: String,
  SequenceNumber: Number,
});

export const NiemTypeUnionSchema = new mongoose.Schema({
  Release: Number,
  UnionTypeNamespacePrefix: String,
  UnionTypeName: String,
  UnionQualifiedType: String,
  MemberTypeNamespacePrefix: String,
  MemberTypeName: String,
  MemberQualifiedType: String,
});

export const NiemChangelogPropertySchema = new mongoose.Schema({
  originalRelease: Number,
  originalNamespace: String,
  originalPropertyName: String,
  changeCode: String,
  issue: String,
  release: Number,
  namespace: String,
  propertyName: String,
  definition: String,
  dataType: String,
  substitutionGroupHead: String,
  elementOrAttribute: String,
  concreteOrAbstract: String,
  isAbstract: String,
});

export const NiemChangelogTypeSchema = new mongoose.Schema({
  originalRelease: Number,
  originalNamespace: String,
  originalTypeName: String,
  changeCode: String,
  issue: String,
  release: Number,
  namespace: String,
  typeName: String,
  definition: String,
  parentType: String,
  baseType: String,
  contentStyle: String,
  simpleStyle: String,
  isAssociation: Boolean,
  isAugmentation: Boolean,
  isAdapter: Boolean,
  isMetadata: Boolean,
});

export const NiemChangelogTypeContainsPropertySchema = new mongoose.Schema({
  originalRelease: Number,
  originalNamespace: String,
  originalTypeName: String,
  originalProperty: String,
  changeCode: String,
  issue: String,
  release: Number,
  namespace: String,
  typeName: String,
  property: String,
  minOccurs: Number,
  maxOccurs: String,
});

export const NiemChangelogFacetSchema = new mongoose.Schema({
  originalRelease: Number,
  originalNamespace: String,
  originalTypeName: String,
  originalFacetValue: String,
  originalDefinition: String,
  changeCode: String,
  issue: String,
  release: Number,
  namespace: String,
  typeName: String,
  facetValue: String,
  definition: String,
  kindOfFacet: String,
});

export const NiemChangelogNamespaceSchema = new mongoose.Schema({
  originalRelease: Number,
  originalPrefix: String,
  originalVersionNumber: String,
  changeCode: String,
  issue: String,
  draft: String,
  release: Number,
  newPrefix: String,
  newVersionNumber: String,
  newURI: String,
});
