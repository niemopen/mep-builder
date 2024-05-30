import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileRepo } from './schemas/files.interface';
import { FileBlob } from './schemas/fileblob.interface';
import { AuditLogService } from 'src/audit/audit.log.service';
import { MongoRepoService } from '../mongorepository/mongorepo.service';
import { GTRIService } from 'src/GTRIAPI2.0/gtri.service';
import { ErrorLogService } from 'src/error/error.log.service';
import * as collection from '../../util/collection.name.util';
import { ArtifactTreeService } from '../../artifactree/artifacttree.service';
import { FileBlobClass } from '../files/schemas/fileblob.class';
import { Package } from '../mongorepository/schemas/package.interface';
import {
  checkForDuplicates,
  xmlToJson,
  createContext,
  addExtensionsToCMF,
} from 'src/util/translation.util';
import { TranslateDto } from './dto/files.dto';
import { create } from 'xmlbuilder2';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel('FileBlob') private FileBlobModel: Model<FileBlob>,
    @InjectModel('Package') private PackageModel: Model<Package>,
    private AuditLogService: AuditLogService,
    @Inject(forwardRef(() => ArtifactTreeService))
    private ArtifactTreeService: ArtifactTreeService,
    @Inject(forwardRef(() => MongoRepoService))
    private MongoRepoService: MongoRepoService,
    private GTRIService: GTRIService,
    private ErrorLogService: ErrorLogService,
  ) {}
  async saveFileToDB(file, FileRepo: FileRepo): Promise<any> {
    // file parameter should be of File Class type

    // save file to mongodb
    let createdFileBlob;
    try {
      if (FileRepo.fileId !== 'null' && FileRepo.fileId !== null) {
        createdFileBlob = await this.FileBlobModel.findByIdAndUpdate(
          FileRepo.fileId,
          {
            packageId: FileRepo.packageId,
            fileBlob: file,
          },
          { upsert: true, new: true }, // creates if doesnt exist and returns new doc
        );
      } else {
        createdFileBlob = await this.FileBlobModel.create({
          packageId: FileRepo.packageId,
          fileBlob: file,
        });
      }

      createdFileBlob.save();

      this.AuditLogService.create(
        collection.fileblobs,
        FileRepo.auditUser,
        createdFileBlob,
      );

      return { isSuccess: true, fileBlobId: createdFileBlob._id };
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async createUpdateFile(FileRepo, fileObj, fileName, parentNodeId = null) {
    /* This method will create or update a file in the database and artifact tree.
       Input parameters:
            - FileRepo - FileRepo information includes packageId and auditUser
            - fileObj - a File class or FileBlobClass object containing the buffer information of the file
            - fileName - the name of the file, including the extension
            - parentNodeId - if it is known which folder in the artifact tree this item belongs in, then pass in the parentNodeId
    */
    let fileNode = null;

    const fileType = fileName.substring(
      fileName.lastIndexOf('.') + 1,
      fileName.length,
    );

    // check if fileblobId already exists in artifact tree to update
    let fileBlobId = await this.ArtifactTreeService.getArtifactFileBlobId(
      FileRepo.packageId,
      fileName,
      parentNodeId,
    );

    // create or update file in DB
    const saveFile = await this.saveFileToDB(fileObj, {
      packageId: FileRepo.packageId,
      fileId: fileBlobId,
      auditUser: FileRepo.auditUser,
    });

    if (saveFile.isSuccess) {
      // Add artifact to tree
      let artifact;

      // Need to specify tags for certain files
      if (fileName === 'wantlist.xml') {
        artifact = {
          label: fileName,
          fileType: fileType,
          fileBlobId: saveFile.fileBlobId,
          tag: 'Wantlist',
          needsReview: false,
        };
      } else if (fileName === 'extension.xsd') {
        artifact = {
          label: fileName,
          fileType: fileType,
          fileBlobId: saveFile.fileBlobId,
          tag: 'extension',
          needsReview: false,
        };
      } else {
        artifact = {
          label: fileName,
          fileType: fileType,
          fileBlobId: saveFile.fileBlobId,
          needsReview: false,
        };
      }
      fileNode = await this.ArtifactTreeService.AddArtifactToTree(
        FileRepo.packageId,
        artifact,
        parentNodeId,
        FileRepo.auditUser,
      );
    }

    return fileNode;
  }

  async retrieveFile(fileId): Promise<any> {
    const file = await this.FileBlobModel.findOne({
      _id: fileId,
    }).exec();

    return file.fileBlob;
  }

  async translateToJsonLd(FileRepo: FileRepo): Promise<any> {
    try {
      const getFileData = async (xmlFiles) => {
        const validXmlFiles = [];

        xmlFiles.forEach((file) => {
          if (
            // the xml, mpd, and iepd catalogs are not to be translated.
            // if an item doesn't have a fileBlobId then it doesn't have any data in the db, it ignores those to prevent errors
            file.hasOwnProperty('fileBlobId') &&
            !file.label.includes('xml-catalog') &&
            !file.label.includes('mpd-catalog') &&
            !file.label.includes('iepd-catalog')
          ) {
            validXmlFiles.push(file);
          }
        });

        const data = [];

        for (const file of validXmlFiles) {
          const blobData = await this.FileBlobModel.findOne({
            _id: file.fileBlobId,
          }).exec();

          //if blobData is not found skip it
          if (blobData !== null) {
            const blob = blobData.fileBlob;

            //save it's artifactTree info with it's fileBlob data, this info is only used for translation purposes
            data.push({ artifactTreeData: file, fileBlobData: blob });
          }
        }

        return data;
      };

      const translateFiles = async (fileData) => {
        for (const file of fileData) {
          const buffer = file.fileBlobData.buffer.toString('utf-8');

          // translate from xml to json-ld
          const parsed = await xmlToJson(buffer);
          const context = createContext(parsed);
          parsed['@context'] = context; // add context to file
          const jsonld = JSON.stringify(parsed, null, 4);

          const jsonldBuffer = Buffer.from(jsonld);

          //replace the file extension from xml/xsd to jsonld
          const label = file.artifactTreeData.label;
          const fileExtension = label.substring(label.lastIndexOf('.') + 1);
          let jsonldLabel = '';
          if (fileExtension === 'xml' || fileExtension === 'xsd') {
            jsonldLabel = label.replace(fileExtension, 'jsonld');
          }

          const fileBlob = new FileBlobClass(jsonldBuffer, jsonldLabel); // utilizing a user defined class for File Blob because NodeJS does not support Blob or File objects like Javascript does

          if (file.artifactTreeData.isDuplicate) {
            //overwrite the old translated file with the new translated file
            await this.FileBlobModel.findOneAndReplace(
              { _id: file.artifactTreeData.jsonldBlobId }, //find the previous file by it's id
              { packageId: FileRepo.packageId, fileBlob: fileBlob }, // replacement data
              { new: true }, // return update data info
            );
          } else {
            const parentNodeId = this.ArtifactTreeService.getParentNodeId(
              file.artifactTreeData.nodeId,
            );

            // Need to create/update a file in the db, createUpdateFile() also adds artifact to tree, updates in db
            await this.createUpdateFile(
              FileRepo,
              fileBlob,
              jsonldLabel,
              parentNodeId,
            );
          }
        }
      };

      //Grab only xml, xsd, and jsonld files from the artifactTree
      const artifactTreeXML =
        await this.ArtifactTreeService.getArtifactsByFileType(
          FileRepo.packageId,
          'xml',
        );
      const artifactTreeXSD =
        await this.ArtifactTreeService.getArtifactsByFileType(
          FileRepo.packageId,
          'xsd',
        );
      const artifactTreeJSONLD =
        await this.ArtifactTreeService.getArtifactsByFileType(
          FileRepo.packageId,
          'jsonld',
        );

      // place xml and xsd objects into one array for easier processing later
      const artifactTreeXMLAndXSD = artifactTreeXML.concat(artifactTreeXSD);

      //check for previously translated json-ld files
      const xmlFiles = await checkForDuplicates(
        artifactTreeXMLAndXSD,
        artifactTreeJSONLD,
      );

      const fileData = await getFileData(xmlFiles);
      await translateFiles(fileData);

      return { isSuccess: true };
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(
        error,
        FileRepo.auditUser,
      );
    }
  }

  async translateViaCMF(TranslateDto: TranslateDto) {
    // NOTE: This function generates the base files received from the GTRI API.
    //       If we modify files further (ex: add extenstions to CMF), this will need to be done downstream.
    // get current xsd data since this is the format being sent to the API
    try {
      const xsdBuffer = await this.MongoRepoService.getExportFileData({
        packageId: TranslateDto.packageId,
        nodeId: '1.1', // NodeId for the niem xsd folder, without the extensions
        auditUser: TranslateDto.auditUser,
      });

      // send data to api
      const result = await this.GTRIService.transformModel(
        'xsd',
        TranslateDto.translateType,
        xsdBuffer.data,
        TranslateDto.auditUser,
      );

      // create file in artifact tree
      if (result.isSuccess) {
        let fileData = result.data;
        // create file object
        const packageData = await this.PackageModel.findById(
          TranslateDto.packageId,
        );
        let extension;

        // determine extension for file
        switch (TranslateDto.translateType) {
          case 'cmf':
            extension = 'cmf.xml';
            break;
          case 'json_schema':
            fileData = JSON.stringify(fileData);
            extension = 'schema.json';
            break;
          default:
            extension = TranslateDto.translateType;
        }

        const fileName = packageData.packageName + '.' + extension;
        const buff = Buffer.from(fileData, 'utf-8');
        const fileObj = new FileBlobClass(buff, fileName); // utilizing a user defined class for File Blob because NodeJS does not support Blob or File objects like Javascript does

        const newFileNodeId = await this.createUpdateFile(
          {
            packageId: TranslateDto.packageId,
            auditUser: TranslateDto.auditUser,
          },
          fileObj,
          fileName,
          '8', // transforms folder
        );

        if (newFileNodeId) {
          return {
            isSuccess: true,
            data: { fileNodeId: newFileNodeId, fileName: fileName },
          };
        } else {
          return {
            isSuccess: false,
            data: {
              errorId: null,
              errorStatus: 500,
              errorMessage: 'Internal Server Error',
            },
          };
        }
      } else {
        return result;
      }
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(
        error,
        TranslateDto.auditUser,
      );
    }
  }

  async generateCMFFile(packageId, auditUser) {
    // Note: This function uses the base cmf file generated by the GTRI API 2.0 and adds the extension data to it
    const xmlBufferToString = require('xml-buffer-tostring');

    // Allow GTRI API 2.0 to create starting CMF file using xsd folder data
    const result = await this.translateViaCMF({
      translateType: 'cmf',
      packageId: packageId,
      auditUser: auditUser,
    });

    let cmfFileNodeId = '';
    let cmfFileName = '';

    if (result.isSuccess) {
      try {
        // Save file blob info to update after extensions are added
        cmfFileNodeId = result.data.fileNodeId;
        cmfFileName = result.data.fileName;

        // get buffer data for starting cmf file
        const cmfBuffer = await this.MongoRepoService.getExportFileData({
          packageId: packageId,
          nodeId: cmfFileNodeId,
          auditUser: auditUser,
        });
        const cmfFileBinary = cmfBuffer.data;
        const cmfFileBuffer = await Buffer.from(cmfFileBinary.toString());

        // convert buffer to xml object to work with
        const xmlString = xmlBufferToString(cmfFileBuffer);
        const doc = create(xmlString);

        // add extensions to XML
        const rootInfo = await this.MongoRepoService.getCMERootInfo(packageId);
        const extensions =
          await this.MongoRepoService.getAllCustomModelExtensions(packageId);
        if (extensions.length !== 0) {
          await addExtensionsToCMF(
            doc,
            rootInfo,
            extensions,
            this.GTRIService,
            this.ErrorLogService,
            auditUser,
          );
        }

        try {
          // send cmf file through transform model to put elements in proper order (translate cmf to cmf)
          const xml = doc.end({ prettyPrint: true });
          const xmlBuffer = Buffer.from(xml, 'utf-8');
          const finalResult = await this.GTRIService.transformModel(
            'cmf',
            'cmf',
            xmlBuffer,
            auditUser,
          );

          // save updated file to database and artifact tree
          if (finalResult.isSuccess) {
            const finalBuffer = Buffer.from(finalResult.data, 'utf-8');
            const fileObj = new FileBlobClass(finalBuffer, cmfFileName);
            await this.createUpdateFile(
              { packageId: packageId, auditUser: auditUser },
              fileObj,
              cmfFileName,
              '8', // transforms folder
            );

            // return buffer
            return { isSuccess: true, data: finalBuffer };
          } else {
            return await this.ErrorLogService.errorServiceResponse(
              {
                status: 500,
                message: 'Error when saving cmf file.',
              },
              auditUser,
            );
          }
        } catch (error) {
          return await this.ErrorLogService.errorServiceResponse(
            error,
            auditUser,
          );
        }
      } catch (error) {
        return await this.ErrorLogService.errorServiceResponse(
          error,
          auditUser,
        );
      }
    } else {
      return result;
    }
  }

  async copySaveFile(FileRepo: FileRepo): Promise<any> {
    // this funciton copies the FileBlob of a file and saves it under a new fileBlobId. The original file remains unmodified.
    const file = await this.FileBlobModel.findOne({
      _id: FileRepo.fileId,
    }).exec();

    const FileRepoParam: FileRepo = { ...FileRepo, fileId: null }; // setting the fileId to null so it can create a new file id.

    const savetoFileResult = await this.saveFileToDB(
      file.fileBlob,
      FileRepoParam,
    );

    return savetoFileResult; // returns success boolean and the new fileBlobId
  }

  async deleteFileFromDB(FileRepo: FileRepo): Promise<any> {
    // delete file from mongodb
    let deletedFileBlob;
    try {
      if (FileRepo.fileId !== 'null' && FileRepo.fileId !== null) {
        deletedFileBlob = await this.FileBlobModel.findOneAndDelete({
          _id: FileRepo.fileId,
        });

        this.AuditLogService.delete(
          collection.fileblobs,
          FileRepo.auditUser,
          deletedFileBlob,
        );

        return { isSuccess: true, fileBlobId: deletedFileBlob._id };
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
