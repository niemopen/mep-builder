import * as actionTypes from '../redux/actions';
import store from '../redux/store';
import { create } from 'xmlbuilder2';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { handleError, trackedErrorSources } from './ErrorHandleUtil';

/*
Wantlist Generation Rules (WGR) - The following will be the rules that define the generation of the wantlist:

WGR 1: The wantlist shall be an XML document
WGR 2: The root element is ‘w:WantList’ with the following attributes:
       2.1 The package release version as indicated in the MEP Metadata
       2.2 w:product="NIEM" (this is static and will not change)
       2.3 The nillableDefault value as indicated by the user on the Build and Validate page prior to Generating the Wantlist
       2.4 xmlns:w=http://niem.gov/niem/wantlist/2.2 (this is static, the version is not expected to change)
       2.5 The URI’s of any and all namespaces included in the wantlist.
           - Ex: If the ‘biom’ namespace is included in an Element or Type, then the following URI will be included: xmlns:biom=http://release.niem.gov/niem/domains/biometrics/3.0/
WGR 3: For every Property mapped in the Property Sheet, there will be an ‘w:Element’ element with the following attributes:
       3.1 Element name including the namespace
       3.2 isReference value provided by SSGT
       3.3 nillable value that should be the same as the nillableDefault value indicated by the user
WGR 4: There are three cases when a ‘w:Type’ element should be included in the wantlist. Types will have a name attribute including the namespace. They will also have an isRequested value that should be false unless it falls under the 4.1 scenario:
       4.1 When the user has mapped the Type directly in the Type sheet. The isRequested value shall be ‘true’
       4.2 When a Property/Element ending with the word ‘Code’ has been added via the Property Sheet, then the corresponding ‘SimpleType’ should be added. It will include multiple ‘w:Facet’ elements nested inside.
       4.3 User includes properties within a type. The type will include ‘ElementInType’ in the wantlist. The isRequested value shall be 'false'
*/

const getGTRINamespaces = async (release) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.get(baseURL + `GTRIAPI/getAllNamespaces/${release}`)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.wantlist);
			});
	}
};

const getGTRIFacets = async (release, qname) => {
	const state = store.getState();
	if (!state.error.systemErrorOccurred) {
		return axios
			.get(baseURL + `GTRIAPI/getFacets/${release}/${qname}`)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				handleError(error, trackedErrorSources.wantlist);
			});
	}
};

async function addCodeSimpleType(wantlist, typePrefixName, isRequested, release) {
	// handle rare cases where property is directly associated with a SimpleType. Replace string with 'Type' to mimic the more normal case. This would stop the next line from resulting in types with incorrect names of 'SimpleSimpleType'
	let simpleTypeName = typePrefixName.replace('SimpleType', 'Type');

	// Replace 'Type' with 'SimpleType'. This is the more normal case.
	simpleTypeName = simpleTypeName.replace('Type', 'SimpleType');

	// get facets from GTRI getFacets API search
	const elementResults = await getGTRIFacets(release, simpleTypeName);
	try {
		if (Object.keys(elementResults).length !== 0) {
			const facetResults = elementResults;

			// for every Facet (if exists), save facet definition
			if (facetResults) {
				// get all Facet data
				const facetList = [];
				for (const i in facetResults) {
					if (facetResults[i].value !== undefined) {
						facetList.push({ facetType: facetResults[i].category, facetValue: facetResults[i].value });
					}
				}

				// add Type with facets as children
				const typeElement = wantlist.ele('w:Type').att('w:name', simpleTypeName).att('w:isRequested', isRequested);
				for (const i in facetList) {
					typeElement.ele('w:Facet').att('w:facet', facetList[i].facetType).att('w:value', facetList[i].facetValue);
				}
			}
		} else {
			console.log("Warning: Could not find '" + simpleTypeName + "' in the SSGT search");
		}
		store.dispatch({ type: actionTypes.UPDATE_SSGT_WANTLIST_ERROR, payload: false });
	} catch {
		store.dispatch({ type: actionTypes.UPDATE_SSGT_WANTLIST_ERROR, payload: true });
	}
}

const addElementInType = (wantlist, typeName, elements, isRequested) => {
	// Add Type Element
	const typeElement = wantlist.ele('w:Type').att('w:name', typeName).att('w:isRequested', isRequested);

	// Add Elements in Type as children
	for (const i in elements) {
		const minOccurs = elements[i].cardinality[0];
		const maxOccurs = elements[i].cardinality.split('..')[1];

		typeElement
			.ele('w:ElementInType')
			.att('w:name', elements[i].name)
			.att('w:isReference', elements[i].isReference)
			.att('w:minOccurs', minOccurs)
			.att('w:maxOccurs', maxOccurs);
	}
};

async function getNamespaceLib(release) {
	const elementResults = await getGTRINamespaces(release);
	let namespaceResults = [];

	try {
		if (Object.keys(elementResults).length !== 0) {
			namespaceResults = elementResults;
		}
		store.dispatch({ type: actionTypes.UPDATE_SSGT_WANTLIST_ERROR, payload: false });
	} catch {
		store.dispatch({ type: actionTypes.UPDATE_SSGT_WANTLIST_ERROR, payload: true });
	}

	return namespaceResults;
}

// The XML of the wantlist is built using xmlbuilder2
// See https://oozcitak.github.io/xmlbuilder2/ for documentation
export async function generateWantlist(propertySheet, typeSheet, release, nillableDefault) {
	const addedNamespaces = [];

	// Create xml document with Wantlist headers
	// WGR 1: The wantlist shall be an XML document
	let wantlist = create({ encoding: 'UTF-8' })
		// WGR 2: The root element is 'w:WantList'
		.ele('w:WantList')
		.att('w:release', release)
		.att('w:product', 'NIEM')
		.att('w:nillableDefault', nillableDefault)
		.att('xmlns:w', 'http://niem.gov/niem/wantlist/2.2');

	// Property Sheet Elements
	// WGR 3: For every Property mapped in the Property Sheet, there will be an ‘w:Element’ element
	for (const i in propertySheet) {
		// Only SSGT items selected during the mapping process will be added to the wantlist
		if (propertySheet[i].targetPropertyName) {
			wantlist
				.ele('w:Element')
				.att('w:name', propertySheet[i].targetNSPrefix + ':' + propertySheet[i].targetPropertyName)
				.att('w:isReference', propertySheet[i].isReference)
				.att('w:nillable', nillableDefault);
			addedNamespaces.push(propertySheet[i].targetNSPrefix);
		}
	}

	// WGR 4.2: If Property ends with 'Code', add its 'SimpleType'
	// Note: This code below is not combined with the above propertySheet loop to mimic how SSGT adds all the Property Elements first before adding any SimpleTypes
	for (const i in propertySheet) {
		if (propertySheet[i].targetPropertyName) {
			if (propertySheet[i].targetPropertyName.endsWith('Code')) {
				// Passing in Type name of this property
				// The isRequested field should be false if it was not added via the Type sheet by the user
				await addCodeSimpleType(wantlist, propertySheet[i].typePrefix + ':' + propertySheet[i].qualifiedDataType, false, release);
				addedNamespaces.push(propertySheet[i].typePrefix);
			}
		}
	}

	// Type Sheet
	// WGR 4.1 & 4.3
	for (const i in typeSheet) {
		if (typeSheet[i].targetTypeName) {
			if (typeSheet[i].elementsInType.length === 0) {
				// WGR 4.1: The isRequested field should be true if it was added to the Type sheet by the user
				if (typeSheet[i].targetTypeName.endsWith('SimpleType')) {
					// if SimpleType, add CodeSimpleType
					await addCodeSimpleType(wantlist, typeSheet[i].targetNSPrefix + ':' + typeSheet[i].targetTypeName, true, release);
				} else {
					wantlist
						.ele('w:Type')
						.att('w:name', typeSheet[i].targetNSPrefix + ':' + typeSheet[i].targetTypeName)
						.att('w:isRequested', true);
				}
			} else {
				// WGR 4.3: The type will include ‘ElementInType’ in the wantlist. The isRequested field should be false.
				addElementInType(wantlist, typeSheet[i].targetNSPrefix + ':' + typeSheet[i].targetTypeName, typeSheet[i].elementsInType, false);

				const elements = typeSheet[i].elementsInType;
				for (const i in elements) {
					// add namespaces of every element added
					const elementName = elements[i].name;
					const elementNamespace = elementName.substr(0, elementName.indexOf(':'));
					addedNamespaces.push(elementNamespace);
				}
			}
			addedNamespaces.push(typeSheet[i].targetNSPrefix);
		}
	}

	// Namespaces
	// get libary of namespaces from SSGT
	const namespaceLib = await getNamespaceLib(release);
	if (namespaceLib.length !== 0) {
		if (wantlist.toString().includes('</w:WantList>')) {
			store.dispatch({ type: actionTypes.UPDATE_WANTLIST_EMPTY, payload: false });
		} else {
			store.dispatch({ type: actionTypes.UPDATE_WANTLIST_EMPTY, payload: true });
			return false;
		}

		store.dispatch({ type: actionTypes.UPDATE_SSGT_WANTLIST_ERROR, payload: false });
		// Go through namespace library and add the uri's of any added namespace to the wantlist header
		for (const i in namespaceLib) {
			if (addedNamespaces.includes(namespaceLib[i].prefix)) {
				wantlist.att('xmlns:' + namespaceLib[i].prefix, namespaceLib[i].uri);
			}
		}
		return wantlist;
	} else {
		store.dispatch({ type: actionTypes.UPDATE_SSGT_WANTLIST_ERROR, payload: true });
		return false;
	}
}
