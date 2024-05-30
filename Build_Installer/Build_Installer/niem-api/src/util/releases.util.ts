import * as xlsx from 'xlsx';
import { getStringValue } from './dataValidation.util';
import axios from 'axios';

export const convertToAugmentationString = (string: string) => {
  const lastFour = string.substring(string.length - 4); // "Type == last 4 characters"
  const lastSixteen = string.substring(string.length - 16); // "AugmentationType == last 16 characters"
  let augmentationString = '';

  if (lastSixteen.toLowerCase() === 'augmentationtype') {
    // If string is in correct format, return string unmodified
    augmentationString = string;
  } else if (lastFour.toLowerCase() === 'type') {
    // Convert WordType to WordAugmentationType
    augmentationString =
      string.substring(0, string.length - 4) +
      'Augmentation' +
      string.substring(string.length - 4, string.length);
  } else {
    // If string doesn't match other criteria return string unmodified
    augmentationString = string;
  }

  return augmentationString;
};

export const convertToAssociationString = (string: string) => {
  const lastFour = string.substring(string.length - 4); // "Type == last 4 characters"
  const lastFifteen = string.substring(string.length - 15); // "AssociationType == last 15 characters"
  let associationString = '';

  if (lastFifteen.toLowerCase() === 'associationtype') {
    // If string is in correct format, return string unmodified
    associationString = string;
  } else if (lastFour.toLowerCase() === 'type') {
    // Convert WordType to WordAssociationType
    associationString =
      string.substring(0, string.length - 4) +
      'Association' +
      string.substring(string.length - 4, string.length);
  } else {
    // If string doesn't match other criteria return string unmodified
    associationString = string;
  }

  return associationString;
};

export const getPreviousRelease = (releases, fileRelease) => {
  if (fileRelease === '3.0') {
    // 2.1 is not currently configured in the release array.
    return '2.1';
  } else {
    // grab index of fileRelease in the releases array
    const i = releases.indexOf(fileRelease);

    // grab the index of the number before it in the array
    const prev = releases.indexOf(releases[i - 1]);

    return releases[prev];
  }
};

export const parseChangelogFileViaNiem = (
  releases,
  fileRelease,
  fileBuffer,
) => {
  const prevRelease = getPreviousRelease(releases, fileRelease);
  const wb = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetNames = wb.SheetNames; // [Readme, Property, Type, TypeContainsProperty, Facet, Namespace]

  // add previous release and file release to changelogData object for processing later
  let changelogData = {
    previousRelease: prevRelease,
    fileRelease: fileRelease,
  };

  // grab data by sheetName
  sheetNames.forEach((sheetName) => {
    // we will not add Readme sheet data to the db
    if (sheetName !== 'Readme') {
      const sheet = wb.Sheets[sheetName]; // grab sheet data
      const data = xlsx.utils.sheet_to_json(sheet); // convert sheet to json
      // organize data by sheet name, ex. {Property: {}, Type: {}, Facet: {}, etc}
      changelogData[sheetName] = data;
    }
  });

  return changelogData;
};

export const addChangelogPropertyToDb = async (
  fileRelease,
  previousRelease,
  property,
  NiemChangelogPropertyModel,
) => {
  let errors = []; // maintain list of errors as we loop through array

  // loop through property array and add data to db
  for (let i = 0; i < property.length; i++) {
    const originalNamespace = `Original (${previousRelease})\r\nNS`;
    const namespace = `New (${fileRelease})\r\nNS`;
    // Changelog Property 3.0, 3.1, 3.2 use 'Element or \r\nAttribute'
    // 4.0, 4.1, 5.0, 5.1 use 'Is Element\r\n(vs Attribute)'
    const elementOrAttribute =
      fileRelease === '3.0' || '3.1' || '3.2'
        ? 'Element or \r\nAttribute'
        : 'Is Element\r\n(vs Attribute)';
    const concreteOrAbstract = 'Concrete or \r\nAbstract';

    const propertyData = await NiemChangelogPropertyModel.create({
      originalRelease: previousRelease,
      originalNamespace: getStringValue(property[i][originalNamespace]),
      originalPropertyName: getStringValue(property[i]['Property Name']),
      changeCode: getStringValue(property[i]['Change Code']),
      issue: getStringValue(property[i]['Issue']),
      release: fileRelease,
      namespace: getStringValue(property[i][namespace]),
      propertyName: getStringValue(property[i]['Property Name_1']),
      definition: getStringValue(property[i]['Definition']),
      dataType: getStringValue(property[i]['Data Type']),
      substitutionGroupHead: getStringValue(
        property[i]['Substitution Group Head'],
      ),
      elementOrAttribute: getStringValue(property[i][elementOrAttribute]),
      concreteOrAbstract: getStringValue(property[i][concreteOrAbstract]),
      isAbstract: getStringValue(property[i]['isAbstract']),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }

  // return all captured logs
  return errors;
};

export const addChangelogTypeToDb = async (
  fileRelease,
  previousRelease,
  type,
  NiemChangelogTypeModel,
) => {
  let errors = []; // maintain list of errors as we loop through array

  // loop through type array and add data to db
  for (const i in type) {
    //
    const originalNamespace = `Original (${previousRelease})\r\nNS`;
    const namespace = `New (${fileRelease})\r\nNS`;

    const typeData = await NiemChangelogTypeModel.create({
      originalRelease: previousRelease,
      originalNamespace: getStringValue(type[i][originalNamespace]),
      originalTypeName: getStringValue(type[i]['Type Name']),
      changeCode: getStringValue(type[i]['Change Code']),
      issue: getStringValue(type[i]['Issue']),
      release: fileRelease,
      namespace: getStringValue(type[i][namespace]),
      typeName: getStringValue(type[i]['Type Name_1']),
      definition: getStringValue(type[i]['Definition']),
      parentType: getStringValue(type[i]['Parent Type']),
      baseType: getStringValue(type[i]['Base Type']),
      contentStyle: getStringValue(type[i]['Content Style']),
      simpleStyle: getStringValue(type[i]['Simple Style']),
      isAssociation: getStringValue(type[i]['Is Association']),
      isAugmentation: getStringValue(type[i]['Is Augmentation']),
      isAdapter: getStringValue(type[i]['Is Adapter']),
      isMetadata: getStringValue(type[i]['Is Metadata']),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }

  // return all captured logs
  return errors;
};

export const addChangelogTypeContainsPropertyToDb = async (
  fileRelease,
  previousRelease,
  tcp,
  NiemChangelogTypeContainsPropertyModel,
) => {
  let errors = []; // maintain list of errors as we loop through array

  // loop through tcp array and add data to db
  for (const i in tcp) {
    //
    const originalNamespace = `Original (${previousRelease})\r\nNS`;
    const namespace = `New (${fileRelease})\r\nNS`;

    const tcpData = await NiemChangelogTypeContainsPropertyModel.create({
      originalRelease: previousRelease,
      originalNamespace: getStringValue(tcp[i][originalNamespace]),
      originalTypeName: getStringValue(tcp[i]['Type Name']),
      originalProperty: getStringValue(tcp[i]['Property']),
      changeCode: getStringValue(tcp[i]['Change Code']),
      issue: getStringValue(tcp[i]['Issue']),
      release: fileRelease,
      namespace: getStringValue(tcp[i][namespace]),
      typeName: getStringValue(tcp[i]['Type Name_1']),
      property: getStringValue(tcp[i]['Property_1']),
      minOccurs: getStringValue(tcp[i]['MinOccurs']),
      maxOccurs: getStringValue(tcp[i]['MaxOccurs']),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }

  // return all captured logs
  return errors;
};

export const addChangelogFacetToDb = async (
  fileRelease,
  previousRelease,
  facet,
  NiemChangelogFacetModel,
) => {
  let errors = []; // maintain list of errors as we loop through array

  // loop through facet array and add data to db
  for (const i in facet) {
    //
    const originalNamespace = `Original (${previousRelease})\r\nNS`;
    const namespace = `New (${fileRelease})\r\nNS`;

    const facetData = await NiemChangelogFacetModel.create({
      originalRelease: previousRelease,
      originalNamespace: getStringValue(facet[i][originalNamespace]),
      originalTypeName: getStringValue(facet[i]['Type Name']),
      originalFacetValue: getStringValue(facet[i]['Facet Value']),
      changeCode: getStringValue(facet[i]['Change Code']),
      issue: getStringValue(facet[i]['Issue']),
      release: fileRelease,
      namespace: getStringValue(facet[i][namespace]),
      typeName: getStringValue(facet[i]['Type Name_1']),
      facetValue: getStringValue(facet[i]['Facet Value_1']),
      definition: getStringValue(facet[i]['Definition']),
      kindOfFacet: getStringValue(facet[i]['Kind of Facet']),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }

  // return all captured logs
  return errors;
};

export const addChangelogNamespaceToDb = async (
  fileRelease,
  previousRelease,
  ns,
  NiemChangelogNamespaceModel,
) => {
  let errors = []; // maintain list of errors as we loop through array

  // loop through ns array and add data to db
  for (const i in ns) {
    // Changelog Namespace 4.0 uses 'Original (3.2) Prefix' and 'New (4.0)\r\nPrefix
    const originalPrefix =
      fileRelease === '4.0' ? 'Original (3.2) \r\nPrefix' : 'Original Prefix';
    const newPrefix =
      fileRelease === '4.0' ? 'New (4.0)\r\nPrefix' : 'New Prefix';

    const namespaceData = await NiemChangelogNamespaceModel.create({
      originalRelease: previousRelease,
      originalPrefix: getStringValue(ns[i][originalPrefix]),
      originalVersionNumber: getStringValue(ns[i]['Original Version Number']),
      changeCode: getStringValue(ns[i]['Change Code']),
      issue: getStringValue(ns[i]['Issue']),
      draft: getStringValue(ns[i]['Draft']),
      release: fileRelease,
      newPrefix: getStringValue(ns[i][newPrefix]),
      newVersionNumber: getStringValue(ns[i]['New Version Number']),
      newURI: getStringValue(ns[i]['New URI']),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }

  // return all captured logs
  return errors;
};

export const releaseUploadStatus = {
  label: 'Loading NIEM Release data... ',
  totalCompleted: 0,
  totalItems: 0,
};

export const resetReleaseUploadStatusValues = () => {
  // reset values back to default
  releaseUploadStatus.label = 'Loading NIEM Release data... ';
  releaseUploadStatus.totalCompleted = 0;
  releaseUploadStatus.totalItems = 0;
};

export const parseReleaseFileViaNiem = (releaseNumber, fileBuffer) => {
  const wb = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName]; // grab sheet data
  const data = xlsx.utils.sheet_to_json(sheet); // convert sheet to json
  return {
    releaseNumber: releaseNumber,
    data: data,
  };
};

export const downloadFile = async (url) => {
  return axios
    .get(url, { responseType: 'arraybuffer' })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const scrape = async (url) => {
  return axios
    .get(url)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const addReleaseFacetToDb = async (NiemFacetModel, releaseData) => {
  // loop through the array of objects [{}] and add to the collection
  const data = releaseData.data;
  let errors = []; // maintain list of errors as we loop through array

  for (const i in data) {
    const item = data[i];

    await NiemFacetModel.create({
      Release: releaseData.releaseNumber,
      TypeNamespacePrefix: getStringValue(item.TypeNamespacePrefix),
      TypeName: getStringValue(item.TypeName),
      QualifiedType: getStringValue(item.QualifiedType),
      FacetName: getStringValue(item.FacetName),
      FacetValue: getStringValue(item.FacetValue),
      Definition: getStringValue(item.Definition),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }
  return errors;
};
export const addReleaseLocalTermToDb = async (NiemLocalTerm, releaseData) => {
  // loop through the array of objects [{}] and add to the collection
  const data = releaseData.data;
  let errors = []; // maintain list of errors as we loop through array

  for (const i in data) {
    const item = data[i];

    await NiemLocalTerm.create({
      Release: releaseData.releaseNumber,
      NamespacePrefix: getStringValue(item.NamespacePrefix),
      LocalTerm: getStringValue(item.LocalTerm),
      Literal: getStringValue(item.Literal),
      Definition: getStringValue(item.Definition),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }
  return errors;
};
export const addReleaseMetadataToDb = async (
  NiemMetadataModel,
  releaseData,
) => {
  // loop through the array of objects [{}] and add to the collection
  const data = releaseData.data;
  let errors = []; // maintain list of errors as we loop through array

  for (const i in data) {
    const item = data[i];

    await NiemMetadataModel.create({
      Release: releaseData.releaseNumber,
      MetadataTypeNamespacePrefix: getStringValue(
        item.MetadataTypeNamespacePrefix,
      ),
      MetadataTypeName: getStringValue(item.MetadataTypeName),
      MetadataQualfiedType: getStringValue(item.MetadataQualfiedType),
      AppliesToTypeNamespacePrefix: getStringValue(
        item.AppliesToTypeNamespacePrefix,
      ),
      AppliesToTypeName: getStringValue(item.AppliesToTypeName),
      AppliesToQualifiedType: getStringValue(item.AppliesToQualifiedType),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }
  return errors;
};
export const addReleaseNamespaceToDb = async (
  NiemNamespaceModel,
  releaseData,
) => {
  // loop through the array of objects [{}] and add to the collection
  const data = releaseData.data;
  let errors = []; // maintain list of errors as we loop through array

  for (const i in data) {
    const item = data[i];

    await NiemNamespaceModel.create({
      Release: releaseData.releaseNumber,
      NamespacePrefix: getStringValue(item.NamespacePrefix),
      NamespaceFile: getStringValue(item.NamespaceFile),
      VersionURI: getStringValue(item.VersionURI),
      VersionReleaseNumber: getStringValue(item.VersionReleaseNumber),
      NamespaceStyle: getStringValue(item.NamespaceStyle),
      NamespaceIsExternallyGenerated: getStringValue(
        item.NamespaceIsExternallyGenerated,
      ),
      IsConformant: getStringValue(item.IsConformant),
      Definition: getStringValue(item.Definition),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }
  return errors;
};
export const addReleasePropertyToDb = async (
  NiemPropertyModel,
  releaseData,
) => {
  // loop through the array of objects [{}] and add to the collection
  const data = releaseData.data;
  let errors = []; // maintain list of errors as we loop through array

  for (const i in data) {
    const item = data[i];
    await NiemPropertyModel.create({
      Release: releaseData.releaseNumber,
      PropertyNamespacePrefix: getStringValue(item.PropertyNamespacePrefix),
      PropertyName: getStringValue(item.PropertyName),
      QualifiedProperty: getStringValue(item.QualifiedProperty),
      IsElement: getStringValue(item.IsElement),
      IsAbstract: getStringValue(item.IsAbstract),
      Keywords: getStringValue(item.Keywords),
      ExampleContent: getStringValue(item.ExampleContent),
      UsageInfo: getStringValue(item.UsageInfo),
      Definition: getStringValue(item.Definition),
      TypeNamespacePrefix: getStringValue(item.TypeNamespacePrefix),
      TypeName: getStringValue(item.TypeName),
      QualifedType: getStringValue(item.QualifiedType),
      SubstitutionGroupPropertyNamespacePrefix: getStringValue(
        item.SubstitutionGroupPropertyNamespacePrefix,
      ),
      SubstitutionGroupPropertyName: getStringValue(
        item.SubstitutionGroupPropertyName,
      ),
      SubstitutionGroupQualifiedProperty: getStringValue(
        item.SubstitutionGroupQualifiedProperty,
      ),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }

  return errors;
};
export const addReleaseTypeToDb = async (NiemTypeModel, releaseData) => {
  // loop through the array of objects [{}] and add to the collection
  const data = releaseData.data;
  let errors = []; // maintain list of errors as we loop through array

  for (const i in data) {
    const item = data[i];
    await NiemTypeModel.create({
      Release: releaseData.releaseNumber,
      TypeNamespacePrefix: getStringValue(item.TypeNamespacePrefix),
      TypeName: getStringValue(item.TypeName),
      QualifiedType: getStringValue(item.QualifiedType),
      ContentStyle: getStringValue(item.ContentStyle),
      SimpleStyle: getStringValue(item.SimpleStyle),
      IsMetadata: getStringValue(item.IsMetadata),
      IsAdapter: getStringValue(item.IsAdapter),
      IsAugmentation: getStringValue(item.IsAugmentation),
      Keywords: getStringValue(item.Keywords),
      ExampleContent: getStringValue(item.ExampleContent),
      UsageInfo: getStringValue(item.UsageInfo),
      Definition: getStringValue(item.Definition),
      SimpleTypeNamespacePrefix: getStringValue(item.SimpleTypeNamespacePrefix),
      SimpleTypeName: getStringValue(item.SimpleTypeName),
      SimpleQualifiedType: getStringValue(item.SimpleQualifiedType),
      ParentTypeNamespacePrefix: getStringValue(item.ParentTypeNamespacePrefix),
      ParentTypeName: getStringValue(item.ParentTypeName),
      ParentQualifiedType: getStringValue(item.ParentQualifiedType),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }
  return errors;
};
export const addReleaseTypeContainsPropertyToDb = async (
  NiemTypeContainsPropertyModel,
  releaseData,
) => {
  // loop through the array of objects [{}] and add to the collection
  const data = releaseData.data;
  let errors = []; // maintain list of errors as we loop through array

  for (const i in data) {
    const item = data[i];

    await NiemTypeContainsPropertyModel.create({
      Release: releaseData.releaseNumber,
      TypeNamespacePrefix: getStringValue(item.TypeNamespacePrefix),
      TypeName: getStringValue(item.TypeName),
      QualifiedType: getStringValue(item.QualifiedType),
      PropertyNamespacePrefix: getStringValue(item.PropertyNamespacePrefix),
      PropertyName: getStringValue(item.PropertyName),
      QualifiedProperty: getStringValue(item.QualifiedProperty),
      MinOccurs: getStringValue(item.MinOccurs),
      MaxOccurs: getStringValue(item.MaxOccurs),
      Definition: getStringValue(item.Definition),
      SequenceNumber: getStringValue(item.SequenceNumber),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }
  return errors;
};
export const addReleaseTypeUnionToDb = async (
  NiemTypeUnionModel,
  releaseData,
) => {
  // loop through the array of objects [{}] and add to the collection
  const data = releaseData.data;
  let errors = []; // maintain list of errors as we loop through array

  for (const i in data) {
    const item = data[i];

    await NiemTypeUnionModel.create({
      Release: releaseData.releaseNumber,
      UnionTypeNamespacePrefix: getStringValue(item.UnionTypeNamespacePrefix),
      UnionTypeName: getStringValue(item.UnionTypeName),
      UnionQualifiedType: getStringValue(item.UnionQualifiedType),
      MemberTypeNamespacePrefix: getStringValue(item.MemberTypeNamespacePrefix),
      MemberTypeName: getStringValue(item.MemberTypeName),
      MemberQualifiedType: getStringValue(item.MemberQualifiedType),
    })
      .then((data) => {
        data.save();
      })
      .catch((error) => {
        errors.push({ log: error.toString() });
      });
  }
  return errors;
};
