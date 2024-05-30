import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Checkbox, Dropdown, Grid, Input, Search, Label } from 'semantic-ui-react';
import Tooltip from '../Shared/Tooltip.js';
import * as tooltipContent from '../Shared/TooltipContent.js';
import * as actionTypes from '../redux/actions';
import axios from 'axios';
import { baseURL } from '../Util/ApiUtil';
import { handleOpenPackage, getExistingPackageData } from '../components/MyHomeTableView';
import { clearUnsavedData } from '../Util/localStorageUtil';
import { releaseOptions } from '../App.js';
import { getSortedMpdDataApi } from '../Util/PackageUtil.js';
import { handleError } from '../Util/ErrorHandleUtil.js';

export const getTypeSearchString = (searchString) => {
	// To incorporate smart search, if user types 'PersonType' as a search string, need to remove 'Type' from the string in order for results to include PersonAssociationType, PersonAugementationType, etc.
	const regEx = new RegExp(/type/gi); // case insensitive
	return searchString.replace(regEx, '');
};

const MEPSearchBar = () => {
	// initialize drop down result list
	let resultsList = {
		'MEP Name': {
			name: 'MEP Name',
			results: [],
		},
		Property: {
			name: 'Property',
			results: [],
		},
		Type: {
			name: 'Type',
			results: [],
		},
	};

	let advSearchValuesInitial = {
		mepNameValue: '',
		propertyValue: '',
		typeValue: '',
		coiValue: '',
		exchangePartnerValue: '',
		ownerValue: '',
		organizationValue: '',
		releaseValue: '',
	};

	const dispatch = useDispatch();
	const searchRef = useRef(null);
	const [isMenuOpen, setIsMenuOpen] = useState(true);
	const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
	const [isMEPNameChecked, setIsMEPNameChecked] = useState(true);
	const [isPropertyChecked, setIsPropertyChecked] = useState(true);
	const [isTypeChecked, setIsTypeChecked] = useState(true);
	const [isCOIchecked, setIsCOIchecked] = useState(false);
	const [isExchangePartnersChecked, setIsExchangePartnersChecked] = useState(false);
	const [isOwnerChecked, setIsOwnerChecked] = useState(false);
	const [isOrganizationChecked, setIsOrganizationChecked] = useState(false);
	const [isIncludeAllReleasesChecked, setIsIncludeAllReleasesChecked] = useState(true);
	const [isIncludePublishedMEPsChecked, setIsIncludePublishedMEPsChecked] = useState(false);
	const [wasChangeMade, setWasChangeMade] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [dropDownResults, setDropwDownResults] = useState(resultsList);
	const [unpublishedPackages, setUnpublishedPackages] = useState([]);
	const [publishedPackages, setPublishedPackages] = useState([]);
	const [openResults, setOpenResults] = useState(false);
	const [advSearchFields, setAdvSearchFields] = useState(advSearchValuesInitial);
	const [selectedReleases, setSelectedReleases] = useState([]);
	const [totalResultsCount, setTotalResultsCount] = useState(0);
	const myHomeActive = useSelector((state) => state.header.myHomeActive);
	const refreshPackages = useSelector((state) => state.home.refreshPackages);
	const deletedPublishedPackageName = useSelector((state) => state.home.deletedPublishedPackageName);
	const deletedUnpublishedPackageName = useSelector((state) => state.home.deletedUnpublishedPackageName);
	const isCopyMEPModalOpen = useSelector((state) => state.copyMEP.isCopyMEPModalOpen);
	const migratedPackageId = useSelector((state) => state.migration.migratedPackageId);
	const generateTranslationActive = useSelector((state) => state.translate.generateTranslationActive);
	const systemErrorOccurred = useSelector((state) => state.error.systemErrorOccurred);

	useEffect(() => {
		// This useEffect will fetch the packages from the db anytime refreshPackages value is true.
		if (refreshPackages === true) {
			// Change Refresh Packages redux value back to false to prevent infinite rendering.
			dispatch({ type: actionTypes.REFRESH_PACKAGES, payload: false });
			let isMounted = true;
			getSortedMpdDataApi().then(({ unpublished, published }) => {
				if (isMounted) {
					setUnpublishedPackages(unpublished);
					setPublishedPackages(published);
				} // only perform state update on mounted component
			});

			return () => {
				isMounted = false; // use effect cleanup to set flag false, if unmounted
			};
		}
	});

	useEffect(() => {
		// fetch packages from the db when changes occur to packages collection
		let isMounted = true;
		getSortedMpdDataApi().then(({ unpublished, published }) => {
			if (isMounted) {
				setUnpublishedPackages(unpublished);
				setPublishedPackages(published);
			} // only perform state update on mounted component
		});
		return () => {
			isMounted = false; // use effect cleanup to set flag false, if unmounted
		};
	}, [myHomeActive, deletedUnpublishedPackageName, deletedPublishedPackageName, generateTranslationActive, isCopyMEPModalOpen, migratedPackageId]);

	useEffect(() => {
		// update search results after changes have been made to search pool
		handleUpdateSearchCriteria();
	}, [publishedPackages]); // only check for changes in one package pool to avoid double rerenders
	// NOTE: Compiler wants more dependencies for this, will break the code without significant changes

	useEffect(() => {
		// show/hide Published Packages
		if (!isIncludePublishedMEPsChecked) {
			dispatch({ type: actionTypes.PUBLISHED_PACKAGES_ACTIVE, payload: false });
		} else {
			dispatch({ type: actionTypes.PUBLISHED_PACKAGES_ACTIVE, payload: true });
		}
	}, [isIncludePublishedMEPsChecked, dispatch]);

	useEffect(() => {
		// update the count of total results found
		setTotalResultsCount(
			dropDownResults['MEP Name'].results.length + dropDownResults.Property.results.length + dropDownResults.Type.results.length
		);
	}, [dropDownResults]);

	// Styles Search Results
	const resultsLayout = ({ categoryContent, resultsContent }) => (
		<div>
			<h3 className='name resultsLayout'>{categoryContent}</h3>
			<div className='results'>{resultsContent}</div>
		</div>
	);

	const categoryRenderer = ({ name }) => {
		return (
			<>
				{/* Only render the total search count label at the top of the results set (before the first category) */}
				{name === 'MEP Name' ? (
					<Label className='totalSearchResults'>
						<strong>
							{totalResultsCount} {totalResultsCount === 1 ? 'result found' : 'results found'}
						</strong>
					</Label>
				) : null}
				<Label className='categoryLayout'>
					{name} ({dropDownResults[name].results.length} {dropDownResults[name].results.length === 1 ? 'result found' : 'results found'})
				</Label>
			</>
		);
	};

	const handleReset = () => {
		// change search back to default values
		setIsMEPNameChecked(true);
		setIsPropertyChecked(true);
		setIsTypeChecked(true);
		setIsIncludeAllReleasesChecked(true);
		setIsIncludePublishedMEPsChecked(false);
		setIsCOIchecked(false);
		setIsExchangePartnersChecked(false);
		setIsOwnerChecked(false);
		setIsOrganizationChecked(false);
		searchChange(null, { value: '' });
		setDropwDownResults(resultsList);
		setAdvSearchFields(advSearchValuesInitial);
		setWasChangeMade(false);
		setIsSelectAllChecked(false);
	};

	const handleSelectAll = () => {
		setWasChangeMade(true);
		setIsSelectAllChecked(!isSelectAllChecked);
		setIsMEPNameChecked(!isMEPNameChecked);
		setIsPropertyChecked(!isPropertyChecked);
		setIsTypeChecked(!isTypeChecked);
		setIsIncludeAllReleasesChecked(!isIncludeAllReleasesChecked);
		setIsIncludePublishedMEPsChecked(!isIncludePublishedMEPsChecked);
		setIsCOIchecked(!setIsCOIchecked);
		setIsExchangePartnersChecked(!setIsExchangePartnersChecked);
		setIsOwnerChecked(!isOwnerChecked);
		setIsOrganizationChecked(!isOrganizationChecked);

		if (isSelectAllChecked) {
			setIsMEPNameChecked(false);
			setIsPropertyChecked(false);
			setIsTypeChecked(false);
			setIsIncludeAllReleasesChecked(false);
			setIsIncludePublishedMEPsChecked(false);
			setIsCOIchecked(false);
			setIsExchangePartnersChecked(false);
			setIsOwnerChecked(false);
			setIsOrganizationChecked(false);
		} else {
			setIsSelectAllChecked(true);
			setIsMEPNameChecked(true);
			setIsPropertyChecked(true);
			setIsTypeChecked(true);
			setIsIncludeAllReleasesChecked(true);
			setIsIncludePublishedMEPsChecked(true);
			setIsCOIchecked(true);
			setIsExchangePartnersChecked(true);
			setIsOwnerChecked(true);
			setIsOrganizationChecked(true);
		}
	};

	const getExtensionsApi = async (packageId) => {
		if (!systemErrorOccurred) {
			return axios
				.get(baseURL + 'MongoRepo/getCustomExtensions/' + packageId)
				.then((response) => {
					return response.data.customExtensions;
				})
				.catch((error) => {
					handleError(error);
					return [];
				});
		} else {
			return [];
		}
	};

	const processInitialSearchResults = (mepNameResults, propertyResults, typeResults) => {
		// attach property and types names to package, remove duplicates, and grab original packageData to pass to advanced search
		const existingUnpublished = []; // track which packages were added
		const existingPublished = []; // track which packages were added
		const unpublishedResults = [];
		const publishedResults = [];
		if (mepNameResults.length === 0 && propertyResults.length === 0 && typeResults.length === 0) {
			// if all selected results are empty, return all packages to continue advanced searching
			return { formattedUnpublished: unpublishedPackages, formattedPublished: publishedPackages };
		}

		mepNameResults.forEach((item) => {
			// seperate unpublished and published
			if (item.ispublished === 'false') {
				const packageData = unpublishedPackages.find(({ PackageId }) => PackageId === item.packageid); // grab original package data
				const isDuplicate = existingUnpublished.includes(item.packageid);
				if (!isDuplicate) {
					unpublishedResults.push({ ...packageData, properties: [], types: [] });
					existingUnpublished.push(item.packageid); // track that it's already been added
				}
			} else {
				const packageData = publishedPackages.find(({ PackageId }) => PackageId === item.packageid); // grab original package data
				const isDuplicate = existingPublished.includes(item.packageid);
				if (!isDuplicate) {
					publishedResults.push({ ...packageData, properties: [], types: [] });
					existingPublished.push(item.packageid); // track that it's already been added
				}
			}
		});

		propertyResults.forEach((item) => {
			// seperate unpublished and published
			if (item.ispublished === 'false') {
				const packageData = unpublishedPackages.find(({ PackageId }) => PackageId === item.packageid);
				const isDuplicate = existingUnpublished.includes(item.packageid);
				if (!isDuplicate) {
					unpublishedResults.push({ ...packageData, properties: [item.propertyname], types: [] });
					existingUnpublished.push(item.packageid);
				} else {
					// if package is already added to results, find it and add the property name to its properties array
					const packageData = unpublishedResults.find(({ PackageId }) => PackageId === item.packageid);
					packageData.properties.push(item.propertyname);
				}
			} else {
				const packageData = publishedPackages.find(({ PackageId }) => PackageId === item.packageid);
				const isDuplicate = existingPublished.includes(item.packageid);
				if (!isDuplicate) {
					publishedResults.push({ ...packageData, properties: [item.propertyname], types: [] });
					existingPublished.push(item.packageid);
				} else {
					// if package is already added to results, find it and add the property name to its properties array
					const packageData = publishedResults.find(({ PackageId }) => PackageId === item.packageid);
					packageData.properties.push(item.propertyname);
				}
			}
		});

		typeResults.forEach((item) => {
			// seperate unpublished and published
			if (item.ispublished === 'false') {
				const packageData = unpublishedPackages.find(({ PackageId }) => PackageId === item.packageid);
				const isDuplicate = existingUnpublished.includes(item.packageid);
				if (!isDuplicate) {
					unpublishedResults.push({ ...packageData, types: [item.typename] });
					existingUnpublished.push(item.packageid);
				} else {
					// if package is already added to results, find it and add the type name to its types array
					const packageData = unpublishedResults.find(({ PackageId }) => PackageId === item.packageid);
					packageData.types.push(item.typename);
				}
			} else {
				const packageData = publishedPackages.find(({ PackageId }) => PackageId === item.packageid);
				const isDuplicate = existingPublished.includes(item.packageid);
				if (!isDuplicate) {
					publishedResults.push({ ...packageData, types: [item.typename] });
					existingPublished.push(item.packageid);
				} else {
					// if package is already added to results, find it and add the type name to its types array
					const packageData = publishedResults.find(({ PackageId }) => PackageId === item.packageid);
					packageData.types.push(item.typename);
				}
			}
		});

		return { formattedUnpublished: unpublishedResults, formattedPublished: publishedResults };
	};

	const handleUpdateSearchCriteria = async () => {
		// handleUpdateSearchCriteria function uses 'AND' logic when filtering searches
		setIsMenuOpen(!isMenuOpen);

		// check if the advanced search fields are empty
		let isAdvSearchFieldsEmpty = true;
		for (let key in advSearchFields) {
			if (advSearchFields[key] !== '') {
				isAdvSearchFieldsEmpty = false;
			}
		}

		const initalResults = await handleSearch(searchQuery);
		let advMepNameResults = [];
		let advPropertyResults = [];
		let advTypeResults = [];
		let advUnpublishedResults = [];
		let advPublishedResults = [];

		const { formattedUnpublished, formattedPublished } = processInitialSearchResults(
			initalResults.mepNameResults,
			initalResults.propResults,
			initalResults.typeResults
		);

		if (!isIncludeAllReleasesChecked) {
			selectedReleases.forEach((release) => {
				// grab selected releases from packages and update results
				const unpublished = formattedUnpublished.filter((item) => {
					return item.Release.includes(release);
				});
				const published = formattedPublished.filter((item) => {
					return item.Release.includes(release);
				});
				unpublished.forEach((item) => advUnpublishedResults.push(item));
				published.forEach((item) => advPublishedResults.push(item));
			});
		} else {
			advUnpublishedResults = formattedUnpublished;
			advPublishedResults = formattedPublished;
		}

		if (isIncludePublishedMEPsChecked === false && isAdvSearchFieldsEmpty === true) {
			advPublishedResults = publishedPackages; // This is to prevent the published package counter from displaying '0 packages'
		}

		if (isMEPNameChecked) {
			let unpubResults = [];
			let pubResults = [];
			const mepNameValue = advSearchFields.mepNameValue.toLowerCase();

			const unpublishedMPDData = advUnpublishedResults.filter((item) => {
				return item.PackageName.toLowerCase().includes(mepNameValue);
			});

			unpublishedMPDData.forEach((pkg) => {
				// remove extraneous info and use lowercase to prevent React DOM errors on dropdown results
				unpubResults.push({
					title: pkg.PackageName,
					ispublished: pkg.isPublished.toString(),
					release: pkg.Release,
					packagename: pkg.PackageName,
					packageid: pkg.PackageId,
				});
			});

			// searching published packages
			if (isIncludePublishedMEPsChecked) {
				const publishedMPDData = advPublishedResults.filter((item) => {
					return item.PackageName.toLowerCase().includes(mepNameValue);
				});

				publishedMPDData.forEach((pkg) => {
					// remove extraneous info and use lowercase to prevent React DOM errors on dropdown results
					pubResults.push({
						title: pkg.PackageName,
						ispublished: pkg.isPublished.toString(),
						release: pkg.Release,
						packagename: pkg.PackageName,
						packageid: pkg.PackageId,
					});
				});
				advMepNameResults = unpubResults.concat(pubResults); // join arrays to populate the drop down search results
				advPublishedResults = publishedMPDData;
			} else {
				advMepNameResults = unpubResults;
			}

			advUnpublishedResults = unpublishedMPDData;
		}

		if (isPropertyChecked) {
			let unpubPropertyResults = [];
			let rawPropertyDropDownResults = [];
			const propertyValue = advSearchFields.propertyValue.toLowerCase();

			const unpubPackagesWithProperties = advUnpublishedResults.filter((item) => {
				return item.properties.length > 0;
			});

			if (propertyValue === '') {
				// if search query is empty just return the current results
				unpubPropertyResults = advUnpublishedResults;
			} else {
				unpubPackagesWithProperties.forEach((item) => {
					item.properties.forEach((propName) => {
						if (propName.toLowerCase().includes(propertyValue)) {
							// remove extraneous info and use lowercase to prevent React DOM errors on dropdown results
							rawPropertyDropDownResults.push({
								packageid: item.PackageId,
								title: propName,
								packagename: item.PackageName,
								release: item.Release,
								ispublished: item.isPublished.toString(),
							});

							// populate homepage results avoiding duplicates
							const isDuplicate = unpubPropertyResults.includes(item);
							if (!isDuplicate) {
								unpubPropertyResults.push(item);
							}
						}
					});
				});
			}
			advUnpublishedResults = unpubPropertyResults;

			// searching published packages
			if (isIncludePublishedMEPsChecked) {
				let pubPropertyResults = [];

				const pubPackagesWithProperties = advPublishedResults.filter((item) => {
					return item.properties.length > 0;
				});

				if (propertyValue === '') {
					// if search query is empty just return the current results
					pubPropertyResults = advPublishedResults;
				} else {
					pubPackagesWithProperties.forEach((item) => {
						item.properties.forEach((propName) => {
							if (propName.toLowerCase().includes(propertyValue)) {
								// populate dropdown results
								rawPropertyDropDownResults.push({
									packageid: item.PackageId,
									title: propName,
									packagename: item.PackageName,
									release: item.Release,
									ispublished: item.isPublished.toString(),
								});

								// populate homepage results avoiding duplicates
								const isDuplicate = pubPropertyResults.includes(item);
								if (!isDuplicate) {
									pubPropertyResults.push(item);
								}
							}
						});
					});
				}
				advPublishedResults = pubPropertyResults;
			}

			advPropertyResults = rawPropertyDropDownResults.map((item, i) => {
				// give each item a new unique key
				let container = {};
				container = { ...item, key: i };
				return container;
			});
		}

		if (isTypeChecked) {
			let unpubTypeResults = [];
			let rawTypeDropDownResults = [];
			let typeValue = advSearchFields.typeValue.toLowerCase();
			typeValue = getTypeSearchString(typeValue);

			const unpubPackagesWithTypes = advUnpublishedResults.filter((item) => {
				return item.types.length > 0;
			});

			if (typeValue === '') {
				// if search query is empty just return the current results
				unpubTypeResults = advUnpublishedResults;
			} else {
				unpubPackagesWithTypes.forEach((item) => {
					item.types.forEach((typeName) => {
						if (typeName.toLowerCase().includes(typeValue)) {
							// remove extraneous info and use lowercase to prevent React DOM errors on dropdown results
							rawTypeDropDownResults.push({
								packageid: item.PackageId,
								title: typeName,
								packagename: item.PackageName,
								release: item.Release,
								ispublished: item.isPublished.toString(),
							});

							// populate homepage results avoiding duplicates
							const isDuplicate = unpubTypeResults.includes(item);
							if (!isDuplicate) {
								unpubTypeResults.push(item);
							}
						}
					});
				});
			}
			advUnpublishedResults = unpubTypeResults;

			// searching published packages
			if (isIncludePublishedMEPsChecked) {
				let pubTypeResults = [];

				const pubPackagesWithTypes = advPublishedResults.filter((item) => {
					return item.types.length > 0;
				});

				if (typeValue === '') {
					// if search query is empty just return the current results
					pubTypeResults = advPublishedResults;
				} else {
					pubPackagesWithTypes.forEach((item) => {
						item.types.forEach((typeName) => {
							if (typeName.toLowerCase().includes(typeValue)) {
								// populate dropdown results
								rawTypeDropDownResults.push({
									packageid: item.PackageId,
									title: typeName,
									packagename: item.PackageName,
									release: item.Release,
									ispublished: item.isPublished.toString(),
								});

								// populate homepage results avoiding duplicates
								const isDuplicate = pubTypeResults.includes(item);
								if (!isDuplicate) {
									pubTypeResults.push(item);
								}
							}
						});
					});
				}
				advPublishedResults = pubTypeResults;
			}

			advTypeResults = rawTypeDropDownResults.map((item, i) => {
				// give each item a new unique key
				let container = {};
				container = { ...item, key: i };
				return container;
			});
		}

		if (isCOIchecked) {
			const coiValue = advSearchFields.coiValue.toLowerCase();

			const advCoiUnpubResults = advUnpublishedResults.filter((item) => {
				//only search if COITags exist in package
				if (item.COITags !== undefined) {
					return item.COITags.toLowerCase().includes(coiValue);
				} else {
					return false;
				}
			});

			advUnpublishedResults = advCoiUnpubResults;

			// searching published packages
			if (isIncludePublishedMEPsChecked) {
				const advCoiPubResults = advPublishedResults.filter((item) => {
					//only search if COITags exist in package
					if (item.COITags !== undefined) {
						return item.COITags.toLowerCase().includes(coiValue);
					} else {
						return false;
					}
				});

				advPublishedResults = advCoiPubResults;
			}
		}

		if (isExchangePartnersChecked) {
			const exchangeValue = advSearchFields.exchangePartnerValue.toLowerCase();

			const advExchangeUnpubResults = advUnpublishedResults.filter((item) => {
				//only search if ExchangeTags exist in package
				if (item.ExchangeTags !== undefined) {
					return item.ExchangeTags.toLowerCase().includes(exchangeValue);
				} else {
					return false;
				}
			});

			advUnpublishedResults = advExchangeUnpubResults;

			// searching published packages
			if (isIncludePublishedMEPsChecked) {
				const advExchangePubResults = advPublishedResults.filter((item) => {
					//only search if ExchangeTags exist in package
					if (item.ExchangeTags !== undefined) {
						return item.ExchangeTags.toLowerCase().includes(exchangeValue);
					} else {
						return false;
					}
				});

				advPublishedResults = advExchangePubResults;
			}
		}

		if (isOwnerChecked && isIncludePublishedMEPsChecked) {
			const ownerValue = advSearchFields.ownerValue.toLowerCase();

			const advOwnerResults = advPublishedResults.filter((item) => {
				return item.Owner.toLowerCase().includes(ownerValue);
			});
			advPublishedResults = advOwnerResults;
		}

		if (isOrganizationChecked) {
			const organizationValue = advSearchFields.organizationValue.toLowerCase();

			const advOrganizationUnpubResults = advUnpublishedResults.filter((item) => {
				return item.OrganizationName.toLowerCase().includes(organizationValue);
			});
			advUnpublishedResults = advOrganizationUnpubResults;

			if (isIncludePublishedMEPsChecked) {
				const advOrganizationPubResults = advPublishedResults.filter((item) => {
					return item.OrganizationName.toLowerCase().includes(organizationValue);
				});
				advPublishedResults = advOrganizationPubResults;
			}
		}

		// populate dropdown results
		setDropwDownResults({
			...dropDownResults,
			'MEP Name': { name: 'MEP Name', results: advSearchFields.mepNameValue === '' && searchQuery === '' ? [] : advMepNameResults },
			Property: { name: 'Property', results: advSearchFields.propertyValue === '' && searchQuery === '' ? [] : advPropertyResults },
			Type: { name: 'Type', results: advSearchFields.typeValue === '' && searchQuery === '' ? [] : advTypeResults },
		});

		// send final search results to update the home page table and cards
		dispatch({ type: actionTypes.UPDATE_UNPUBLISHED_SEARCH_RESULTS_LIST, payload: advUnpublishedResults });
		dispatch({ type: actionTypes.UPDATE_PUBLISHED_SEARCH_RESULTS_LIST, payload: advPublishedResults });
		dispatch({ type: actionTypes.REFRESH_PACKAGES, payload: true });
	};

	const addPackageToTable = (results, source, packages = unpublishedPackages) => {
		// get the packageName from Property/Type and add package to results table
		let packageNames = [];
		results.forEach((data) => {
			packageNames.push(data.PackageName);
		});
		source.forEach((data) => {
			const isDuplicate = packageNames.includes(data.packagename);
			if (!isDuplicate) {
				packageNames.push(data.packagename);
			}
		});

		let newResults = [];
		packageNames.forEach((name) => {
			const packageNameData = packages.find(({ PackageName }) => PackageName === name);
			// only add packageNameData if a match was found
			if (packageNameData) {
				newResults.push(packageNameData);
			}
		});

		return newResults;
	};

	const handleSearch = async (searchQuery) => {
		// handleSearch function uses 'OR' logic when filtering searches
		let mepNameResults = [];
		let mepNameUnpubResults = [];
		let mepNamePubResults = [];
		let rawPropertyResults = [];
		let sourceProperty = [];
		let targetProperty = [];
		let extensionProperty = [];
		let rawTypeResults = [];
		let sourceType = [];
		let targetType = [];
		let extensionType = [];
		mepNameUnpubResults = unpublishedPackages;
		mepNamePubResults = publishedPackages;
		searchQuery = searchQuery.toLowerCase();
		const typeSearchQuery = getTypeSearchString(searchQuery);

		//Search for MEP name
		if (isMEPNameChecked) {
			const filteredUnpublished = mepNameUnpubResults.filter((pkg) => pkg.PackageName.toLowerCase().includes(searchQuery));
			mepNameUnpubResults = filteredUnpublished; // reassign back to itself

			mepNameUnpubResults.forEach((pkg) => {
				// remove extraneous info and use lowercase to prevent React DOM errors on dropdown results
				mepNameResults.push({
					title: pkg.PackageName,
					ispublished: pkg.isPublished.toString(),
					release: pkg.Release,
					packagename: pkg.PackageName,
					packageid: pkg.PackageId,
				});
			});

			// searching published packages
			if (isIncludePublishedMEPsChecked) {
				const filteredPublished = mepNamePubResults.filter((pkg) => pkg.PackageName.toLowerCase().includes(searchQuery));
				mepNamePubResults = filteredPublished; // reassign back to itself

				mepNamePubResults.forEach((pkg) => {
					// remove extraneous info and use lowercase to prevent React DOM errors on dropdown results
					mepNameResults.push({
						title: pkg.PackageName,
						ispublished: pkg.isPublished.toString(),
						release: pkg.Release,
						packagename: pkg.PackageName,
						packageid: pkg.PackageId,
					});
				});
			}
		}

		// Search Property (source and target)
		if (isPropertyChecked) {
			const unpublishedSourceProperty = [];
			const unpublishedTargetProperty = [];
			const unpublishedExtensionProperty = [];

			for (let pkg of unpublishedPackages) {
				let packageName = pkg.PackageName;
				const packageId = pkg.PackageId;
				let release = pkg.Release;
				const ispublished = pkg.isPublished.toString();
				const existingPackageData = await getExistingPackageData(packageId);

				if (existingPackageData) {
					const propertySheet = existingPackageData['mappingDoc'].propertySheet;
					const extensions = await getExtensionsApi(packageId);

					const sourceResults = propertySheet.filter((data) => {
						if (data.sourcePropertyName) {
							return data.sourcePropertyName.toLowerCase().includes(searchQuery);
						} else {
							return false;
						}
					});

					const targetResults = propertySheet.filter((data) => {
						if (data.targetPropertyName) {
							return data.targetPropertyName.toLowerCase().includes(searchQuery);
						} else {
							return false;
						}
					});

					if (extensions.length > 0) {
						// filter extensions by isProperty and search query
						const extensionResults = extensions.filter((extension) => {
							if (extension.elementName) {
								const isProperty = extension.elementName.toLowerCase().substring(extension.elementName.length - 4) !== 'type';
								return extension.elementName.toLowerCase().includes(searchQuery) && isProperty;
							} else {
								return false;
							}
						});

						if (extensionResults.length > 0) {
							const uniqueExtensions = [];

							// exclude duplicates
							const uniqueExtensionResults = extensionResults.filter((element) => {
								const isDuplicate = uniqueExtensions.includes(element.elementName);

								if (!isDuplicate) {
									uniqueExtensions.push(element.elementName);
									return true;
								}
								return false;
							});

							// associate package name to each item and push results
							uniqueExtensionResults.forEach((extension) => {
								extension.release = release;
								extension.packagename = packageName;
								extension.packageid = packageId;
								extension.ispublished = ispublished;
								unpublishedExtensionProperty.push(extension);
							});
						}
					}

					if (sourceResults.length > 0) {
						// remove duplicate sourcePropertyName from the same package
						const uniqueSourceNames = [];

						const uniqueSourceResults = sourceResults.filter((element) => {
							const isDuplicate = uniqueSourceNames.includes(element.sourcePropertyName);

							if (!isDuplicate) {
								uniqueSourceNames.push(element.sourcePropertyName);
								return true;
							}
							return false;
						});

						uniqueSourceResults.forEach((property) => {
							// attach package name to item
							property.release = release;
							property.packagename = packageName;
							property.packageid = packageId;
							property.ispublished = ispublished;
							unpublishedSourceProperty.push(property);
						});
					}

					if (targetResults.length > 0) {
						// remove duplicate targetPropertyName from the same package
						const uniqueTargetNames = [];

						const uniqueTargetResults = targetResults.filter((element) => {
							const isDuplicate = uniqueTargetNames.includes(element.targetPropertyName);

							if (!isDuplicate) {
								uniqueTargetNames.push(element.targetPropertyName);
								return true;
							}
							return false;
						});

						uniqueTargetResults.forEach((property) => {
							// attach package name to item
							property.release = release;
							property.packagename = packageName;
							property.packageid = packageId;
							property.ispublished = ispublished;
							unpublishedTargetProperty.push(property);
						});
					}
				}
			}

			// build MEP name results
			const sourcePackages = addPackageToTable(mepNameUnpubResults, unpublishedSourceProperty);
			mepNameUnpubResults = sourcePackages;
			const targetPackages = addPackageToTable(mepNameUnpubResults, unpublishedTargetProperty);
			mepNameUnpubResults = targetPackages;
			const extensionPackages = addPackageToTable(mepNameUnpubResults, unpublishedExtensionProperty);

			// combine extension packages and source/target packages, excluding duplicates
			// this is needed because extensions don't have the one-to-one relationship like sources and targets do
			extensionPackages.forEach((extPackage) => {
				if (!mepNameUnpubResults.includes(extPackage)) {
					mepNameUnpubResults.push(extPackage);
				}
			});

			// searching published packages
			if (isIncludePublishedMEPsChecked) {
				const publishedSourceProperty = [];
				const publishedTargetProperty = [];
				const publishedExtensionProperty = [];

				for (let pkg of publishedPackages) {
					let packageName = pkg.PackageName;
					const packageId = pkg.PackageId;
					let release = pkg.Release;
					const ispublished = pkg.isPublished.toString();
					const existingPackageData = await getExistingPackageData(packageId);

					if (existingPackageData) {
						const propertySheet = existingPackageData['mappingDoc'].propertySheet;
						const extensions = getExtensionsApi(packageId);

						const sourceResults = propertySheet.filter((data) => {
							if (data.sourcePropertyName) {
								return data.sourcePropertyName.toLowerCase().includes(searchQuery);
							} else {
								return false;
							}
						});

						const targetResults = propertySheet.filter((data) => {
							if (data.targetPropertyName) {
								return data.targetPropertyName.toLowerCase().includes(searchQuery);
							} else {
								return false;
							}
						});

						if (extensions.length > 0) {
							// filter extensions by isProperty and search query
							const extensionResults = extensions.filter((extension) => {
								if (extension.elementName) {
									const isProperty = extension.elementName.toLowerCase().substring(extension.elementName.length - 4) !== 'type';
									return extension.elementName.toLowerCase().includes(searchQuery) && isProperty;
								} else {
									return false;
								}
							});

							if (extensionResults.length > 0) {
								// exclude duplicates
								const uniqueExtensions = [];

								const uniqueExtensionResults = extensionResults.filter((element) => {
									const isDuplicate = uniqueExtensions.includes(element.elementName);

									if (!isDuplicate) {
										uniqueExtensions.push(element.elementName);
										return true;
									}
									return false;
								});

								// associate package name with each item and push results
								uniqueExtensionResults.forEach((extension) => {
									extension.release = release;
									extension.packagename = packageName;
									extension.packageid = packageId;
									extension.ispublished = ispublished;
									publishedExtensionProperty.push(extension);
								});
							}
						}

						if (sourceResults.length > 0) {
							// remove duplicate sourcePropertyName from the same package
							const uniqueSourceNames = [];

							const uniqueSourceResults = sourceResults.filter((element) => {
								const isDuplicate = uniqueSourceNames.includes(element.sourcePropertyName);

								if (!isDuplicate) {
									uniqueSourceNames.push(element.sourcePropertyName);
									return true;
								}
								return false;
							});

							uniqueSourceResults.forEach((property) => {
								// attach package name to item
								property.release = release;
								property.packagename = packageName;
								property.packageid = packageId;
								property.ispublished = ispublished;
								publishedSourceProperty.push(property);
							});
						}

						if (targetResults.length > 0) {
							// remove duplicate targetPropertyName from the same package
							const uniqueTargetNames = [];

							const uniqueTargetResults = targetResults.filter((element) => {
								const isDuplicate = uniqueTargetNames.includes(element.targetPropertyName);

								if (!isDuplicate) {
									uniqueTargetNames.push(element.targetPropertyName);
									return true;
								}
								return false;
							});

							uniqueTargetResults.forEach((property) => {
								// attach package name to item
								property.release = release;
								property.packagename = packageName;
								property.packageid = packageId;
								property.ispublished = ispublished;
								publishedTargetProperty.push(property);
							});
						}
					}
				}

				// build MEP name results
				const sourcePackages = addPackageToTable(mepNamePubResults, publishedSourceProperty, publishedPackages);
				mepNamePubResults = sourcePackages;
				const targetPackages = addPackageToTable(mepNamePubResults, publishedTargetProperty, publishedPackages);
				mepNamePubResults = targetPackages;
				const extensionPackages = addPackageToTable(mepNamePubResults, publishedExtensionProperty, publishedPackages);

				// combine extension packages and source/target packages, excluding duplicates
				// this is needed because extensions don't have the one-to-one relationship like sources and targets do
				extensionPackages.forEach((extPackage) => {
					if (!mepNamePubResults.includes(extPackage)) {
						mepNamePubResults.push(extPackage);
					}
				});

				// combine published and unpublished results
				sourceProperty = unpublishedSourceProperty.concat(publishedSourceProperty);
				targetProperty = unpublishedTargetProperty.concat(publishedTargetProperty);
				extensionProperty = unpublishedExtensionProperty.concat(publishedExtensionProperty);
			} else {
				sourceProperty = unpublishedSourceProperty;
				targetProperty = unpublishedTargetProperty;
				extensionProperty = unpublishedExtensionProperty;
			}

			// only push relevant info
			sourceProperty.forEach((data, i) => {
				rawPropertyResults.push({
					packageid: data.packageid,
					key: data.key,
					title: data.sourcePropertyName,
					packagename: data.packagename,
					release: data.release,
					ispublished: data.ispublished,
					propertyname: data.sourcePropertyName, // for processing in advanced search
				});
			});

			targetProperty.forEach((data) => {
				rawPropertyResults.push({
					packageid: data.packageid,
					key: data.key,
					title: data.targetPropertyName,
					packagename: data.packagename,
					release: data.release,
					ispublished: data.ispublished,
					propertyname: data.targetPropertyName, // for processing in advanced search
				});
			});

			extensionProperty.forEach((data) => {
				rawPropertyResults.push({
					packageid: data.packageid,
					key: data.key,
					title: data.elementName,
					packagename: data.packagename,
					release: data.release,
					ispublished: data.ispublished,
					propertyname: data.elementName, // for processing in advanced search
				});
			});
		}

		// Search Type (source and target)
		if (isTypeChecked) {
			const unpublishedSourceType = [];
			const unpublishedTargetType = [];
			const unpublishedExtensionType = [];

			for (let pkg of unpublishedPackages) {
				let packageName = pkg.PackageName;
				const packageId = pkg.PackageId;
				let release = pkg.Release;
				const ispublished = pkg.isPublished.toString();
				const existingPackageData = await getExistingPackageData(packageId);

				if (existingPackageData) {
					const typeSheet = existingPackageData['mappingDoc'].typeSheet;
					const extensions = await getExtensionsApi(packageId, typeSearchQuery);

					const sourceResults = typeSheet.filter((data) => {
						if (data.sourceTypeName) {
							return data.sourceTypeName.toLowerCase().includes(typeSearchQuery);
						} else {
							return false;
						}
					});

					const targetResults = typeSheet.filter((data) => {
						if (data.targetTypeName) {
							return data.targetTypeName.toLowerCase().includes(typeSearchQuery);
						} else {
							return false;
						}
					});

					if (extensions.length > 0) {
						// filter extensions by isType and search query
						const extensionResults = extensions.filter((extension) => {
							if (extension.elementName) {
								const isType = extension.elementName.toLowerCase().substring(extension.elementName.length - 4) === 'type';
								return extension.elementName.toLowerCase().includes(typeSearchQuery) && isType;
							} else {
								return false;
							}
						});

						if (extensionResults.length > 0) {
							// exclude duplicates
							const uniqueExtensions = [];
							const uniqueExtensionResults = extensionResults.filter((element) => {
								const isDuplicate = uniqueExtensions.includes(element.elementName);

								if (!isDuplicate) {
									uniqueExtensions.push(element.elementName);
									return true;
								}
								return false;
							});

							uniqueExtensionResults.forEach((extension) => {
								// associate package name to each item and push results
								extension.release = release;
								extension.packagename = packageName;
								extension.packageid = packageId;
								extension.ispublished = ispublished;
								unpublishedExtensionType.push(extension);
							});
						}
					}

					if (sourceResults.length > 0) {
						// remove duplicate sourceTypeName from the same package
						const uniqueSourceNames = [];

						const uniqueSourceResults = sourceResults.filter((element) => {
							const isDuplicate = uniqueSourceNames.includes(element.sourceTypeName);

							if (!isDuplicate) {
								uniqueSourceNames.push(element.sourceTypeName);
								return true;
							}
							return false;
						});

						uniqueSourceResults.forEach((type) => {
							type.release = release;
							type.packagename = packageName;
							type.packageid = packageId;
							type.ispublished = ispublished;
							unpublishedSourceType.push(type);
						});
					}

					if (targetResults.length > 0) {
						// remove duplicate targetPropertyName from the same package
						const uniqueTargetNames = [];

						const uniqueTargetResults = targetResults.filter((element) => {
							const isDuplicate = uniqueTargetNames.includes(element.targetPropertyName);

							if (!isDuplicate) {
								uniqueTargetNames.push(element.targetPropertyName);
								return true;
							}
							return false;
						});

						uniqueTargetResults.forEach((type) => {
							type.release = release;
							type.packagename = packageName;
							type.packageid = packageId;
							type.ispublished = ispublished;
							unpublishedTargetType.push(type);
						});
					}
				}
			}

			// build MEP name results
			const sourcePackages = addPackageToTable(mepNameUnpubResults, unpublishedSourceType);
			mepNameUnpubResults = sourcePackages;
			const targetPackages = addPackageToTable(mepNameUnpubResults, unpublishedTargetType);
			mepNameUnpubResults = targetPackages;
			const extensionPackages = addPackageToTable(mepNameUnpubResults, unpublishedExtensionType);

			// combine extension packages and source/target packages, excluding duplicates
			// this is needed because extensions don't have the one-to-one relationship like sources and targets do
			extensionPackages.forEach((extPackage) => {
				if (!mepNameUnpubResults.includes(extPackage)) {
					mepNameUnpubResults.push(extPackage);
				}
			});

			// searching published packages
			if (isIncludePublishedMEPsChecked) {
				const publishedSourceType = [];
				const publishedTargetType = [];
				const publishedExtensionType = [];

				for (let pkg of publishedPackages) {
					let packageName = pkg.PackageName;
					const packageId = pkg.PackageId;
					let release = pkg.Release;
					const ispublished = pkg.isPublished.toString();
					const existingPackageData = await getExistingPackageData(packageId);

					if (existingPackageData) {
						const typeSheet = existingPackageData['mappingDoc'].typeSheet;
						const extensions = await getExtensionsApi(packageId, typeSearchQuery);

						const sourceResults = typeSheet.filter((data) => {
							if (data.sourceTypeName) {
								return data.sourceTypeName.toLowerCase().includes(typeSearchQuery);
							} else {
								return false;
							}
						});

						const targetResults = typeSheet.filter((data) => {
							if (data.targetTypeName) {
								return data.targetTypeName.toLowerCase().includes(typeSearchQuery);
							} else {
								return false;
							}
						});

						if (extensions.length > 0) {
							// filter extensions by isType and search query
							const extensionResults = extensions.filter((extension) => {
								if (extension.elementName) {
									const isType = extension.elementName.toLowerCase().substring(extension.elementName.length - 4) === 'type';
									return extension.elementName.toLowerCase().includes(typeSearchQuery) && isType;
								} else {
									return false;
								}
							});

							if (extensionResults.length > 0) {
								const uniqueExtensions = [];

								// exclude duplicates
								const uniqueExtensionResults = extensionResults.filter((element) => {
									const isDuplicate = uniqueExtensions.includes(element.elementName);

									if (!isDuplicate) {
										uniqueExtensions.push(element.elementName);
										return true;
									}
									return false;
								});

								// associate MEP name to each item and push results
								uniqueExtensionResults.forEach((extension) => {
									extension.release = release;
									extension.packagename = packageName;
									extension.packageid = packageId;
									extension.ispublished = ispublished;
									publishedExtensionType.push(extension);
								});
							}
						}

						if (sourceResults.length > 0) {
							// remove duplicate sourceTypeName from the same package
							const uniqueSourceNames = [];

							const uniqueSourceResults = sourceResults.filter((element) => {
								const isDuplicate = uniqueSourceNames.includes(element.sourceTypeName);

								if (!isDuplicate) {
									uniqueSourceNames.push(element.sourceTypeName);
									return true;
								}
								return false;
							});

							uniqueSourceResults.forEach((type) => {
								type.release = release;
								type.packagename = packageName;
								type.packageid = packageId;
								type.ispublished = ispublished;
								publishedSourceType.push(type);
							});
						}

						if (targetResults.length > 0) {
							// remove duplicate targetPropertyName from the same package
							const uniqueTargetNames = [];

							const uniqueTargetResults = targetResults.filter((element) => {
								const isDuplicate = uniqueTargetNames.includes(element.targetPropertyName);

								if (!isDuplicate) {
									uniqueTargetNames.push(element.targetPropertyName);
									return true;
								}
								return false;
							});

							uniqueTargetResults.forEach((type) => {
								type.release = release;
								type.packagename = packageName;
								type.ispublished = ispublished;
								publishedTargetType.push(type);
							});
						}
					}
				}

				// build MEP name results
				const sourcePackages = addPackageToTable(mepNamePubResults, publishedSourceType, publishedPackages);
				mepNamePubResults = sourcePackages;
				const targetPackages = addPackageToTable(mepNamePubResults, publishedTargetType, publishedPackages);
				mepNamePubResults = targetPackages;
				const extensionPackages = addPackageToTable(mepNamePubResults, publishedExtensionType, publishedPackages);

				// combine extension packages and source/target packages, excluding duplicates
				// this is needed because extensions don't have the one-to-one relationship like sources and targets do
				extensionPackages.forEach((extPackage) => {
					if (!mepNamePubResults.includes(extPackage)) {
						mepNamePubResults.push(extPackage);
					}
				});

				// combine published and unpublished results
				sourceType = unpublishedSourceType.concat(publishedSourceType);
				targetType = unpublishedTargetType.concat(publishedTargetType);
				extensionType = unpublishedExtensionType.concat(publishedExtensionType);
			} else {
				sourceType = unpublishedSourceType;
				targetType = unpublishedTargetType;
				extensionType = unpublishedExtensionType;
			}

			// only push relevant info and remove duplicates (ex. don't have PackageA display multiple "IdentificationId" texts. Case sensitive)
			sourceType.forEach((data, i) => {
				const isDuplicate = rawTypeResults.some((item) => item.packageid === data.packageid && item.typename === data.sourceTypeName);
				if (!isDuplicate) {
					rawTypeResults.push({
						packageid: data.packageid,
						key: data.key,
						title: data.sourceTypeName,
						packagename: data.packagename,
						release: data.release,
						ispublished: data.ispublished,
						typename: data.sourceTypeName, // for processing in advanced search
					});
				}
			});
			targetType.forEach((data) => {
				const isDuplicate = rawTypeResults.some((item) => item.packageid === data.packageid && item.typename === data.targetTypeName);
				if (!isDuplicate) {
					rawTypeResults.push({
						packageid: data.packageid,
						key: data.key,
						title: data.targetTypeName,
						packagename: data.packagename,
						release: data.release,
						ispublished: data.ispublished,
						typename: data.targetTypeName, // for processing in advanced search
					});
				}
			});
			extensionType.forEach((data) => {
				const isDuplicate = rawTypeResults.some((item) => item.packageid === data.packageid && item.typename === data.elementName);
				if (!isDuplicate) {
					rawTypeResults.push({
						packageid: data.packageid,
						key: data.key,
						title: data.elementName,
						packagename: data.packagename,
						release: data.release,
						ispublished: data.ispublished,
						typename: data.elementName, // for processing in advanced search
					});
				}
			});
		}

		const propertyResults = rawPropertyResults.map((item, i) => {
			// give each item a new unique key
			let container = {};
			container = { ...item, key: i };
			return container;
		});

		const typeResults = rawTypeResults.map((item, i) => {
			// give each item a new unique key
			let container = {};
			container = { ...item, key: i };
			return container;
		});

		// populate drop down with results
		if (searchQuery === '') {
			setDropwDownResults({
				...dropDownResults,
				'MEP Name': { name: 'MEP Name', results: [] },
				Property: { name: 'Property', results: [] },
				Type: { name: 'Type', results: [] },
			});
		} else {
			setDropwDownResults({
				...dropDownResults,
				'MEP Name': { name: 'MEP Name', results: mepNameResults },
				Property: { name: 'Property', results: propertyResults },
				Type: { name: 'Type', results: typeResults },
			});
		}

		// send final results to update MyHome table and cards
		dispatch({ type: actionTypes.UPDATE_UNPUBLISHED_SEARCH_RESULTS_LIST, payload: mepNameUnpubResults });
		dispatch({ type: actionTypes.UPDATE_PUBLISHED_SEARCH_RESULTS_LIST, payload: mepNamePubResults });
		dispatch({ type: actionTypes.REFRESH_PACKAGES, payload: true });

		return { mepNameResults: mepNameResults, propResults: propertyResults, typeResults: typeResults };
	};

	const searchChange = (e, d) => {
		setSearchQuery(d.value);
		handleSearch(d.value);
	};

	const onResultSelect = (e, d) => {
		const pkg = d.result;
		if (pkg.ispublished === 'false') {
			// clear unsaved session data from previously viewed package
			clearUnsavedData();
			handleOpenPackage({ PackageName: pkg.packagename, PackageId: pkg.packageid }, dispatch);
		} else {
			// unable to open published packages at this time
		}
	};

	const resultRenderer = ({ title, ispublished, packagename }) => {
		return (
			<>
				<div className='searchResultTitle'>
					<span>
						<strong>{title}</strong>
					</span>
					{title === packagename ? <span className='publishedLabel'>{ispublished === 'true' ? 'Published' : 'Unpublished'}</span> : null}
				</div>
				{title === packagename ? null : (
					<div className='searchFoundInText'>
						<span>Found in {packagename}</span>
						<span>{ispublished === 'true' ? 'Published' : 'Unpublished'}</span>
					</div>
				)}
			</>
		);
	};

	return (
		<>
			{/* ------------------------------ Search Bar ------------------------------ */}
			<Grid columns={2}>
				<Grid.Column width={10} id='mepSearchBar'>
					<Search
						placeholder='Search MEP Name, Property, or Type'
						icon='search'
						category
						categoryLayoutRenderer={resultsLayout}
						categoryRenderer={categoryRenderer}
						results={dropDownResults}
						resultRenderer={resultRenderer}
						open={openResults}
						onFocus={() => {
							setOpenResults(true);
						}}
						onBlur={() => {
							setOpenResults(false);
						}}
						onResultSelect={onResultSelect}
						value={searchQuery}
						onSearchChange={searchChange}
						noResultsMessage='No results found.'
						input={{ ref: searchRef }}
					/>
				</Grid.Column>
				{/* ------------------------------ Advanced Search ------------------------------ */}
				<Grid.Column width={8} id='advSearch'>
					<Dropdown item simple icon='caret down' className='cardMenu' text='Advanced Search' onClick={() => setIsMenuOpen(!isMenuOpen)}>
						<Dropdown.Menu>
							<Dropdown.Item>
								<Checkbox label='Select All' checked={isSelectAllChecked} onChange={handleSelectAll} />
							</Dropdown.Item>
							<Dropdown.Item>
								<Checkbox
									label='MEP Name'
									checked={isMEPNameChecked}
									onChange={() => {
										setIsMEPNameChecked(!isMEPNameChecked);
										setIsSelectAllChecked(false);
										setWasChangeMade(true);
									}}
								/>
							</Dropdown.Item>
							{isMEPNameChecked ? (
								<Dropdown.Item>
									<Input
										placeholder='Enter MEP Name Filter'
										onChange={(d) => {
											setAdvSearchFields({ ...advSearchFields, mepNameValue: d.target.value });
											setWasChangeMade(true);
										}}
										value={advSearchFields.mepNameValue}
									/>
								</Dropdown.Item>
							) : null}
							<Dropdown.Item>
								<Checkbox
									label='Property'
									checked={isPropertyChecked}
									onChange={() => {
										setIsPropertyChecked(!isPropertyChecked);
										setIsSelectAllChecked(false);
										setWasChangeMade(true);
									}}
								/>
							</Dropdown.Item>
							{isPropertyChecked ? (
								<Dropdown.Item>
									<Input
										placeholder='Enter Property Filter'
										onChange={(d) => {
											setAdvSearchFields({ ...advSearchFields, propertyValue: d.target.value });
											setWasChangeMade(true);
										}}
										value={advSearchFields.propertyValue}
									/>
								</Dropdown.Item>
							) : null}
							<Dropdown.Item>
								<Checkbox
									label='Type'
									checked={isTypeChecked}
									onChange={() => {
										setIsTypeChecked(!isTypeChecked);
										setIsSelectAllChecked(false);
										setWasChangeMade(true);
									}}
								/>
							</Dropdown.Item>
							{isTypeChecked ? (
								<Dropdown.Item>
									<Input
										placeholder='Enter Type Filter'
										onChange={(d) => {
											setAdvSearchFields({ ...advSearchFields, typeValue: d.target.value });
											setWasChangeMade(true);
										}}
										value={advSearchFields.typeValue}
									/>
								</Dropdown.Item>
							) : null}
							<Dropdown.Item>
								<Checkbox
									label='Communities of Interest'
									checked={isCOIchecked}
									onChange={() => {
										setIsCOIchecked(!isCOIchecked);
										setIsSelectAllChecked(false);
										setWasChangeMade(true);
									}}
								/>
							</Dropdown.Item>
							{isCOIchecked ? (
								<Tooltip
									content={tooltipContent.multipleEntrySeparation}
									position='right center'
									inverted
									trigger={
										<Dropdown.Item>
											<Input
												placeholder='Enter COI Tags'
												onChange={(d) => {
													setAdvSearchFields({ ...advSearchFields, coiValue: d.target.value });
													setWasChangeMade(true);
												}}
												value={advSearchFields.coiValue}
											/>
										</Dropdown.Item>
									}
								/>
							) : null}
							<Dropdown.Item>
								<Checkbox
									label='Exchange Partners'
									checked={isExchangePartnersChecked}
									onChange={() => {
										setIsExchangePartnersChecked(!isExchangePartnersChecked);
										setIsSelectAllChecked(false);
										setWasChangeMade(true);
									}}
								/>
							</Dropdown.Item>
							{isExchangePartnersChecked ? (
								<Tooltip
									content={tooltipContent.multipleEntrySeparation}
									position='right center'
									inverted
									trigger={
										<Dropdown.Item>
											<Input
												placeholder='Enter Exchange Partners'
												onChange={(d) => {
													setAdvSearchFields({ ...advSearchFields, exchangePartnerValue: d.target.value });
													setWasChangeMade(true);
												}}
												value={advSearchFields.exchangePartnerValue}
											/>
										</Dropdown.Item>
									}
								/>
							) : null}

							{isIncludePublishedMEPsChecked ? (
								<Dropdown.Item>
									<Checkbox
										label='Owner'
										checked={isOwnerChecked}
										onChange={() => {
											setIsOwnerChecked(!isOwnerChecked);
											setIsSelectAllChecked(false);
											setWasChangeMade(true);
										}}
									/>
								</Dropdown.Item>
							) : (
								<Tooltip
									content={tooltipContent.ownerFieldDescription}
									position='right center'
									inverted
									trigger={
										<Dropdown.Item>
											<Checkbox
												label='Owner'
												checked={isOwnerChecked}
												disabled={!isIncludePublishedMEPsChecked}
												onChange={() => {
													setIsOwnerChecked(!isOwnerChecked);
													setIsSelectAllChecked(false);
													setWasChangeMade(true);
												}}
											/>
										</Dropdown.Item>
									}
								/>
							)}

							{isOwnerChecked && isIncludePublishedMEPsChecked ? (
								<Tooltip
									content={tooltipContent.ownerFieldDescription}
									position='right center'
									inverted
									trigger={
										<Dropdown.Item>
											<Input
												placeholder='Enter Owner Filter'
												onChange={(d) => {
													setAdvSearchFields({ ...advSearchFields, ownerValue: d.target.value });
													setWasChangeMade(true);
												}}
												value={advSearchFields.ownerValue}
											/>
										</Dropdown.Item>
									}
								/>
							) : null}
							<Dropdown.Item>
								<Checkbox
									label='Organization'
									checked={isOrganizationChecked}
									onChange={() => {
										setIsOrganizationChecked(!isOrganizationChecked);
										setIsSelectAllChecked(false);
										setWasChangeMade(true);
									}}
								/>
							</Dropdown.Item>
							{isOrganizationChecked ? (
								<Dropdown.Item>
									<Input
										placeholder='Enter Organization Filter'
										onChange={(d) => {
											setAdvSearchFields({ ...advSearchFields, organizationValue: d.target.value });
											setWasChangeMade(true);
										}}
										value={advSearchFields.organizationValue}
									/>
								</Dropdown.Item>
							) : null}
							<Dropdown.Item>
								<Checkbox
									label='Include All Releases'
									checked={isIncludeAllReleasesChecked}
									onChange={() => {
										setIsIncludeAllReleasesChecked(!isIncludeAllReleasesChecked);
										setIsSelectAllChecked(false);
										setWasChangeMade(true);
									}}
								/>
							</Dropdown.Item>
							{!isIncludeAllReleasesChecked ? (
								<Dropdown.Item>
									<Dropdown
										id='releaseDropdown'
										selection
										multiple
										search
										simple
										options={releaseOptions()}
										onChange={(e, d) => {
											setSelectedReleases(d.value);
											setWasChangeMade(true);
										}}
									/>
								</Dropdown.Item>
							) : null}
							<Dropdown.Item>
								<Checkbox
									label='Include Published MEPS'
									checked={isIncludePublishedMEPsChecked}
									onChange={() => {
										setIsIncludePublishedMEPsChecked(!isIncludePublishedMEPsChecked);
										setIsSelectAllChecked(false);
										setWasChangeMade(true);
									}}
								/>
							</Dropdown.Item>
							<Button
								className='primaryButton'
								disabled={!wasChangeMade}
								onClick={() => {
									handleUpdateSearchCriteria();
									searchRef.current.focus(); // set search bar to be in focus
								}}
							>
								Apply
							</Button>
							<Button className='primaryButton' onClick={handleReset}>
								Reset
							</Button>
						</Dropdown.Menu>
					</Dropdown>
				</Grid.Column>
			</Grid>
		</>
	);
};

export default MEPSearchBar;
