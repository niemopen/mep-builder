"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleasesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cheerio = require("cheerio");
const JSZip = require("jszip");
const releases_util_1 = require("../../util/releases.util");
const migration_util_1 = require("../../util/migration.util");
const error_log_service_1 = require("../../error/error.log.service");
const files_service_1 = require("../files/files.service");
const gtri_service_1 = require("../../GTRIAPI2.0/gtri.service");
const collection = require("../../util/collection.name.util");
const dataValidation_util_1 = require("../../util/dataValidation.util");
const fs = require('fs');
let ReleasesService = class ReleasesService {
    constructor(ErrorLogService, FilesService, GTRIService, NiemPropertyModel, NiemTypeModel, NiemNamespaceModel, NiemFacetModel, NiemLocalTermModel, NiemMetadataModel, NiemTypeContainsPropertyModel, NiemTypeUnionModel, NiemChangelogPropertyModel, NiemChangelogTypeModel, NiemChangelogTypeContainsPropertyModel, NiemChangelogFacetModel, NiemChangelogNamespaceModel, MappingDocModel) {
        this.ErrorLogService = ErrorLogService;
        this.FilesService = FilesService;
        this.GTRIService = GTRIService;
        this.NiemPropertyModel = NiemPropertyModel;
        this.NiemTypeModel = NiemTypeModel;
        this.NiemNamespaceModel = NiemNamespaceModel;
        this.NiemFacetModel = NiemFacetModel;
        this.NiemLocalTermModel = NiemLocalTermModel;
        this.NiemMetadataModel = NiemMetadataModel;
        this.NiemTypeContainsPropertyModel = NiemTypeContainsPropertyModel;
        this.NiemTypeUnionModel = NiemTypeUnionModel;
        this.NiemChangelogPropertyModel = NiemChangelogPropertyModel;
        this.NiemChangelogTypeModel = NiemChangelogTypeModel;
        this.NiemChangelogTypeContainsPropertyModel = NiemChangelogTypeContainsPropertyModel;
        this.NiemChangelogFacetModel = NiemChangelogFacetModel;
        this.NiemChangelogNamespaceModel = NiemChangelogNamespaceModel;
        this.MappingDocModel = MappingDocModel;
        this.updateErrorLog = (errorLogs, userId, collectionName) => {
            if (errorLogs.length > 0) {
                for (let i = 0; i < errorLogs.length; i++) {
                    this.ErrorLogService.logError(collectionName, userId, errorLogs[i].log);
                }
            }
        };
        this.addReleaseDataToDb = async (NiemDataDto, releaseData) => {
            try {
                if (releaseData.fileName === 'Facet') {
                    const facetErrorLogs = await (0, releases_util_1.addReleaseFacetToDb)(this.NiemFacetModel, releaseData);
                    this.updateErrorLog(facetErrorLogs, NiemDataDto.userId, collection.niemfacets);
                }
                if (releaseData.fileName === 'LocalTerm') {
                    const localTermErrorLogs = await (0, releases_util_1.addReleaseLocalTermToDb)(this.NiemLocalTermModel, releaseData);
                    this.updateErrorLog(localTermErrorLogs, NiemDataDto.userId, collection.niemlocalterms);
                }
                if (releaseData.fileName === 'Metadata') {
                    const metadataErrorLogs = await (0, releases_util_1.addReleaseMetadataToDb)(this.NiemMetadataModel, releaseData);
                    this.updateErrorLog(metadataErrorLogs, NiemDataDto.userId, collection.niemmetadatas);
                }
                if (releaseData.fileName === 'Namespace') {
                    const namespaceErrorLogs = await (0, releases_util_1.addReleaseNamespaceToDb)(this.NiemNamespaceModel, releaseData);
                    this.updateErrorLog(namespaceErrorLogs, NiemDataDto.userId, collection.niemnamespaces);
                }
                if (releaseData.fileName === 'Property') {
                    const propertyErrorLogs = await (0, releases_util_1.addReleasePropertyToDb)(this.NiemPropertyModel, releaseData);
                    this.updateErrorLog(propertyErrorLogs, NiemDataDto.userId, collection.niemproperties);
                }
                if (releaseData.fileName === 'Type') {
                    const typeErrorLogs = await (0, releases_util_1.addReleaseTypeToDb)(this.NiemTypeModel, releaseData);
                    this.updateErrorLog(typeErrorLogs, NiemDataDto.userId, collection.niemtypes);
                }
                if (releaseData.fileName === 'TypeContainsProperty') {
                    const tcpErrorLogs = await (0, releases_util_1.addReleaseTypeContainsPropertyToDb)(this.NiemTypeContainsPropertyModel, releaseData);
                    this.updateErrorLog(tcpErrorLogs, NiemDataDto.userId, collection.niemtypecontainsproperties);
                }
                if (releaseData.fileName === 'TypeUnion') {
                    const typeUnionErrorLogs = await (0, releases_util_1.addReleaseTypeUnionToDb)(this.NiemTypeUnionModel, releaseData);
                    this.updateErrorLog(typeUnionErrorLogs, NiemDataDto.userId, collection.niemtypeunions);
                }
            }
            catch (error) {
                return await this.ErrorLogService.errorServiceResponse(error, NiemDataDto.userId);
            }
        };
        this.addChangelogDataToDb = async (NiemDataDto, changelogDataObj) => {
            try {
                releases_util_1.releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Property data...`;
                const propertyErrorLogs = await (0, releases_util_1.addChangelogPropertyToDb)(changelogDataObj.fileRelease, changelogDataObj.previousRelease, changelogDataObj.Property, this.NiemChangelogPropertyModel);
                this.updateErrorLog(propertyErrorLogs, NiemDataDto.userId, collection.niemchangelogproperties);
                releases_util_1.releaseUploadStatus.totalCompleted += 1;
                releases_util_1.releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Type data...`;
                const typeErrorLogs = await (0, releases_util_1.addChangelogTypeToDb)(changelogDataObj.fileRelease, changelogDataObj.previousRelease, changelogDataObj.Type, this.NiemChangelogTypeModel);
                this.updateErrorLog(typeErrorLogs, NiemDataDto.userId, collection.niemchangelogtypes);
                releases_util_1.releaseUploadStatus.totalCompleted += 1;
                releases_util_1.releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Type Contains Property data...`;
                const tcpErrorLogs = await (0, releases_util_1.addChangelogTypeContainsPropertyToDb)(changelogDataObj.fileRelease, changelogDataObj.previousRelease, changelogDataObj.TypeContainsProperty, this.NiemChangelogTypeContainsPropertyModel);
                this.updateErrorLog(tcpErrorLogs, NiemDataDto.userId, collection.niemchangelogtypecontainsproperties);
                releases_util_1.releaseUploadStatus.totalCompleted += 1;
                releases_util_1.releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Facet data...`;
                const facetErrorLogs = await (0, releases_util_1.addChangelogFacetToDb)(changelogDataObj.fileRelease, changelogDataObj.previousRelease, changelogDataObj.Facet, this.NiemChangelogFacetModel);
                this.updateErrorLog(facetErrorLogs, NiemDataDto.userId, collection.niemchangelogfacets);
                releases_util_1.releaseUploadStatus.totalCompleted += 1;
                releases_util_1.releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Namespace data...`;
                const namespaceErrorLogs = await (0, releases_util_1.addChangelogNamespaceToDb)(changelogDataObj.fileRelease, changelogDataObj.previousRelease, changelogDataObj.Namespace, this.NiemChangelogNamespaceModel);
                this.updateErrorLog(namespaceErrorLogs, NiemDataDto.userId, collection.niemchangelognamespaces);
                releases_util_1.releaseUploadStatus.totalCompleted += 1;
            }
            catch (error) {
                return await this.ErrorLogService.errorServiceResponse(error, NiemDataDto.userId);
            }
        };
    }
    async getParentType(ParentTypeDto) {
        const result = await this.NiemPropertyModel.find({
            TypeName: ParentTypeDto.searchString,
        });
        return result;
    }
    async getAugmentations(AugmentationDto) {
        const augmentationString = (0, releases_util_1.convertToAugmentationString)(AugmentationDto.searchString);
        const result = await this.NiemTypeModel.find({
            TypeName: augmentationString,
            $or: [{ IsAugmentation: 1 }, { IsAugmentation: 'TRUE' }],
        });
        return result;
    }
    async getAssociations(AssociationDto) {
        const associationString = (0, releases_util_1.convertToAssociationString)(AssociationDto.searchString);
        const result = await this.NiemTypeModel.find({
            TypeName: associationString,
            $or: [{ IsAugmentation: 0 }, { IsAugmentation: 'FALSE' }],
        });
        return result;
    }
    async migrateRelease(MigrationDto) {
        try {
            let draftMappingDoc = {
                propertySheet: [],
                typeSheet: [],
                typeHasPropertySheet: [],
                codesFacetsSheet: [],
                namespaceSheet: [],
                localTerminologySheet: [],
                typeUnionSheet: [],
                metadataSheet: [],
            };
            let niemChanges = {};
            const releaseRange = (0, migration_util_1.getReleaseRange)(MigrationDto);
            const mappingDoc = await this.MappingDocModel.findOne({ packageId: MigrationDto.packageId }, { mappingDocJSON: 1 });
            draftMappingDoc = JSON.parse(mappingDoc['mappingDocJSON']);
            for (let i = 0; i < releaseRange.length; i++) {
                if (releaseRange[i] !== MigrationDto.startingRelease) {
                    const release = releaseRange[i];
                    const propertyMigrationResults = await (0, migration_util_1.migratePropertySheet)(release, draftMappingDoc, this.NiemChangelogPropertyModel);
                    draftMappingDoc.propertySheet = propertyMigrationResults.propertyObj;
                    const typeMigrationResults = await (0, migration_util_1.migrateTypeSheet)(release, draftMappingDoc, this.NiemChangelogTypeModel);
                    draftMappingDoc.typeSheet = typeMigrationResults.typeObj;
                    const typeHasPropertyMigrationResults = await (0, migration_util_1.migrateTypeHasPropertySheet)(release, draftMappingDoc, this.NiemChangelogTypeContainsPropertyModel);
                    draftMappingDoc.typeHasPropertySheet =
                        typeHasPropertyMigrationResults.typeHasPropertyObj;
                    const facetMigrationResults = await (0, migration_util_1.migrateFacetSheet)(release, draftMappingDoc, this.NiemChangelogFacetModel);
                    draftMappingDoc.codesFacetsSheet = facetMigrationResults.facetObj;
                    const namespaceMigrationResults = await (0, migration_util_1.migrateNamespaceSheet)(release, draftMappingDoc, this.NiemChangelogNamespaceModel);
                    draftMappingDoc.namespaceSheet =
                        namespaceMigrationResults.namespaceObj;
                    niemChanges[release] = {
                        propertyChanges: propertyMigrationResults.changesObj,
                        typeChanges: typeMigrationResults.changesObj,
                        typeHasPropertyChanges: typeHasPropertyMigrationResults.changesObj,
                        codesFacetsChanges: facetMigrationResults.changesObj,
                        namespaceChanges: namespaceMigrationResults.changesObj,
                    };
                }
            }
            return {
                originalMappingDoc: JSON.parse(mappingDoc['mappingDocJSON']),
                newMappingDoc: draftMappingDoc,
                niemChanges: niemChanges,
            };
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    async migrateReleasViaGTRI(MigrationDto) {
        const cmfFileResult = await this.FilesService.generateCMFFile(MigrationDto.packageId, MigrationDto.auditUser);
        const result = await this.GTRIService.migrateModel(MigrationDto.startingRelease, MigrationDto.endRelease, cmfFileResult.data, MigrationDto.auditUser);
        if (result.isSuccess) {
            return {
                isSuccess: true,
                data: 'Migration call to GTRI API 2.0 was successful! Results will be handled in future development.',
            };
        }
        else {
            return result;
        }
    }
    async getNamespaceData(ReleaseDto) {
        const release = parseFloat(ReleaseDto.release);
        const namespace = await this.NiemNamespaceModel.find({
            Release: release,
        });
        return namespace;
    }
    async getDomainElements(DomainDto) {
        const release = parseFloat(DomainDto.release);
        const property = await this.NiemPropertyModel.find({
            Release: release,
            PropertyNamespacePrefix: DomainDto.domainPrefix,
        });
        const type = await this.NiemTypeModel.find({
            Release: release,
            TypeNamespacePrefix: DomainDto.domainPrefix,
        });
        return { property: property, type: type };
    }
    getReleaseProgressStatus() {
        return releases_util_1.releaseUploadStatus;
    }
    async checkAvailableReleases(userId = '') {
        try {
            const niemUrl = 'https://release.niem.gov/niem/';
            const homepageHTML = await (0, releases_util_1.scrape)(niemUrl);
            const $ = cheerio.load(homepageHTML);
            const homePageContents = $('table').find('a').contents();
            let releases = [];
            homePageContents.each(function (i, elem) {
                const num = parseFloat($(this).text());
                if (Number.isNaN(num) === false) {
                    releases.push($(this).text());
                }
            });
            releases.splice(0, 3);
            const releaseArr = releases.map((release) => {
                return release.slice(0, -1);
            });
            return { isSuccess: true, data: releaseArr };
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, userId);
        }
    }
    async updateReleaseViaNiem(userId, currentRelease) {
        try {
            const niemUrl = 'https://release.niem.gov/niem/';
            const homepageHTML = await (0, releases_util_1.scrape)(niemUrl);
            const $ = cheerio.load(homepageHTML);
            const availableReleaseStatus = await this.checkAvailableReleases(userId);
            if (!availableReleaseStatus.isSuccess) {
                return availableReleaseStatus;
            }
            const releases = availableReleaseStatus.data;
            const releaseRange = (0, migration_util_1.getReleaseRange)({
                releases: releases,
                startingRelease: currentRelease === undefined ? '3.0' : currentRelease,
                endRelease: releases[releases.length - 1],
            });
            if (currentRelease !== undefined) {
                releaseRange.splice(0, 1);
            }
            const releaseFiles = [
                'Facet.csv',
                'LocalTerm.csv',
                'Metadata.csv',
                'Namespace.csv',
                'Property.csv',
                'Type.csv',
                'TypeContainsProperty.csv',
                'TypeUnion.csv',
            ];
            releases_util_1.releaseUploadStatus.totalItems =
                releaseRange.length * (releaseFiles.length + 5);
            for (let i = 0; i < releaseRange.length; i++) {
                const release = releaseRange[i];
                const releasePageHTML = await (0, releases_util_1.scrape)(niemUrl + release);
                const c = cheerio.load(releasePageHTML);
                const releasePageContents = c('a');
                let releaseZipFileName = '';
                let changeLogZipFileName = '';
                const processReleaseFolder = async (data, releaseFiles, release) => {
                    const buff = Buffer.from(data, 'base64');
                    const zip = new JSZip();
                    await zip.loadAsync(buff);
                    const files = zip.files;
                    const fileKeys = Object.keys(files);
                    for (let k = 0; k < fileKeys.length; k++) {
                        const key = fileKeys[k];
                        const file = files[key];
                        const fileSplit = file.name.split('/');
                        const fileName = fileSplit[fileSplit.length - 1];
                        if (releaseFiles.includes(fileName)) {
                            releases_util_1.releaseUploadStatus.label = `Loading ${release} ${fileName} Release data...`;
                            const fileBuffer = await file.async('nodebuffer');
                            const parsed = (0, releases_util_1.parseReleaseFileViaNiem)(release, fileBuffer);
                            const name = fileName.slice(0, -4);
                            const data = Object.assign(Object.assign({}, parsed), { fileName: name });
                            if (data.data.length > 0) {
                                await this.addReleaseDataToDb({ userId: userId }, data);
                            }
                            releases_util_1.releaseUploadStatus.totalCompleted += 1;
                        }
                    }
                };
                if (release === '3.0' ||
                    release === '3.1' ||
                    release === '3.2' ||
                    release === '4.0' ||
                    release === '4.1' ||
                    release === '4.2') {
                    releasePageContents.each(function (i, elem) {
                        if ($(this).text() === 'Alternate data formats') {
                            releaseZipFileName = $(this).attr('href');
                        }
                    });
                    releasePageContents.each(function (i, elem) {
                        if ($(this).text() === 'Change log spreadsheet') {
                            changeLogZipFileName = $(this).attr('href');
                        }
                    });
                    if (!(0, dataValidation_util_1.isStringValid)(releaseZipFileName) ||
                        !(0, dataValidation_util_1.isStringValid)(changeLogZipFileName)) {
                        return {
                            isSuccess: false,
                            data: {
                                errorId: null,
                                errorStatus: 500,
                                errorMessage: 'Internal Server Error',
                            },
                        };
                    }
                    const data = await (0, releases_util_1.downloadFile)(niemUrl + release + '/' + releaseZipFileName);
                    await processReleaseFolder(data, releaseFiles, release);
                    const changelogFileBuffer = await (0, releases_util_1.downloadFile)(niemUrl + release + '/' + changeLogZipFileName);
                    const changelogData = (0, releases_util_1.parseChangelogFileViaNiem)(releases, release, changelogFileBuffer);
                    await this.addChangelogDataToDb({ userId }, changelogData);
                }
                else {
                    releasePageContents.each(function (i, elem) {
                        if ($(this).text() === 'CSVs') {
                            releaseZipFileName = $(this).attr('href');
                        }
                    });
                    releasePageContents.each(function (i, elem) {
                        if ($(this).text() === 'Change log spreadsheet') {
                            changeLogZipFileName = $(this).attr('href');
                        }
                    });
                    if (!(0, dataValidation_util_1.isStringValid)(releaseZipFileName) ||
                        !(0, dataValidation_util_1.isStringValid)(changeLogZipFileName)) {
                        return {
                            isSuccess: false,
                            data: {
                                errorId: null,
                                errorStatus: 500,
                                errorMessage: 'Internal Server Error',
                            },
                        };
                    }
                    const data = await (0, releases_util_1.downloadFile)(niemUrl + release + '/' + releaseZipFileName);
                    await processReleaseFolder(data, releaseFiles, release);
                    const changelogFileBuffer = await (0, releases_util_1.downloadFile)(niemUrl + release + '/' + changeLogZipFileName);
                    const changelogData = (0, releases_util_1.parseChangelogFileViaNiem)(releases, release, changelogFileBuffer);
                    await this.addChangelogDataToDb({ userId }, changelogData);
                }
            }
            (0, releases_util_1.resetReleaseUploadStatusValues)();
            return { isSuccess: true, data: releaseRange };
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, userId);
        }
    }
    async getLoadedReleases() {
        try {
            const loadedReleases = await this.NiemPropertyModel.distinct('Release');
            const sortedReleases = loadedReleases
                .sort()
                .map((releaseNum) => releaseNum.toFixed(1));
            return { isSuccess: true, data: sortedReleases };
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, '');
        }
    }
};
ReleasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, mongoose_1.InjectModel)('NiemProperty')),
    __param(4, (0, mongoose_1.InjectModel)('NiemType')),
    __param(5, (0, mongoose_1.InjectModel)('NiemNamespace')),
    __param(6, (0, mongoose_1.InjectModel)('NiemFacet')),
    __param(7, (0, mongoose_1.InjectModel)('NiemLocalTerm')),
    __param(8, (0, mongoose_1.InjectModel)('NiemMetadata')),
    __param(9, (0, mongoose_1.InjectModel)('NiemTypeContainsProperty')),
    __param(10, (0, mongoose_1.InjectModel)('NiemTypeUnion')),
    __param(11, (0, mongoose_1.InjectModel)('NiemChangelogProperty')),
    __param(12, (0, mongoose_1.InjectModel)('NiemChangelogType')),
    __param(13, (0, mongoose_1.InjectModel)('NiemChangelogTypeContainsProperty')),
    __param(14, (0, mongoose_1.InjectModel)('NiemChangelogFacet')),
    __param(15, (0, mongoose_1.InjectModel)('NiemChangelogNamespace')),
    __param(16, (0, mongoose_1.InjectModel)('MappingDoc')),
    __metadata("design:paramtypes", [error_log_service_1.ErrorLogService,
        files_service_1.FilesService,
        gtri_service_1.GTRIService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReleasesService);
exports.ReleasesService = ReleasesService;
//# sourceMappingURL=releases.service.js.map