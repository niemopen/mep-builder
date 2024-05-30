import * as _ from 'lodash';
import * as JSZip from 'jszip';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SavePackageDto,
  SaveCMEDataDto,
  ExportPackageDto,
  MappingComponentDto,
  CommonComponentsDto,
  DeletePackageDto,
  TransferPackagesDto,
} from './dto/mongorepo.dto';
import * as collection from '../../util/collection.name.util';
import { FileBlobClass } from '../files/schemas/fileblob.class';
import { AuditLogService } from 'src/audit/audit.log.service';
import { ArtifactTreeService } from 'src/artifactree/artifacttree.service';
import { FilesService } from '../files/files.service';
import { GTRIService } from 'src/GTRIAPI2.0/gtri.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { UserService } from 'src/user/user.service';
import { Package } from './schemas/package.interface';
import { ArtifactTree } from './schemas/artifacttree.interface';
import { FileBlob } from '../files/schemas/fileblob.interface';
import { MappingDoc } from './schemas/mappingdoc.interface';
import { PropertyComponent } from './schemas/components/propertycomponent.interface';
import { TypeComponent } from './schemas/components/typecomponent.interface';
import { TypeHasPropertyComponent } from './schemas/components/typehaspropertycomponent.interface';
import { CodesFacetsComponent } from './schemas/components/codesfacetscomponent.interface';
import { NamespaceComponent } from './schemas/components/namespacecomponent.interface';
import { LocalTerminologyComponent } from './schemas/components/localterminologycomponent.interface';
import { TypeUnionComponent } from './schemas/components/typeunioncomponent.interface';
import { MetadataComponent } from './schemas/components/metadatacomponent.interface';
import { PropertyCommonNIEMComponent } from './schemas/components/propertycommonniemcomponent.interface';
import { TypeCommonNIEMComponent } from './schemas/components/typecommonniemcomponent.interface';
import { CustomModelExtension } from './schemas/custommodelextension.interface';
import { stringify } from 'querystring';

@Injectable()
export class MongoRepoService {
  constructor(
    private AuditLogService: AuditLogService,
    private ArtifactTreeService: ArtifactTreeService,
    private FilesService: FilesService,
    private GTRIService: GTRIService,
    private ErrorLogService: ErrorLogService,
    private UserService: UserService,
    @InjectModel('Package') private PackageModel: Model<Package>,
    @InjectModel('ArtifactTree') private ArtifactTreeModel: Model<ArtifactTree>,
    @InjectModel('FileBlob') private FileBlobModel: Model<FileBlob>,
    @InjectModel('MappingDoc') private MappingDocModel: Model<MappingDoc>,
    @InjectModel('PropertyComponent')
    private PropertyComponentModel: Model<PropertyComponent>,
    @InjectModel('TypeComponent')
    private TypeComponentModel: Model<TypeComponent>,
    @InjectModel('TypeHasPropertyComponent')
    private TypeHasPropertyComponentModel: Model<TypeHasPropertyComponent>,
    @InjectModel('CodesFacetsComponent')
    private CodesFacetsComponentModel: Model<CodesFacetsComponent>,
    @InjectModel('NamespaceComponent')
    private NamespaceComponentModel: Model<NamespaceComponent>,
    @InjectModel('LocalTerminologyComponent')
    private LocalTerminologyComponentModel: Model<LocalTerminologyComponent>,
    @InjectModel('TypeUnionComponent')
    private TypeUnionComponentModel: Model<TypeUnionComponent>,
    @InjectModel('MetadataComponent')
    private MetadataComponentModel: Model<MetadataComponent>,
    @InjectModel('PropertyCommonNIEMComponent')
    private PropertyCommonNIEMComponentModel: Model<PropertyCommonNIEMComponent>,
    @InjectModel('TypeCommonNIEMComponent')
    private TypeCommonNIEMComponentModel: Model<TypeCommonNIEMComponent>,
    @InjectModel('CustomModelExtension')
    private CMEModel: Model<CustomModelExtension>,
  ) {}

  async savePackage(SavePackageDto: SavePackageDto, auditUser): Promise<any> {
    try {
      // Save Package
      let packageExists = false;
      let artifactTree;
      let mappingDoc;
      let packageData;

      // check if existing packageId exists in database with the same package name. If the name has changed, it should be created as a new package instead.
      if (SavePackageDto.packageId) {
        let findPackageResult = await this.PackageModel.findOne(
          { _id: SavePackageDto.packageId },
          { packageName: 1, _id: 0 },
        );

        const currentPackageName = findPackageResult['packageName'];

        if (currentPackageName === SavePackageDto.packageName) {
          packageExists = true;
        } else {
          packageExists = false;
        }
      } else {
        packageExists = false;
      }

      if (packageExists) {
        // update artifact tree
        const ogArtifactTree = await this.ArtifactTreeModel.findOne({
          packageId: SavePackageDto.packageId,
        });

        const modArtifactTree = await this.ArtifactTreeModel.findOneAndUpdate(
          { packageId: SavePackageDto.packageId },
          { artifactTreeJSON: SavePackageDto.artifactTree },
          { new: true }, // returns the document after update
        );

        // if artifact tree updated, create audit log
        if (!_.isEqual(ogArtifactTree, modArtifactTree)) {
          this.AuditLogService.update(
            collection.artifacttrees,
            auditUser,
            modArtifactTree,
            ogArtifactTree,
          );
        }

        // Update Mapping Doc
        const ogMappingDoc = await this.MappingDocModel.findOne({
          packageId: SavePackageDto.packageId,
        });
        const modMappingDoc = (mappingDoc =
          await this.MappingDocModel.findOneAndUpdate(
            { packageId: SavePackageDto.packageId },
            { mappingDocJSON: SavePackageDto.mappingDoc },
            { new: true }, // returns the document after update
          ));

        // if Mapping Doc updated, create audit log
        if (!_.isEqual(ogMappingDoc, modMappingDoc)) {
          this.AuditLogService.update(
            collection.mappingdocs,
            auditUser,
            modMappingDoc,
            ogMappingDoc,
          );
        }

        // Update package
        const ogPackageData = await this.PackageModel.findById(
          SavePackageDto.packageId,
        );
        packageData = await this.PackageModel.findByIdAndUpdate(
          SavePackageDto.packageId,
          {
            userId: SavePackageDto.userId,
            packageName: SavePackageDto.packageName,
            niemRelease: SavePackageDto.niemRelease,
            version: SavePackageDto.version,
            status: SavePackageDto.status,
            statusNo: SavePackageDto.statusNo,
            poc: SavePackageDto.poc,
            pocEmail: SavePackageDto.pocEmail,
            description: SavePackageDto.description,
            orgName: SavePackageDto.orgName,
            orgType: SavePackageDto.orgType,
            coiTags: SavePackageDto.coiTags,
            exchangeTags: SavePackageDto.exchangeTags,
            format: SavePackageDto.format,
            isReleaseLocked: SavePackageDto.isReleaseLocked,
            isRequiredArtifactUploaded:
              SavePackageDto.isRequiredArtifactUploaded,
            cmeData: SavePackageDto.cmeData,
            isPublished: SavePackageDto.isPublished,
            isCopiedPackage: SavePackageDto.isCopiedPackage,
            isMigratedPackage: SavePackageDto.isMigratedPackage,
            isTranslationGenerated: SavePackageDto.isTranslationGenerated,
            validationArtifacts: SavePackageDto.validationArtifacts,
            showValidationResults: SavePackageDto.showValidationResults,
          },
          { new: true }, // returns the document after update
        );

        // if packageData updated, create audit log
        if (!_.isEqual(ogPackageData, packageData)) {
          this.AuditLogService.update(
            collection.packages,
            auditUser,
            packageData,
            ogPackageData,
          );
        }

        return SavePackageDto.packageId;
      } else {
        // create new package
        packageData = await this.PackageModel.create({
          userId: SavePackageDto.userId,
          packageName: SavePackageDto.packageName,
          niemRelease: SavePackageDto.niemRelease,
          version: SavePackageDto.version,
          status: SavePackageDto.status,
          statusNo: SavePackageDto.statusNo,
          poc: SavePackageDto.poc,
          pocEmail: SavePackageDto.pocEmail,
          description: SavePackageDto.description,
          orgName: SavePackageDto.orgName,
          orgType: SavePackageDto.orgType,
          coiTags: SavePackageDto.coiTags,
          exchangeTags: SavePackageDto.exchangeTags,
          format: SavePackageDto.format,
          isReleaseLocked: SavePackageDto.isReleaseLocked,
          isRequiredArtifactUploaded: SavePackageDto.isRequiredArtifactUploaded,
          cmeData: SavePackageDto.cmeData,
          isPublished: SavePackageDto.isPublished,
          isCopiedPackage: SavePackageDto.isCopiedPackage,
          isMigratedPackage: SavePackageDto.isMigratedPackage,
          isTranslationGenerated: SavePackageDto.isTranslationGenerated,
          validationArtifacts: SavePackageDto.validationArtifacts,
          showValidationResults: SavePackageDto.showValidationResults,
        });
        packageData.save();

        this.AuditLogService.create(
          collection.packages,
          auditUser,
          packageData,
        );

        // create new artifact tree
        artifactTree = await this.ArtifactTreeModel.create({
          packageId: packageData._id,
          artifactTreeJSON: SavePackageDto.artifactTree,
        });
        artifactTree.save();

        this.AuditLogService.create(
          collection.artifacttrees,
          auditUser,
          artifactTree,
        );

        // create new mapping doc
        mappingDoc = await this.MappingDocModel.create({
          packageId: packageData._id,
          mappingDocJSON: SavePackageDto.mappingDoc,
        });
        mappingDoc.save();

        this.AuditLogService.create(
          collection.mappingdocs,
          auditUser,
          mappingDoc,
        );

        return packageData._id;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async createArtifactFileForDB(file, SSGTDTO, currentPath): Promise<any> {
    // function to create an artifact tree node for a File
    let artifact;

    // create a fileblob in the DB and get fileblobid that will be stored in the artifact tree
    const fileBuffer = await file.async('nodeBuffer');
    const fileBlob = new FileBlobClass(fileBuffer, currentPath); // utilizing a user defined class for File Blob because NodeJS does not support Blob or File objects like Javascript does
    const fileAddResult = await this.FilesService.saveFileToDB(fileBlob, {
      packageId: SSGTDTO.packageId,
      fileId: null,
      auditUser: SSGTDTO.auditUser,
    });
    const fileBlobId = fileAddResult.fileBlobId;

    // Get fileType extenstion based on the file name
    const fileType = currentPath.substring(
      currentPath.lastIndexOf('.') + 1,
      currentPath.length,
    );

    // create artifact node that will be added to the artifact tree
    artifact = {
      label: currentPath,
      fileType: fileType,
      fileBlobId: fileBlobId,
    };

    return artifact;
  }

  async saveSubsetSchema(encodedString, SSGTDTO): Promise<any> {
    try {
      // Get current Artifact Tree from DB
      let artifactTree = await this.ArtifactTreeService.getArtifactTreeJSON(
        SSGTDTO.packageId,
      );

      if (artifactTree) {
        // SubsetSchemas are saved within the base-xsd folder
        const baseNodeId = await this.ArtifactTreeService.getNodeIdByLabel(
          artifactTree,
          'base-xsd',
        );

        // read zip file
        const buff = Buffer.from(encodedString, 'base64');
        const zip = new JSZip();
        await zip.loadAsync(buff);

        // get file items
        const files = zip.files;
        const fileKeys = Object.keys(files);

        // store each item of the zip file in the Artifact Tree
        for (let k = 0; k < fileKeys.length; k++) {
          // update Artifact Tree from DB
          artifactTree = await this.ArtifactTreeService.getArtifactTreeJSON(
            SSGTDTO.packageId,
          );
          let key = fileKeys[k];
          let file = files[key];

          const pathParts = file.name.split('/');
          let currentNode = baseNodeId;

          // go through path and create or update folders/files
          for (let i = 0; i < pathParts.length; i++) {
            let currentPath = pathParts[i];
            let currentBranch =
              await this.ArtifactTreeService.getBranchChildren(
                artifactTree,
                currentNode,
              );

            let artifact = {};

            // create file object
            let fileBuffer = await file.async('nodebuffer');
            let fileObj = new FileBlobClass(fileBuffer, currentPath); // utilizing a user defined class for File Blob because NodeJS does not support Blob or File objects like Javascript does

            // check if current path exists
            let existingNode = await this.ArtifactTreeService.getNodeIdByLabel(
              currentBranch,
              currentPath,
            );

            if (existingNode === -1) {
              // node does not exist

              if (i === pathParts.length - 1) {
                // Need to create a file in the db, createUpdateFile() also adds artifact to tree, updates in db
                currentNode = await this.FilesService.createUpdateFile(
                  {
                    packageId: SSGTDTO.packageId,
                    auditUser: SSGTDTO.auditUser,
                  },
                  fileObj,
                  currentPath,
                  currentNode,
                );
              } else {
                // Need to create a folder
                artifact = {
                  label: currentPath,
                  fileType: 'folder',
                };

                // add artifact to tree, updates in DB
                currentNode = await this.ArtifactTreeService.AddArtifactToTree(
                  SSGTDTO.packageId,
                  artifact,
                  currentNode,
                  SSGTDTO.auditUser,
                );
              }
            } else {
              // node already exists
              if (i === pathParts.length - 1) {
                // Need to overwrite a file in the db.
                currentNode = await this.FilesService.createUpdateFile(
                  {
                    packageId: SSGTDTO.packageId,
                    auditUser: SSGTDTO.auditUser,
                  },
                  fileObj,
                  currentPath,
                  currentNode,
                );
              } else {
                currentNode = existingNode;
                // make folder visible
                await this.ArtifactTreeService.makeBranchVisible(
                  currentNode,
                  SSGTDTO.packageId,
                  SSGTDTO.auditUser,
                );
              }
            }
          }
        }
        return { isSuccess: true };
      } else {
        return await this.ErrorLogService.errorServiceResponse(
          {
            response: { status: 500 },
            message:
              'saveSubsetSchema was unable to retrieve an Artifact Tree.',
          },
          SSGTDTO.auditUser,
        );
      }
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(
        error,
        SSGTDTO.auditUser,
      );
    }
  }

  async getChildren(items, nestedFolder) {
    for (let i = 0; i < items.length; i++) {
      if (items[i]['isVisible'] == true && items[i]['fileType'] != 'folder') {
        // item is a file, get fileData
        const fileDBResult = await this.FileBlobModel.findById(
          items[i]['fileBlobId'],
        );
        const fileData = fileDBResult['fileBlob']['buffer']['buffer'];
        nestedFolder.file(items[i]['label'], fileData);
      } else {
        // item is a folder, loop through to get children
        const subFolder = nestedFolder.folder(items[i]['label']);
        await this.getChildren(items[i]['children'], subFolder);
      }
    }
  }

  async generateZip(artifactNode) {
    const zip = new JSZip();
    const parentFolder = zip.folder(artifactNode['label']);

    await this.getChildren(artifactNode.children, parentFolder);

    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  async getExportFileData(ExportPackageDto: ExportPackageDto): Promise<any> {
    // get artifact tree json
    const artifactTree = await this.ArtifactTreeService.getArtifactTreeJSON(
      ExportPackageDto.packageId,
    );

    // get artifact tree node and children
    let artifactNode;

    const loopThrough = (items) => {
      items.forEach((item) => {
        if (item.nodeId === ExportPackageDto.nodeId) {
          artifactNode = item;
        }
        const children = item.children;
        if (children && children.length > 0) {
          loopThrough(children);
        }
      });
    };

    loopThrough(artifactTree);

    // check if artifact tree node is a file or folder
    if (artifactNode['fileType'] === 'folder') {
      // export item is a folder and a zip folder needs to be created
      const zipBuffer = await this.generateZip(artifactNode);
      return { data: zipBuffer, type: 'zip' };
    } else {
      // export item is a file
      const fileDBResult = await this.FileBlobModel.findById(
        artifactNode['fileBlobId'],
      );

      const fileBuffer = fileDBResult['fileBlob']['buffer'];
      const fileName = fileDBResult['fileBlob']['originalname'];
      const fileType = fileName.substring(
        fileName.lastIndexOf('.') + 1,
        fileName.length,
      );

      return { data: fileBuffer, type: fileType };
    }
  }

  // Delete an existing package
  async deletePackage(DeletePackageDto: DeletePackageDto): Promise<any> {
    // deletes package from package collection. Returns error if this delete errors
    // also deletes package data from other collections. Does not return false on error as this data is extra and is not pertinent to continued application functionality
    try {
      // =================================
      // delete from package collection
      // =================================
      const deletedPackage = await this.PackageModel.findByIdAndDelete(
        DeletePackageDto.packageId,
      ).exec();

      await this.AuditLogService.delete(
        collection.packages,
        DeletePackageDto.auditUser,
        deletedPackage,
      );
    } catch (error) {
      console.error(error);
      return false;
    }

    // =================================
    // delete from fileblobs collection
    // =================================
    let deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.FileBlobModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.fileblobs,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete FileBlob Error: ', err);
      }
    }

    // =================================
    // delete from artifacttrees collection
    // =================================
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.ArtifactTreeModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.artifacttrees,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Artifact Tree Error: ', err);
      }
    }

    // =================================
    // delete from mappingdocs collection
    // =================================
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.MappingDocModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.mappingdocs,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Mapping Doc Error: ', err);
      }
    }

    // =================================
    // delete from component collections
    // =================================

    // Property
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.PropertyComponentModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.propertycomponents,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Property Component Error: ', err);
      }
    }

    // Type
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.TypeComponentModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.typecomponents,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Type Component Error: ', err);
      }
    }

    // Type-Has-Property
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.TypeHasPropertyComponentModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.typehaspropertycomponents,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Type Has Property Component Error: ', err);
      }
    }

    // Codes | Facets
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.CodesFacetsComponentModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.codesfacetscomponents,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Code Facets Component Error: ', err);
      }
    }

    // Namespace
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.NamespaceComponentModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.namespacecomponents,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Namespace Component Error: ', err);
      }
    }

    // Local Terminology
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.LocalTerminologyComponentModel.findOneAndDelete(
          {
            packageId: DeletePackageDto.packageId,
          },
        ).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.localterminologycomponents,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Local Terminology Error: ', err);
      }
    }

    // Type Union
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.TypeUnionComponentModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.typeunioncomponents,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Type Union Error: ', err);
      }
    }

    // Metadata
    deletedDoc = {};
    while (deletedDoc !== null) {
      try {
        deletedDoc = await this.MetadataComponentModel.findOneAndDelete({
          packageId: DeletePackageDto.packageId,
        }).exec();

        if (deletedDoc !== null) {
          await this.AuditLogService.delete(
            collection.metadatacomponents,
            DeletePackageDto.auditUser,
            deletedDoc,
          );
        }
      } catch (err) {
        console.error('Delete Metadata Error: ', err);
      }
    }

    return true;
  }

  async findPackagesByUserId(userId, auditUser = ''): Promise<any> {
    try {
      const ownedPackages = await this.PackageModel.find({ userId: userId });
      return { isSuccess: true, data: { ownedPackages } };
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(
        error,
        auditUser,
        collection.packages,
      );
    }
  }

  async findPublishedPackages() {
    try {
      // grab all published packages in the db
      const publishedPackages = await this.PackageModel.find({
        isPublished: true,
      });

      // remove UserId before sending to frontend
      const scrubUserId = (obj) => {
        const s = JSON.stringify(obj);

        if (s.includes('userId') && s.includes('packageName')) {
          const startIndex = s.indexOf('userId');
          const endIndex = s.indexOf('packageName');

          const substring = s.substring(startIndex, endIndex);

          return s.replace(substring, '');
        } else {
          return s;
        }
      };
      const scrubbedPackages = [];
      publishedPackages.forEach((pkg) => {
        const data = scrubUserId(pkg);
        scrubbedPackages.push(JSON.parse(data));
      });

      return { response: true, publishedPackages: scrubbedPackages };
    } catch (err) {
      return { response: false };
    }
  }

  // NOTE: Returns user's unpublished and ALL published (if userId is present and findingPublished is true)
  async findMPDData(userId = '', findingPublished = false): Promise<any> {
    let mpdDataDocuments = [];
    if (findingPublished) {
      mpdDataDocuments = await this.PackageModel.find({ isPublished: true });
    } else {
      mpdDataDocuments = await this.PackageModel.find({
        userId: userId,
        isPublished: false,
      });
    }
    const mpdDataArray = [];

    mpdDataDocuments.forEach((doc) => {
      mpdDataArray.push({
        PackageId: doc._id,
        PackageName: doc.packageName,
        Release: doc.niemRelease,
        Version: doc.version,
        Status: doc.status,
        StatusNo: doc.statusNo,
        PointOfContact: doc.poc,
        Email: doc.pocEmail,
        Description: doc.description,
        OrganizationName: doc.orgName,
        OrganizationType: doc.orgType,
        COITags: doc.coiTags,
        ExchangeTags: doc.exchangeTags,
        Format: doc.format,
        isReleaseLocked: doc.isReleaseLocked,
        isPublished: doc.isPublished,
        isCopiedPackage: doc.isCopiedPackage,
      }); // because returns as object, dont need to parse
    });

    return mpdDataArray;
  }

  // NOTE: Returns user's unpublished and ALL published (if userId is present)
  async getSortedMpdData(userId = '') {
    const unpublishedData = await this.findMPDData(userId);
    const publishedData = await this.findMPDData('', true);

    // find the user's name and add it to the published package data
    for (let i = 0; i < publishedData.length; i++) {
      const pkg = publishedData[i];
      const pkgData = await this.PackageModel.findOne({ _id: pkg.PackageId });
      const userData = await this.UserService.findById(pkgData.userId);

      if (pkgData.userId === userId) {
        pkg.Owner = 'You';
        pkg.isSelfOwned = true; // if the package is owned by the current logged in user
      } else {
        pkg.Owner = `${userData.first_name} ${userData.last_name}`;
        pkg.isSelfOwned = false;
      }
    }

    return { unpublished: unpublishedData, published: publishedData };
  }

  async findByPackageId(packageId): Promise<any> {
    try {
      const jsonObj = {};

      const artifactTreeDoc = await this.ArtifactTreeModel.findOne(
        { packageId: packageId },
        { artifactTreeJSON: 1 },
      );

      const mappingDoc = await this.MappingDocModel.findOne(
        { packageId: packageId },
        { mappingDocJSON: 1 },
      );

      const mpdDataContent = await this.PackageModel.findById(packageId);

      jsonObj['artifactTree'] = JSON.parse(artifactTreeDoc['artifactTreeJSON']);
      jsonObj['mappingDoc'] = JSON.parse(mappingDoc['mappingDocJSON']);
      jsonObj['mpdData'] = mpdDataContent;

      return jsonObj;
    } catch {
      // returns false when package name did not exist
      return false;
    }
  }

  async saveComponents(
    MappingComponentDto: MappingComponentDto,
    auditUser,
  ): Promise<any> {
    let modData; // used to track modified data for the audit log
    try {
      // Save Property Component
      const propertySheetArr = JSON.parse(
        JSON.stringify(MappingComponentDto.propertySheet),
      );

      for (var i = 0; i < propertySheetArr.length; i++) {
        const rowExists = await this.PropertyComponentModel.findOne({
          packageId: MappingComponentDto.packageId,
          key: propertySheetArr[i].key,
        });
        if (rowExists) {
          modData = await this.PropertyComponentModel.findOneAndUpdate(
            {
              packageId: MappingComponentDto.packageId,
              key: propertySheetArr[i].key,
            },
            {
              sourceNSPrefix: propertySheetArr[i].sourceNSPrefix,
              sourcePropertyName: propertySheetArr[i].sourcePropertyName,
              sourceDataType: propertySheetArr[i].dataType,
              sourceDefinition: propertySheetArr[i].sourceDefinition,
              mappingCode: propertySheetArr[i].mappingCode,
              targetNSPrefix: propertySheetArr[i].targetNSPrefix,
              targetPropertyName: propertySheetArr[i].targetPropertyName,
              targetQualifiedDataType: propertySheetArr[i].qualifiedDataType,
              targetDefinition: propertySheetArr[i].targetDefinition,
              targetSubstitutionGroup: propertySheetArr[i].substitutionGroup,
              targetIsAbstract: propertySheetArr[i].isAbstract,
              targetStyle: propertySheetArr[i].style,
              targetKeywords: propertySheetArr[i].keywords,
              targetExampleContent: propertySheetArr[i].exampleContent,
              targetUsageInfo: propertySheetArr[i].usageInfo,
            },
            { new: true }, // returns the document after update
          );

          if (!_.isEqual(rowExists, modData)) {
            this.AuditLogService.update(
              collection.propertycomponents,
              auditUser,
              modData,
              rowExists,
            );
          }
        } else {
          const newComponent = await this.PropertyComponentModel.create({
            packageId: MappingComponentDto.packageId,
            key: propertySheetArr[i].key,
            sourceNSPrefix: propertySheetArr[i].sourceNSPrefix,
            sourcePropertyName: propertySheetArr[i].sourcePropertyName,
            sourceDataType: propertySheetArr[i].dataType,
            sourceDefinition: propertySheetArr[i].sourceDefinition,
            mappingCode: propertySheetArr[i].mappingCode,
            targetNSPrefix: propertySheetArr[i].targetNSPrefix,
            targetPropertyName: propertySheetArr[i].targetPropertyName,
            targetQualifiedDataType: propertySheetArr[i].qualifiedDataType,
            targetDefinition: propertySheetArr[i].targetDefinition,
            targetSubstitutionGroup: propertySheetArr[i].substitutionGroup,
            targetIsAbstract: propertySheetArr[i].isAbstract,
            targetStyle: propertySheetArr[i].style,
            targetKeywords: propertySheetArr[i].keywords,
            targetExampleContent: propertySheetArr[i].exampleContent,
            targetUsageInfo: propertySheetArr[i].usageInfo,
          });
          newComponent.save();

          this.AuditLogService.create(
            collection.propertycomponents,
            auditUser,
            newComponent,
          );
        }
      }

      // Save Type Component
      const typeSheetArr = JSON.parse(
        JSON.stringify(MappingComponentDto.typeSheet),
      );

      for (var i = 0; i < typeSheetArr.length; i++) {
        const rowExists = await this.TypeComponentModel.findOne({
          packageId: MappingComponentDto.packageId,
          key: typeSheetArr[i].key,
        });

        // elementsInTypeString is an array of strings, this function converts it into just string.
        const makeElementsInTypeStringValid = (elementsInTypeStringArr) => {
          if (
            elementsInTypeStringArr === undefined ||
            elementsInTypeStringArr.length === 0
          ) {
            return '';
          } else {
            let cleanedStrings = [];
            for (let i = 0; i < elementsInTypeStringArr.length; i++) {
              //strings are formatted: "word\n". Here we are only selecting the "word" and not the "\n"
              const [word, carriage] = elementsInTypeStringArr[i].split('\n');
              cleanedStrings.push(word);
            }
            return cleanedStrings.join();
          }
        };

        const elementsInTypeString = makeElementsInTypeStringValid(
          typeSheetArr[i].elementsInTypeString,
        );

        if (rowExists) {
          modData = await this.TypeComponentModel.findOneAndUpdate(
            {
              packageId: MappingComponentDto.packageId,
              key: typeSheetArr[i].key,
            },
            {
              sourceNSPrefix: typeSheetArr[i].sourceNSPrefix,
              sourceTypeName: typeSheetArr[i].sourceTypeName,
              sourceParentBaseType: typeSheetArr[i].sourceParentBaseType,
              sourceDefinition: typeSheetArr[i].sourceDefinition,
              mappingCode: typeSheetArr[i].mappingCode,
              targetNSPrefix: typeSheetArr[i].targetNSPrefix,
              targetTypeName: typeSheetArr[i].targetTypeName,
              targetElementInType: elementsInTypeString,
              targetParentBaseType: typeSheetArr[i].targetParentBaseType,
              targetDefinition: typeSheetArr[i].targetDefinition,
              targetStyle: typeSheetArr[i].style,
            },
            { new: true }, // returns the document after update
          );

          if (!_.isEqual(rowExists, modData)) {
            this.AuditLogService.update(
              collection.typecomponents,
              auditUser,
              modData,
              rowExists,
            );
          }
        } else {
          const newComponent = await this.TypeComponentModel.create({
            packageId: MappingComponentDto.packageId,
            key: typeSheetArr[i].key,
            sourceNSPrefix: typeSheetArr[i].sourceNSPrefix,
            sourceTypeName: typeSheetArr[i].sourceTypeName,
            sourceParentBaseType: typeSheetArr[i].sourceParentBaseType,
            sourceDefinition: typeSheetArr[i].sourceDefinition,
            mappingCode: typeSheetArr[i].mappingCode,
            targetNSPrefix: typeSheetArr[i].targetNSPrefix,
            targetTypeName: typeSheetArr[i].targetTypeName,
            targetElementInType: elementsInTypeString,
            targetParentBaseType: typeSheetArr[i].targetParentBaseType,
            targetDefinition: typeSheetArr[i].targetDefinition,
            targetStyle: typeSheetArr[i].style,
          });
          newComponent.save();

          this.AuditLogService.create(
            collection.typecomponents,
            auditUser,
            newComponent,
          );
        }
      }

      // Save Type Has Property Component
      const typeHasPropertySheetArr = JSON.parse(
        JSON.stringify(MappingComponentDto.typeHasPropertySheet),
      );

      for (var i = 0; i < typeHasPropertySheetArr.length; i++) {
        const rowExists = await this.TypeHasPropertyComponentModel.findOne({
          packageId: MappingComponentDto.packageId,
          key: typeHasPropertySheetArr[i].key,
        });
        if (rowExists) {
          modData = await this.TypeHasPropertyComponentModel.findOneAndUpdate(
            {
              packageId: MappingComponentDto.packageId,
              key: typeHasPropertySheetArr[i].key,
            },
            {
              sourceTypeNS: typeHasPropertySheetArr[i].sourceTypeNS,
              sourceTypeName: typeHasPropertySheetArr[i].sourceTypeName,
              sourcePropertyNS: typeHasPropertySheetArr[i].sourcePropertyNS,
              sourcePropertyName: typeHasPropertySheetArr[i].sourcePropertyName,
              sourceMin: typeHasPropertySheetArr[i].sourceMin,
              sourceMax: typeHasPropertySheetArr[i].sourceMax,
              mappingCode: typeHasPropertySheetArr[i].mappingCode,
              targetTypeNS: typeHasPropertySheetArr[i].targetTypeNS,
              targetTypeName: typeHasPropertySheetArr[i].targetTypeName,
              targetPropertyNS: typeHasPropertySheetArr[i].targetPropertyNS,
              targetPropertyName: typeHasPropertySheetArr[i].targetPropertyName,
              targetMin: typeHasPropertySheetArr[i].targetMin,
              targetMax: typeHasPropertySheetArr[i].targetMax,
              targetDefinition: typeHasPropertySheetArr[i].targetDefinition,
            },
            { new: true }, // returns the document after update
          );

          if (!_.isEqual(rowExists, modData)) {
            this.AuditLogService.update(
              collection.typehaspropertycomponents,
              auditUser,
              modData,
              rowExists,
            );
          }
        } else {
          const newComponent = await this.TypeHasPropertyComponentModel.create({
            packageId: MappingComponentDto.packageId,
            key: typeHasPropertySheetArr[i].key,
            sourceTypeNS: typeHasPropertySheetArr[i].sourceTypeNS,
            sourceTypeName: typeHasPropertySheetArr[i].sourceTypeName,
            sourcePropertyNS: typeHasPropertySheetArr[i].sourcePropertyNS,
            sourcePropertyName: typeHasPropertySheetArr[i].sourcePropertyName,
            sourceMin: typeHasPropertySheetArr[i].sourceMin,
            sourceMax: typeHasPropertySheetArr[i].sourceMax,
            mappingCode: typeHasPropertySheetArr[i].mappingCode,
            targetTypeNS: typeHasPropertySheetArr[i].targetTypeNS,
            targetTypeName: typeHasPropertySheetArr[i].targetTypeName,
            targetPropertyNS: typeHasPropertySheetArr[i].targetPropertyNS,
            targetPropertyName: typeHasPropertySheetArr[i].targetPropertyName,
            targetMin: typeHasPropertySheetArr[i].targetMin,
            targetMax: typeHasPropertySheetArr[i].targetMax,
            targetDefinition: typeHasPropertySheetArr[i].targetDefinition,
          });
          newComponent.save();

          this.AuditLogService.create(
            collection.typehaspropertycomponents,
            auditUser,
            newComponent,
          );
        }
      }

      // Save Codes Facets Component
      const codesFacetsSheetArr = JSON.parse(
        JSON.stringify(MappingComponentDto.codesFacetsSheet),
      );

      for (var i = 0; i < codesFacetsSheetArr.length; i++) {
        const rowExists = await this.CodesFacetsComponentModel.findOne({
          packageId: MappingComponentDto.packageId,
          key: codesFacetsSheetArr[i].key,
        });
        if (rowExists) {
          modData = await this.CodesFacetsComponentModel.findOneAndUpdate(
            {
              packageId: MappingComponentDto.packageId,
              key: codesFacetsSheetArr[i].key,
            },
            {
              sourceNSPrefix: codesFacetsSheetArr[i].sourceNSPrefix,
              sourceTypeName: codesFacetsSheetArr[i].sourceTypeName,
              sourceValue: codesFacetsSheetArr[i].sourceValue,
              sourceDefinition: codesFacetsSheetArr[i].sourceDefinition,
              sourceKindOfFacet: codesFacetsSheetArr[i].sourceKindOfFacet,
              mappingCode: codesFacetsSheetArr[i].mappingCode,
              targetNSPrefix: codesFacetsSheetArr[i].targetNSPrefix,
              targetTypeName: codesFacetsSheetArr[i].targetTypeName,
              targetValue: codesFacetsSheetArr[i].targetValue,
              targetDefinition: codesFacetsSheetArr[i].targetDefinition,
              targetKindOfFacet: codesFacetsSheetArr[i].targetKindOfFacet,
            },
            { new: true },
          );

          if (!_.isEqual(rowExists, modData)) {
            this.AuditLogService.update(
              collection.codesfacetscomponents,
              auditUser,
              modData,
              rowExists,
            );
          }
        } else {
          const newComponent = await this.CodesFacetsComponentModel.create({
            packageId: MappingComponentDto.packageId,
            key: codesFacetsSheetArr[i].key,
            sourceNSPrefix: codesFacetsSheetArr[i].sourceNSPrefix,
            sourceTypeName: codesFacetsSheetArr[i].sourceTypeName,
            sourceValue: codesFacetsSheetArr[i].sourceValue,
            sourceDefinition: codesFacetsSheetArr[i].sourceDefinition,
            sourceKindOfFacet: codesFacetsSheetArr[i].sourceKindOfFacet,
            mappingCode: codesFacetsSheetArr[i].mappingCode,
            targetNSPrefix: codesFacetsSheetArr[i].targetNSPrefix,
            targetTypeName: codesFacetsSheetArr[i].targetTypeName,
            targetValue: codesFacetsSheetArr[i].targetValue,
            targetDefinition: codesFacetsSheetArr[i].targetDefinition,
            targetKindOfFacet: codesFacetsSheetArr[i].targetKindOfFacet,
          });
          newComponent.save();

          this.AuditLogService.create(
            collection.codesfacetscomponents,
            auditUser,
            newComponent,
          );
        }
      }

      // Save Namespace Component
      const namespaceSheetArr = JSON.parse(
        JSON.stringify(MappingComponentDto.namespaceSheet),
      );

      for (var i = 0; i < namespaceSheetArr.length; i++) {
        const rowExists = await this.NamespaceComponentModel.findOne({
          packageId: MappingComponentDto.packageId,
          key: namespaceSheetArr[i].key,
        });
        if (rowExists) {
          modData = await this.NamespaceComponentModel.findOneAndUpdate(
            {
              packageId: MappingComponentDto.packageId,
              key: namespaceSheetArr[i].key,
            },
            {
              sourceNSPrefix: namespaceSheetArr[i].sourceNSPrefix,
              sourceURI: namespaceSheetArr[i].sourceURI,
              sourceDefinition: namespaceSheetArr[i].sourceDefinition,
              mappingCode: namespaceSheetArr[i].mappingCode,
              targetNSPrefix: namespaceSheetArr[i].targetNSPrefix,
              targetStyle: namespaceSheetArr[i].style,
              targetURI: namespaceSheetArr[i].targetURI,
              targetDefinition: namespaceSheetArr[i].targetDefinition,
              ndrVersion: namespaceSheetArr[i].ndrVersion,
              ndrTarget: namespaceSheetArr[i].ndrTarget,
              fileName: namespaceSheetArr[i].fileName,
              relativePath: namespaceSheetArr[i].relativePath,
              draftVersion: namespaceSheetArr[i].draftVersion,
            },
            { new: true },
          );

          if (!_.isEqual(rowExists, modData)) {
            this.AuditLogService.update(
              collection.namespacecomponents,
              auditUser,
              modData,
              rowExists,
            );
          }
        } else {
          const newComponent = await this.NamespaceComponentModel.create({
            packageId: MappingComponentDto.packageId,
            key: namespaceSheetArr[i].key,
            sourceNSPrefix: namespaceSheetArr[i].sourceNSPrefix,
            sourceURI: namespaceSheetArr[i].sourceURI,
            sourceDefinition: namespaceSheetArr[i].sourceDefinition,
            mappingCode: namespaceSheetArr[i].mappingCode,
            targetNSPrefix: namespaceSheetArr[i].targetNSPrefix,
            targetStyle: namespaceSheetArr[i].style,
            targetURI: namespaceSheetArr[i].targetURI,
            targetDefinition: namespaceSheetArr[i].targetDefinition,
            ndrVersion: namespaceSheetArr[i].ndrVersion,
            ndrTarget: namespaceSheetArr[i].ndrTarget,
            fileName: namespaceSheetArr[i].fileName,
            relativePath: namespaceSheetArr[i].relativePath,
            draftVersion: namespaceSheetArr[i].draftVersion,
          });
          newComponent.save();

          this.AuditLogService.create(
            collection.namespacecomponents,
            auditUser,
            newComponent,
          );
        }
      }

      // Save Local Terminology Component
      const localTerminologySheetArr = JSON.parse(
        JSON.stringify(MappingComponentDto.localTerminologySheet),
      );

      for (var i = 0; i < localTerminologySheetArr.length; i++) {
        const rowExists = await this.LocalTerminologyComponentModel.findOne({
          packageId: MappingComponentDto.packageId,
          key: localTerminologySheetArr[i].key,
        });
        if (rowExists) {
          modData = await this.LocalTerminologyComponentModel.findOneAndUpdate(
            {
              packageId: MappingComponentDto.packageId,
              key: localTerminologySheetArr[i].key,
            },
            {
              sourceNSPrefix: localTerminologySheetArr[i].sourceNSPrefix,
              sourceTerm: localTerminologySheetArr[i].sourceTerm,
              sourceLiteral: localTerminologySheetArr[i].sourceLiteral,
              sourceDefinition: localTerminologySheetArr[i].sourceDefinition,
              mappingCode: localTerminologySheetArr[i].mappingCode,
              targetNSPrefix: localTerminologySheetArr[i].targetNSPrefix,
              targetTerm: localTerminologySheetArr[i].targetTerm,
              targetLiteral: localTerminologySheetArr[i].targetLiteral,
              targetDefinition: localTerminologySheetArr[i].targetDefinition,
            },
            { new: true },
          );

          if (!_.isEqual(rowExists, modData)) {
            this.AuditLogService.update(
              collection.localterminologycomponents,
              auditUser,
              modData,
              rowExists,
            );
          }
        } else {
          const newComponent = await this.LocalTerminologyComponentModel.create(
            {
              packageId: MappingComponentDto.packageId,
              key: localTerminologySheetArr[i].key,
              sourceNSPrefix: localTerminologySheetArr[i].sourceNSPrefix,
              sourceTerm: localTerminologySheetArr[i].sourceTerm,
              sourceLiteral: localTerminologySheetArr[i].sourceLiteral,
              sourceDefinition: localTerminologySheetArr[i].sourceDefinition,
              mappingCode: localTerminologySheetArr[i].mappingCode,
              targetNSPrefix: localTerminologySheetArr[i].targetNSPrefix,
              targetTerm: localTerminologySheetArr[i].targetTerm,
              targetLiteral: localTerminologySheetArr[i].targetLiteral,
              targetDefinition: localTerminologySheetArr[i].targetDefinition,
            },
          );
          newComponent.save();

          this.AuditLogService.create(
            collection.localterminologycomponents,
            auditUser,
            newComponent,
          );
        }
      }

      // Save Type Union Component
      const typeUnionSheetArr = JSON.parse(
        JSON.stringify(MappingComponentDto.typeUnionSheet),
      );

      for (var i = 0; i < typeUnionSheetArr.length; i++) {
        const rowExists = await this.TypeUnionComponentModel.findOne({
          packageId: MappingComponentDto.packageId,
          key: typeUnionSheetArr[i].key,
        });
        if (rowExists) {
          modData = await this.TypeUnionComponentModel.findOneAndUpdate(
            {
              packageId: MappingComponentDto.packageId,
              key: typeUnionSheetArr[i].key,
            },
            {
              sourceUnionNS: typeUnionSheetArr[i].sourceUnionNS,
              sourceUnionTypeName: typeUnionSheetArr[i].sourceUnionTypeName,
              sourceMemberNS: typeUnionSheetArr[i].sourceMemberNS,
              sourceMemberTypeName: typeUnionSheetArr[i].sourceMemberTypeName,
              mappingCode: typeUnionSheetArr[i].mappingCode,
              targetUnionNS: typeUnionSheetArr[i].targetUnionNS,
              targetUnionTypeName: typeUnionSheetArr[i].targetUnionTypeName,
              targetMemberNS: typeUnionSheetArr[i].targetMemberNS,
              targetMemberTypeName: typeUnionSheetArr[i].targetMemberTypeName,
            },
            { new: true },
          );

          if (!_.isEqual(rowExists, modData)) {
            this.AuditLogService.update(
              collection.typeunioncomponents,
              auditUser,
              modData,
              rowExists,
            );
          }
        } else {
          const newComponent = await this.TypeUnionComponentModel.create({
            packageId: MappingComponentDto.packageId,
            key: typeUnionSheetArr[i].key,
            sourceUnionNS: typeUnionSheetArr[i].sourceUnionNS,
            sourceUnionTypeName: typeUnionSheetArr[i].sourceUnionTypeName,
            sourceMemberNS: typeUnionSheetArr[i].sourceMemberNS,
            sourceMemberTypeName: typeUnionSheetArr[i].sourceMemberTypeName,
            mappingCode: typeUnionSheetArr[i].mappingCode,
            targetUnionNS: typeUnionSheetArr[i].targetUnionNS,
            targetUnionTypeName: typeUnionSheetArr[i].targetUnionTypeName,
            targetMemberNS: typeUnionSheetArr[i].targetMemberNS,
            targetMemberTypeName: typeUnionSheetArr[i].targetMemberTypeName,
          });
          newComponent.save();

          this.AuditLogService.create(
            collection.typeunioncomponents,
            auditUser,
            newComponent,
          );
        }
      }

      // Save Metadata Component
      const metadataSheetArr = JSON.parse(
        JSON.stringify(MappingComponentDto.metadataSheet),
      );

      for (var i = 0; i < metadataSheetArr.length; i++) {
        const rowExists = await this.MetadataComponentModel.findOne({
          packageId: MappingComponentDto.packageId,
          key: metadataSheetArr[i].key,
        });
        if (rowExists) {
          modData = await this.MetadataComponentModel.findOneAndUpdate(
            {
              packageId: MappingComponentDto.packageId,
              key: metadataSheetArr[i].key,
            },
            {
              sourceMetadataNS: metadataSheetArr[i].sourceMetadataNS,
              sourceMetadataTypeName:
                metadataSheetArr[i].sourceMetadataTypeName,
              sourceAppliesToNS: metadataSheetArr[i].sourceAppliesToNS,
              sourceAppliesToTypeName:
                metadataSheetArr[i].sourceAppliesToTypeName,
              mappingCode: metadataSheetArr[i].mappingCode,
              targetMetadataNS: metadataSheetArr[i].targetMetadataNS,
              targetMetadataTypeName:
                metadataSheetArr[i].targetMetadataTypeName,
              targetAppliesToNS: metadataSheetArr[i].targetAppliesToNS,
              targetAppliesToTypeName:
                metadataSheetArr[i].targetAppliesToTypeName,
            },
            { new: true },
          );

          if (!_.isEqual(rowExists, modData)) {
            this.AuditLogService.update(
              collection.metadatacomponents,
              auditUser,
              modData,
              rowExists,
            );
          }
        } else {
          const newComponent = await this.MetadataComponentModel.create({
            packageId: MappingComponentDto.packageId,
            key: metadataSheetArr[i].key,
            sourceMetadataNS: metadataSheetArr[i].sourceMetadataNS,
            sourceMetadataTypeName: metadataSheetArr[i].sourceMetadataTypeName,
            sourceAppliesToNS: metadataSheetArr[i].sourceAppliesToNS,
            sourceAppliesToTypeName:
              metadataSheetArr[i].sourceAppliesToTypeName,
            mappingCode: metadataSheetArr[i].mappingCode,
            targetMetadataNS: metadataSheetArr[i].targetMetadataNS,
            targetMetadataTypeName: metadataSheetArr[i].targetMetadataTypeName,
            targetAppliesToNS: metadataSheetArr[i].targetAppliesToNS,
            targetAppliesToTypeName:
              metadataSheetArr[i].targetAppliesToTypeName,
          });
          newComponent.save();

          this.AuditLogService.create(
            collection.metadatacomponents,
            auditUser,
            newComponent,
          );
        }
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async getCommonComponents(
    CommonComponentsDto: CommonComponentsDto,
  ): Promise<any> {
    let commonComponents = {};

    if (CommonComponentsDto.searchType === 'Property') {
      if (CommonComponentsDto.searchString === '') {
        commonComponents = await this.PropertyCommonNIEMComponentModel.find();
      } else {
        const searchExpression = {
          $regex: CommonComponentsDto.searchString.replace(/\s*/g, ''),
          $options: '$i',
        };
        commonComponents = await this.PropertyCommonNIEMComponentModel.find({
          $or: [
            {
              parent_property_name: searchExpression,
            },
            {
              property_name: searchExpression,
            },
          ],
        });
      }
    } else if (CommonComponentsDto.searchType === 'Type') {
      if (CommonComponentsDto.searchString === '') {
        commonComponents = await this.TypeCommonNIEMComponentModel.find();
      } else {
        const searchExpression = {
          $regex: CommonComponentsDto.searchString.replace(/\s*/g, ''),
          $options: '$i',
        };
        commonComponents = await this.TypeCommonNIEMComponentModel.find({
          type_name: searchExpression,
        });
      }
    } else {
      return false; // invalid searchType
    }

    return commonComponents;
  }

  async getArtifactChecklist(packageId: string) {
    // grab the isRequiredArtifactUploaded data from the db
    try {
      const packageData = await this.PackageModel.find({
        _id: packageId,
      });

      const checklist = JSON.parse(packageData[0].isRequiredArtifactUploaded); // convert string into object

      // if one item is false, return false. If all items are true, return true
      const isChecklistComplete = !Object.values(checklist).includes(false);

      return { isChecklistComplete: isChecklistComplete, checklist: checklist };
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async updateArtifactStatus(SavePackageDto: SavePackageDto, auditUser) {
    // update the isRequiredArtifactUploaded data in the db
    try {
      const ogPackageData = await this.PackageModel.findById(
        SavePackageDto.packageId,
      );

      const packageData = await this.PackageModel.findByIdAndUpdate(
        SavePackageDto.packageId,
        {
          isRequiredArtifactUploaded: SavePackageDto.isRequiredArtifactUploaded,
        },
        { new: true }, // returns the document after update
      );

      // if packageData updated, create audit log
      if (!_.isEqual(ogPackageData, packageData)) {
        this.AuditLogService.update(
          collection.packages,
          auditUser,
          packageData,
          ogPackageData,
        );
      }

      return packageData;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async getTranslationGenerationStatus(packageId: string) {
    // grab the isTranslationGenerated data from the db
    try {
      const packageData = await this.PackageModel.find({
        _id: packageId,
      });

      return {
        response: true,
        isTranslationGenerated: packageData[0].isTranslationGenerated,
      };
    } catch (err) {
      console.log(err);
      return { response: false };
    }
  }

  async updateTranslationGenerationStatus(
    SavePackageDto: SavePackageDto,
    auditUser,
  ) {
    // update the isTranslationGenerated data in the db
    try {
      const ogPackageData = await this.PackageModel.findById(
        SavePackageDto.packageId,
      );

      const packageData = await this.PackageModel.findByIdAndUpdate(
        SavePackageDto.packageId,
        {
          isTranslationGenerated: SavePackageDto.isTranslationGenerated,
        },
        { new: true }, // returns the document after update
      );

      // if packageData updated, create audit log
      if (!_.isEqual(ogPackageData, packageData)) {
        this.AuditLogService.update(
          collection.packages,
          auditUser,
          packageData,
          ogPackageData,
        );
      }

      return packageData;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async transferPackages(
    transferData: TransferPackagesDto,
    auditUser: string,
  ): Promise<any> {
    try {
      const result = await this.findPackagesByUserId(
        transferData.transferFromUserId,
        auditUser,
      );

      const transferedPackages = [];

      for (const pkg of transferData.packagesToTransfer) {
        const transferedPackage = await this.PackageModel.findByIdAndUpdate(
          pkg['_id'],
          {
            userId: transferData.transferToUserId,
            poc: transferData.packagePocMap[pkg['_id']],
            pocEmail: transferData.packagePocEmailMap[pkg['_id']],
          },
          { new: true },
        );
        transferedPackages.push(transferedPackage);

        // package data changed, log it
        await this.AuditLogService.update(
          collection.packages,
          auditUser,
          transferedPackage,
          pkg,
        );
      }

      return { isSuccess: true, data: { transferedPackages } };
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(
        error,
        auditUser,
        collection.packages,
      );
    }
  }

  async isPackageOwner(userId: string, packageId: string) {
    // checks if the user is the owner of the package
    const packageData = await this.findByPackageId(packageId);
    const packageOwner = packageData.mpdData.userId;

    return userId === packageOwner;
  }

  // ================
  // Begin CME Functions
  // ================
  async getAllCustomModelExtensions(packageId) {
    return await this.CMEModel.find({
      packageId: packageId,
    });
  }

  async getCMERootInfo(packageId) {
    const packageData = await this.PackageModel.findById(packageId);
    const cmeJSONObj = JSON.parse(packageData.cmeData);
    return {
      version: packageData.niemRelease,
      elementName: cmeJSONObj.elementName,
      elementType: cmeJSONObj.elementType,
      uri: cmeJSONObj.uri,
      definition: cmeJSONObj.definition,
    };
  }

  async saveCMEData(SaveCMEDataDto: SaveCMEDataDto, auditUser): Promise<any> {
    try {
      // Save custom model extension data json in package collection
      const ogPackageData = await this.PackageModel.findById(
        SaveCMEDataDto.packageId,
      );
      if (ogPackageData) {
        const modData = await this.PackageModel.findByIdAndUpdate(
          SaveCMEDataDto.packageId,
          {
            cmeData: SaveCMEDataDto.cmeData,
          },
          { new: true }, // returns the document after update
        );

        if (!_.isEqual(ogPackageData, modData)) {
          this.AuditLogService.update(
            collection.packages,
            auditUser,
            modData,
            ogPackageData,
          );
        }
      }

      // Save custom model extension data to mongo db
      const cmeDataParsed = JSON.parse(SaveCMEDataDto.cmeData);
      const cmeDataElements = cmeDataParsed.children;

      // keep track of created/updated records
      const updatedIds = [];
      for (const i in cmeDataElements) {
        let element = cmeDataElements[i];
        let filter = {
          packageId: SaveCMEDataDto.packageId,
          elementType: element.elementType,
          elementName: element.elementName,
        };
        // check if already exists
        let ogElement = await this.CMEModel.findOne(filter);

        if (ogElement) {
          // update if exists
          let modElement = await this.CMEModel.findOneAndUpdate(
            filter,
            {
              elementLabel: element.elementLabel,
              specificType: element.specificType,
              dataType: element.dataType,
              elementDefinition: element.elementDefinition
                ? element.elementDefinition
                : element.definition,
              containerElements: element.containerElements,
              code: element.code,
            },
            { new: true },
          );

          updatedIds.push(modElement._id);

          // make update audit log
          if (!_.isEqual(ogElement, modElement)) {
            this.AuditLogService.update(
              collection.custommodelextensions,
              auditUser,
              modElement,
              ogElement,
            );
          }
        } else {
          // create if not exists
          let newRecord = await this.CMEModel.create({
            packageId: SaveCMEDataDto.packageId,
            elementType: element.elementType,
            elementName: element.elementName,
            elementLabel: element.elementLabel,
            specificType: element.specificType,
            dataType: element.dataType,
            elementDefinition: element.elementDefinition
              ? element.elementDefinition
              : element.definition,
            containerElements: element.containerElements,
            code: element.code,
          });

          updatedIds.push(newRecord._id);

          // make create audit log
          this.AuditLogService.create(
            collection.custommodelextensions,
            auditUser,
            newRecord,
          );
        }
      }

      // check if any _ids belonging to this package are not created/updated, then delete them
      const docsToDelete = await this.CMEModel.find({
        packageId: SaveCMEDataDto.packageId,
        _id: { $nin: updatedIds },
      });

      for (const i in docsToDelete) {
        await this.CMEModel.deleteOne({ _id: docsToDelete[i]._id });
        // make delete audit log
        this.AuditLogService.delete(
          collection.custommodelextensions,
          auditUser,
          docsToDelete[i],
        );
      }

      return { isSuccess: true };
    } catch (error) {
      // log error to db
      const dbRecord = await this.ErrorLogService.logError(
        collection.packages,
        auditUser,
        stringify(error.response),
      );

      return {
        isSuccess: false,
        data: {
          errorId: dbRecord._id,
          errorStatus: error.response.status,
          errorMessage: error.response,
        },
      };
    }
  }

  extractExstensionSchema(dataStream, packageId, auditUser) {
    var fs = require('fs');
    var self = this; // give the following callback function access to this context

    return new Promise<any>((resolve, reject) => {
      // read zip data from transformModel
      dataStream
        .pipe(fs.createWriteStream('./temp.zip'))
        .on('finish', async function () {
          try {
            // extract the extension.xsd file and save this to our own artifact tree
            const zipData = fs.readFileSync('temp.zip');
            const zip = await JSZip.loadAsync(zipData);
            const extensionFile = zip.file('temp/extension/extension.xsd');
            if (extensionFile) {
              const fileBuffer = await extensionFile.async('nodebuffer');
              const fileObj = new FileBlobClass(fileBuffer, 'extension.xsd');

              await self.FilesService.createUpdateFile(
                {
                  packageId: packageId,
                  auditUser: auditUser,
                },
                fileObj,
                'extension.xsd',
                '1.3', // extension folder
              );

              fs.unlinkSync('temp.zip'); // delete temp file
              resolve({ isSuccess: true });
            } else {
              fs.unlinkSync('temp.zip'); // delete temp file
              reject(
                new Error('There was an error when extracting extension.xsd'),
              );
            }
          } catch (err) {
            fs.unlinkSync('temp.zip'); // delete temp file
            reject(err);
          }
        })
        .on('error', (err) => {
          fs.unlinkSync('temp.zip'); // delete temp file
          reject(err);
        });
    });
  }

  async buildCMEData(SaveCMEDataDto: SaveCMEDataDto, auditUser): Promise<any> {
    // save CME Data
    const saveResult = await this.saveCMEData(SaveCMEDataDto, auditUser);
    if (saveResult.isSuccess) {
      // generate CMF File and return success/fail results from within function
      const cmfResult = await this.FilesService.generateCMFFile(
        SaveCMEDataDto.packageId,
        auditUser,
      );
      if (cmfResult.isSuccess) {
        // transform cmf to xsd to get extension.xsd file
        const transformResult = await this.GTRIService.transformModel(
          'cmf',
          'xsd',
          cmfResult.data,
          auditUser,
        );
        if (transformResult.isSuccess) {
          try {
            const extractResult = await this.extractExstensionSchema(
              transformResult.data,
              SaveCMEDataDto.packageId,
              auditUser,
            );
            if (extractResult.isSuccess) {
              return { isSuccess: true };
            } else {
              throw new Error('Error when extracting extension.xsd');
            }
          } catch (error) {
            return await this.ErrorLogService.errorServiceResponse(
              error,
              auditUser,
            );
          }
        } else {
          // returning error results from transform model
          return transformResult;
        }
      } else {
        // returning error results from generate CMF File
        return cmfResult;
      }
    } else {
      // returning error results from save
      return saveResult;
    }
  }
  // ================
  // End CME Functions
  // ================
}
