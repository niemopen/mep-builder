import { create } from 'xmlbuilder2';
import { createUpdateFile } from './UploadFileUtil';
import { getFilesByLabel, getFolderPath, artifactTags, getFilesAll, getFilesByTag } from './ArtifactTreeUtil';
import store from '../redux/store';
import { updateArtifactChecklist } from '../Shared/ArtifactChecklist';
import { niemReferenceBaseURL } from '../config/config';
import { isStringFieldValid } from './FieldValidationUtil';

export function getCatalogName(release) {
	// the NIEM 3.0 Specification document uses mpd-catalog.xml
	// the NIEM 5.0 Specification document uses iepd-catalog.xml
	if (release >= 5.0) {
		return 'iepd-catalog.xml';
	} else {
		return 'mpd-catalog.xml';
	}
}

const getPackageInformation = (metaData) => {
	const packgeInfo = {
		'c:AuthoritativeSource': {
			'nc:EntityOrganization': {
				'nc:OrganizationName': metaData.OrganizationName,
				'nc:OrganizationPrimaryContactInformation': {
					'nc:ContactEmailID': metaData.Email,
					'nc:ContactEntity': { 'nc:EntityPerson': { 'nc:PersonName': { 'nc:PersonFullName': metaData.PointOfContact } } },
				},
			},
		},
		'c:CreationDate': metaData.CreationDate,
		'c:StatusText': metaData.Status,
		'c:DomainText': metaData.COITags,
		'c:ExchangePartnerName': metaData.ExchangeTags,
	};

	if (!isStringFieldValid(metaData.CreationDate)) {
		delete packgeInfo['c:CreationDate'];
	}
	return packgeInfo;
};

const getRelativePath = (artifactTree, nodeId) => {
	// this function returns the file path relative to the mpd catalog (which is in the root folder)

	// get absolute folder path
	const absolutePath = getFolderPath(artifactTree, nodeId);

	// get packageName from reducer
	const state = store.getState();
	const packageName = state.mpd.packageName;

	return absolutePath.replace(packageName + '/', '');
};

const getIEPConformanceTargets = (artifactTree) => {
	const conformanceTargetJSON = {};
	let checkedFiles;
	let filePath;

	// check if xml-catalog.xml exists
	checkedFiles = getFilesByLabel(artifactTree, 'xml-catalog.xml');
	if (checkedFiles && checkedFiles.length !== 0) {
		// get relative file path
		filePath = getRelativePath(artifactTree, checkedFiles[0].nodeId);

		// add to conformance target JSON
		conformanceTargetJSON['c:XMLSchemaValid'] = {
			'c:XMLCatalog': {
				'@': {
					'c:pathURI': filePath,
				},
			},
		};
	}

	// check if sample files exist
	checkedFiles = getFilesByTag(artifactTree, artifactTags.sample);
	if (checkedFiles && checkedFiles.length !== 0) {
		conformanceTargetJSON['c:IEPSampleXMLDocument'] = [];
		for (let i = 0; i < checkedFiles.length; i++) {
			// get relative file path
			filePath = getRelativePath(artifactTree, checkedFiles[i].nodeId);

			// add to conformance target JSON
			conformanceTargetJSON['c:IEPSampleXMLDocument'].push({
				'@': {
					'c:pathURI': filePath,
				},
			});
		}
	}

	return conformanceTargetJSON;
};

// Logic to determine the element name for each artifact in the catalog
const getElementName = (f, changeLogElement, artifactTree) => {
	// Ignore items that were already created in the Conformance Target section or is this mpdcatalog document
	if (f.label !== 'mpd-catalog.xml' && f.label !== 'iepd-catalog.xml' && f.label !== 'xml-catalog.xml' && f.tag !== artifactTags.sample) {
		// check based on tag
		switch (f.tag) {
			case artifactTags.readme:
				return 'c:ReadMe';
			case artifactTags.changelog:
				return changeLogElement;
			case artifactTags.conformance:
				return 'c:ConformanceAssertion';
			case artifactTags.wantlist:
				return 'c:Wantlist';
			case artifactTags.subsetSchema:
				return 'c:SubsetSchemaDocument';
			default:
				break;
		}

		// check for schema documents
		const schemaDocRegEx = new RegExp('^.*.xsd$');
		if (schemaDocRegEx.test(f.label)) {
			let relativePath = getRelativePath(artifactTree, f.nodeId);

			if (relativePath.includes('extension/')) {
				return 'c:ExtensionSchemaDocument';
			} else if (relativePath.includes('external/')) {
				return 'c:ExternalSchemaDocument';
			} else {
				return 'c:ReferenceSchemaDocument';
			}
		}

		// if inconclusive based on tag, check based on file name
		const businessRuleRegEx = new RegExp('^.*business.rule.*$');
		if (f.label.includes('changelog')) {
			return changeLogElement;
		} else if (f.label.includes('readme')) {
			return 'c:ReadMe';
		} else if (f.label.includes('wantlist')) {
			return 'c:Wantlist';
		} else if (f.label.includes('conformance-assertion')) {
			return 'c:ConformanceAssertion';
		} else if (businessRuleRegEx.test(f.label)) {
			return 'c:BusinessRulesArtifact';
		}

		return 'c:File'; // default element name
	}

	return false;
};

const getArtifactElements = (artifactTree, changeLogElement) => {
	const artifactElements = {};
	let elementName;
	const files = getFilesAll(artifactTree);

	files.forEach((file) => {
		// determine element name
		elementName = getElementName(file, changeLogElement, artifactTree);

		if (elementName) {
			// get relative path
			let relativePath = getRelativePath(artifactTree, file.nodeId);

			// add element
			artifactElements[elementName] = {
				'@': {
					'c:pathURI': relativePath,
				},
			};
		}
	});

	return artifactElements;
};

export async function UpdateMPDCatalog(artifactTree, data, packageId) {
	// NOTE: The MPD Catalog is generated based off of the appropriate MPD/IEPD Specification document (https://niem.github.io/reference/specifications/iepd/)

	const metaData = data.root;
	const catalogName = getCatalogName(metaData.Release);
	let catalogElement;
	let changeLogElement;

	// version is a combination of version + status + status number, default value is 1
	const version = metaData.Status ? metaData.Version + metaData.Status + metaData.StatusNo : metaData.Version ? metaData.Version : 1;

	// create xml from document
	const doc = create({ encoding: 'UTF-8' });

	// main element
	if (catalogName === 'mpd-catalog.xml') {
		// based on 3.0 MPD Specification
		catalogElement = doc.ele('c:Catalog');
		catalogElement
			.att('xmlns:c', niemReferenceBaseURL.replace('https', 'http') + 'resource/mpd/catalog/3.0/')
			.att('xmlns:nc', 'http://release.niem.gov/niem/niem-core/3.0/')
			.att('xmlns:structures', niemReferenceBaseURL + 'structures/3.0/')
			.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
			.att(
				'xsi:schemaLocation',
				niemReferenceBaseURL.replace('https', 'http') +
					'resource/mpd/catalog/3.0/ ' +
					niemReferenceBaseURL +
					'specification/model-package-description/3.0.1/xsd-mpd-catalog/mpd-catalog-3.0.xsd'
			);
		catalogElement = catalogElement.ele('c:MPD');
		catalogElement
			.att('c:mpdURI', metaData.URI)
			.att(
				'c:mpdClassURIList',
				niemReferenceBaseURL +
					'specification/model-package-description/3.0/#MPD ' +
					niemReferenceBaseURL +
					'specification/model-package-description/3.0/#IEPD'
			)
			.att('c:mpdName', metaData.PackageName)
			.att('c:mpdVersionID', version)
			.ele({ 'nc:DescriptionText': metaData.Description });

		catalogElement.ele({ 'c:MPDInformation': getPackageInformation(metaData) });

		// get artifact element name
		changeLogElement = 'c:MPDChangeLog';
	} else {
		// based on 5.0 IEPD Specification
		catalogElement = doc.ele('c:IEPDCatalog');
		catalogElement
			.att('xmlns:c', niemReferenceBaseURL.replace('https', 'http') + 'resource/iepd/catalog/5.0/')
			.att('xmlns:nc', 'http://release.niem.gov/niem/niem-core/5.0/')
			.att('xmlns:structures', 'http://release.niem.gov/niem/structures/5.0/')
			.att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
			.att(
				'xsi:schemaLocation',
				niemReferenceBaseURL.replace('https', 'http') +
					'resource/iepd/catalog/5.0/ ' +
					niemReferenceBaseURL +
					'specification/model-package-description/5.0/iepd-catalog-schema/iepd-catalog.xsd'
			)
			.att({ 'c:iepdName': metaData.PackageName })
			.att({ 'c:iepdVersionID': version })
			.att({ 'c:iepdURI': metaData.URI }) // currently inputed by the user on the Publish and Implement phase
			.att({
				'c:iepdConformanceTargetIdentifierURIList': niemReferenceBaseURL + 'resource/iepd/catalog/5.0/#IEPD',
			})
			.ele({ 'nc:DescriptionText': metaData.Description });

		catalogElement.ele({ 'c:IEPDInformation': getPackageInformation(metaData) });

		// get artifact element name
		changeLogElement = 'c:IEPDChangeLog';
	}

	// IEP ConformanceTargets (same for both specifications)
	catalogElement.ele({ 'c:IEPConformanceTarget': getIEPConformanceTargets(artifactTree) });

	// Artifacts (same for both specifications), check if they exist first
	catalogElement.ele(getArtifactElements(artifactTree, changeLogElement));

	// xml document string
	const xml = doc.end({ prettyPrint: true });

	// add file to DB and Artifact Tree
	const fileObj = new File([xml], catalogName, { type: 'text/xml' });
	const uploadResult = await createUpdateFile(artifactTree, packageId, fileObj, catalogName, '0', false, artifactTags.catalog);

	if (uploadResult.isSuccess) {
		await updateArtifactChecklist(packageId, 'catalog', uploadResult.isSuccess);
	}
}
