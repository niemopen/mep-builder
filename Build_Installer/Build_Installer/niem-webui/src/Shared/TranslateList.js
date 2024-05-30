import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../redux/actions';
import { translateTypes } from '.././config/config.json';
import { List, Checkbox, Button, Popup } from 'semantic-ui-react';
import { translateToJsonLd, translateViaCMF, updateTranslationStatus } from '../Util/TranslationUtil';
import { updateReduxArtifactTreeFromDB } from '../Util/ArtifactTreeUtil';
import { closePackage, handleSavePackage } from '../Util/savePackageUtil';
import { updateReduxFromPackageData } from '../Util/PackageUtil';
import * as tooltipContent from '../Shared/TooltipContent.js';
import { clearValidationResults } from '../Util/ValidationUtil.js';

const TranslateList = (props) => {
	const userId = useSelector((state) => state.session.userId);
	const [isCheckedTranslateTypes, setIsCheckedTranslateTypes] = useState({});
	const format = useSelector((state) => state.mpd.format);
	const generateTranslationActive = useSelector((state) => state.translate.generateTranslationActive);
	const mepChangeWarningModalOpen = useSelector((state) => state.mepChangeWarning.mepChangeWarningModalOpen);
	const indexForTranslationGeneration = useSelector((state) => state.translate.indexForTranslationGeneration);

	const dispatch = useDispatch();

	const translateStrings = {
		// These are the formats implemented to translate via the GTRI API 2.0
		// If the config file contains anything other than these, the extras will be disabled in the checklist
		// apiEnum refers to the "to" parameter used by the GTRI API 2.0 interface
		cmf: { label: 'CMF', apiEnum: 'cmf' },
		jsonLD: { label: 'JSON LD', apiEnum: '' },
		xml: { label: 'XML', apiEnum: 'xsd' },
		jsonSchema: { label: 'JSON Schema', apiEnum: 'json_schema' },
		owl: { label: 'OWL', apiEnum: 'owl' },
	};

	const handleFormatTranslation = async () => {
		// initialize success value to true, any failure will update this
		let translationResult = true;
		let singleResult = true;
		let translatedFormats;

		if (props.sourceComponent === 'BuildValidate') {
			props.listVisibleChanger(false);
			props.loadingStateChanger(true);
			translatedFormats = format;
		} else if (props.sourceComponent === 'MyHomeCard') {
			translatedFormats = props.pkg.Format;
			dispatch({ type: actionTypes.MY_HOME_LOADER_ACTIVE, payload: true });
		}

		// start translations for each type that was checked
		for (const type in isCheckedTranslateTypes) {
			if (isCheckedTranslateTypes[type] === true) {
				if (type === 'jsonLD') {
					singleResult = await translateToJsonLd(props.packageId, userId);
					if (singleResult === true) {
						if (!translatedFormats.includes(translateStrings.jsonLD.label)) {
							translatedFormats = translatedFormats.concat(', ', translateStrings.jsonLD.label);
						}
					} else {
						translationResult = false;
					}
				} else {
					singleResult = await translateViaCMF(translateStrings[type].apiEnum, props.packageId, userId);
					if (singleResult === true) {
						if (!translatedFormats.includes(translateStrings[type].label)) {
							translatedFormats = translatedFormats.concat(', ', translateStrings[type].label);
						}
					} else {
						translationResult = false;
					}
				}
			}
		}

		// reset checked translate types values
		setIsCheckedTranslateTypes({});

		// handle success or fail
		if (translationResult === true) {
			if (props.sourceComponent === 'BuildValidate') {
				dispatch({ type: actionTypes.BUILD_UPDATE_TRANSLATE_MESSAGE, payload: 'success' });

				updateReduxArtifactTreeFromDB(props.packageId);

				dispatch({
					type: actionTypes.UPDATE_MPD_FORMAT,
					payload: translatedFormats,
				});
				props.loadingStateChanger(false);
			} else if (props.sourceComponent === 'MyHomeCard') {
				await updateReduxFromPackageData(props.pkg, dispatch, false);
				dispatch({ type: actionTypes.UPDATE_MPD_FORMAT, payload: translatedFormats });

				await handleSavePackage(true);
				closePackage(); // since we opened the published package in the redux, we must close out the package data

				dispatch({ type: actionTypes.UPDATE_TRANSLATION_COMPLETION_STATUS, payload: 'success' });
				dispatch({ type: actionTypes.TRANSLATED_PACKAGE_NAME, payload: props.pkg.PackageName });
				dispatch({ type: actionTypes.REFRESH_PACKAGES, payload: true });
				dispatch({ type: actionTypes.MY_HOME_LOADER_ACTIVE, payload: false });
			}

			await updateTranslationStatus(props.packageId, translationResult);
			await handleSavePackage(true); // save once more to finalize translation status
		} else {
			if (props.sourceComponent === 'BuildValidate') {
				dispatch({ type: actionTypes.BUILD_UPDATE_TRANSLATE_MESSAGE, payload: 'fail' });
			} else if (props.sourceComponent === 'MyHomeCard') {
				dispatch({ type: actionTypes.UPDATE_TRANSLATION_COMPLETION_STATUS, payload: 'fail' });
			}
		}
		dispatch({ type: actionTypes.GENERATE_TRANSLATION_ACTIVE, payload: false });
		// stop loader
		if (props.sourceComponent === 'BuildValidate') {
			props.loadingStateChanger(false);
		} else if (props.sourceComponent === 'MyHomeCard') {
			dispatch({ type: actionTypes.MY_HOME_LOADER_ACTIVE, payload: false });
		}
		// Allows translation success/fail message to only be visble for 5 seconds and reset TRANSLATED_PACKAGE_NAME back to an empty string
		const timer = setTimeout(() => {
			if (translationResult === true) {
				dispatch({ type: actionTypes.BUILD_UPDATE_TRANSLATE_MESSAGE, payload: '' });
			}
			dispatch({ type: actionTypes.UPDATE_TRANSLATION_COMPLETION_STATUS, payload: '' });
			dispatch({ type: actionTypes.TRANSLATED_PACKAGE_NAME, payload: '' });
		}, 5000);
		return () => clearTimeout(timer);
	};

	const isTranslateDisabled = () => {
		// if there are any checked translate options, translate button will be enabled
		for (const t in isCheckedTranslateTypes) {
			if (isCheckedTranslateTypes[t] === true) {
				return false;
			}
		}
		// else, translate button will be disabled
		return true;
	};

	const renderTranslateTypes = () => {
		const implementedTypes = [];
		const implementedKeys = [];
		for (const t in translateStrings) {
			implementedTypes.push(translateStrings[t].label);
			implementedKeys.push(t);
		}

		return translateTypes.map((type) => {
			if (implementedTypes.includes(type)) {
				let typeIndex = implementedTypes.indexOf(type);
				let key = implementedKeys[typeIndex];
				return (
					<List.Item className='translateListTypeItem'>
						<Checkbox
							label={type}
							checked={isCheckedTranslateTypes[key] ? isCheckedTranslateTypes[key] : false}
							onChange={(e, d) => {
								setIsCheckedTranslateTypes({ ...isCheckedTranslateTypes, [key]: d.checked });
							}}
						/>
					</List.Item>
				);
			} else {
				return (
					<Popup
						className='roleTooltipIcon'
						content={tooltipContent.unknownFormat}
						position='bottom center'
						inverted
						trigger={
							<List.Item>
								<Checkbox label={type} disabled={true} />
							</List.Item>
						}
					/>
				);
			}
		});
	};

	useEffect(() => {
		// only run tranlation generation for the package which has matching index
		if (generateTranslationActive && (props.index === indexForTranslationGeneration || props.sourceComponent === 'BuildValidate')) {
			const generate = async () => {
				clearValidationResults();
				await handleFormatTranslation();
			};
			generate();
		}
	}, [generateTranslationActive]); // NOTE: Compiler wants handleFormatTranslation() as a dependency. This will break the code.

	return (
		<>
			<List
				// prevent the list from displaying over MEP Change Warning Modal
				style={mepChangeWarningModalOpen ? { display: 'none' } : { display: 'initial' }}
			>
				<List.Header className='translateListHeader'>
					<b>Translate to:</b>
				</List.Header>
				<List.Content>{renderTranslateTypes()}</List.Content>
			</List>
			<Button
				className='primaryButton'
				style={mepChangeWarningModalOpen ? { display: 'none' } : { display: 'initial' }} // prevent the list from displaying over MEP Change Warning Modal
				disabled={isTranslateDisabled()}
				onClick={() => {
					// only show MEPChangeWarningModal if the user is attempting to translate an open/unpublished pacakge
					if (props.sourceComponent === 'BuildValidate') {
						dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_OPEN, payload: true });
						dispatch({ type: actionTypes.MEP_CHANGE_WARNING_MODAL_TRIGGER, payload: 'translate' });
						dispatch({ type: actionTypes.MEP_CONTAINS_DEFAULT_TEXT_TRUE });
						dispatch({ type: actionTypes.GENERATE_SUBSET_TRANSLATION_TEXT_TRUE });
					} else if (props.sourceComponent === 'MyHomeCard') {
						dispatch({ type: actionTypes.UPDATE_INDEX_FOR_TRANSLATION_GENERATION, payload: props.index });
						dispatch({ type: actionTypes.GENERATE_TRANSLATION_ACTIVE, payload: true });
					}
				}}
			>
				Translate
			</Button>
		</>
	);
};

export default TranslateList;
