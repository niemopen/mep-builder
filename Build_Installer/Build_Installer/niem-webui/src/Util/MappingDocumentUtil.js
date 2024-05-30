import * as xlsx from 'xlsx';
import * as actionTypes from '../redux/actions';
import { setSessionValue } from './localStorageUtil';
import * as sessionVar from './SessionVar';
import { deleteSubsetTranslate } from '../Shared/MEPChangeWarningModal';
import store from '../redux/store';

export const resetMappingGrid = () => {
	setSessionValue(sessionVar.unsaved_property_sheet, [], actionTypes.UPDATE_PROPERTY_SHEET);
	setSessionValue(sessionVar.unsaved_type_sheet, [], actionTypes.UPDATE_TYPE_SHEET);
	setSessionValue(sessionVar.unsaved_type_has_property_sheet, [], actionTypes.UPDATE_TYPE_HAS_PROPERTY_SHEET);
	setSessionValue(sessionVar.unsaved_codes_facets_sheet, [], actionTypes.UPDATE_CODES_FACETS_SHEET);
	setSessionValue(sessionVar.unsaved_namespace_sheet, [], actionTypes.UPDATE_NAMESPACE_SHEET);
	setSessionValue(sessionVar.unsaved_local_terminology_sheet, [], actionTypes.UPDATE_LOCAL_TERMINOLOGY_SHEET);
	setSessionValue(sessionVar.unsaved_type_union_sheet, [], actionTypes.UPDATE_TYPE_UNION_SHEET);
	setSessionValue(sessionVar.unsaved_metadata_sheet, [], actionTypes.UPDATE_METADATA_SHEET);
};

export const mapDocSheetNames = {
	propertySheet: 'propertySheet',
	typeSheet: 'typeSheet',
	typeHasPropertySheet: 'typeHasPropertySheet',
	codesFacetsSheet: 'codesFacetsSheet',
	namespaceSheet: 'namespaceSheet',
	localTerminologySheet: 'localTerminologySheet',
	typeUnionSheet: 'typeUnionSheet',
	metadataSheet: 'metadataSheet',
};

export function ParseExcel(bufferArray) {
	const promise = new Promise((resolve, reject) => {
		const wb = xlsx.read(bufferArray, { type: 'buffer' });
		// order of index in sheetsArray is important. See MapJson() below.
		const sheetsArray = ['Property', 'Type', 'Type-Has-Property', 'Codes | Facets', 'Namespace', 'Local Terminology', 'Type Union', 'Metadata'];
		let dataArray = [];

		sheetsArray.forEach(function (sheet) {
			const ws = wb.Sheets[sheet]; // If sheet does not exist, it returns an empty array
			const data = xlsx.utils.sheet_to_json(ws);
			dataArray.push(data);
		});

		resolve(dataArray);
	});

	promise.then((arr) => {
		MapJson(arr);
	});
}

export const ParseCustomExcel = (bufferArray, columns, row, sheetHasHeaders) => {
	const promise = new Promise((resolve, reject) => {
		let data = [];
		const wb = xlsx.read(bufferArray, { type: 'buffer' });

		// This code handles multiple worksheets in a custom mapping spreadsheet. Saving for potential use in a future release
		// const sheetsArray = ['Property', 'Type'];
		// sheetsArray.forEach((sheetName) => {
		// 	const ws = wb.Sheets[sheetName]; // If sheet does not exist, it returns an empty array
		// 	data.push(xlsx.utils.sheet_to_json(ws, { range: row }));
		// });

		const sheetName = wb.Props.SheetNames[0]; // grab first sheet in excel
		const ws = wb.Sheets[sheetName]; // If sheet does not exist, it returns an empty array

		if (sheetHasHeaders) {
			data.push(xlsx.utils.sheet_to_json(ws, { range: row }));
			resolve(data);
		} else {
			// map data to column letter names
			data.push(xlsx.utils.sheet_to_json(ws, { range: row, header: 'A' }));
			resolve(data);
		}
	});

	return promise.then((result) => {
		MapCustomJson(result, columns);
	});
};

export function UpdateMapDocRow(sheetName, sheetToUpdate, keyToUpdate, updatedData, checkedElementInType, selectedCardinality) {
	let rowToUpdate = sheetToUpdate.filter((item) => item.key === keyToUpdate);
	rowToUpdate = rowToUpdate[0];

	let elementsInTypeToAdd = [];
	let elementsInTypeString = [];

	// put elements and cardinalities together in the format that will be added to the Type Sheet
	if (sheetName === 'Type') {
		const cardinalityToAdd = [];

		// get only the elementsInType pertaining to this row
		elementsInTypeToAdd = checkedElementInType.filter((element) => element['type'] === updatedData.name);

		// get cardinalities pertaining to this type
		elementsInTypeToAdd.forEach((element) => {
			// see if non-default cardinality was selected
			const index = selectedCardinality.findIndex((obj) => obj.type === element['type'] && obj.element === element['name']);
			if (index > -1) {
				cardinalityToAdd.push(selectedCardinality[index]);
			} else {
				// create default cardinality entry
				cardinalityToAdd.push({ type: element['type'], element: element.name, cardinality: '0..unbounded' });
			}
		});

		// merge cardinality values to element object
		elementsInTypeToAdd = elementsInTypeToAdd.map((element) => {
			const index = cardinalityToAdd.findIndex((obj) => obj.type === element['type'] && obj.element === element['name']);
			const cardinality = cardinalityToAdd[index]['cardinality'];
			return (element = {
				isReference: element.isReference,
				name: element.name,
				type: element.type,
				cardinality: cardinality,
			});
		});

		// get string version of Elements in Type to display in mapping grid
		elementsInTypeString = elementsInTypeToAdd.map((element) => {
			return element.name + '(' + element.cardinality + ')\n';
		});
	}

	// Map SSGT Table Modal results to Mapping Document terminology
	const mappedUpdatedData = {
		targetNSPrefix: updatedData.prefix,
		targetPropertyName: updatedData.name,
		typePrefix: updatedData.typePrefix,
		targetTypeName: updatedData.name,
		qualifiedDataType: updatedData.typeName,
		targetDefinition: updatedData.definition,
		isAbstract: updatedData.isAbstract,
		targetURI: updatedData.uri,
		isReference: updatedData.isReference,
		elementsInType: elementsInTypeToAdd,
		elementsInTypeString: elementsInTypeString,
	};

	const propertiesToUpdate = Object.keys(mappedUpdatedData);

	// update or add property to selected row
	for (let i = 0; i < propertiesToUpdate.length; i++) {
		const property = propertiesToUpdate[i];
		rowToUpdate[property] = mappedUpdatedData[property];
	}

	// Replace the sheet entry with the updated row
	const updatedSheet = sheetToUpdate.map((row) => {
		if (row.key === keyToUpdate) {
			return rowToUpdate;
		} else {
			return row;
		}
	});

	switch (sheetName) {
		case 'Property':
			setSessionValue(sessionVar.unsaved_property_sheet, updatedSheet, actionTypes.UPDATE_PROPERTY_SHEET);
			break;
		case 'Type':
			setSessionValue(sessionVar.unsaved_type_sheet, updatedSheet, actionTypes.UPDATE_TYPE_SHEET);
			break;
		case 'Namespace':
			setSessionValue(sessionVar.unsaved_namespace_sheet, updatedSheet, actionTypes.UPDATE_NAMESPACE_SHEET);
			break;
		default:
			break;
	}
}

export function getNextRowKey(sheet) {
	let maxKey = 0;

	sheet.forEach((row) => {
		if (row['key'] > maxKey) {
			maxKey = row['key'];
		}
	});

	return maxKey + 1;
}

export function addRowToSheet(sheetName, dataToAdd = null) {
	// Fetch most recent state to avoid any refreshing/overwriting issues
	const state = store.getState();
	// if a subset schema exists, delete it as it is outdated
	if (state.mpd.isRequiredArtifactUploaded.subset) {
		deleteSubsetTranslate(true, false);
	}

	if (dataToAdd) {
		var nextKey;
		var sheet;
		switch (sheetName) {
			case mapDocSheetNames.propertySheet:
				sheet = state.mappingDoc.propertySheet;
				nextKey = getNextRowKey(sheet);
				dataToAdd['key'] = nextKey;
				setSessionValue(sessionVar.unsaved_property_sheet, [dataToAdd, ...sheet], actionTypes.UPDATE_PROPERTY_SHEET);
				break;
			case mapDocSheetNames.typeSheet:
				sheet = state.mappingDoc.typeSheet;
				nextKey = getNextRowKey(sheet);
				dataToAdd['key'] = nextKey;
				setSessionValue(sessionVar.unsaved_type_sheet, [dataToAdd, ...sheet], actionTypes.UPDATE_TYPE_SHEET);
				break;
			case mapDocSheetNames.typeHasPropertySheet:
				sheet = state.mappingDoc.typeHasPropertySheet;
				nextKey = getNextRowKey(sheet);
				dataToAdd['key'] = nextKey;
				setSessionValue(sessionVar.unsaved_type_has_property_sheet, [dataToAdd, ...sheet], actionTypes.UPDATE_TYPE_HAS_PROPERTY_SHEET);
				break;
			case mapDocSheetNames.codesFacetsSheet:
				sheet = state.mappingDoc.codesFacetsSheet;
				nextKey = getNextRowKey(sheet);
				dataToAdd['key'] = nextKey;
				setSessionValue(sessionVar.unsaved_codes_facets_sheet, [dataToAdd, ...sheet], actionTypes.UPDATE_CODES_FACETS_SHEET);
				break;
			case mapDocSheetNames.namespaceSheet:
				sheet = state.mappingDoc.namespaceSheet;
				nextKey = getNextRowKey(sheet);
				dataToAdd['key'] = nextKey;
				setSessionValue(sessionVar.unsaved_namespace_sheet, [dataToAdd, ...sheet], actionTypes.UPDATE_NAMESPACE_SHEET);
				break;
			case mapDocSheetNames.localTerminologySheet:
				sheet = state.mappingDoc.localTerminologySheet;
				nextKey = getNextRowKey(sheet);
				dataToAdd['key'] = nextKey;
				setSessionValue(sessionVar.unsaved_local_terminology_sheet, [dataToAdd, ...sheet], actionTypes.UPDATE_LOCAL_TERMINOLOGY_SHEET);
				break;
			case mapDocSheetNames.typeUnionSheet:
				sheet = state.mappingDoc.typeUnionSheet;
				nextKey = getNextRowKey(sheet);
				dataToAdd['key'] = nextKey;
				setSessionValue(sessionVar.unsaved_type_union_sheet, [dataToAdd, ...sheet], actionTypes.UPDATE_TYPE_UNION_SHEET);
				break;
			case mapDocSheetNames.metadataSheet:
				sheet = state.mappingDoc.metadataSheet;
				nextKey = getNextRowKey(sheet);
				dataToAdd['key'] = nextKey;
				setSessionValue(sessionVar.unsaved_metadata_sheet, [dataToAdd, ...sheet], actionTypes.UPDATE_METADATA_SHEET);
				break;
			default:
			// do nothing
		}
	}
}

export const MapCustomJson = (arr, hdr) => {
	const propertyArray = [];
	const typeArray = [];

	// This code handles multiple worksheets in a custom mapping spreadsheet. Saving for potential use in a future release
	// // Property sheet
	// arr[0].forEach(function (row, i) {
	// 	propertyArray.push({
	//   /* property objects here */
	// 	})
	// })
	// // Type Sheet
	// arr[1].forEach(function (row, i) {
	// 	typeArray.push({
	//   /* type objects here */
	//  })
	// })

	arr.forEach(function (row) {
		for (let i in row) {
			// if row is empty skip it
			if (
				row[i][hdr.property.sourceNSPrefixKey] ||
				row[i][hdr.property.sourcePropertyName] ||
				row[i][hdr.property.dataType] ||
				row[i][hdr.property.sourceDefinition] ||
				row[i][hdr.property.sourceSampleValue] ||
				row[i][hdr.property.mappingCode] ||
				row[i][hdr.property.targetNSPrefix] ||
				row[i][hdr.property.targetPropertyName] ||
				row[i][hdr.property.qualifiedDataType] ||
				row[i][hdr.property.targetDefinition] ||
				row[i][hdr.property.substitutionGroup] ||
				row[i][hdr.property.isAbstract] ||
				row[i][hdr.property.style] ||
				row[i][hdr.property.keywords] ||
				row[i][hdr.property.exampleContent] ||
				row[i][hdr.property.usageInfo]
			) {
				// Property sheet
				propertyArray.push({
					key: i,
					sourceNSPrefix: row[i][hdr.property.sourceNSPrefixKey],
					sourcePropertyName: row[i][hdr.property.sourcePropertyName],
					dataType: row[i][hdr.property.dataType],
					sourceDefinition: row[i][hdr.property.sourceDefinition],
					sourceSampleValue: row[i][hdr.property.sourceSampleValue],
					mappingCode: row[i][hdr.property.mappingCode],
					targetNSPrefix: row[i][hdr.property.targetNSPrefix],
					targetPropertyName: row[i][hdr.property.targetPropertyName],
					qualifiedDataType: row[i][hdr.property.qualifiedDataType],
					targetDefinition: row[i][hdr.property.targetDefinition],
					substitutionGroup: row[i][hdr.property.substitutionGroup],
					isAbstract: row[i][hdr.property.isAbstract] === true ? 'TRUE' : 'FALSE',
					style: row[i][hdr.property.style] === 'attribute' ? 'attribute' : 'element',
					keywords: row[i][hdr.property.keywords],
					exampleContent: row[i][hdr.property.exampleContent],
					usageInfo: row[i][hdr.property.usageInfo],
				});
			}

			// if row is empty skip it
			if (
				row[i][hdr.type.sourceNSPrefixKey] ||
				row[i][hdr.type.sourceTypeName] ||
				row[i][hdr.type.sourceParentBaseType] ||
				row[i][hdr.type.sourceDefinition] ||
				row[i][hdr.type.mappingCode] ||
				row[i][hdr.type.targetNSPrefix] ||
				row[i][hdr.type.targetTypeName] ||
				row[i][hdr.type.elementsInTypeString] ||
				row[i][hdr.type.targetParentBaseType] ||
				row[i][hdr.type.targetDefinition] ||
				row[i][hdr.type.style]
			) {
				// Type Sheet
				typeArray.push({
					key: i,
					sourceNSPrefix: row[i][hdr.type.sourceNSPrefix],
					sourceTypeName: row[i][hdr.type.sourceTypeName],
					sourceParentBaseType: row[i][hdr.type.sourceParentBaseType],
					sourceDefinition: row[i][hdr.type.sourceDefinition],
					mappingCode: row[i][hdr.type.mappingCode],
					targetNSPrefix: row[i][hdr.type.targetNSPrefix],
					targetTypeName: row[i][hdr.type.targetTypeName],
					elementsInTypeString: row[i][hdr.type.elementsInTypeString],
					targetParentBaseType: row[i][hdr.type.targetParentBaseType],
					targetDefinition: row[i][hdr.type.targetDefinition],
					style: row[i][hdr.type.style] !== '' && row[i][hdr.type.style] != null ? row[i][hdr.type.style] : 'Object',
				});
			}
		}
	});

	setSessionValue(sessionVar.unsaved_property_sheet, propertyArray, actionTypes.UPDATE_PROPERTY_SHEET);
	setSessionValue(sessionVar.unsaved_type_sheet, typeArray, actionTypes.UPDATE_TYPE_SHEET);
};

function MapJson(arr) {
	const propertyArray = [];
	const typeArray = [];
	const typeHasPropertyArray = [];
	const codesFacetsArray = [];
	const nameSpaceArray = [];
	const localTerminologyArray = [];
	const typeUnionArray = [];
	const metadataArray = [];

	// Property Sheet is at index 0 in sheetsArray
	arr[0].forEach(function (row, i) {
		// check if 'Data Type' column exists to identify non-header row
		if (row['Data Type'] !== '' && row['Data Type'] != null) {
			// The Excel Sheet has a few headers that include a line break. These need to use RegEx to access them.
			const mappingCodeKey = Object.keys(row).filter(function (key) {
				return /^Mapping\s+Code$/.test(key);
			});
			const sourceNSPrefixKey = Object.keys(row).filter(function (key) {
				return /^Source\s+NS Prefix$/.test(key);
			});
			const targetNSPrefixKey = Object.keys(row).filter(function (key) {
				return /^Target\s+NS Prefix$/.test(key);
			});
			const isAbstractKey = Object.keys(row).filter(function (key) {
				return /Is Abstract/.test(key);
			});
			const styleKey = Object.keys(row).filter(function (key) {
				return /Style/.test(key);
			});
			propertyArray.push({
				key: i,
				sourceNSPrefix: row[sourceNSPrefixKey],
				sourcePropertyName: row['Property Name 1'],
				dataType: row['Data Type'],
				sourceDefinition: row['Definition 1'],
				mappingCode: row[mappingCodeKey],
				targetNSPrefix: row[targetNSPrefixKey],
				targetPropertyName: row['Property Name 2'],
				qualifiedDataType: row['Qualified Data Type'],
				targetDefinition: row['Definition 2'],
				substitutionGroup: row['Substitution Group 2'],
				isAbstract: row[isAbstractKey] === true ? 'TRUE' : 'FALSE',
				style: row[styleKey] === 'attribute' ? 'attribute' : 'element',
				keywords: row['Keywords'],
				exampleContent: row['Example Content'],
				usageInfo: row['Usage Info'],
			});
		}
	});

	setSessionValue(sessionVar.unsaved_property_sheet, propertyArray, actionTypes.UPDATE_PROPERTY_SHEET);

	// Type Sheet is at index 1 in sheetsArray
	arr[1].forEach(function (row, i) {
		// Unlike the other sheets, the Type Sheet did not have header rows throughout in the example provided, so there is no need to check if it should exclude some rows (i.e. no if statement here)
		// The Excel Sheet has a few headers that include a line break. These need to use RegEx to access them.
		const mappingCodeKey = Object.keys(row).filter(function (key) {
			return /^Mapping\s+Code$/.test(key);
		});
		const sourceNSPrefixKey = Object.keys(row).filter(function (key) {
			return /^Source\s+NS Prefix$/.test(key);
		});
		const targetNSPrefixKey = Object.keys(row).filter(function (key) {
			return /^Target\s+NS Prefix$/.test(key);
		});
		const styleKey = Object.keys(row).filter(function (key) {
			return /Style/.test(key);
		});
		typeArray.push({
			key: i,
			sourceNSPrefix: row[sourceNSPrefixKey],
			sourceTypeName: row['Type Name 1'],
			sourceParentBaseType: row['Parent / Base Type 1'],
			sourceDefinition: row['Definition 1'],
			mappingCode: row[mappingCodeKey],
			targetNSPrefix: row[targetNSPrefixKey],
			targetTypeName: row['Type Name 2'],
			targetParentBaseType: row['Parent / Base Type 2'],
			targetDefinition: row['Definition 2'],
			style: row[styleKey] !== '' && row[styleKey] != null ? row[styleKey] : 'Object',
		});
	});

	setSessionValue(sessionVar.unsaved_type_sheet, typeArray, actionTypes.UPDATE_TYPE_SHEET);

	// Type-Has-Property Sheet is at index 2 in sheetsArray
	arr[2].forEach(function (row, i) {
		// check if 'Property Name' column exists to identify non-header row
		if (row['Property Name 1'] !== '' && row['Property Name 1'] != null) {
			// The Excel Sheet has a few headers that include a line break. These need to use RegEx to access them.
			const mappingCodeKey = Object.keys(row).filter(function (key) {
				return /^Mapping\s+Code$/.test(key);
			});
			const sourceTypeNSKey = Object.keys(row).filter(function (key) {
				return /^Source\s+Type NS$/.test(key);
			});
			const targetTypeNSKey = Object.keys(row).filter(function (key) {
				return /^Target\s+Type NS$/.test(key);
			});
			const targetMinKey = Object.keys(row).filter(function (key) {
				return /^Min[\s\S]+=0\)$/.test(key);
			});
			const targetMaxKey = Object.keys(row).filter(function (key) {
				return /^Max[\s\S]+unbounded\)$/.test(key);
			});
			const definitionKey = Object.keys(row).filter(function (key) {
				return /Definition/.test(key);
			});

			typeHasPropertyArray.push({
				key: i,
				sourceTypeNS: row[sourceTypeNSKey],
				sourceTypeName: row['Type Name 1'],
				sourcePropertyNS: row['Property NS 1'],
				sourcePropertyName: row['Property Name 1'],
				sourceMin: row['Min 1'],
				sourceMax: row['Max 1'],
				mappingCode: row[mappingCodeKey],
				targetTypeNS: row[targetTypeNSKey],
				targetTypeName: row['Type Name 2'],
				targetPropertyNS: row['Property NS 2'],
				targetPropertyName: row['Property Name 2'],
				targetMin: row[targetMinKey] !== '' && row[targetMinKey] != null ? row[targetMinKey] : 0,
				targetMax: row[targetMaxKey] !== '' && row[targetMaxKey] != null ? row[targetMaxKey] : 'unbounded',
				targetDefinition: row[definitionKey],
			});
		}
	});

	setSessionValue(sessionVar.unsaved_type_has_property_sheet, typeHasPropertyArray, actionTypes.UPDATE_TYPE_HAS_PROPERTY_SHEET);

	// Codes | Facets Sheet is at index 3 in sheetsArray
	arr[3].forEach(function (row, i) {
		// Unlike the other sheets, the Codes | Facets Sheet did not have header rows throughout in the example provided, so there is no need to check if it should exclude some rows (i.e. no if statement here)
		// The Excel Sheet has a few headers that include a line break. These need to use RegEx to access them.
		const mappingCodeKey = Object.keys(row).filter(function (key) {
			return /^Mapping\s+Code$/.test(key);
		});
		const sourceNSPrefixKey = Object.keys(row).filter(function (key) {
			return /^Source\s+NS Prefix$/.test(key);
		});
		const targetNSPrefixKey = Object.keys(row).filter(function (key) {
			return /^Target\s+NS Prefix$/.test(key);
		});
		const sourceKindOfFacetKey = Object.keys(row).filter(function (key) {
			return /Kind of Facet 1/.test(key);
		});
		const targetKindOfFacetKey = Object.keys(row).filter(function (key) {
			return /Kind of Facet 2/.test(key);
		});
		codesFacetsArray.push({
			key: i,
			sourceNSPrefix: row[sourceNSPrefixKey],
			sourceTypeName: row['Type Name 1'],
			sourceValue: row['Value 1'],
			sourceDefinition: row['Definition 1'],
			sourceKindOfFacet: row[sourceKindOfFacetKey] !== '' && row[sourceKindOfFacetKey] != null ? row[sourceKindOfFacetKey] : 'enumerated',
			mappingCode: row[mappingCodeKey],
			targetNSPrefix: row[targetNSPrefixKey],
			targetTypeName: row['Type Name 2'],
			targetValue: row['Value 2'],
			targetDefinition: row['Definition 2'],
			targetKindOfFacet: row[targetKindOfFacetKey] !== '' && row[targetKindOfFacetKey] != null ? row[targetKindOfFacetKey] : 'enumerated',
		});
	});

	setSessionValue(sessionVar.unsaved_codes_facets_sheet, codesFacetsArray, actionTypes.UPDATE_CODES_FACETS_SHEET);

	// Namespace Sheet is at index 4 in sheetsArray
	arr[4].forEach(function (row, i) {
		// Unlike the other sheets, the Codes | Facets Sheet did not have header rows throughout in the example provided, so there is no need to check if it should exclude some rows (i.e. no if statement here)
		// The Excel Sheet has a few headers that include a line break. These need to use RegEx to access them.
		const mappingCodeKey = Object.keys(row).filter(function (key) {
			return /^Mapping\s+Code$/.test(key);
		});
		const sourceNSPrefixKey = Object.keys(row).filter(function (key) {
			return /^Source\s+NS Prefix$/.test(key);
		});
		const targetNSPrefixKey = Object.keys(row).filter(function (key) {
			return /^Target\s+NS Prefix$/.test(key);
		});
		const ndrVersionKey = Object.keys(row).filter(function (key) {
			return /NDR Version/.test(key);
		});
		nameSpaceArray.push({
			key: i,
			sourceNSPrefix: row[sourceNSPrefixKey],
			sourceURI: row['URI 1'],
			sourceDefinition: row['Definition 1'],
			mappingCode: row[mappingCodeKey],
			targetNSPrefix: row[targetNSPrefixKey],
			style: row['Style 2'],
			targetURI: row['URI 2'],
			targetDefinition: row['Definition 2'],
			ndrVersion: row[ndrVersionKey] !== '' && row[ndrVersionKey] != null ? row[ndrVersionKey] : 4.0,
			ndrTarget: row['NDR Target 2'],
			fileName: row['File Name 2'],
			relativePath: row['Relative Path 2'],
			draftVersion: row['Draft Version 2'],
		});
	});

	setSessionValue(sessionVar.unsaved_namespace_sheet, nameSpaceArray, actionTypes.UPDATE_NAMESPACE_SHEET);

	// Local Terminology Sheet is at index 5 in sheetsArray
	arr[5].forEach(function (row, i) {
		// Unlike the other sheets, the Codes | Facets Sheet did not have header rows throughout in the example provided, so there is no need to check if it should exclude some rows (i.e. no if statement here)
		// The Excel Sheet has a few headers that include a line break. These need to use RegEx to access them.
		const mappingCodeKey = Object.keys(row).filter(function (key) {
			return /^Mapping\s+Code$/.test(key);
		});
		const sourceNSPrefixKey = Object.keys(row).filter(function (key) {
			return /^Source\s+NS Prefix$/.test(key);
		});
		const targetNSPrefixKey = Object.keys(row).filter(function (key) {
			return /^Target\s+NS Prefix$/.test(key);
		});
		localTerminologyArray.push({
			key: i,
			sourceNSPrefix: row[sourceNSPrefixKey],
			sourceTerm: row['Term 1'],
			sourceLiteral: row['Literal 1'],
			sourceDefinition: row['Definition 1'],
			mappingCode: row[mappingCodeKey],
			targetNSPrefix: row[targetNSPrefixKey],
			targetTerm: row['Term 2'],
			targetLiteral: row['Literal 2'],
			targetDefinition: row['Definition 2'],
		});
	});

	setSessionValue(sessionVar.unsaved_local_terminology_sheet, localTerminologyArray, actionTypes.UPDATE_LOCAL_TERMINOLOGY_SHEET);

	// Type Union Sheet is at index 6 in sheetsArray
	arr[6].forEach(function (row, i) {
		// Unlike the other sheets, the Codes | Facets Sheet did not have header rows throughout in the example provided, so there is no need to check if it should exclude some rows (i.e. no if statement here)
		// The Excel Sheet has a few headers that include a line break. These need to use RegEx to access them.
		const mappingCodeKey = Object.keys(row).filter(function (key) {
			return /^Mapping\s+Code$/.test(key);
		});
		const sourceUnionNSKey = Object.keys(row).filter(function (key) {
			return /^Source\s+Union NS$/.test(key);
		});
		const targetUnionNSKey = Object.keys(row).filter(function (key) {
			return /^Target\s+Union NS$/.test(key);
		});
		typeUnionArray.push({
			key: i,
			sourceUnionNS: row[sourceUnionNSKey],
			sourceUnionTypeName: row['Union Type Name 1'],
			sourceMemberNS: row['Member NS 1'],
			sourceMemberTypeName: row['Member Type Name 1'],
			mappingCode: row[mappingCodeKey],
			targetUnionNS: row[targetUnionNSKey],
			targetUnionTypeName: row['Union Type Name 2'],
			targetMemberNS: row['Member NS 2'],
			targetMemberTypeName: row['Member Type Name 2'],
		});
	});

	setSessionValue(sessionVar.unsaved_type_union_sheet, typeUnionArray, actionTypes.UPDATE_TYPE_UNION_SHEET);

	// Metadata Sheet is at index 7 in sheetsArray
	arr[7].forEach(function (row, i) {
		// Unlike the other sheets, the Codes | Facets Sheet did not have header rows throughout in the example provided, so there is no need to check if it should exclude some rows (i.e. no if statement here)
		// The Excel Sheet has a few headers that include a line break. These need to use RegEx to access them.
		const mappingCodeKey = Object.keys(row).filter(function (key) {
			return /^Mapping\s+Code$/.test(key);
		});
		const sourceMetadataNSKey = Object.keys(row).filter(function (key) {
			return /^Source\s+Metadata NS$/.test(key);
		});
		const targetMetadataNSKey = Object.keys(row).filter(function (key) {
			return /^Target\s+Metadata NS 2$/.test(key);
		});
		metadataArray.push({
			key: i,
			sourceMetadataNS: row[sourceMetadataNSKey],
			sourceMetadataTypeName: row['Metadata Type Name 1'],
			sourceAppliesToNS: row['Applies to NS 1'],
			sourceAppliesToTypeName: row['Applies to Type Name 1'],
			mappingCode: row[mappingCodeKey],
			targetMetadataNS: row[targetMetadataNSKey],
			targetMetadataTypeName: row['Metadata Type Name 2'],
			targetAppliesToNS: row['Applies to NS 2'],
			targetAppliesToTypeName: row['Applies to Type Name 2'],
		});
	});

	setSessionValue(sessionVar.unsaved_metadata_sheet, metadataArray, actionTypes.UPDATE_METADATA_SHEET);
}
