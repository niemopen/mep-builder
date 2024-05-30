"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtensionsToCMF = exports.createContext = exports.xmlToJson = exports.checkForDuplicates = void 0;
const xml2js = require('xml2js');
const checkForDuplicates = async (xmlFiles, jsonldFiles) => {
    for (const file of xmlFiles) {
        file.isDuplicate = false;
        const xmlBasename = file.label.substring(0, file.label.lastIndexOf('.') + 1);
        jsonldFiles.forEach((jsonldFile) => {
            const fileName = jsonldFile.label;
            const jsonldBasename = fileName.substring(0, fileName.lastIndexOf('.') + 1);
            if (xmlBasename === jsonldBasename) {
                file.isDuplicate = true;
                file.jsonldBlobId = jsonldFile.fileBlobId;
            }
        });
    }
    return xmlFiles;
};
exports.checkForDuplicates = checkForDuplicates;
const xmlToJson = async (file) => {
    var parser = new xml2js.Parser({ mergeAttrs: true, explicitArray: false });
    const parsed = parser
        .parseStringPromise(file)
        .then(function (result) {
        return result;
    })
        .catch(function (err) {
        console.log(err);
        return false;
    });
    return parsed;
};
exports.xmlToJson = xmlToJson;
const createContext = (jsonFile) => {
    let context = {};
    let [first] = Object.keys(jsonFile);
    for (let key in jsonFile[first]) {
        if (typeof jsonFile[first][key] === 'string' &&
            jsonFile[first][key].includes('http')) {
            const splitKey = key.split(':');
            let urlWithHashSymbol = jsonFile[first][key] + '#';
            if (splitKey.length === 1) {
                context[`${splitKey[0]}`] = urlWithHashSymbol;
            }
            else {
                context[`${splitKey[1]}`] = urlWithHashSymbol;
            }
        }
    }
    return context;
};
exports.createContext = createContext;
const addNIEMDatatype = async (cmf, datatype, version, GTRIService, ErrorLogService, auditUser) => {
    if (!datatype.startsWith('ext')) {
        const result = await GTRIService.getTypeCMF(version, datatype.replace('.', ':'));
        if (result.data.Model.Datatype) {
            const typeInfo = result.data.Model.Datatype;
            const datatypeElement = cmf.ele('Datatype');
            datatypeElement.att('structures:id', datatype.replace(':', '.'));
            datatypeElement.ele({ Name: typeInfo.Name });
            datatypeElement.ele({
                Namespace: {
                    '@': {
                        'structures:ref': typeInfo.Namespace['structures:ref'],
                        'xsi:nil': typeInfo.Namespace['xsi:nil'],
                    },
                },
            });
            datatypeElement.ele({ DefinitionText: typeInfo.DefinitionText });
        }
        else {
            const errorMessage = 'Datatype ' +
                datatype +
                ' was not found and could not be added to the CMF file.';
            await ErrorLogService.logError('custommodelextensions', auditUser, errorMessage);
            console.error(errorMessage);
        }
    }
};
const addNIEMNamespace = async (cmf, prefix, version, GTRIService, ErrorLogService, auditUser) => {
    if (prefix !== 'ext') {
        const result = await GTRIService.getNamespaceCMF(version, prefix);
        if (result.data.Model.Namespace) {
            const namespaceInfo = result.data.Model.Namespace;
            const namespaceElement = cmf.ele('Namespace');
            namespaceElement.att('structures:id', prefix);
            namespaceElement.ele({ NamespaceURI: namespaceInfo.NamespaceURI });
            namespaceElement.ele({
                NamespacePrefixText: prefix,
            });
            namespaceElement.ele({ DefinitionText: namespaceInfo.DefinitionText });
            namespaceElement.ele({
                NamespaceKindCode: namespaceInfo.NamespaceKindCode,
            });
        }
        else {
            const errorMessage = 'Namespace ' +
                prefix +
                ' was not found and could not be added to the CMF file.';
            await ErrorLogService.logError('custommodelextensions', auditUser, errorMessage);
            console.error(errorMessage);
        }
    }
};
const addExtensionsToCMF = async (doc, rootInfo, extensions, GTRIService, ErrorLogService, auditUser) => {
    const obj = doc.end({ format: 'object' });
    const existingNamespaces = obj['Model']['Namespace']
        ? obj['Model']['Namespace']['@structures:id']
            ? [obj['Model']['Namespace']['@structures:id']]
            : obj['Model']['Namespace'].map((i) => i['@structures:id'])
        : [];
    const existingProperties = obj['Model']['Property']
        ? obj['Model']['Property']['@structures:id']
            ? [obj['Model']['Property']['@structures:id']]
            : obj['Model']['Property'].map((i) => i['@structures:id'])
        : [];
    const existingDatatypes = (function () {
        const datatypes = (function () {
            if (obj['Model']['Datatype']) {
                if (obj['Model']['Datatype']['@structures:id']) {
                    return [obj['Model']['Datatype']['@structures:id']];
                }
                else {
                    return obj['Model']['Datatype'].map((i) => i['@structures:id']);
                }
            }
            else {
                return [];
            }
        })();
        const classes = (function () {
            if (obj['Model']['Class']) {
                if (obj['Model']['Class']['@structures:id']) {
                    return [obj['Model']['Class']['@structures:id']];
                }
                else {
                    return obj['Model']['Class'].map((i) => i['@structures:id']);
                }
            }
            else {
                return [];
            }
        })();
        return datatypes.concat(classes);
    })();
    if (!existingNamespaces.includes('ext')) {
        const namespaceElement = doc.root().ele('Namespace');
        namespaceElement.att('structures:id', 'ext');
        namespaceElement.ele({ NamespaceURI: rootInfo.uri });
        namespaceElement.ele({
            NamespacePrefixText: rootInfo.elementName === 'extension' ? 'ext' : rootInfo.elementName,
        });
        namespaceElement.ele({ DefinitionText: rootInfo.definition });
        namespaceElement.ele({ NamespaceKindCode: 'EXTENSION' });
        existingNamespaces.push('ext');
    }
    for (const i in extensions) {
        let e = extensions[i];
        const firstLetterToUppercase = (string) => {
            const split = string.split(':');
            if (split.length > 1) {
                const word = split[1];
                const formatted = word.replace(word.charAt(0), word.charAt(0).toUpperCase());
                return [split[0], formatted].join(':');
            }
            else {
                const word = split[0];
                const formatted = word.replace(word.charAt(0), word.charAt(0).toUpperCase());
                return formatted;
            }
        };
        if (e.dataType.startsWith('ext')) {
            e.elementName = firstLetterToUppercase(e.elementName);
        }
        if (e.dataType.startsWith('ext')) {
            e.dataType = firstLetterToUppercase(e.dataType);
        }
        if (existingDatatypes.includes('ext.' + e.elementName) ||
            existingProperties.includes('ext.' + e.elementName)) {
            continue;
        }
        if (e.elementType === 'dataElement') {
            if (e.elementName.endsWith('Type')) {
                let datatypeElement = doc.root().ele('Datatype');
                datatypeElement.att('structures:id', e.dataType.replace(':', '.'));
                datatypeElement.ele({ Name: e.elementName });
                datatypeElement.ele({
                    Namespace: {
                        '@': { 'structures:ref': 'ext', 'xsi:nil': 'true' },
                    },
                });
                datatypeElement.ele({ DefinitionText: e.elementDefinition });
                existingDatatypes.push(e.dataType.replace(':', '.'));
                if (e.elementName.endsWith('CodeType')) {
                    let restrictionOfElement = datatypeElement.ele('RestrictionOf');
                    restrictionOfElement.ele({
                        Datatype: {
                            '@': { 'structures:ref': 'xs.token', 'xsi:nil': 'true' },
                        },
                    });
                    if (!existingNamespaces.includes('xs')) {
                        await addNIEMNamespace(doc.root(), 'xs', rootInfo.version, GTRIService, ErrorLogService, auditUser);
                        existingNamespaces.push('xs');
                    }
                    if (!existingDatatypes.includes('xs.token')) {
                        await addNIEMDatatype(doc.root(), 'xs.token', rootInfo.version, GTRIService, ErrorLogService, auditUser);
                        existingDatatypes.push('xs.token');
                    }
                    for (const c of e.code) {
                        let tagName = '';
                        switch (c['codeType']) {
                            case 'enumeration':
                                tagName = 'Enumeration';
                                break;
                            case 'fractionDigits':
                                tagName = 'FractionDigits';
                                break;
                            case 'length':
                                tagName = 'Length';
                                break;
                            case 'maxExclusive':
                                tagName = 'MaxExclusive';
                                break;
                            case 'maxInclusive':
                                tagName = 'MaxInclusive';
                                break;
                            case 'maxLength':
                                tagName = 'MaxLength';
                                break;
                            case 'minExclusive':
                                tagName = 'MinExclusive';
                                break;
                            case 'minInclusive':
                                tagName = 'MinInclusive';
                                break;
                            case 'minLength':
                                tagName = 'MinLength';
                                break;
                            case 'pattern':
                                tagName = 'Pattern';
                                break;
                            case 'totalDigits':
                                tagName = 'TotalDigits';
                                break;
                            case 'whiteSpace':
                                tagName = 'WhiteSpace';
                                break;
                            default:
                                tagName = '';
                        }
                        if (tagName !== '') {
                            let enumerationElement = restrictionOfElement.ele(tagName);
                            enumerationElement.ele({ StringValue: c['codeKey'] });
                            enumerationElement.ele({
                                DefinitionText: c['codeValue'],
                            });
                        }
                    }
                }
            }
            else {
                let propertyElement = doc.root().ele('Property');
                propertyElement.att('structures:id', 'ext.' + e.elementName);
                propertyElement.ele({ Name: e.elementName });
                propertyElement.ele({
                    Namespace: {
                        '@': { 'structures:ref': 'ext', 'xsi:nil': 'true' },
                    },
                });
                propertyElement.ele({ DefinitionText: e.elementDefinition });
                if (e.dataType.startsWith('ext') && !e.dataType.endsWith('CodeType')) {
                    propertyElement.ele({
                        Class: {
                            '@': {
                                'structures:ref': e.dataType.replace(':', '.'),
                                'xsi:nil': 'true',
                            },
                        },
                    });
                }
                else {
                    propertyElement.ele({
                        Datatype: {
                            '@': {
                                'structures:ref': e.dataType.replace(':', '.'),
                                'xsi:nil': 'true',
                            },
                        },
                    });
                }
                if (!existingDatatypes.includes(e.dataType.replace(':', '.'))) {
                    await addNIEMDatatype(doc.root(), e.dataType, rootInfo.version, GTRIService, ErrorLogService, auditUser);
                    existingDatatypes.push(e.dataType.replace(':', '.'));
                }
                const datatypeNamespace = e.dataType.substring(0, e.dataType.indexOf(':'));
                if (!existingNamespaces.includes(datatypeNamespace)) {
                    await addNIEMNamespace(doc.root(), datatypeNamespace, rootInfo.version, GTRIService, ErrorLogService, auditUser);
                    existingNamespaces.push(datatypeNamespace);
                }
            }
        }
        else if (e.elementType === 'container') {
            let classElement = doc.root().ele('Class');
            classElement.att('structures:id', 'ext.' + e.elementName);
            classElement.ele({ Name: e.elementName });
            classElement.ele({
                Namespace: {
                    '@': { 'structures:ref': 'ext', 'xsi:nil': 'true' },
                },
            });
            classElement.ele({ DefinitionText: e['elementDefinition'] });
            const hasProperties = e.containerElements[0]['containerElements'];
            for (let p = 1; p <= hasProperties.length; p++) {
                const hasPropertyElement = classElement.ele('HasProperty');
                const formattedValue = firstLetterToUppercase(hasProperties[p - 1]['value']);
                hasPropertyElement.ele({
                    Property: {
                        '@': {
                            'structures:ref': 'ext.' + formattedValue,
                            'xsi:nil': 'true',
                        },
                    },
                });
                hasPropertyElement.ele({ MinOccursQuantity: 1 });
                hasPropertyElement.ele({ MaxOccursQuantity: 1 });
            }
        }
    }
    const uriVersion = rootInfo.version.substr(0, rootInfo.version.indexOf('.'));
    const conformanceURI = 'http://reference.niem.gov/niem/specification/naming-and-design-rules/' +
        uriVersion +
        '.0/#ExtensionSchemaDocument';
    const schemaDocElement = doc.root().ele('SchemaDocument');
    schemaDocElement.ele({ NamespacePrefixText: 'ext' });
    schemaDocElement.ele({ NamespaceURI: rootInfo.uri });
    schemaDocElement.ele({ ConformanceTargetURIList: conformanceURI });
    schemaDocElement.ele({ DocumentFilePathText: 'extension/extension.xsd' });
    schemaDocElement.ele({ NIEMVersionText: uriVersion });
    schemaDocElement.ele({ SchemaVersionText: 1 });
};
exports.addExtensionsToCMF = addExtensionsToCMF;
//# sourceMappingURL=translation.util.js.map