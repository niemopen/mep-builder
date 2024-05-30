"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReleaseTypeUnionToDb = exports.addReleaseTypeContainsPropertyToDb = exports.addReleaseTypeToDb = exports.addReleasePropertyToDb = exports.addReleaseNamespaceToDb = exports.addReleaseMetadataToDb = exports.addReleaseLocalTermToDb = exports.addReleaseFacetToDb = exports.scrape = exports.downloadFile = exports.parseReleaseFileViaNiem = exports.resetReleaseUploadStatusValues = exports.releaseUploadStatus = exports.addChangelogNamespaceToDb = exports.addChangelogFacetToDb = exports.addChangelogTypeContainsPropertyToDb = exports.addChangelogTypeToDb = exports.addChangelogPropertyToDb = exports.parseChangelogFileViaNiem = exports.getPreviousRelease = exports.convertToAssociationString = exports.convertToAugmentationString = void 0;
const xlsx = require("xlsx");
const dataValidation_util_1 = require("./dataValidation.util");
const axios_1 = require("axios");
const convertToAugmentationString = (string) => {
    const lastFour = string.substring(string.length - 4);
    const lastSixteen = string.substring(string.length - 16);
    let augmentationString = '';
    if (lastSixteen.toLowerCase() === 'augmentationtype') {
        augmentationString = string;
    }
    else if (lastFour.toLowerCase() === 'type') {
        augmentationString =
            string.substring(0, string.length - 4) +
                'Augmentation' +
                string.substring(string.length - 4, string.length);
    }
    else {
        augmentationString = string;
    }
    return augmentationString;
};
exports.convertToAugmentationString = convertToAugmentationString;
const convertToAssociationString = (string) => {
    const lastFour = string.substring(string.length - 4);
    const lastFifteen = string.substring(string.length - 15);
    let associationString = '';
    if (lastFifteen.toLowerCase() === 'associationtype') {
        associationString = string;
    }
    else if (lastFour.toLowerCase() === 'type') {
        associationString =
            string.substring(0, string.length - 4) +
                'Association' +
                string.substring(string.length - 4, string.length);
    }
    else {
        associationString = string;
    }
    return associationString;
};
exports.convertToAssociationString = convertToAssociationString;
const getPreviousRelease = (releases, fileRelease) => {
    if (fileRelease === '3.0') {
        return '2.1';
    }
    else {
        const i = releases.indexOf(fileRelease);
        const prev = releases.indexOf(releases[i - 1]);
        return releases[prev];
    }
};
exports.getPreviousRelease = getPreviousRelease;
const parseChangelogFileViaNiem = (releases, fileRelease, fileBuffer) => {
    const prevRelease = (0, exports.getPreviousRelease)(releases, fileRelease);
    const wb = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetNames = wb.SheetNames;
    let changelogData = {
        previousRelease: prevRelease,
        fileRelease: fileRelease,
    };
    sheetNames.forEach((sheetName) => {
        if (sheetName !== 'Readme') {
            const sheet = wb.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
            changelogData[sheetName] = data;
        }
    });
    return changelogData;
};
exports.parseChangelogFileViaNiem = parseChangelogFileViaNiem;
const addChangelogPropertyToDb = async (fileRelease, previousRelease, property, NiemChangelogPropertyModel) => {
    let errors = [];
    for (let i = 0; i < property.length; i++) {
        const originalNamespace = `Original (${previousRelease})\r\nNS`;
        const namespace = `New (${fileRelease})\r\nNS`;
        const elementOrAttribute = fileRelease === '3.0' || '3.1' || '3.2'
            ? 'Element or \r\nAttribute'
            : 'Is Element\r\n(vs Attribute)';
        const concreteOrAbstract = 'Concrete or \r\nAbstract';
        const propertyData = await NiemChangelogPropertyModel.create({
            originalRelease: previousRelease,
            originalNamespace: (0, dataValidation_util_1.getStringValue)(property[i][originalNamespace]),
            originalPropertyName: (0, dataValidation_util_1.getStringValue)(property[i]['Property Name']),
            changeCode: (0, dataValidation_util_1.getStringValue)(property[i]['Change Code']),
            issue: (0, dataValidation_util_1.getStringValue)(property[i]['Issue']),
            release: fileRelease,
            namespace: (0, dataValidation_util_1.getStringValue)(property[i][namespace]),
            propertyName: (0, dataValidation_util_1.getStringValue)(property[i]['Property Name_1']),
            definition: (0, dataValidation_util_1.getStringValue)(property[i]['Definition']),
            dataType: (0, dataValidation_util_1.getStringValue)(property[i]['Data Type']),
            substitutionGroupHead: (0, dataValidation_util_1.getStringValue)(property[i]['Substitution Group Head']),
            elementOrAttribute: (0, dataValidation_util_1.getStringValue)(property[i][elementOrAttribute]),
            concreteOrAbstract: (0, dataValidation_util_1.getStringValue)(property[i][concreteOrAbstract]),
            isAbstract: (0, dataValidation_util_1.getStringValue)(property[i]['isAbstract']),
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
exports.addChangelogPropertyToDb = addChangelogPropertyToDb;
const addChangelogTypeToDb = async (fileRelease, previousRelease, type, NiemChangelogTypeModel) => {
    let errors = [];
    for (const i in type) {
        const originalNamespace = `Original (${previousRelease})\r\nNS`;
        const namespace = `New (${fileRelease})\r\nNS`;
        const typeData = await NiemChangelogTypeModel.create({
            originalRelease: previousRelease,
            originalNamespace: (0, dataValidation_util_1.getStringValue)(type[i][originalNamespace]),
            originalTypeName: (0, dataValidation_util_1.getStringValue)(type[i]['Type Name']),
            changeCode: (0, dataValidation_util_1.getStringValue)(type[i]['Change Code']),
            issue: (0, dataValidation_util_1.getStringValue)(type[i]['Issue']),
            release: fileRelease,
            namespace: (0, dataValidation_util_1.getStringValue)(type[i][namespace]),
            typeName: (0, dataValidation_util_1.getStringValue)(type[i]['Type Name_1']),
            definition: (0, dataValidation_util_1.getStringValue)(type[i]['Definition']),
            parentType: (0, dataValidation_util_1.getStringValue)(type[i]['Parent Type']),
            baseType: (0, dataValidation_util_1.getStringValue)(type[i]['Base Type']),
            contentStyle: (0, dataValidation_util_1.getStringValue)(type[i]['Content Style']),
            simpleStyle: (0, dataValidation_util_1.getStringValue)(type[i]['Simple Style']),
            isAssociation: (0, dataValidation_util_1.getStringValue)(type[i]['Is Association']),
            isAugmentation: (0, dataValidation_util_1.getStringValue)(type[i]['Is Augmentation']),
            isAdapter: (0, dataValidation_util_1.getStringValue)(type[i]['Is Adapter']),
            isMetadata: (0, dataValidation_util_1.getStringValue)(type[i]['Is Metadata']),
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
exports.addChangelogTypeToDb = addChangelogTypeToDb;
const addChangelogTypeContainsPropertyToDb = async (fileRelease, previousRelease, tcp, NiemChangelogTypeContainsPropertyModel) => {
    let errors = [];
    for (const i in tcp) {
        const originalNamespace = `Original (${previousRelease})\r\nNS`;
        const namespace = `New (${fileRelease})\r\nNS`;
        const tcpData = await NiemChangelogTypeContainsPropertyModel.create({
            originalRelease: previousRelease,
            originalNamespace: (0, dataValidation_util_1.getStringValue)(tcp[i][originalNamespace]),
            originalTypeName: (0, dataValidation_util_1.getStringValue)(tcp[i]['Type Name']),
            originalProperty: (0, dataValidation_util_1.getStringValue)(tcp[i]['Property']),
            changeCode: (0, dataValidation_util_1.getStringValue)(tcp[i]['Change Code']),
            issue: (0, dataValidation_util_1.getStringValue)(tcp[i]['Issue']),
            release: fileRelease,
            namespace: (0, dataValidation_util_1.getStringValue)(tcp[i][namespace]),
            typeName: (0, dataValidation_util_1.getStringValue)(tcp[i]['Type Name_1']),
            property: (0, dataValidation_util_1.getStringValue)(tcp[i]['Property_1']),
            minOccurs: (0, dataValidation_util_1.getStringValue)(tcp[i]['MinOccurs']),
            maxOccurs: (0, dataValidation_util_1.getStringValue)(tcp[i]['MaxOccurs']),
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
exports.addChangelogTypeContainsPropertyToDb = addChangelogTypeContainsPropertyToDb;
const addChangelogFacetToDb = async (fileRelease, previousRelease, facet, NiemChangelogFacetModel) => {
    let errors = [];
    for (const i in facet) {
        const originalNamespace = `Original (${previousRelease})\r\nNS`;
        const namespace = `New (${fileRelease})\r\nNS`;
        const facetData = await NiemChangelogFacetModel.create({
            originalRelease: previousRelease,
            originalNamespace: (0, dataValidation_util_1.getStringValue)(facet[i][originalNamespace]),
            originalTypeName: (0, dataValidation_util_1.getStringValue)(facet[i]['Type Name']),
            originalFacetValue: (0, dataValidation_util_1.getStringValue)(facet[i]['Facet Value']),
            changeCode: (0, dataValidation_util_1.getStringValue)(facet[i]['Change Code']),
            issue: (0, dataValidation_util_1.getStringValue)(facet[i]['Issue']),
            release: fileRelease,
            namespace: (0, dataValidation_util_1.getStringValue)(facet[i][namespace]),
            typeName: (0, dataValidation_util_1.getStringValue)(facet[i]['Type Name_1']),
            facetValue: (0, dataValidation_util_1.getStringValue)(facet[i]['Facet Value_1']),
            definition: (0, dataValidation_util_1.getStringValue)(facet[i]['Definition']),
            kindOfFacet: (0, dataValidation_util_1.getStringValue)(facet[i]['Kind of Facet']),
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
exports.addChangelogFacetToDb = addChangelogFacetToDb;
const addChangelogNamespaceToDb = async (fileRelease, previousRelease, ns, NiemChangelogNamespaceModel) => {
    let errors = [];
    for (const i in ns) {
        const originalPrefix = fileRelease === '4.0' ? 'Original (3.2) \r\nPrefix' : 'Original Prefix';
        const newPrefix = fileRelease === '4.0' ? 'New (4.0)\r\nPrefix' : 'New Prefix';
        const namespaceData = await NiemChangelogNamespaceModel.create({
            originalRelease: previousRelease,
            originalPrefix: (0, dataValidation_util_1.getStringValue)(ns[i][originalPrefix]),
            originalVersionNumber: (0, dataValidation_util_1.getStringValue)(ns[i]['Original Version Number']),
            changeCode: (0, dataValidation_util_1.getStringValue)(ns[i]['Change Code']),
            issue: (0, dataValidation_util_1.getStringValue)(ns[i]['Issue']),
            draft: (0, dataValidation_util_1.getStringValue)(ns[i]['Draft']),
            release: fileRelease,
            newPrefix: (0, dataValidation_util_1.getStringValue)(ns[i][newPrefix]),
            newVersionNumber: (0, dataValidation_util_1.getStringValue)(ns[i]['New Version Number']),
            newURI: (0, dataValidation_util_1.getStringValue)(ns[i]['New URI']),
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
exports.addChangelogNamespaceToDb = addChangelogNamespaceToDb;
exports.releaseUploadStatus = {
    label: 'Loading NIEM Release data... ',
    totalCompleted: 0,
    totalItems: 0,
};
const resetReleaseUploadStatusValues = () => {
    exports.releaseUploadStatus.label = 'Loading NIEM Release data... ';
    exports.releaseUploadStatus.totalCompleted = 0;
    exports.releaseUploadStatus.totalItems = 0;
};
exports.resetReleaseUploadStatusValues = resetReleaseUploadStatusValues;
const parseReleaseFileViaNiem = (releaseNumber, fileBuffer) => {
    const wb = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    return {
        releaseNumber: releaseNumber,
        data: data,
    };
};
exports.parseReleaseFileViaNiem = parseReleaseFileViaNiem;
const downloadFile = async (url) => {
    return axios_1.default
        .get(url, { responseType: 'arraybuffer' })
        .then((response) => {
        return response.data;
    })
        .catch((error) => {
        console.log(error);
    });
};
exports.downloadFile = downloadFile;
const scrape = async (url) => {
    return axios_1.default
        .get(url)
        .then((response) => {
        return response.data;
    })
        .catch((error) => {
        console.log(error);
    });
};
exports.scrape = scrape;
const addReleaseFacetToDb = async (NiemFacetModel, releaseData) => {
    const data = releaseData.data;
    let errors = [];
    for (const i in data) {
        const item = data[i];
        await NiemFacetModel.create({
            Release: releaseData.releaseNumber,
            TypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.TypeNamespacePrefix),
            TypeName: (0, dataValidation_util_1.getStringValue)(item.TypeName),
            QualifiedType: (0, dataValidation_util_1.getStringValue)(item.QualifiedType),
            FacetName: (0, dataValidation_util_1.getStringValue)(item.FacetName),
            FacetValue: (0, dataValidation_util_1.getStringValue)(item.FacetValue),
            Definition: (0, dataValidation_util_1.getStringValue)(item.Definition),
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
exports.addReleaseFacetToDb = addReleaseFacetToDb;
const addReleaseLocalTermToDb = async (NiemLocalTerm, releaseData) => {
    const data = releaseData.data;
    let errors = [];
    for (const i in data) {
        const item = data[i];
        await NiemLocalTerm.create({
            Release: releaseData.releaseNumber,
            NamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.NamespacePrefix),
            LocalTerm: (0, dataValidation_util_1.getStringValue)(item.LocalTerm),
            Literal: (0, dataValidation_util_1.getStringValue)(item.Literal),
            Definition: (0, dataValidation_util_1.getStringValue)(item.Definition),
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
exports.addReleaseLocalTermToDb = addReleaseLocalTermToDb;
const addReleaseMetadataToDb = async (NiemMetadataModel, releaseData) => {
    const data = releaseData.data;
    let errors = [];
    for (const i in data) {
        const item = data[i];
        await NiemMetadataModel.create({
            Release: releaseData.releaseNumber,
            MetadataTypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.MetadataTypeNamespacePrefix),
            MetadataTypeName: (0, dataValidation_util_1.getStringValue)(item.MetadataTypeName),
            MetadataQualfiedType: (0, dataValidation_util_1.getStringValue)(item.MetadataQualfiedType),
            AppliesToTypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.AppliesToTypeNamespacePrefix),
            AppliesToTypeName: (0, dataValidation_util_1.getStringValue)(item.AppliesToTypeName),
            AppliesToQualifiedType: (0, dataValidation_util_1.getStringValue)(item.AppliesToQualifiedType),
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
exports.addReleaseMetadataToDb = addReleaseMetadataToDb;
const addReleaseNamespaceToDb = async (NiemNamespaceModel, releaseData) => {
    const data = releaseData.data;
    let errors = [];
    for (const i in data) {
        const item = data[i];
        await NiemNamespaceModel.create({
            Release: releaseData.releaseNumber,
            NamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.NamespacePrefix),
            NamespaceFile: (0, dataValidation_util_1.getStringValue)(item.NamespaceFile),
            VersionURI: (0, dataValidation_util_1.getStringValue)(item.VersionURI),
            VersionReleaseNumber: (0, dataValidation_util_1.getStringValue)(item.VersionReleaseNumber),
            NamespaceStyle: (0, dataValidation_util_1.getStringValue)(item.NamespaceStyle),
            NamespaceIsExternallyGenerated: (0, dataValidation_util_1.getStringValue)(item.NamespaceIsExternallyGenerated),
            IsConformant: (0, dataValidation_util_1.getStringValue)(item.IsConformant),
            Definition: (0, dataValidation_util_1.getStringValue)(item.Definition),
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
exports.addReleaseNamespaceToDb = addReleaseNamespaceToDb;
const addReleasePropertyToDb = async (NiemPropertyModel, releaseData) => {
    const data = releaseData.data;
    let errors = [];
    for (const i in data) {
        const item = data[i];
        await NiemPropertyModel.create({
            Release: releaseData.releaseNumber,
            PropertyNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.PropertyNamespacePrefix),
            PropertyName: (0, dataValidation_util_1.getStringValue)(item.PropertyName),
            QualifiedProperty: (0, dataValidation_util_1.getStringValue)(item.QualifiedProperty),
            IsElement: (0, dataValidation_util_1.getStringValue)(item.IsElement),
            IsAbstract: (0, dataValidation_util_1.getStringValue)(item.IsAbstract),
            Keywords: (0, dataValidation_util_1.getStringValue)(item.Keywords),
            ExampleContent: (0, dataValidation_util_1.getStringValue)(item.ExampleContent),
            UsageInfo: (0, dataValidation_util_1.getStringValue)(item.UsageInfo),
            Definition: (0, dataValidation_util_1.getStringValue)(item.Definition),
            TypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.TypeNamespacePrefix),
            TypeName: (0, dataValidation_util_1.getStringValue)(item.TypeName),
            QualifedType: (0, dataValidation_util_1.getStringValue)(item.QualifiedType),
            SubstitutionGroupPropertyNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.SubstitutionGroupPropertyNamespacePrefix),
            SubstitutionGroupPropertyName: (0, dataValidation_util_1.getStringValue)(item.SubstitutionGroupPropertyName),
            SubstitutionGroupQualifiedProperty: (0, dataValidation_util_1.getStringValue)(item.SubstitutionGroupQualifiedProperty),
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
exports.addReleasePropertyToDb = addReleasePropertyToDb;
const addReleaseTypeToDb = async (NiemTypeModel, releaseData) => {
    const data = releaseData.data;
    let errors = [];
    for (const i in data) {
        const item = data[i];
        await NiemTypeModel.create({
            Release: releaseData.releaseNumber,
            TypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.TypeNamespacePrefix),
            TypeName: (0, dataValidation_util_1.getStringValue)(item.TypeName),
            QualifiedType: (0, dataValidation_util_1.getStringValue)(item.QualifiedType),
            ContentStyle: (0, dataValidation_util_1.getStringValue)(item.ContentStyle),
            SimpleStyle: (0, dataValidation_util_1.getStringValue)(item.SimpleStyle),
            IsMetadata: (0, dataValidation_util_1.getStringValue)(item.IsMetadata),
            IsAdapter: (0, dataValidation_util_1.getStringValue)(item.IsAdapter),
            IsAugmentation: (0, dataValidation_util_1.getStringValue)(item.IsAugmentation),
            Keywords: (0, dataValidation_util_1.getStringValue)(item.Keywords),
            ExampleContent: (0, dataValidation_util_1.getStringValue)(item.ExampleContent),
            UsageInfo: (0, dataValidation_util_1.getStringValue)(item.UsageInfo),
            Definition: (0, dataValidation_util_1.getStringValue)(item.Definition),
            SimpleTypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.SimpleTypeNamespacePrefix),
            SimpleTypeName: (0, dataValidation_util_1.getStringValue)(item.SimpleTypeName),
            SimpleQualifiedType: (0, dataValidation_util_1.getStringValue)(item.SimpleQualifiedType),
            ParentTypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.ParentTypeNamespacePrefix),
            ParentTypeName: (0, dataValidation_util_1.getStringValue)(item.ParentTypeName),
            ParentQualifiedType: (0, dataValidation_util_1.getStringValue)(item.ParentQualifiedType),
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
exports.addReleaseTypeToDb = addReleaseTypeToDb;
const addReleaseTypeContainsPropertyToDb = async (NiemTypeContainsPropertyModel, releaseData) => {
    const data = releaseData.data;
    let errors = [];
    for (const i in data) {
        const item = data[i];
        await NiemTypeContainsPropertyModel.create({
            Release: releaseData.releaseNumber,
            TypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.TypeNamespacePrefix),
            TypeName: (0, dataValidation_util_1.getStringValue)(item.TypeName),
            QualifiedType: (0, dataValidation_util_1.getStringValue)(item.QualifiedType),
            PropertyNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.PropertyNamespacePrefix),
            PropertyName: (0, dataValidation_util_1.getStringValue)(item.PropertyName),
            QualifiedProperty: (0, dataValidation_util_1.getStringValue)(item.QualifiedProperty),
            MinOccurs: (0, dataValidation_util_1.getStringValue)(item.MinOccurs),
            MaxOccurs: (0, dataValidation_util_1.getStringValue)(item.MaxOccurs),
            Definition: (0, dataValidation_util_1.getStringValue)(item.Definition),
            SequenceNumber: (0, dataValidation_util_1.getStringValue)(item.SequenceNumber),
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
exports.addReleaseTypeContainsPropertyToDb = addReleaseTypeContainsPropertyToDb;
const addReleaseTypeUnionToDb = async (NiemTypeUnionModel, releaseData) => {
    const data = releaseData.data;
    let errors = [];
    for (const i in data) {
        const item = data[i];
        await NiemTypeUnionModel.create({
            Release: releaseData.releaseNumber,
            UnionTypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.UnionTypeNamespacePrefix),
            UnionTypeName: (0, dataValidation_util_1.getStringValue)(item.UnionTypeName),
            UnionQualifiedType: (0, dataValidation_util_1.getStringValue)(item.UnionQualifiedType),
            MemberTypeNamespacePrefix: (0, dataValidation_util_1.getStringValue)(item.MemberTypeNamespacePrefix),
            MemberTypeName: (0, dataValidation_util_1.getStringValue)(item.MemberTypeName),
            MemberQualifiedType: (0, dataValidation_util_1.getStringValue)(item.MemberQualifiedType),
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
exports.addReleaseTypeUnionToDb = addReleaseTypeUnionToDb;
//# sourceMappingURL=releases.util.js.map