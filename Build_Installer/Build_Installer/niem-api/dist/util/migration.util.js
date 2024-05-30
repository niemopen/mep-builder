"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateNamespaceSheet = exports.migrateFacetSheet = exports.migrateTypeHasPropertySheet = exports.migrateTypeSheet = exports.migratePropertySheet = exports.removePrefix = exports.getMappingDocItemName = exports.getReleaseRange = void 0;
const dataValidation_util_1 = require("./dataValidation.util");
const getReleaseRange = (MigrationDto) => {
    const allReleases = MigrationDto.releases;
    const indexOfStartingRelease = allReleases.indexOf(MigrationDto.startingRelease);
    const indexOfEndRelease = allReleases.indexOf(MigrationDto.endRelease);
    const getReleaseRange = allReleases.slice(indexOfStartingRelease, indexOfEndRelease + 1);
    return getReleaseRange;
};
exports.getReleaseRange = getReleaseRange;
const getMappingDocItemName = (mappingCode, sourceName, targetName) => {
    if (mappingCode === 'no change') {
        return (0, dataValidation_util_1.isStringValid)(sourceName) ? sourceName : false;
    }
    else {
        return (0, dataValidation_util_1.isStringValid)(targetName) ? targetName : false;
    }
};
exports.getMappingDocItemName = getMappingDocItemName;
const removePrefix = (string) => {
    const split = string.split(':');
    if (split.length === 1) {
        return split[0];
    }
    else {
        return split[1];
    }
};
exports.removePrefix = removePrefix;
const migratePropertySheet = async (release, mappingDoc, NiemChangelogPropertyModel) => {
    let propertyObj = [];
    let changesObj = {
        changelogRelease: release,
        add: [],
        edit: [],
        delete: [],
        notFound: [],
        noChange: [],
    };
    for (let i = 0; i < mappingDoc.propertySheet.length; i++) {
        const propertyItem = mappingDoc.propertySheet[i];
        const sourceData = {
            sourceNSPrefix: (0, dataValidation_util_1.getStringValue)(propertyItem.sourceNSPrefix, ''),
            sourcePropertyName: (0, dataValidation_util_1.getStringValue)(propertyItem.sourcePropertyName, ''),
            dataType: (0, dataValidation_util_1.getStringValue)(propertyItem.dataType, ''),
            sourceDefinition: (0, dataValidation_util_1.getStringValue)(propertyItem.sourceDefinition, ''),
            sourceSampleValue: (0, dataValidation_util_1.getStringValue)(propertyItem.sourceSampleValue, ''),
        };
        const propertyName = (0, exports.getMappingDocItemName)(propertyItem.mappingCode, propertyItem.sourcePropertyName, propertyItem.targetPropertyName);
        if (propertyName !== false) {
            const propertyChangelog = await NiemChangelogPropertyModel.findOne({
                release: release,
                originalPropertyName: {
                    $regex: `^${propertyName}$`,
                    $options: 'i',
                },
            }).exec();
            if (propertyChangelog !== null) {
                const qualifiedDataTypeValue = (0, dataValidation_util_1.isStringValid)(propertyChangelog.dataType)
                    ? (0, exports.removePrefix)(propertyChangelog.dataType)
                    : '';
                const isAbstractValue = (0, dataValidation_util_1.getStringValue)(propertyChangelog.isAbstract) === 'true'
                    ? 'TRUE'
                    : 'FALSE';
                const targetData = {
                    mappingCode: (0, dataValidation_util_1.getStringValue)(propertyChangelog.changeCode, ''),
                    targetNSPrefix: (0, dataValidation_util_1.getStringValue)(propertyChangelog.namespace, ''),
                    targetPropertyName: (0, dataValidation_util_1.getStringValue)(propertyChangelog.propertyName, ''),
                    qualifiedDataType: qualifiedDataTypeValue,
                    targetDefinition: (0, dataValidation_util_1.getStringValue)(propertyChangelog.definition, ''),
                    substitutionGroup: (0, dataValidation_util_1.getStringValue)(propertyChangelog.substitutionGroupHead, ''),
                    isAbstract: isAbstractValue,
                };
                const updatedPropertyObj = Object.assign(sourceData, targetData);
                if (propertyChangelog.changeCode === 'new' ||
                    propertyChangelog.changeCode === 'add') {
                    changesObj.add.push(updatedPropertyObj);
                    propertyObj.push(updatedPropertyObj);
                }
                else if (propertyChangelog.changeCode === 'modified' ||
                    propertyChangelog.changeCode === 'edit') {
                    changesObj.edit.push(updatedPropertyObj);
                    propertyObj.push(updatedPropertyObj);
                }
                else if (propertyChangelog.changeCode === 'deleted' ||
                    propertyChangelog.changeCode === 'delete') {
                    changesObj.delete.push(updatedPropertyObj);
                    propertyObj.push(updatedPropertyObj);
                }
                else if (propertyChangelog.changeCode === 'no change') {
                    changesObj.noChange.push(propertyItem);
                    propertyObj.push(propertyItem);
                }
            }
            else {
                const propertyChangelog = await NiemChangelogPropertyModel.findOne({
                    release: release,
                    propertyName: {
                        $regex: `^${propertyName}$`,
                        $options: 'i',
                    },
                }).exec();
                if (propertyChangelog !== null) {
                    const qualifiedDataTypeValue = (0, dataValidation_util_1.isStringValid)(propertyChangelog.dataType)
                        ? (0, exports.removePrefix)(propertyChangelog.dataType)
                        : '';
                    const isAbstractValue = (0, dataValidation_util_1.getStringValue)(propertyChangelog.isAbstract) === 'true'
                        ? 'TRUE'
                        : 'FALSE';
                    const targetData = {
                        mappingCode: (0, dataValidation_util_1.getStringValue)(propertyChangelog.changeCode, ''),
                        targetNSPrefix: (0, dataValidation_util_1.getStringValue)(propertyChangelog.namespace, ''),
                        targetPropertyName: (0, dataValidation_util_1.getStringValue)(propertyChangelog.propertyName, ''),
                        qualifiedDataType: qualifiedDataTypeValue,
                        targetDefinition: (0, dataValidation_util_1.getStringValue)(propertyChangelog.definition, ''),
                        substitutionGroup: (0, dataValidation_util_1.getStringValue)(propertyChangelog.substitutionGroupHead, ''),
                        isAbstract: isAbstractValue,
                    };
                    const updatedPropertyObj = Object.assign(sourceData, targetData);
                    propertyObj.push(updatedPropertyObj);
                    changesObj.add.push(updatedPropertyObj);
                }
                else {
                    const targetData = {
                        key: i,
                        mappingCode: '',
                        targetNSPrefix: '',
                        targetPropertyName: '',
                        qualifiedDataType: '',
                        targetDefinition: '',
                        substitutionGroup: '',
                        isAbstract: '',
                    };
                    const updatedPropertyObj = Object.assign(sourceData, targetData);
                    propertyObj.push(updatedPropertyObj);
                    changesObj.notFound.push(updatedPropertyObj);
                }
            }
        }
        else {
            if (propertyItem.mappingCode === 'deleted' ||
                propertyItem.mappingCode === 'delete') {
                propertyObj.push(propertyItem);
                changesObj.delete.push(propertyItem);
            }
            else {
                const targetData = {
                    key: i,
                    mappingCode: '',
                    targetNSPrefix: '',
                    targetPropertyName: '',
                    qualifiedDataType: '',
                    targetDefinition: '',
                    substitutionGroup: '',
                    isAbstract: '',
                };
                const updatedPropertyObj = Object.assign(sourceData, targetData);
                propertyObj.push(updatedPropertyObj);
                changesObj.notFound.push(updatedPropertyObj);
            }
        }
    }
    return { propertyObj, changesObj: changesObj };
};
exports.migratePropertySheet = migratePropertySheet;
const migrateTypeSheet = async (release, mappingDoc, NiemChangelogTypeModel) => {
    let typeObj = [];
    let changesObj = {
        changelogRelease: release,
        add: [],
        edit: [],
        delete: [],
        notFound: [],
        noChange: [],
    };
    const getParentBaseType = (parentType, baseType) => {
        const isParentValid = (0, dataValidation_util_1.isStringValid)(parentType);
        const isBaseValid = (0, dataValidation_util_1.isStringValid)(baseType);
        if (!isParentValid && !isBaseValid) {
            return '';
        }
        if (parentType === '<deleted>' && isBaseValid) {
            return baseType;
        }
        if (baseType === '<deleted>' && isParentValid) {
            return parentType;
        }
        if (isParentValid && isBaseValid) {
            return parentType;
        }
        if (isParentValid && !isBaseValid) {
            return parentType;
        }
        if (!isParentValid && isBaseValid) {
            return baseType;
        }
    };
    for (let i = 0; i < mappingDoc.typeSheet.length; i++) {
        const typeItem = mappingDoc.typeSheet[i];
        const sourceData = {
            sourceNSPrefix: (0, dataValidation_util_1.getStringValue)(typeItem.sourceNSPrefix, ''),
            sourceTypeName: (0, dataValidation_util_1.getStringValue)(typeItem.sourceTypeName, ''),
            sourceParentBaseType: (0, dataValidation_util_1.getStringValue)(typeItem.sourceParentBaseType, ''),
            sourceDefinition: (0, dataValidation_util_1.getStringValue)(typeItem.sourceDefinition, ''),
        };
        const typeName = (0, exports.getMappingDocItemName)(typeItem.mappingCode, typeItem.sourceTypeName, typeItem.targetTypeName);
        if (typeName !== false) {
            const typeChangelog = await NiemChangelogTypeModel.findOne({
                release: release,
                originalTypeName: {
                    $regex: `^${typeName}$`,
                    $options: 'i',
                },
            }).exec();
            if (typeChangelog !== null) {
                const parentBaseType = getParentBaseType(typeChangelog.parentType, typeChangelog.baseType);
                const targetData = {
                    key: i,
                    mappingCode: (0, dataValidation_util_1.getStringValue)(typeChangelog.changeCode, ''),
                    targetNSPrefix: (0, dataValidation_util_1.getStringValue)(typeChangelog.namespace, ''),
                    targetTypeName: (0, dataValidation_util_1.getStringValue)(typeChangelog.typeName, ''),
                    targetParentBaseType: parentBaseType,
                    targetDefinition: (0, dataValidation_util_1.getStringValue)(typeChangelog.definition, ''),
                };
                const updatedTypeObj = Object.assign(sourceData, targetData);
                if (typeChangelog.changeCode === 'new' ||
                    typeChangelog.changeCode === 'add') {
                    changesObj.add.push(updatedTypeObj);
                    typeObj.push(updatedTypeObj);
                }
                else if (typeChangelog.changeCode === 'modified' ||
                    typeChangelog.changeCode === 'edit') {
                    changesObj.edit.push(updatedTypeObj);
                    typeObj.push(updatedTypeObj);
                }
                else if (typeChangelog.changeCode === 'deleted' ||
                    typeChangelog.changeCode === 'delete') {
                    changesObj.delete.push(updatedTypeObj);
                    typeObj.push(updatedTypeObj);
                }
                else if (typeChangelog.changeCode === 'no change') {
                    changesObj.noChange.push(typeItem);
                    typeObj.push(typeItem);
                }
            }
            else {
                const typeChangelog = await NiemChangelogTypeModel.findOne({
                    release: release,
                    typeName: {
                        $regex: `^${typeName}$`,
                        $options: 'i',
                    },
                }).exec();
                if (typeChangelog !== null) {
                    const parentBaseType = getParentBaseType(typeChangelog.parentType, typeChangelog.baseType);
                    const targetData = {
                        key: i,
                        mappingCode: (0, dataValidation_util_1.getStringValue)(typeChangelog.changeCode, ''),
                        targetNSPrefix: (0, dataValidation_util_1.getStringValue)(typeChangelog.namespace, ''),
                        targetTypeName: (0, dataValidation_util_1.getStringValue)(typeChangelog.typeName, ''),
                        targetParentBaseType: parentBaseType,
                        targetDefinition: (0, dataValidation_util_1.getStringValue)(typeChangelog.definition, ''),
                    };
                    const updatedTypeObj = Object.assign(sourceData, targetData);
                    typeObj.push(updatedTypeObj);
                    changesObj.add.push(updatedTypeObj);
                }
                else {
                    const targetData = {
                        key: i,
                        mappingCode: '',
                        targetNSPrefix: '',
                        targetTypeName: '',
                        targetParentBaseType: '',
                        targetDefinition: '',
                    };
                    const updatedTypeObj = Object.assign(sourceData, targetData);
                    typeObj.push(updatedTypeObj);
                    changesObj.notFound.push(updatedTypeObj);
                }
            }
        }
        else {
            if (typeItem.mappingCode === 'deleted' ||
                typeItem.mappingCode === 'delete') {
                typeObj.push(typeItem);
                changesObj.delete.push(typeItem);
            }
            else {
                const targetData = {
                    key: i,
                    mappingCode: '',
                    targetNSPrefix: '',
                    targetTypeName: '',
                    targetParentBaseType: '',
                    targetDefinition: '',
                };
                const updatedTypeObj = Object.assign(sourceData, targetData);
                typeObj.push(updatedTypeObj);
                changesObj.notFound.push(updatedTypeObj);
            }
        }
    }
    return { typeObj, changesObj: changesObj };
};
exports.migrateTypeSheet = migrateTypeSheet;
const migrateTypeHasPropertySheet = async (release, mappingDoc, NiemChangelogTypeContainsPropertyModel) => {
    let typeHasPropertyObj = [];
    let changesObj = {
        changelogRelease: release,
        add: [],
        edit: [],
        delete: [],
        notFound: [],
        noChange: [],
    };
    for (let i = 0; i < mappingDoc.typeHasPropertySheet.length; i++) {
        const thpItem = mappingDoc.typeHasPropertySheet[i];
        const sourceData = {
            key: i,
            sourceTypeNS: (0, dataValidation_util_1.getStringValue)(thpItem.sourceTypeNS, ''),
            sourceTypeName: (0, dataValidation_util_1.getStringValue)(thpItem.sourceTypeName, ''),
            sourcePropertyNS: (0, dataValidation_util_1.getStringValue)(thpItem.sourcePropertyNS, ''),
            sourcePropertyName: (0, dataValidation_util_1.getStringValue)(thpItem.sourcePropertyName, ''),
            sourceMin: (0, dataValidation_util_1.getStringValue)(thpItem.sourceMin, ''),
            sourceMax: (0, dataValidation_util_1.getStringValue)(thpItem.sourceMax, ''),
        };
        const thpTypeName = (0, exports.getMappingDocItemName)(thpItem.mappingCode, thpItem.sourceTypeName, thpItem.targetTypeName);
        const thpPropertyName = (0, exports.getMappingDocItemName)(thpItem.mappingCode, thpItem.sourcePropertyName, thpItem.targetPropertyName);
        if (thpTypeName !== false && thpPropertyName !== false) {
            const thpChangelog = await NiemChangelogTypeContainsPropertyModel.findOne({
                release: release,
                originalTypeName: {
                    $regex: `^${thpTypeName}$`,
                    $options: 'i',
                },
                originalProperty: {
                    $regex: `^${thpPropertyName}$`,
                    $options: 'i',
                },
            }).exec();
            if (thpChangelog !== null) {
                const targetData = {
                    key: i,
                    mappingCode: (0, dataValidation_util_1.getStringValue)(thpChangelog.changeCode, ''),
                    targetTypeNS: (0, dataValidation_util_1.getStringValue)(thpChangelog.namespace, ''),
                    targetTypeName: (0, dataValidation_util_1.getStringValue)(thpChangelog.typeName, ''),
                    targetPropertyName: (0, dataValidation_util_1.getStringValue)(thpChangelog.property, ''),
                    targetMin: (0, dataValidation_util_1.getStringValue)(thpChangelog.minOccurs, ''),
                    targetMax: (0, dataValidation_util_1.getStringValue)(thpChangelog.maxOccurs, ''),
                };
                const updatedThpObj = Object.assign(sourceData, targetData);
                if (thpChangelog.changeCode === 'new' ||
                    thpChangelog.changeCode === 'add') {
                    changesObj.add.push(updatedThpObj);
                    typeHasPropertyObj.push(updatedThpObj);
                }
                else if (thpChangelog.changeCode === 'modified' ||
                    thpChangelog.changeCode === 'edit') {
                    changesObj.edit.push(updatedThpObj);
                    typeHasPropertyObj.push(updatedThpObj);
                }
                else if (thpChangelog.changeCode === 'deleted' ||
                    thpChangelog.changeCode === 'delete') {
                    changesObj.delete.push(updatedThpObj);
                    typeHasPropertyObj.push(updatedThpObj);
                }
                else if (thpChangelog.changeCode === 'no change') {
                    changesObj.noChange.push(thpItem);
                    typeHasPropertyObj.push(thpItem);
                }
            }
            else {
                const thpChangelog = await NiemChangelogTypeContainsPropertyModel.findOne({
                    release: release,
                    typeName: {
                        $regex: `^${thpTypeName}$`,
                        $options: 'i',
                    },
                    property: {
                        $regex: `^${thpPropertyName}$`,
                        $options: 'i',
                    },
                }).exec();
                if (thpChangelog !== null) {
                    const targetData = {
                        key: i,
                        mappingCode: (0, dataValidation_util_1.getStringValue)(thpChangelog.changeCode, ''),
                        targetTypeNS: (0, dataValidation_util_1.getStringValue)(thpChangelog.namespace, ''),
                        targetTypeName: (0, dataValidation_util_1.getStringValue)(thpChangelog.typeName, ''),
                        targetPropertyName: (0, dataValidation_util_1.getStringValue)(thpChangelog.property, ''),
                        targetMin: (0, dataValidation_util_1.getStringValue)(thpChangelog.minOccurs, ''),
                        targetMax: (0, dataValidation_util_1.getStringValue)(thpChangelog.maxOccurs, ''),
                    };
                    const updatedThpObj = Object.assign(sourceData, targetData);
                    typeHasPropertyObj.push(updatedThpObj);
                    changesObj.add.push(updatedThpObj);
                }
                else {
                    const targetData = {
                        key: i,
                        mappingCode: '',
                        targetTypeNS: '',
                        targetTypeName: '',
                        targetPropertyName: '',
                        targetMin: '',
                        targetMax: '',
                    };
                    const updatedThpObj = Object.assign(sourceData, targetData);
                    typeHasPropertyObj.push(updatedThpObj);
                    changesObj.notFound.push(updatedThpObj);
                }
            }
        }
        else {
            if (thpItem.mappingCode === 'deleted' ||
                thpItem.mappingCode === 'delete') {
                typeHasPropertyObj.push(thpItem);
                changesObj.delete.push(thpItem);
            }
            else {
                const targetData = {
                    key: i,
                    mappingCode: '',
                    targetTypeNS: '',
                    targetTypeName: '',
                    targetPropertyName: '',
                    targetMin: '',
                    targetMax: '',
                };
                const updatedThpObj = Object.assign(sourceData, targetData);
                typeHasPropertyObj.push(updatedThpObj);
                changesObj.notFound.push(updatedThpObj);
            }
        }
    }
    return { typeHasPropertyObj: typeHasPropertyObj, changesObj: changesObj };
};
exports.migrateTypeHasPropertySheet = migrateTypeHasPropertySheet;
const migrateFacetSheet = async (release, mappingDoc, NiemChangelogFacetModel) => {
    let facetObj = [];
    let changesObj = {
        changelogRelease: release,
        add: [],
        edit: [],
        delete: [],
        notFound: [],
        noChange: [],
    };
    for (let i = 0; i < mappingDoc.codesFacetsSheet.length; i++) {
        const facetItem = mappingDoc.codesFacetsSheet[i];
        const sourceData = {
            key: i,
            sourceNSPrefix: (0, dataValidation_util_1.getStringValue)(facetItem.sourceNSPrefix, ''),
            sourceTypeName: (0, dataValidation_util_1.getStringValue)(facetItem.sourceTypeName, ''),
            sourceValue: (0, dataValidation_util_1.getStringValue)(facetItem.sourceValue, ''),
            sourceDefinition: (0, dataValidation_util_1.getStringValue)(facetItem.sourceDefinition, ''),
            sourceKindOfFacet: (0, dataValidation_util_1.getStringValue)(facetItem.sourceKindOfFacet, ''),
        };
        const facetTypeName = (0, exports.getMappingDocItemName)(facetItem.mappingCode, facetItem.sourceTypeName, facetItem.targetTypeName);
        const facetValueName = (0, exports.getMappingDocItemName)(facetItem.mappingCode, facetItem.sourceValue, facetItem.targetValue);
        if (facetTypeName !== false && facetValueName !== false) {
            const facetChangelog = await NiemChangelogFacetModel.findOne({
                release: release,
                originalTypeName: {
                    $regex: `^${facetTypeName}$`,
                    $options: 'i',
                },
                originalFacetValue: {
                    $regex: `^${facetValueName}$`,
                    $options: 'i',
                },
            }).exec();
            if (facetChangelog !== null) {
                const targetData = {
                    key: i,
                    mappingCode: (0, dataValidation_util_1.getStringValue)(facetChangelog.changeCode, ''),
                    targetNSPrefix: (0, dataValidation_util_1.getStringValue)(facetChangelog.namespace, ''),
                    targetTypeName: (0, dataValidation_util_1.getStringValue)(facetChangelog.typeName, ''),
                    targetValue: (0, dataValidation_util_1.getStringValue)(facetChangelog.facetValue, ''),
                    targetDefinition: (0, dataValidation_util_1.getStringValue)(facetChangelog.definition, ''),
                    targetKindOfFacet: (0, dataValidation_util_1.getStringValue)(facetChangelog.kindOfFacet, ''),
                };
                const updatedFacetObj = Object.assign(sourceData, targetData);
                if (facetChangelog.changeCode === 'new' ||
                    facetChangelog.changeCode === 'add') {
                    changesObj.add.push(updatedFacetObj);
                    facetObj.push(updatedFacetObj);
                }
                else if (facetChangelog.changeCode === 'modified' ||
                    facetChangelog.changeCode === 'edit') {
                    changesObj.edit.push(updatedFacetObj);
                    facetObj.push(updatedFacetObj);
                }
                else if (facetChangelog.changeCode === 'deleted' ||
                    facetChangelog.changeCode === 'delete') {
                    changesObj.delete.push(updatedFacetObj);
                    facetObj.push(updatedFacetObj);
                }
                else if (facetChangelog.changeCode === 'no change') {
                    changesObj.noChange.push(facetItem);
                    facetObj.push(facetItem);
                }
            }
            else {
                const facetChangelog = await NiemChangelogFacetModel.findOne({
                    release: release,
                    typeName: {
                        $regex: `^${facetTypeName}$`,
                        $options: 'i',
                    },
                    facetValue: {
                        $regex: `^${facetValueName}$`,
                        $options: 'i',
                    },
                }).exec();
                if (facetChangelog !== null) {
                    const targetData = {
                        key: i,
                        mappingCode: (0, dataValidation_util_1.getStringValue)(facetChangelog.changeCode, ''),
                        targetNSPrefix: (0, dataValidation_util_1.getStringValue)(facetChangelog.namespace, ''),
                        targetTypeName: (0, dataValidation_util_1.getStringValue)(facetChangelog.typeName, ''),
                        targetValue: (0, dataValidation_util_1.getStringValue)(facetChangelog.facetValue, ''),
                        targetDefinition: (0, dataValidation_util_1.getStringValue)(facetChangelog.definition, ''),
                        targetKindOfFacet: (0, dataValidation_util_1.getStringValue)(facetChangelog.kindOfFacet, ''),
                    };
                    const updatedFacetObj = Object.assign(sourceData, targetData);
                    facetObj.push(updatedFacetObj);
                    changesObj.add.push(updatedFacetObj);
                }
                else {
                    const targetData = {
                        key: i,
                        mappingCode: '',
                        targetNSPrefix: '',
                        targetTypeName: '',
                        targetValue: '',
                        targetDefinition: '',
                        targetKindOfFacet: '',
                    };
                    const updatedFacetObj = Object.assign(sourceData, targetData);
                    facetObj.push(updatedFacetObj);
                    changesObj.notFound.push(updatedFacetObj);
                }
            }
        }
        else {
            if (facetItem.mappingCode === 'deleted' ||
                facetItem.mappingCode === 'delete') {
                facetObj.push(facetItem);
                changesObj.delete.push(facetItem);
            }
            else {
                const targetData = {
                    key: i,
                    mappingCode: '',
                    targetNSPrefix: '',
                    targetTypeName: '',
                    targetValue: '',
                    targetDefinition: '',
                    targetKindOfFacet: '',
                };
                const updatedFacetObj = Object.assign(sourceData, targetData);
                facetObj.push(updatedFacetObj);
                changesObj.notFound.push(updatedFacetObj);
            }
        }
    }
    return { facetObj: facetObj, changesObj: changesObj };
};
exports.migrateFacetSheet = migrateFacetSheet;
const migrateNamespaceSheet = async (release, mappingDoc, NiemChangelogNamespaceModel) => {
    let namespaceObj = [];
    let changesObj = {
        changelogRelease: release,
        add: [],
        edit: [],
        delete: [],
        notFound: [],
        noChange: [],
    };
    for (let i = 0; i < mappingDoc.namespaceSheet.length; i++) {
        const namespaceItem = mappingDoc.namespaceSheet[i];
        const sourceData = {
            key: i,
            sourceNSPrefix: (0, dataValidation_util_1.getStringValue)(namespaceItem.sourceNSPrefix, ''),
            sourceURI: (0, dataValidation_util_1.getStringValue)(namespaceItem.sourceURI, ''),
            sourceDefinition: (0, dataValidation_util_1.getStringValue)(namespaceItem.sourceDefinition, ''),
        };
        const namespacePrefixName = (0, exports.getMappingDocItemName)(namespaceItem.mappingCode, namespaceItem.sourceNSPrefix, namespaceItem.targetNSPrefix);
        if (namespacePrefixName !== false) {
            const namespaceChangelog = await NiemChangelogNamespaceModel.findOne({
                release: release,
                originalPrefix: {
                    $regex: `^${namespacePrefixName}$`,
                    $options: 'i',
                },
            }).exec();
            if (namespaceChangelog !== null) {
                const targetData = {
                    key: i,
                    mappingCode: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.changeCode, ''),
                    targetNSPrefix: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.newPrefix, ''),
                    targetURI: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.newURI, ''),
                    targetDefinition: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.definition, ''),
                    ndrVersion: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.newVersionNumber, ''),
                    draftVersion: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.draft, ''),
                };
                const updatedNamespaceObj = Object.assign(sourceData, targetData);
                if (namespaceChangelog.changeCode === 'new' ||
                    namespaceChangelog.changeCode === 'add') {
                    changesObj.add.push(updatedNamespaceObj);
                    namespaceObj.push(updatedNamespaceObj);
                }
                else if (namespaceChangelog.changeCode === 'modified' ||
                    namespaceChangelog.changeCode === 'edit') {
                    changesObj.edit.push(updatedNamespaceObj);
                    namespaceObj.push(updatedNamespaceObj);
                }
                else if (namespaceChangelog.changeCode === 'deleted' ||
                    namespaceChangelog.changeCode === 'delete') {
                    changesObj.delete.push(updatedNamespaceObj);
                    namespaceObj.push(updatedNamespaceObj);
                }
                else if (namespaceChangelog.changeCode === 'no change') {
                    changesObj.noChange.push(namespaceItem);
                    namespaceObj.push(namespaceItem);
                }
            }
            else {
                const namespaceChangelog = await NiemChangelogNamespaceModel.findOne({
                    release: release,
                    newPrefix: {
                        $regex: `^${namespacePrefixName}$`,
                        $options: 'i',
                    },
                }).exec();
                if (namespaceChangelog !== null) {
                    const targetData = {
                        key: i,
                        mappingCode: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.changeCode, ''),
                        targetNSPrefix: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.newPrefix, ''),
                        targetURI: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.newURI, ''),
                        targetDefinition: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.definition, ''),
                        ndrVersion: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.newVersionNumber, ''),
                        draftVersion: (0, dataValidation_util_1.getStringValue)(namespaceChangelog.draft, ''),
                    };
                    const updatedNamespaceObj = Object.assign(sourceData, targetData);
                    namespaceObj.push(updatedNamespaceObj);
                    changesObj.add.push(updatedNamespaceObj);
                }
                else {
                    const targetData = {
                        key: i,
                        mappingCode: '',
                        targetNSPrefix: '',
                        targetURI: '',
                        targetDefinition: '',
                        ndrVersion: '',
                        draftVersion: '',
                    };
                    const updatedNamespaceObj = Object.assign(sourceData, targetData);
                    namespaceObj.push(updatedNamespaceObj);
                    changesObj.notFound.push(updatedNamespaceObj);
                }
            }
        }
        else {
            if (namespaceItem.mappingCode === 'deleted' ||
                namespaceItem.mappingCode === 'delete') {
                namespaceObj.push(namespaceItem);
                changesObj.delete.push(namespaceItem);
            }
            else {
                const targetData = {
                    key: i,
                    mappingCode: '',
                    targetNSPrefix: '',
                    targetURI: '',
                    targetDefinition: '',
                    ndrVersion: '',
                    draftVersion: '',
                };
                const updatedNamespaceObj = Object.assign(sourceData, targetData);
                namespaceObj.push(updatedNamespaceObj);
                changesObj.notFound.push(updatedNamespaceObj);
            }
        }
    }
    return { namespaceObj: namespaceObj, changesObj: changesObj };
};
exports.migrateNamespaceSheet = migrateNamespaceSheet;
//# sourceMappingURL=migration.util.js.map