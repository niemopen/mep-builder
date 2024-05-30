import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cheerio from 'cheerio';
import * as JSZip from 'jszip';
import {
  ParentTypeDto,
  AugmentationDto,
  AssociationDto,
  MigrationDto,
  ReleaseDto,
  DomainDto,
} from './dto/releases.dto';
import {
  NiemProperty,
  NiemType,
  NiemNamespace,
  NiemFacet,
  NiemLocalTerm,
  NiemMetadata,
  NiemTypeContainsProperty,
  NiemTypeUnion,
  NiemChangelogProperty,
  NiemChangelogType,
  NiemChangelogTypeContainsProperty,
  NiemChangelogFacet,
  NiemChangelogNamespace,
} from './schemas/releases.interface';
import {
  convertToAugmentationString,
  convertToAssociationString,
  addChangelogPropertyToDb,
  addChangelogTypeToDb,
  addChangelogTypeContainsPropertyToDb,
  addChangelogFacetToDb,
  addChangelogNamespaceToDb,
  addReleaseFacetToDb,
  addReleaseLocalTermToDb,
  addReleaseMetadataToDb,
  addReleaseNamespaceToDb,
  addReleasePropertyToDb,
  addReleaseTypeContainsPropertyToDb,
  addReleaseTypeToDb,
  addReleaseTypeUnionToDb,
  releaseUploadStatus,
  resetReleaseUploadStatusValues,
  parseReleaseFileViaNiem,
  downloadFile,
  scrape,
  parseChangelogFileViaNiem,
} from '../../util/releases.util';
import {
  getReleaseRange,
  migratePropertySheet,
  migrateTypeSheet,
  migrateTypeHasPropertySheet,
  migrateFacetSheet,
  migrateNamespaceSheet,
} from '../../util/migration.util';
import { ErrorLogService } from 'src/error/error.log.service';
import { FilesService } from '../files/files.service';
import { GTRIService } from 'src/GTRIAPI2.0/gtri.service';
import * as collection from '../../util/collection.name.util';
import { MappingDoc } from '../mongorepository/schemas/mappingdoc.interface';
import { isStringValid } from 'src/util/dataValidation.util';

const fs = require('fs');

@Injectable()
export class ReleasesService {
  constructor(
    private ErrorLogService: ErrorLogService,
    private FilesService: FilesService,
    private GTRIService: GTRIService,
    @InjectModel('NiemProperty') private NiemPropertyModel: Model<NiemProperty>,
    @InjectModel('NiemType') private NiemTypeModel: Model<NiemType>,
    @InjectModel('NiemNamespace')
    private NiemNamespaceModel: Model<NiemNamespace>,
    @InjectModel('NiemFacet') private NiemFacetModel: Model<NiemFacet>,
    @InjectModel('NiemLocalTerm')
    private NiemLocalTermModel: Model<NiemLocalTerm>,
    @InjectModel('NiemMetadata') private NiemMetadataModel: Model<NiemMetadata>,
    @InjectModel('NiemTypeContainsProperty')
    private NiemTypeContainsPropertyModel: Model<NiemTypeContainsProperty>,
    @InjectModel('NiemTypeUnion')
    private NiemTypeUnionModel: Model<NiemTypeUnion>,
    @InjectModel('NiemChangelogProperty')
    private NiemChangelogPropertyModel: Model<NiemChangelogProperty>,
    @InjectModel('NiemChangelogType')
    private NiemChangelogTypeModel: Model<NiemChangelogType>,
    @InjectModel('NiemChangelogTypeContainsProperty')
    private NiemChangelogTypeContainsPropertyModel: Model<NiemChangelogTypeContainsProperty>,
    @InjectModel('NiemChangelogFacet')
    private NiemChangelogFacetModel: Model<NiemChangelogFacet>,
    @InjectModel('NiemChangelogNamespace')
    private NiemChangelogNamespaceModel: Model<NiemChangelogNamespace>,
    @InjectModel('MappingDoc')
    private MappingDocModel: Model<MappingDoc>,
  ) {}

  async getParentType(ParentTypeDto: ParentTypeDto): Promise<any> {
    const result = await this.NiemPropertyModel.find({
      TypeName: ParentTypeDto.searchString,
    });

    return result;
  }

  async getAugmentations(AugmentationDto: AugmentationDto): Promise<any> {
    const augmentationString = convertToAugmentationString(
      AugmentationDto.searchString,
    );
    const result = await this.NiemTypeModel.find({
      TypeName: augmentationString,
      $or: [{ IsAugmentation: 1 }, { IsAugmentation: 'TRUE' }], // Include only Augmentations
    });

    return result;
  }

  async getAssociations(AssociationDto: AssociationDto): Promise<any> {
    const associationString = convertToAssociationString(
      AssociationDto.searchString,
    );
    const result = await this.NiemTypeModel.find({
      TypeName: associationString,
      $or: [{ IsAugmentation: 0 }, { IsAugmentation: 'FALSE' }], // Don't include Augmentations.
    });

    return result;
  }

  updateErrorLog = (errorLogs, userId, collectionName) => {
    if (errorLogs.length > 0) {
      for (let i = 0; i < errorLogs.length; i++) {
        this.ErrorLogService.logError(collectionName, userId, errorLogs[i].log);
      }
    }
  };

  async migrateRelease(MigrationDto: MigrationDto) {
    try {
      // this should reflect the most recent changes. This will be the final version that populates the db
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

      const releaseRange = getReleaseRange(MigrationDto);

      const mappingDoc = await this.MappingDocModel.findOne(
        { packageId: MigrationDto.packageId },
        { mappingDocJSON: 1 },
      );

      draftMappingDoc = JSON.parse(mappingDoc['mappingDocJSON']);

      for (let i = 0; i < releaseRange.length; i++) {
        // we can skip the starting release as the release after it will have the changelog data.
        // For example, if the starting release is 3.0. We will need to search 3.1 Changelog data to see the changes between 3.0 and 3.1
        if (releaseRange[i] !== MigrationDto.startingRelease) {
          const release = releaseRange[i];

          // Property Sheet
          const propertyMigrationResults = await migratePropertySheet(
            release,
            draftMappingDoc,
            this.NiemChangelogPropertyModel,
          );
          draftMappingDoc.propertySheet = propertyMigrationResults.propertyObj; // overwrite the old changes. Only keep the latest changes

          // Type Sheet
          const typeMigrationResults = await migrateTypeSheet(
            release,
            draftMappingDoc,
            this.NiemChangelogTypeModel,
          );
          draftMappingDoc.typeSheet = typeMigrationResults.typeObj;

          // Type Has Property Sheet
          const typeHasPropertyMigrationResults =
            await migrateTypeHasPropertySheet(
              release,
              draftMappingDoc,
              this.NiemChangelogTypeContainsPropertyModel,
            );
          draftMappingDoc.typeHasPropertySheet =
            typeHasPropertyMigrationResults.typeHasPropertyObj;

          // Codes Facet Sheet
          const facetMigrationResults = await migrateFacetSheet(
            release,
            draftMappingDoc,
            this.NiemChangelogFacetModel,
          );
          draftMappingDoc.codesFacetsSheet = facetMigrationResults.facetObj;

          // Namespace Sheet
          const namespaceMigrationResults = await migrateNamespaceSheet(
            release,
            draftMappingDoc,
            this.NiemChangelogNamespaceModel,
          );
          draftMappingDoc.namespaceSheet =
            namespaceMigrationResults.namespaceObj;

          // track all NIEM changes by release
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
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async migrateReleasViaGTRI(MigrationDto: MigrationDto): Promise<any> {
    // get cmf file data
    const cmfFileResult = await this.FilesService.generateCMFFile(
      MigrationDto.packageId,
      MigrationDto.auditUser,
    );

    // call GTRI Migrate models
    const result = await this.GTRIService.migrateModel(
      MigrationDto.startingRelease,
      MigrationDto.endRelease,
      cmfFileResult.data,
      MigrationDto.auditUser,
    );

    if (result.isSuccess) {
      // TODO: Save successful result.data file(s) and handle appropriately in a future ticket or release
      return {
        isSuccess: true,
        data: 'Migration call to GTRI API 2.0 was successful! Results will be handled in future development.',
      };
    } else {
      return result;
    }
  }

  async getNamespaceData(ReleaseDto: ReleaseDto) {
    // release is typed as a double within the db, we must convert the string to a float
    const release = parseFloat(ReleaseDto.release);
    const namespace = await this.NiemNamespaceModel.find({
      Release: release,
    });

    return namespace;
  }

  async getDomainElements(DomainDto: DomainDto) {
    // release is typed as a double within the db, we must convert the string to a float
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
    return releaseUploadStatus;
  }

  addReleaseDataToDb = async (NiemDataDto, releaseData) => {
    try {
      if (releaseData.fileName === 'Facet') {
        const facetErrorLogs = await addReleaseFacetToDb(
          this.NiemFacetModel,
          releaseData,
        );
        this.updateErrorLog(
          facetErrorLogs,
          NiemDataDto.userId,
          collection.niemfacets,
        );
      }
      if (releaseData.fileName === 'LocalTerm') {
        const localTermErrorLogs = await addReleaseLocalTermToDb(
          this.NiemLocalTermModel,
          releaseData,
        );
        this.updateErrorLog(
          localTermErrorLogs,
          NiemDataDto.userId,
          collection.niemlocalterms,
        );
      }
      if (releaseData.fileName === 'Metadata') {
        const metadataErrorLogs = await addReleaseMetadataToDb(
          this.NiemMetadataModel,
          releaseData,
        );
        this.updateErrorLog(
          metadataErrorLogs,
          NiemDataDto.userId,
          collection.niemmetadatas,
        );
      }
      if (releaseData.fileName === 'Namespace') {
        const namespaceErrorLogs = await addReleaseNamespaceToDb(
          this.NiemNamespaceModel,
          releaseData,
        );
        this.updateErrorLog(
          namespaceErrorLogs,
          NiemDataDto.userId,
          collection.niemnamespaces,
        );
      }
      if (releaseData.fileName === 'Property') {
        const propertyErrorLogs = await addReleasePropertyToDb(
          this.NiemPropertyModel,
          releaseData,
        );
        this.updateErrorLog(
          propertyErrorLogs,
          NiemDataDto.userId,
          collection.niemproperties,
        );
      }
      if (releaseData.fileName === 'Type') {
        const typeErrorLogs = await addReleaseTypeToDb(
          this.NiemTypeModel,
          releaseData,
        );
        this.updateErrorLog(
          typeErrorLogs,
          NiemDataDto.userId,
          collection.niemtypes,
        );
      }
      if (releaseData.fileName === 'TypeContainsProperty') {
        const tcpErrorLogs = await addReleaseTypeContainsPropertyToDb(
          this.NiemTypeContainsPropertyModel,
          releaseData,
        );
        this.updateErrorLog(
          tcpErrorLogs,
          NiemDataDto.userId,
          collection.niemtypecontainsproperties,
        );
      }
      if (releaseData.fileName === 'TypeUnion') {
        const typeUnionErrorLogs = await addReleaseTypeUnionToDb(
          this.NiemTypeUnionModel,
          releaseData,
        );
        this.updateErrorLog(
          typeUnionErrorLogs,
          NiemDataDto.userId,
          collection.niemtypeunions,
        );
      }
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(
        error,
        NiemDataDto.userId,
      );
    }
  };

  addChangelogDataToDb = async (NiemDataDto, changelogDataObj) => {
    try {
      // add Property data to db
      releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Property data...`; // update label to reflect what's currently processing
      const propertyErrorLogs = await addChangelogPropertyToDb(
        changelogDataObj.fileRelease,
        changelogDataObj.previousRelease,
        changelogDataObj.Property,
        this.NiemChangelogPropertyModel,
      );

      this.updateErrorLog(
        propertyErrorLogs,
        NiemDataDto.userId,
        collection.niemchangelogproperties,
      );
      releaseUploadStatus.totalCompleted += 1; // update number of completed items

      // add Type data to db
      releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Type data...`;
      const typeErrorLogs = await addChangelogTypeToDb(
        changelogDataObj.fileRelease,
        changelogDataObj.previousRelease,
        changelogDataObj.Type,
        this.NiemChangelogTypeModel,
      );

      this.updateErrorLog(
        typeErrorLogs,
        NiemDataDto.userId,
        collection.niemchangelogtypes,
      );
      releaseUploadStatus.totalCompleted += 1;

      // add TypeContainsProperty data to db
      releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Type Contains Property data...`;
      const tcpErrorLogs = await addChangelogTypeContainsPropertyToDb(
        changelogDataObj.fileRelease,
        changelogDataObj.previousRelease,
        changelogDataObj.TypeContainsProperty,
        this.NiemChangelogTypeContainsPropertyModel,
      );

      this.updateErrorLog(
        tcpErrorLogs,
        NiemDataDto.userId,
        collection.niemchangelogtypecontainsproperties,
      );
      releaseUploadStatus.totalCompleted += 1;

      // add Facet data to db
      releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Facet data...`;
      const facetErrorLogs = await addChangelogFacetToDb(
        changelogDataObj.fileRelease,
        changelogDataObj.previousRelease,
        changelogDataObj.Facet,
        this.NiemChangelogFacetModel,
      );

      this.updateErrorLog(
        facetErrorLogs,
        NiemDataDto.userId,
        collection.niemchangelogfacets,
      );
      releaseUploadStatus.totalCompleted += 1;

      // add Namespace Data to db
      releaseUploadStatus.label = `Loading ${changelogDataObj.fileRelease} Changelog Namespace data...`;
      const namespaceErrorLogs = await addChangelogNamespaceToDb(
        changelogDataObj.fileRelease,
        changelogDataObj.previousRelease,
        changelogDataObj.Namespace,
        this.NiemChangelogNamespaceModel,
      );

      this.updateErrorLog(
        namespaceErrorLogs,
        NiemDataDto.userId,
        collection.niemchangelognamespaces,
      );

      releaseUploadStatus.totalCompleted += 1;
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(
        error,
        NiemDataDto.userId,
      );
    }
  };

  async checkAvailableReleases(userId = ''): Promise<any> {
    try {
      // scrape data from the homepage
      const niemUrl = 'https://release.niem.gov/niem/';
      const homepageHTML = await scrape(niemUrl);

      const $ = cheerio.load(homepageHTML);
      const homePageContents = $('table').find('a').contents();
      let releases = [];

      // if the folder name is able to convert to a float then it is a release folder (ex. 3.2)
      homePageContents.each(function (i, elem) {
        const num = parseFloat($(this).text());
        if (Number.isNaN(num) === false) {
          releases.push($(this).text());
        }
      });

      releases.splice(0, 3); // remove releases prior to 3.0
      const releaseArr = releases.map((release) => {
        return release.slice(0, -1); // remove slash from end of string  (ex. 3.0/)
      });

      return { isSuccess: true, data: releaseArr };
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, userId);
    }
  }

  async updateReleaseViaNiem(userId, currentRelease) {
    try {
      // scrape data from the homepage
      const niemUrl = 'https://release.niem.gov/niem/';
      const homepageHTML = await scrape(niemUrl);
      const $ = cheerio.load(homepageHTML);

      // determine how many releases need to be downloaded to bring the system up to date
      const availableReleaseStatus = await this.checkAvailableReleases(userId);
      if (!availableReleaseStatus.isSuccess) {
        return availableReleaseStatus;
      }

      const releases = availableReleaseStatus.data;
      const releaseRange = getReleaseRange({
        releases: releases,
        startingRelease: currentRelease === undefined ? '3.0' : currentRelease, // If 3.0 release is not loaded set starting release to 3.0
        endRelease: releases[releases.length - 1],
      });

      if (currentRelease !== undefined) {
        releaseRange.splice(0, 1); // remove the current release from range
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

      // calculate total number of items to be processed
      releaseUploadStatus.totalItems =
        releaseRange.length * (releaseFiles.length + 5); // 5 equals number of tabs to process in the Changelog file

      // loop through each release
      for (let i = 0; i < releaseRange.length; i++) {
        // scrape data from the release page
        const release = releaseRange[i];
        const releasePageHTML = await scrape(niemUrl + release);
        const c = cheerio.load(releasePageHTML);
        const releasePageContents = c('a');
        let releaseZipFileName = '';
        let changeLogZipFileName = '';

        const processReleaseFolder = async (data, releaseFiles, release) => {
          // unzip release folder
          const buff = Buffer.from(data, 'base64');
          const zip = new JSZip();
          await zip.loadAsync(buff);

          // begin searching release folder
          const files = zip.files;
          const fileKeys = Object.keys(files);

          for (let k = 0; k < fileKeys.length; k++) {
            const key = fileKeys[k];
            const file = files[key];

            // grab the fileName from the file path
            const fileSplit = file.name.split('/');
            const fileName = fileSplit[fileSplit.length - 1];

            // only parse file if it is a required release file
            if (releaseFiles.includes(fileName)) {
              // update label to reflect what's currently processing
              releaseUploadStatus.label = `Loading ${release} ${fileName} Release data...`;

              const fileBuffer = await file.async('nodebuffer');
              const parsed = parseReleaseFileViaNiem(release, fileBuffer);
              const name = fileName.slice(0, -4); // get fileName without extension (Facet.csv)
              const data = { ...parsed, fileName: name };
              // after parsing load into database
              if (data.data.length > 0) {
                await this.addReleaseDataToDb({ userId: userId }, data);
              }
              releaseUploadStatus.totalCompleted += 1;
            }
          }
        };

        // pre-5.0 release pages are structured differently from post-5.0 release pages
        if (
          release === '3.0' ||
          release === '3.1' ||
          release === '3.2' ||
          release === '4.0' ||
          release === '4.1' ||
          release === '4.2'
        ) {
          // find the link that contains the releases folder
          releasePageContents.each(function (i, elem) {
            // Alternate Data Formats are only found in releases 3.0-4.2
            if ($(this).text() === 'Alternate data formats') {
              releaseZipFileName = $(this).attr('href');
            }
          });

          // find the link that contains the changelog file
          releasePageContents.each(function (i, elem) {
            if ($(this).text() === 'Change log spreadsheet') {
              changeLogZipFileName = $(this).attr('href');
            }
          });

          // if file name is invalid throw error and discontinue process
          if (
            !isStringValid(releaseZipFileName) ||
            !isStringValid(changeLogZipFileName)
          ) {
            return {
              isSuccess: false,
              data: {
                errorId: null,
                errorStatus: 500,
                errorMessage: 'Internal Server Error',
              },
            };
          }

          // download file and unzip it
          const data = await downloadFile(
            niemUrl + release + '/' + releaseZipFileName,
          );
          await processReleaseFolder(data, releaseFiles, release);

          // download file and unzip it
          const changelogFileBuffer = await downloadFile(
            niemUrl + release + '/' + changeLogZipFileName,
          );

          const changelogData = parseChangelogFileViaNiem(
            releases,
            release,
            changelogFileBuffer,
          );

          await this.addChangelogDataToDb({ userId }, changelogData);
        } else {
          // find the link that contains the releases folder
          releasePageContents.each(function (i, elem) {
            if ($(this).text() === 'CSVs') {
              releaseZipFileName = $(this).attr('href');
            }
          });

          // find the link that contains the changelog file
          releasePageContents.each(function (i, elem) {
            if ($(this).text() === 'Change log spreadsheet') {
              changeLogZipFileName = $(this).attr('href');
            }
          });

          // if file name is invalid throw error and discontinue process
          if (
            !isStringValid(releaseZipFileName) ||
            !isStringValid(changeLogZipFileName)
          ) {
            return {
              isSuccess: false,
              data: {
                errorId: null,
                errorStatus: 500,
                errorMessage: 'Internal Server Error',
              },
            };
          }

          // download file and unzip it
          const data = await downloadFile(
            niemUrl + release + '/' + releaseZipFileName,
          );
          await processReleaseFolder(data, releaseFiles, release);

          // download file and unzip it
          const changelogFileBuffer = await downloadFile(
            niemUrl + release + '/' + changeLogZipFileName,
          );

          const changelogData = parseChangelogFileViaNiem(
            releases,
            release,
            changelogFileBuffer,
          );

          await this.addChangelogDataToDb({ userId }, changelogData);
        }
      }

      resetReleaseUploadStatusValues();
      return { isSuccess: true, data: releaseRange };
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, userId);
    }
  }

  async getLoadedReleases() {
    try {
      const loadedReleases = await this.NiemPropertyModel.distinct('Release');
      const sortedReleases = loadedReleases
        .sort() // sort releases so they are presented in numeric ascending order
        .map((releaseNum) => releaseNum.toFixed(1)); // ensure that the first decimal place is always provided
      return { isSuccess: true, data: sortedReleases };
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, '');
    }
  }
}
