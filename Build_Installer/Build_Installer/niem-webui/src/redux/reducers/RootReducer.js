import AdminModuleReducer from './AdminModuleReducer';
import AnalyzeRequirementsReducer from './AnalyzeRequirementsReducer';
import ApiErrorReducer from './ApiErrorReducer';
import ArtifactTreeReducer from './ArtifactTreeReducer';
import AssembleDocumentReducer from './AssembleDocumentReducer';
import BuildValidateReducer from './BuildValidateReducer';
import CMEBuilderReducer from './CMEBuilderReducer';
import { combineReducers } from 'redux';
import ConfirmArtifactDeleteModalReducer from './ConfirmArtifactDeleteModalReducer';
import ContactModalReducer from './ContactModalReducer';
import CopyMEPFromMyHomeReducer from './CopyMEPMyHomeModalReducer';
import CopyMigrateWarningModalReducer from './CopyMigrateWarningModalReducer';
import ExistingFileNameModalReducer from './ExistingFileNameModalReducer';
import ExistingMEPNameModalReducer from './ExistingMEPNameModalReducer';
import HeaderNavReducer from './HeaderNavReducer';
import LeftNavSidebarReducer from './LeftNavSidebarReducer';
import LogOutModalReducer from './LogOutModalReducer';
import MapAndModelReducer from './MapAndModelReducer';
import MappingDocumentReducer from './MappingDocumentReducer';
import MEPChangeWarningModalReducer from './MEPChangeWarningModalReducer';
import ModifyArtifactTreeModalReducer from './ModifyArtifactTreeModalReducer';
import MPDCatalogReducer from './MPDCatalogReducer';
import MyHomeReducer from './MyHomeReducer';
import NiemDataReducer from './NiemDataReducer';
import PackagesListReducer from './PackagesListReducer';
import PasswordExpiringMessageReducer from './PasswordExpiringMessageReducer';
import PublishImplementReducer from './PublishImplementReducer';
import ReleaseMigrationReducer from './ReleaseMigrationReducer';
import ReleaseModalReducer from './ReleaseModalReducer';
import RequestAccountModalReducer from './RequestAccountModalReducer';
import ResetPasswordModalReducer from './ResetPasswordModalReducer';
import SampleOptionsModalReducer from './SampleOptionsModalReducer';
import ScenarioPlanning from './ScenarioPlanningReducer';
import SessionReducer from './SessionReducer';
import SSGTModalStateReducer from './SSGTModalStateReducer';
import TopNavReducer from './TopNavReducer';
import TransferPackagesModalReducer from './TransferPackagesModalReducer';
import TranslateReducer from './TranslateReducer';
import UploadArtifactReducer from './UploadArtifactReducer';
import UserManagementModalReducer from './UserManagementModalReducer';
import UserProfileModalReducer from './UserProfileModalReducer';

const RootReducer = combineReducers({
	admin: AdminModuleReducer,
	analyze: AnalyzeRequirementsReducer,
	artifact: ArtifactTreeReducer,
	assemble: AssembleDocumentReducer,
	build: BuildValidateReducer,
	cme: CMEBuilderReducer,
	confirm: ConfirmArtifactDeleteModalReducer,
	contact: ContactModalReducer,
	copyMEP: CopyMEPFromMyHomeReducer,
	copyMigrateWarning: CopyMigrateWarningModalReducer,
	data: NiemDataReducer,
	error: ApiErrorReducer,
	existing: ExistingMEPNameModalReducer,
	existingFile: ExistingFileNameModalReducer,
	header: HeaderNavReducer,
	home: MyHomeReducer,
	logout: LogOutModalReducer,
	mapping: MapAndModelReducer,
	mappingDoc: MappingDocumentReducer,
	mepChangeWarning: MEPChangeWarningModalReducer,
	migration: ReleaseMigrationReducer,
	modifyArtifact: ModifyArtifactTreeModalReducer,
	mpd: MPDCatalogReducer,
	packagesList: PackagesListReducer,
	passwordExpiring: PasswordExpiringMessageReducer,
	planning: ScenarioPlanning,
	publish: PublishImplementReducer,
	release: ReleaseModalReducer,
	requestAccount: RequestAccountModalReducer,
	resetPassword: ResetPasswordModalReducer,
	sample: SampleOptionsModalReducer,
	session: SessionReducer,
	sidebar: LeftNavSidebarReducer,
	ssgt: SSGTModalStateReducer,
	top: TopNavReducer,
	translate: TranslateReducer,
	transfer: TransferPackagesModalReducer,
	upload: UploadArtifactReducer,
	userManagement: UserManagementModalReducer,
	userProfile: UserProfileModalReducer,
});

export default RootReducer;
