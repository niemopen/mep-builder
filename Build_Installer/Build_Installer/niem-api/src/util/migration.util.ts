import { isStringValid, getStringValue } from './dataValidation.util';

export const getReleaseRange = (MigrationDto) => {
  // grab all releases between two releases
  const allReleases = MigrationDto.releases;
  const indexOfStartingRelease = allReleases.indexOf(
    MigrationDto.startingRelease,
  );
  const indexOfEndRelease = allReleases.indexOf(MigrationDto.endRelease);

  const getReleaseRange = allReleases.slice(
    indexOfStartingRelease,
    indexOfEndRelease + 1,
  );

  return getReleaseRange;
};

export const getMappingDocItemName = (mappingCode, sourceName, targetName) => {
  // if the change code is 'no change' we will use sourceName as the targetName will be empty
  if (mappingCode === 'no change') {
    return isStringValid(sourceName) ? sourceName : false;
  } else {
    // if the change code isn't 'no change' check if it's a valid string
    return isStringValid(targetName) ? targetName : false;
  }
};

export const removePrefix = (string) => {
  // get qualifiedDataType from dataType
  // ex: niem-xs:nonNegativeInteger to nonNegativeInteger
  const split = string.split(':');

  if (split.length === 1) {
    return split[0];
  } else {
    return split[1];
  }
};

export const migratePropertySheet = async (
  release,
  mappingDoc,
  NiemChangelogPropertyModel,
) => {
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
      sourceNSPrefix: getStringValue(propertyItem.sourceNSPrefix, ''),
      sourcePropertyName: getStringValue(propertyItem.sourcePropertyName, ''),
      dataType: getStringValue(propertyItem.dataType, ''),
      sourceDefinition: getStringValue(propertyItem.sourceDefinition, ''),
      sourceSampleValue: getStringValue(propertyItem.sourceSampleValue, ''),
    };

    const propertyName = getMappingDocItemName(
      propertyItem.mappingCode,
      propertyItem.sourcePropertyName,
      propertyItem.targetPropertyName,
    );

    // if propertyName is false, then the field is empty.
    if (propertyName !== false) {
      // search changelog release
      const propertyChangelog = await NiemChangelogPropertyModel.findOne({
        release: release,
        originalPropertyName: {
          $regex: `^${propertyName}$`, // do an exact-match, case insensitive search
          $options: 'i',
        },
      }).exec();

      // if propertyChangelog is not null, parse through the results
      if (propertyChangelog !== null) {
        const qualifiedDataTypeValue = isStringValid(propertyChangelog.dataType)
          ? removePrefix(propertyChangelog.dataType)
          : '';

        const isAbstractValue =
          getStringValue(propertyChangelog.isAbstract) === 'true'
            ? 'TRUE'
            : 'FALSE';

        const targetData = {
          mappingCode: getStringValue(propertyChangelog.changeCode, ''),
          targetNSPrefix: getStringValue(propertyChangelog.namespace, ''),
          targetPropertyName: getStringValue(
            propertyChangelog.propertyName,
            '',
          ),
          qualifiedDataType: qualifiedDataTypeValue,
          targetDefinition: getStringValue(propertyChangelog.definition, ''),
          substitutionGroup: getStringValue(
            propertyChangelog.substitutionGroupHead,
            '',
          ),
          isAbstract: isAbstractValue,
        };

        // combine data into one object
        const updatedPropertyObj = Object.assign(sourceData, targetData);

        /* NOTE: Change codes
            // Changelog Releases 3.1 - 4.1: deleted, modified, new, no change
            // Changelog Releases 4.2 - 5.0: add, delete, edit, no change
            // Changelog Releases 5.1: add, edit, no change. (delete is not included in the file)
        */

        // keep track of changes
        if (
          propertyChangelog.changeCode === 'new' ||
          propertyChangelog.changeCode === 'add'
        ) {
          changesObj.add.push(updatedPropertyObj);
          propertyObj.push(updatedPropertyObj);
        } else if (
          propertyChangelog.changeCode === 'modified' ||
          propertyChangelog.changeCode === 'edit'
        ) {
          changesObj.edit.push(updatedPropertyObj);
          propertyObj.push(updatedPropertyObj);
        } else if (
          propertyChangelog.changeCode === 'deleted' ||
          propertyChangelog.changeCode === 'delete'
        ) {
          changesObj.delete.push(updatedPropertyObj);
          propertyObj.push(updatedPropertyObj);
        } else if (propertyChangelog.changeCode === 'no change') {
          // if there is no change, retain the original data.
          changesObj.noChange.push(propertyItem);
          propertyObj.push(propertyItem);
        }
      } else {
        // if propertyChangelog is null, then no results were found
        // if the obj wasn't found, check to see if it was a new addition in the changelog by searching the propertyName column
        const propertyChangelog = await NiemChangelogPropertyModel.findOne({
          release: release,
          propertyName: {
            $regex: `^${propertyName}$`,
            $options: 'i',
          },
        }).exec();

        // propertyChangelog is null, an item wasn't found
        if (propertyChangelog !== null) {
          const qualifiedDataTypeValue = isStringValid(
            propertyChangelog.dataType,
          )
            ? removePrefix(propertyChangelog.dataType)
            : '';

          const isAbstractValue =
            getStringValue(propertyChangelog.isAbstract) === 'true'
              ? 'TRUE'
              : 'FALSE';

          const targetData = {
            mappingCode: getStringValue(propertyChangelog.changeCode, ''),
            targetNSPrefix: getStringValue(propertyChangelog.namespace, ''),
            targetPropertyName: getStringValue(
              propertyChangelog.propertyName,
              '',
            ),
            qualifiedDataType: qualifiedDataTypeValue,
            targetDefinition: getStringValue(propertyChangelog.definition, ''),
            substitutionGroup: getStringValue(
              propertyChangelog.substitutionGroupHead,
              '',
            ),
            isAbstract: isAbstractValue,
          };

          // combine data into one object
          const updatedPropertyObj = Object.assign(sourceData, targetData);
          propertyObj.push(updatedPropertyObj);
          changesObj.add.push(updatedPropertyObj);
        } else {
          // if not a new addition in the changelog, it's not found
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

          // combine data into one object
          const updatedPropertyObj = Object.assign(sourceData, targetData);

          propertyObj.push(updatedPropertyObj);
          changesObj.notFound.push(updatedPropertyObj);
        }
      }
    } else {
      // if field is empty, check if it was deleted
      if (
        propertyItem.mappingCode === 'deleted' ||
        propertyItem.mappingCode === 'delete'
      ) {
        // if an item was deleted in a past release, it won't be found in future releases. Here we retain it's place in the changesObj
        propertyObj.push(propertyItem);
        changesObj.delete.push(propertyItem);
      } else {
        // if item wasn't deleted then the item is considered not found
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

        // combine data into one object
        const updatedPropertyObj = Object.assign(sourceData, targetData);

        propertyObj.push(updatedPropertyObj);
        changesObj.notFound.push(updatedPropertyObj);
      }
    }
  }
  return { propertyObj, changesObj: changesObj };
};

export const migrateTypeSheet = async (
  release,
  mappingDoc,
  NiemChangelogTypeModel,
) => {
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
    const isParentValid = isStringValid(parentType);
    const isBaseValid = isStringValid(baseType);

    if (!isParentValid && !isBaseValid) {
      return '';
    }

    // <deleted> is considered null
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
      sourceNSPrefix: getStringValue(typeItem.sourceNSPrefix, ''),
      sourceTypeName: getStringValue(typeItem.sourceTypeName, ''),
      sourceParentBaseType: getStringValue(typeItem.sourceParentBaseType, ''),
      sourceDefinition: getStringValue(typeItem.sourceDefinition, ''),
    };

    const typeName = getMappingDocItemName(
      typeItem.mappingCode,
      typeItem.sourceTypeName,
      typeItem.targetTypeName,
    );

    // if typeName is false, then the field is empty.
    if (typeName !== false) {
      // search changelog release
      const typeChangelog = await NiemChangelogTypeModel.findOne({
        release: release,
        originalTypeName: {
          $regex: `^${typeName}$`, // do an exact-match, case insensitive search
          $options: 'i',
        },
      }).exec();

      // if typeChangelog is not null, parse through the results
      if (typeChangelog !== null) {
        const parentBaseType = getParentBaseType(
          typeChangelog.parentType,
          typeChangelog.baseType,
        );

        const targetData = {
          key: i,
          mappingCode: getStringValue(typeChangelog.changeCode, ''),
          targetNSPrefix: getStringValue(typeChangelog.namespace, ''),
          targetTypeName: getStringValue(typeChangelog.typeName, ''),
          targetParentBaseType: parentBaseType,
          targetDefinition: getStringValue(typeChangelog.definition, ''),
        };

        // combine data into one object
        const updatedTypeObj = Object.assign(sourceData, targetData);

        /* NOTE: Change codes
            // Changelog Releases 3.1 - 4.1: deleted, modified, new, no change
            // Changelog Releases 4.2 - 5.0: add, delete, edit, no change
            // Changelog Releases 5.1: add, edit, no change. (delete is not included in the file)
        */

        // keep track of changes
        if (
          typeChangelog.changeCode === 'new' ||
          typeChangelog.changeCode === 'add'
        ) {
          changesObj.add.push(updatedTypeObj);
          typeObj.push(updatedTypeObj);
        } else if (
          typeChangelog.changeCode === 'modified' ||
          typeChangelog.changeCode === 'edit'
        ) {
          changesObj.edit.push(updatedTypeObj);
          typeObj.push(updatedTypeObj);
        } else if (
          typeChangelog.changeCode === 'deleted' ||
          typeChangelog.changeCode === 'delete'
        ) {
          changesObj.delete.push(updatedTypeObj);
          typeObj.push(updatedTypeObj);
        } else if (typeChangelog.changeCode === 'no change') {
          // if there is no change, retain the original data.
          changesObj.noChange.push(typeItem);
          typeObj.push(typeItem);
        }
      } else {
        // if typeChangelog is null, then no results were found
        // if the obj wasn't found, check to see if it was a new addition in the changelog by searching the typeName column
        const typeChangelog = await NiemChangelogTypeModel.findOne({
          release: release,
          typeName: {
            $regex: `^${typeName}$`,
            $options: 'i',
          },
        }).exec();

        if (typeChangelog !== null) {
          const parentBaseType = getParentBaseType(
            typeChangelog.parentType,
            typeChangelog.baseType,
          );

          const targetData = {
            key: i,
            mappingCode: getStringValue(typeChangelog.changeCode, ''),
            targetNSPrefix: getStringValue(typeChangelog.namespace, ''),
            targetTypeName: getStringValue(typeChangelog.typeName, ''),
            targetParentBaseType: parentBaseType,
            targetDefinition: getStringValue(typeChangelog.definition, ''),
          };

          // combine data into one object
          const updatedTypeObj = Object.assign(sourceData, targetData);
          typeObj.push(updatedTypeObj);
          changesObj.add.push(updatedTypeObj);
        } else {
          // if not a new addition in the changelog, it's not found
          const targetData = {
            key: i,
            mappingCode: '',
            targetNSPrefix: '',
            targetTypeName: '',
            targetParentBaseType: '',
            targetDefinition: '',
          };

          // combine data into one object
          const updatedTypeObj = Object.assign(sourceData, targetData);

          typeObj.push(updatedTypeObj);
          changesObj.notFound.push(updatedTypeObj);
        }
      }
    } else {
      // if field is empty, check if it was deleted
      if (
        typeItem.mappingCode === 'deleted' ||
        typeItem.mappingCode === 'delete'
      ) {
        // if an item was deleted in a past release, it won't be found in future releases. Here we retain it's place in the changesObj
        typeObj.push(typeItem);
        changesObj.delete.push(typeItem);
      } else {
        // if item wasn't deleted then the item is considered not found
        const targetData = {
          key: i,
          mappingCode: '',
          targetNSPrefix: '',
          targetTypeName: '',
          targetParentBaseType: '',
          targetDefinition: '',
        };

        // combine data into one object
        const updatedTypeObj = Object.assign(sourceData, targetData);

        typeObj.push(updatedTypeObj);
        changesObj.notFound.push(updatedTypeObj);
      }
    }
  }

  return { typeObj, changesObj: changesObj };
};

export const migrateTypeHasPropertySheet = async (
  release,
  mappingDoc,
  NiemChangelogTypeContainsPropertyModel,
) => {
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
      sourceTypeNS: getStringValue(thpItem.sourceTypeNS, ''),
      sourceTypeName: getStringValue(thpItem.sourceTypeName, ''),
      sourcePropertyNS: getStringValue(thpItem.sourcePropertyNS, ''),
      sourcePropertyName: getStringValue(thpItem.sourcePropertyName, ''),
      sourceMin: getStringValue(thpItem.sourceMin, ''),
      sourceMax: getStringValue(thpItem.sourceMax, ''),
    };

    const thpTypeName = getMappingDocItemName(
      thpItem.mappingCode,
      thpItem.sourceTypeName,
      thpItem.targetTypeName,
    );

    const thpPropertyName = getMappingDocItemName(
      thpItem.mappingCode,
      thpItem.sourcePropertyName,
      thpItem.targetPropertyName,
    );

    // if thpName and thpPropertyName is false, then the field is empty.
    if (thpTypeName !== false && thpPropertyName !== false) {
      // search changelog release
      /* NOTE:
          The TypeContainsProperty Changelog has duplicate field names. To avoid selecting the incorrect item we search the both originalTypeName and originalPropertyName
      */
      const thpChangelog = await NiemChangelogTypeContainsPropertyModel.findOne(
        {
          release: release,
          originalTypeName: {
            $regex: `^${thpTypeName}$`, // do an exact-match, case insensitive search
            $options: 'i',
          },
          originalProperty: {
            $regex: `^${thpPropertyName}$`,
            $options: 'i',
          },
        },
      ).exec();

      // if thpChangelog is not null, parse through the results
      if (thpChangelog !== null) {
        const targetData = {
          key: i,
          mappingCode: getStringValue(thpChangelog.changeCode, ''),
          targetTypeNS: getStringValue(thpChangelog.namespace, ''),
          targetTypeName: getStringValue(thpChangelog.typeName, ''),
          targetPropertyName: getStringValue(thpChangelog.property, ''),
          targetMin: getStringValue(thpChangelog.minOccurs, ''),
          targetMax: getStringValue(thpChangelog.maxOccurs, ''),
        };

        // combine data into one object
        const updatedThpObj = Object.assign(sourceData, targetData);

        /* NOTE: Change codes
            // Changelog Releases 3.1 - 4.1: deleted, modified, new, no change
            // Changelog Releases 4.2 - 5.0: add, delete, edit, no change
            // Changelog Releases 5.1: add, edit, no change. (delete is not included in the file)
        */

        // keep track of changes
        if (
          thpChangelog.changeCode === 'new' ||
          thpChangelog.changeCode === 'add'
        ) {
          changesObj.add.push(updatedThpObj);
          typeHasPropertyObj.push(updatedThpObj);
        } else if (
          thpChangelog.changeCode === 'modified' ||
          thpChangelog.changeCode === 'edit'
        ) {
          changesObj.edit.push(updatedThpObj);
          typeHasPropertyObj.push(updatedThpObj);
        } else if (
          thpChangelog.changeCode === 'deleted' ||
          thpChangelog.changeCode === 'delete'
        ) {
          changesObj.delete.push(updatedThpObj);
          typeHasPropertyObj.push(updatedThpObj);
        } else if (thpChangelog.changeCode === 'no change') {
          // if there is no change, retain the original data.
          changesObj.noChange.push(thpItem);
          typeHasPropertyObj.push(thpItem);
        }
      } else {
        // if thpChangelog is null, then no results were found
        // if the obj wasn't found, check to see if it was a new addition in the changelog by searching the typeName column
        const thpChangelog =
          await NiemChangelogTypeContainsPropertyModel.findOne({
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
            mappingCode: getStringValue(thpChangelog.changeCode, ''),
            targetTypeNS: getStringValue(thpChangelog.namespace, ''),
            targetTypeName: getStringValue(thpChangelog.typeName, ''),
            targetPropertyName: getStringValue(thpChangelog.property, ''),
            targetMin: getStringValue(thpChangelog.minOccurs, ''),
            targetMax: getStringValue(thpChangelog.maxOccurs, ''),
          };

          // combine data into one object
          const updatedThpObj = Object.assign(sourceData, targetData);
          typeHasPropertyObj.push(updatedThpObj);
          changesObj.add.push(updatedThpObj);
        } else {
          // if not a new addition in the changelog, it's not found
          const targetData = {
            key: i,
            mappingCode: '',
            targetTypeNS: '',
            targetTypeName: '',
            targetPropertyName: '',
            targetMin: '',
            targetMax: '',
          };

          // combine data into one object
          const updatedThpObj = Object.assign(sourceData, targetData);

          typeHasPropertyObj.push(updatedThpObj);
          changesObj.notFound.push(updatedThpObj);
        }
      }
    } else {
      // if field is empty, check if it was deleted
      if (
        thpItem.mappingCode === 'deleted' ||
        thpItem.mappingCode === 'delete'
      ) {
        // if an item was deleted in a past release, it won't be found in future releases. Here we retain it's place in the changesObj
        typeHasPropertyObj.push(thpItem);
        changesObj.delete.push(thpItem);
      } else {
        // if item wasn't deleted then the item is considered not found
        const targetData = {
          key: i,
          mappingCode: '',
          targetTypeNS: '',
          targetTypeName: '',
          targetPropertyName: '',
          targetMin: '',
          targetMax: '',
        };

        // combine data into one object
        const updatedThpObj = Object.assign(sourceData, targetData);

        typeHasPropertyObj.push(updatedThpObj);
        changesObj.notFound.push(updatedThpObj);
      }
    }
  }

  return { typeHasPropertyObj: typeHasPropertyObj, changesObj: changesObj };
};

export const migrateFacetSheet = async (
  release,
  mappingDoc,
  NiemChangelogFacetModel,
) => {
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
      sourceNSPrefix: getStringValue(facetItem.sourceNSPrefix, ''),
      sourceTypeName: getStringValue(facetItem.sourceTypeName, ''),
      sourceValue: getStringValue(facetItem.sourceValue, ''),
      sourceDefinition: getStringValue(facetItem.sourceDefinition, ''),
      sourceKindOfFacet: getStringValue(facetItem.sourceKindOfFacet, ''),
    };

    const facetTypeName = getMappingDocItemName(
      facetItem.mappingCode,
      facetItem.sourceTypeName,
      facetItem.targetTypeName,
    );
    const facetValueName = getMappingDocItemName(
      facetItem.mappingCode,
      facetItem.sourceValue,
      facetItem.targetValue,
    );

    // if facetTypeName and facetValueName is false, then the field is empty.
    if (facetTypeName !== false && facetValueName !== false) {
      // search changelog release
      const facetChangelog = await NiemChangelogFacetModel.findOne({
        release: release,
        originalTypeName: {
          $regex: `^${facetTypeName}$`, // do an exact-match, case insensitive search
          $options: 'i',
        },
        originalFacetValue: {
          $regex: `^${facetValueName}$`,
          $options: 'i',
        },
      }).exec();

      // if facetChangelog is not null, parse through the results
      if (facetChangelog !== null) {
        const targetData = {
          key: i,
          mappingCode: getStringValue(facetChangelog.changeCode, ''),
          targetNSPrefix: getStringValue(facetChangelog.namespace, ''),
          targetTypeName: getStringValue(facetChangelog.typeName, ''),
          targetValue: getStringValue(facetChangelog.facetValue, ''),
          targetDefinition: getStringValue(facetChangelog.definition, ''),
          targetKindOfFacet: getStringValue(facetChangelog.kindOfFacet, ''),
        };

        // combine data into one object
        const updatedFacetObj = Object.assign(sourceData, targetData);

        /* NOTE: Change codes
            // Changelog Releases 3.1 - 4.1: deleted, modified, new, no change
            // Changelog Releases 4.2 - 5.0: add, delete, edit, no change
            // Changelog Releases 5.1: add, edit, no change. (delete is not included in the file)
        */

        // keep track of changes
        if (
          facetChangelog.changeCode === 'new' ||
          facetChangelog.changeCode === 'add'
        ) {
          changesObj.add.push(updatedFacetObj);
          facetObj.push(updatedFacetObj);
        } else if (
          facetChangelog.changeCode === 'modified' ||
          facetChangelog.changeCode === 'edit'
        ) {
          changesObj.edit.push(updatedFacetObj);
          facetObj.push(updatedFacetObj);
        } else if (
          facetChangelog.changeCode === 'deleted' ||
          facetChangelog.changeCode === 'delete'
        ) {
          changesObj.delete.push(updatedFacetObj);
          facetObj.push(updatedFacetObj);
        } else if (facetChangelog.changeCode === 'no change') {
          // if there is no change, retain the original data.
          changesObj.noChange.push(facetItem);
          facetObj.push(facetItem);
        }
      } else {
        // if facetChangelog is null, then no results were found
        // if the obj wasn't found, check to see if it was a new addition in the changelog by searching the typeName column
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
            mappingCode: getStringValue(facetChangelog.changeCode, ''),
            targetNSPrefix: getStringValue(facetChangelog.namespace, ''),
            targetTypeName: getStringValue(facetChangelog.typeName, ''),
            targetValue: getStringValue(facetChangelog.facetValue, ''),
            targetDefinition: getStringValue(facetChangelog.definition, ''),
            targetKindOfFacet: getStringValue(facetChangelog.kindOfFacet, ''),
          };

          // combine data into one object
          const updatedFacetObj = Object.assign(sourceData, targetData);
          facetObj.push(updatedFacetObj);
          changesObj.add.push(updatedFacetObj);
        } else {
          // if not a new addition in the changelog, it's not found
          const targetData = {
            key: i,
            mappingCode: '',
            targetNSPrefix: '',
            targetTypeName: '',
            targetValue: '',
            targetDefinition: '',
            targetKindOfFacet: '',
          };

          // combine data into one object
          const updatedFacetObj = Object.assign(sourceData, targetData);

          facetObj.push(updatedFacetObj);
          changesObj.notFound.push(updatedFacetObj);
        }
      }
    } else {
      // if field is empty, check if it was deleted
      if (
        facetItem.mappingCode === 'deleted' ||
        facetItem.mappingCode === 'delete'
      ) {
        // if an item was deleted in a past release, it won't be found in future releases. Here we retain it's place in the changesObj
        facetObj.push(facetItem);
        changesObj.delete.push(facetItem);
      } else {
        // if item wasn't deleted then the item is considered not found
        const targetData = {
          key: i,
          mappingCode: '',
          targetNSPrefix: '',
          targetTypeName: '',
          targetValue: '',
          targetDefinition: '',
          targetKindOfFacet: '',
        };

        // combine data into one object
        const updatedFacetObj = Object.assign(sourceData, targetData);

        facetObj.push(updatedFacetObj);
        changesObj.notFound.push(updatedFacetObj);
      }
    }
  }

  return { facetObj: facetObj, changesObj: changesObj };
};

export const migrateNamespaceSheet = async (
  release,
  mappingDoc,
  NiemChangelogNamespaceModel,
) => {
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
      sourceNSPrefix: getStringValue(namespaceItem.sourceNSPrefix, ''),
      sourceURI: getStringValue(namespaceItem.sourceURI, ''),
      sourceDefinition: getStringValue(namespaceItem.sourceDefinition, ''),
    };

    const namespacePrefixName = getMappingDocItemName(
      namespaceItem.mappingCode,
      namespaceItem.sourceNSPrefix,
      namespaceItem.targetNSPrefix,
    );

    // if namespacePrefixName is false, then the field is empty.
    if (namespacePrefixName !== false) {
      // search changelog release
      const namespaceChangelog = await NiemChangelogNamespaceModel.findOne({
        release: release,
        originalPrefix: {
          $regex: `^${namespacePrefixName}$`, // do an exact-match, case insensitive search
          $options: 'i',
        },
      }).exec();

      // if namespaceChangelog is not null, parse through the results
      if (namespaceChangelog !== null) {
        const targetData = {
          key: i,
          mappingCode: getStringValue(namespaceChangelog.changeCode, ''),
          targetNSPrefix: getStringValue(namespaceChangelog.newPrefix, ''),
          targetURI: getStringValue(namespaceChangelog.newURI, ''),
          targetDefinition: getStringValue(namespaceChangelog.definition, ''),
          ndrVersion: getStringValue(namespaceChangelog.newVersionNumber, ''),
          draftVersion: getStringValue(namespaceChangelog.draft, ''),
        };

        // combine data into one object
        const updatedNamespaceObj = Object.assign(sourceData, targetData);

        /* NOTE: Change codes
            // Changelog Releases 3.1 - 4.1: deleted, modified, new, no change
            // Changelog Releases 4.2 - 5.0: add, delete, edit, no change
            // Changelog Releases 5.1: add, edit, no change. (delete is not included in the file)
        */

        // keep track of changes
        if (
          namespaceChangelog.changeCode === 'new' ||
          namespaceChangelog.changeCode === 'add'
        ) {
          changesObj.add.push(updatedNamespaceObj);
          namespaceObj.push(updatedNamespaceObj);
        } else if (
          namespaceChangelog.changeCode === 'modified' ||
          namespaceChangelog.changeCode === 'edit'
        ) {
          changesObj.edit.push(updatedNamespaceObj);
          namespaceObj.push(updatedNamespaceObj);
        } else if (
          namespaceChangelog.changeCode === 'deleted' ||
          namespaceChangelog.changeCode === 'delete'
        ) {
          changesObj.delete.push(updatedNamespaceObj);
          namespaceObj.push(updatedNamespaceObj);
        } else if (namespaceChangelog.changeCode === 'no change') {
          // if there is no change, retain the original data.
          changesObj.noChange.push(namespaceItem);
          namespaceObj.push(namespaceItem);
        }
      } else {
        // if namespaceChangelog is null, then no results were found
        // if the obj wasn't found, check to see if it was a new addition in the changelog by searching the typeName column
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
            mappingCode: getStringValue(namespaceChangelog.changeCode, ''),
            targetNSPrefix: getStringValue(namespaceChangelog.newPrefix, ''),
            targetURI: getStringValue(namespaceChangelog.newURI, ''),
            targetDefinition: getStringValue(namespaceChangelog.definition, ''),
            ndrVersion: getStringValue(namespaceChangelog.newVersionNumber, ''),
            draftVersion: getStringValue(namespaceChangelog.draft, ''),
          };

          // combine data into one object
          const updatedNamespaceObj = Object.assign(sourceData, targetData);
          namespaceObj.push(updatedNamespaceObj);
          changesObj.add.push(updatedNamespaceObj);
        } else {
          // if not a new addition in the changelog, it's not found
          const targetData = {
            key: i,
            mappingCode: '',
            targetNSPrefix: '',
            targetURI: '',
            targetDefinition: '',
            ndrVersion: '',
            draftVersion: '',
          };

          // combine data into one object
          const updatedNamespaceObj = Object.assign(sourceData, targetData);

          namespaceObj.push(updatedNamespaceObj);
          changesObj.notFound.push(updatedNamespaceObj);
        }
      }
    } else {
      // if field is empty, check if it was deleted
      if (
        namespaceItem.mappingCode === 'deleted' ||
        namespaceItem.mappingCode === 'delete'
      ) {
        // if an item was deleted in a past release, it won't be found in future releases. Here we retain it's place in the changesObj
        namespaceObj.push(namespaceItem);
        changesObj.delete.push(namespaceItem);
      } else {
        // if item wasn't deleted then the item is considered not found
        const targetData = {
          key: i,
          mappingCode: '',
          targetNSPrefix: '',
          targetURI: '',
          targetDefinition: '',
          ndrVersion: '',
          draftVersion: '',
        };

        // combine data into one object
        const updatedNamespaceObj = Object.assign(sourceData, targetData);

        namespaceObj.push(updatedNamespaceObj);
        changesObj.notFound.push(updatedNamespaceObj);
      }
    }
  }

  return { namespaceObj: namespaceObj, changesObj: changesObj };
};
