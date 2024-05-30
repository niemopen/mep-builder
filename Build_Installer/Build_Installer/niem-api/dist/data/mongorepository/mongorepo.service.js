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
exports.MongoRepoService = void 0;
const _ = require("lodash");
const JSZip = require("jszip");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const collection = require("../../util/collection.name.util");
const fileblob_class_1 = require("../files/schemas/fileblob.class");
const audit_log_service_1 = require("../../audit/audit.log.service");
const artifacttree_service_1 = require("../../artifactree/artifacttree.service");
const files_service_1 = require("../files/files.service");
const gtri_service_1 = require("../../GTRIAPI2.0/gtri.service");
const error_log_service_1 = require("../../error/error.log.service");
const user_service_1 = require("../../user/user.service");
const querystring_1 = require("querystring");
let MongoRepoService = class MongoRepoService {
    constructor(AuditLogService, ArtifactTreeService, FilesService, GTRIService, ErrorLogService, UserService, PackageModel, ArtifactTreeModel, FileBlobModel, MappingDocModel, PropertyComponentModel, TypeComponentModel, TypeHasPropertyComponentModel, CodesFacetsComponentModel, NamespaceComponentModel, LocalTerminologyComponentModel, TypeUnionComponentModel, MetadataComponentModel, PropertyCommonNIEMComponentModel, TypeCommonNIEMComponentModel, CMEModel) {
        this.AuditLogService = AuditLogService;
        this.ArtifactTreeService = ArtifactTreeService;
        this.FilesService = FilesService;
        this.GTRIService = GTRIService;
        this.ErrorLogService = ErrorLogService;
        this.UserService = UserService;
        this.PackageModel = PackageModel;
        this.ArtifactTreeModel = ArtifactTreeModel;
        this.FileBlobModel = FileBlobModel;
        this.MappingDocModel = MappingDocModel;
        this.PropertyComponentModel = PropertyComponentModel;
        this.TypeComponentModel = TypeComponentModel;
        this.TypeHasPropertyComponentModel = TypeHasPropertyComponentModel;
        this.CodesFacetsComponentModel = CodesFacetsComponentModel;
        this.NamespaceComponentModel = NamespaceComponentModel;
        this.LocalTerminologyComponentModel = LocalTerminologyComponentModel;
        this.TypeUnionComponentModel = TypeUnionComponentModel;
        this.MetadataComponentModel = MetadataComponentModel;
        this.PropertyCommonNIEMComponentModel = PropertyCommonNIEMComponentModel;
        this.TypeCommonNIEMComponentModel = TypeCommonNIEMComponentModel;
        this.CMEModel = CMEModel;
    }
    async savePackage(SavePackageDto, auditUser) {
        try {
            let packageExists = false;
            let artifactTree;
            let mappingDoc;
            let packageData;
            if (SavePackageDto.packageId) {
                let findPackageResult = await this.PackageModel.findOne({ _id: SavePackageDto.packageId }, { packageName: 1, _id: 0 });
                const currentPackageName = findPackageResult['packageName'];
                if (currentPackageName === SavePackageDto.packageName) {
                    packageExists = true;
                }
                else {
                    packageExists = false;
                }
            }
            else {
                packageExists = false;
            }
            if (packageExists) {
                const ogArtifactTree = await this.ArtifactTreeModel.findOne({
                    packageId: SavePackageDto.packageId,
                });
                const modArtifactTree = await this.ArtifactTreeModel.findOneAndUpdate({ packageId: SavePackageDto.packageId }, { artifactTreeJSON: SavePackageDto.artifactTree }, { new: true });
                if (!_.isEqual(ogArtifactTree, modArtifactTree)) {
                    this.AuditLogService.update(collection.artifacttrees, auditUser, modArtifactTree, ogArtifactTree);
                }
                const ogMappingDoc = await this.MappingDocModel.findOne({
                    packageId: SavePackageDto.packageId,
                });
                const modMappingDoc = (mappingDoc =
                    await this.MappingDocModel.findOneAndUpdate({ packageId: SavePackageDto.packageId }, { mappingDocJSON: SavePackageDto.mappingDoc }, { new: true }));
                if (!_.isEqual(ogMappingDoc, modMappingDoc)) {
                    this.AuditLogService.update(collection.mappingdocs, auditUser, modMappingDoc, ogMappingDoc);
                }
                const ogPackageData = await this.PackageModel.findById(SavePackageDto.packageId);
                packageData = await this.PackageModel.findByIdAndUpdate(SavePackageDto.packageId, {
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
                }, { new: true });
                if (!_.isEqual(ogPackageData, packageData)) {
                    this.AuditLogService.update(collection.packages, auditUser, packageData, ogPackageData);
                }
                return SavePackageDto.packageId;
            }
            else {
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
                this.AuditLogService.create(collection.packages, auditUser, packageData);
                artifactTree = await this.ArtifactTreeModel.create({
                    packageId: packageData._id,
                    artifactTreeJSON: SavePackageDto.artifactTree,
                });
                artifactTree.save();
                this.AuditLogService.create(collection.artifacttrees, auditUser, artifactTree);
                mappingDoc = await this.MappingDocModel.create({
                    packageId: packageData._id,
                    mappingDocJSON: SavePackageDto.mappingDoc,
                });
                mappingDoc.save();
                this.AuditLogService.create(collection.mappingdocs, auditUser, mappingDoc);
                return packageData._id;
            }
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
    async createArtifactFileForDB(file, SSGTDTO, currentPath) {
        let artifact;
        const fileBuffer = await file.async('nodeBuffer');
        const fileBlob = new fileblob_class_1.FileBlobClass(fileBuffer, currentPath);
        const fileAddResult = await this.FilesService.saveFileToDB(fileBlob, {
            packageId: SSGTDTO.packageId,
            fileId: null,
            auditUser: SSGTDTO.auditUser,
        });
        const fileBlobId = fileAddResult.fileBlobId;
        const fileType = currentPath.substring(currentPath.lastIndexOf('.') + 1, currentPath.length);
        artifact = {
            label: currentPath,
            fileType: fileType,
            fileBlobId: fileBlobId,
        };
        return artifact;
    }
    async saveSubsetSchema(encodedString, SSGTDTO) {
        try {
            let artifactTree = await this.ArtifactTreeService.getArtifactTreeJSON(SSGTDTO.packageId);
            if (artifactTree) {
                const baseNodeId = await this.ArtifactTreeService.getNodeIdByLabel(artifactTree, 'base-xsd');
                const buff = Buffer.from(encodedString, 'base64');
                const zip = new JSZip();
                await zip.loadAsync(buff);
                const files = zip.files;
                const fileKeys = Object.keys(files);
                for (let k = 0; k < fileKeys.length; k++) {
                    artifactTree = await this.ArtifactTreeService.getArtifactTreeJSON(SSGTDTO.packageId);
                    let key = fileKeys[k];
                    let file = files[key];
                    const pathParts = file.name.split('/');
                    let currentNode = baseNodeId;
                    for (let i = 0; i < pathParts.length; i++) {
                        let currentPath = pathParts[i];
                        let currentBranch = await this.ArtifactTreeService.getBranchChildren(artifactTree, currentNode);
                        let artifact = {};
                        let fileBuffer = await file.async('nodebuffer');
                        let fileObj = new fileblob_class_1.FileBlobClass(fileBuffer, currentPath);
                        let existingNode = await this.ArtifactTreeService.getNodeIdByLabel(currentBranch, currentPath);
                        if (existingNode === -1) {
                            if (i === pathParts.length - 1) {
                                currentNode = await this.FilesService.createUpdateFile({
                                    packageId: SSGTDTO.packageId,
                                    auditUser: SSGTDTO.auditUser,
                                }, fileObj, currentPath, currentNode);
                            }
                            else {
                                artifact = {
                                    label: currentPath,
                                    fileType: 'folder',
                                };
                                currentNode = await this.ArtifactTreeService.AddArtifactToTree(SSGTDTO.packageId, artifact, currentNode, SSGTDTO.auditUser);
                            }
                        }
                        else {
                            if (i === pathParts.length - 1) {
                                currentNode = await this.FilesService.createUpdateFile({
                                    packageId: SSGTDTO.packageId,
                                    auditUser: SSGTDTO.auditUser,
                                }, fileObj, currentPath, currentNode);
                            }
                            else {
                                currentNode = existingNode;
                                await this.ArtifactTreeService.makeBranchVisible(currentNode, SSGTDTO.packageId, SSGTDTO.auditUser);
                            }
                        }
                    }
                }
                return { isSuccess: true };
            }
            else {
                return await this.ErrorLogService.errorServiceResponse({
                    response: { status: 500 },
                    message: 'saveSubsetSchema was unable to retrieve an Artifact Tree.',
                }, SSGTDTO.auditUser);
            }
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, SSGTDTO.auditUser);
        }
    }
    async getChildren(items, nestedFolder) {
        for (let i = 0; i < items.length; i++) {
            if (items[i]['isVisible'] == true && items[i]['fileType'] != 'folder') {
                const fileDBResult = await this.FileBlobModel.findById(items[i]['fileBlobId']);
                const fileData = fileDBResult['fileBlob']['buffer']['buffer'];
                nestedFolder.file(items[i]['label'], fileData);
            }
            else {
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
    async getExportFileData(ExportPackageDto) {
        const artifactTree = await this.ArtifactTreeService.getArtifactTreeJSON(ExportPackageDto.packageId);
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
        if (artifactNode['fileType'] === 'folder') {
            const zipBuffer = await this.generateZip(artifactNode);
            return { data: zipBuffer, type: 'zip' };
        }
        else {
            const fileDBResult = await this.FileBlobModel.findById(artifactNode['fileBlobId']);
            const fileBuffer = fileDBResult['fileBlob']['buffer'];
            const fileName = fileDBResult['fileBlob']['originalname'];
            const fileType = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
            return { data: fileBuffer, type: fileType };
        }
    }
    async deletePackage(DeletePackageDto) {
        try {
            const deletedPackage = await this.PackageModel.findByIdAndDelete(DeletePackageDto.packageId).exec();
            await this.AuditLogService.delete(collection.packages, DeletePackageDto.auditUser, deletedPackage);
        }
        catch (error) {
            console.error(error);
            return false;
        }
        let deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.FileBlobModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.fileblobs, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete FileBlob Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.ArtifactTreeModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.artifacttrees, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Artifact Tree Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.MappingDocModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.mappingdocs, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Mapping Doc Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.PropertyComponentModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.propertycomponents, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Property Component Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.TypeComponentModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.typecomponents, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Type Component Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.TypeHasPropertyComponentModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.typehaspropertycomponents, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Type Has Property Component Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.CodesFacetsComponentModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.codesfacetscomponents, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Code Facets Component Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.NamespaceComponentModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.namespacecomponents, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Namespace Component Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.LocalTerminologyComponentModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.localterminologycomponents, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Local Terminology Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.TypeUnionComponentModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.typeunioncomponents, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Type Union Error: ', err);
            }
        }
        deletedDoc = {};
        while (deletedDoc !== null) {
            try {
                deletedDoc = await this.MetadataComponentModel.findOneAndDelete({
                    packageId: DeletePackageDto.packageId,
                }).exec();
                if (deletedDoc !== null) {
                    await this.AuditLogService.delete(collection.metadatacomponents, DeletePackageDto.auditUser, deletedDoc);
                }
            }
            catch (err) {
                console.error('Delete Metadata Error: ', err);
            }
        }
        return true;
    }
    async findPackagesByUserId(userId, auditUser = '') {
        try {
            const ownedPackages = await this.PackageModel.find({ userId: userId });
            return { isSuccess: true, data: { ownedPackages } };
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, auditUser, collection.packages);
        }
    }
    async findPublishedPackages() {
        try {
            const publishedPackages = await this.PackageModel.find({
                isPublished: true,
            });
            const scrubUserId = (obj) => {
                const s = JSON.stringify(obj);
                if (s.includes('userId') && s.includes('packageName')) {
                    const startIndex = s.indexOf('userId');
                    const endIndex = s.indexOf('packageName');
                    const substring = s.substring(startIndex, endIndex);
                    return s.replace(substring, '');
                }
                else {
                    return s;
                }
            };
            const scrubbedPackages = [];
            publishedPackages.forEach((pkg) => {
                const data = scrubUserId(pkg);
                scrubbedPackages.push(JSON.parse(data));
            });
            return { response: true, publishedPackages: scrubbedPackages };
        }
        catch (err) {
            return { response: false };
        }
    }
    async findMPDData(userId = '', findingPublished = false) {
        let mpdDataDocuments = [];
        if (findingPublished) {
            mpdDataDocuments = await this.PackageModel.find({ isPublished: true });
        }
        else {
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
            });
        });
        return mpdDataArray;
    }
    async getSortedMpdData(userId = '') {
        const unpublishedData = await this.findMPDData(userId);
        const publishedData = await this.findMPDData('', true);
        for (let i = 0; i < publishedData.length; i++) {
            const pkg = publishedData[i];
            const pkgData = await this.PackageModel.findOne({ _id: pkg.PackageId });
            const userData = await this.UserService.findById(pkgData.userId);
            if (pkgData.userId === userId) {
                pkg.Owner = 'You';
                pkg.isSelfOwned = true;
            }
            else {
                pkg.Owner = `${userData.first_name} ${userData.last_name}`;
                pkg.isSelfOwned = false;
            }
        }
        return { unpublished: unpublishedData, published: publishedData };
    }
    async findByPackageId(packageId) {
        try {
            const jsonObj = {};
            const artifactTreeDoc = await this.ArtifactTreeModel.findOne({ packageId: packageId }, { artifactTreeJSON: 1 });
            const mappingDoc = await this.MappingDocModel.findOne({ packageId: packageId }, { mappingDocJSON: 1 });
            const mpdDataContent = await this.PackageModel.findById(packageId);
            jsonObj['artifactTree'] = JSON.parse(artifactTreeDoc['artifactTreeJSON']);
            jsonObj['mappingDoc'] = JSON.parse(mappingDoc['mappingDocJSON']);
            jsonObj['mpdData'] = mpdDataContent;
            return jsonObj;
        }
        catch (_a) {
            return false;
        }
    }
    async saveComponents(MappingComponentDto, auditUser) {
        let modData;
        try {
            const propertySheetArr = JSON.parse(JSON.stringify(MappingComponentDto.propertySheet));
            for (var i = 0; i < propertySheetArr.length; i++) {
                const rowExists = await this.PropertyComponentModel.findOne({
                    packageId: MappingComponentDto.packageId,
                    key: propertySheetArr[i].key,
                });
                if (rowExists) {
                    modData = await this.PropertyComponentModel.findOneAndUpdate({
                        packageId: MappingComponentDto.packageId,
                        key: propertySheetArr[i].key,
                    }, {
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
                    }, { new: true });
                    if (!_.isEqual(rowExists, modData)) {
                        this.AuditLogService.update(collection.propertycomponents, auditUser, modData, rowExists);
                    }
                }
                else {
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
                    this.AuditLogService.create(collection.propertycomponents, auditUser, newComponent);
                }
            }
            const typeSheetArr = JSON.parse(JSON.stringify(MappingComponentDto.typeSheet));
            for (var i = 0; i < typeSheetArr.length; i++) {
                const rowExists = await this.TypeComponentModel.findOne({
                    packageId: MappingComponentDto.packageId,
                    key: typeSheetArr[i].key,
                });
                const makeElementsInTypeStringValid = (elementsInTypeStringArr) => {
                    if (elementsInTypeStringArr === undefined ||
                        elementsInTypeStringArr.length === 0) {
                        return '';
                    }
                    else {
                        let cleanedStrings = [];
                        for (let i = 0; i < elementsInTypeStringArr.length; i++) {
                            const [word, carriage] = elementsInTypeStringArr[i].split('\n');
                            cleanedStrings.push(word);
                        }
                        return cleanedStrings.join();
                    }
                };
                const elementsInTypeString = makeElementsInTypeStringValid(typeSheetArr[i].elementsInTypeString);
                if (rowExists) {
                    modData = await this.TypeComponentModel.findOneAndUpdate({
                        packageId: MappingComponentDto.packageId,
                        key: typeSheetArr[i].key,
                    }, {
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
                    }, { new: true });
                    if (!_.isEqual(rowExists, modData)) {
                        this.AuditLogService.update(collection.typecomponents, auditUser, modData, rowExists);
                    }
                }
                else {
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
                    this.AuditLogService.create(collection.typecomponents, auditUser, newComponent);
                }
            }
            const typeHasPropertySheetArr = JSON.parse(JSON.stringify(MappingComponentDto.typeHasPropertySheet));
            for (var i = 0; i < typeHasPropertySheetArr.length; i++) {
                const rowExists = await this.TypeHasPropertyComponentModel.findOne({
                    packageId: MappingComponentDto.packageId,
                    key: typeHasPropertySheetArr[i].key,
                });
                if (rowExists) {
                    modData = await this.TypeHasPropertyComponentModel.findOneAndUpdate({
                        packageId: MappingComponentDto.packageId,
                        key: typeHasPropertySheetArr[i].key,
                    }, {
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
                    }, { new: true });
                    if (!_.isEqual(rowExists, modData)) {
                        this.AuditLogService.update(collection.typehaspropertycomponents, auditUser, modData, rowExists);
                    }
                }
                else {
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
                    this.AuditLogService.create(collection.typehaspropertycomponents, auditUser, newComponent);
                }
            }
            const codesFacetsSheetArr = JSON.parse(JSON.stringify(MappingComponentDto.codesFacetsSheet));
            for (var i = 0; i < codesFacetsSheetArr.length; i++) {
                const rowExists = await this.CodesFacetsComponentModel.findOne({
                    packageId: MappingComponentDto.packageId,
                    key: codesFacetsSheetArr[i].key,
                });
                if (rowExists) {
                    modData = await this.CodesFacetsComponentModel.findOneAndUpdate({
                        packageId: MappingComponentDto.packageId,
                        key: codesFacetsSheetArr[i].key,
                    }, {
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
                    }, { new: true });
                    if (!_.isEqual(rowExists, modData)) {
                        this.AuditLogService.update(collection.codesfacetscomponents, auditUser, modData, rowExists);
                    }
                }
                else {
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
                    this.AuditLogService.create(collection.codesfacetscomponents, auditUser, newComponent);
                }
            }
            const namespaceSheetArr = JSON.parse(JSON.stringify(MappingComponentDto.namespaceSheet));
            for (var i = 0; i < namespaceSheetArr.length; i++) {
                const rowExists = await this.NamespaceComponentModel.findOne({
                    packageId: MappingComponentDto.packageId,
                    key: namespaceSheetArr[i].key,
                });
                if (rowExists) {
                    modData = await this.NamespaceComponentModel.findOneAndUpdate({
                        packageId: MappingComponentDto.packageId,
                        key: namespaceSheetArr[i].key,
                    }, {
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
                    }, { new: true });
                    if (!_.isEqual(rowExists, modData)) {
                        this.AuditLogService.update(collection.namespacecomponents, auditUser, modData, rowExists);
                    }
                }
                else {
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
                    this.AuditLogService.create(collection.namespacecomponents, auditUser, newComponent);
                }
            }
            const localTerminologySheetArr = JSON.parse(JSON.stringify(MappingComponentDto.localTerminologySheet));
            for (var i = 0; i < localTerminologySheetArr.length; i++) {
                const rowExists = await this.LocalTerminologyComponentModel.findOne({
                    packageId: MappingComponentDto.packageId,
                    key: localTerminologySheetArr[i].key,
                });
                if (rowExists) {
                    modData = await this.LocalTerminologyComponentModel.findOneAndUpdate({
                        packageId: MappingComponentDto.packageId,
                        key: localTerminologySheetArr[i].key,
                    }, {
                        sourceNSPrefix: localTerminologySheetArr[i].sourceNSPrefix,
                        sourceTerm: localTerminologySheetArr[i].sourceTerm,
                        sourceLiteral: localTerminologySheetArr[i].sourceLiteral,
                        sourceDefinition: localTerminologySheetArr[i].sourceDefinition,
                        mappingCode: localTerminologySheetArr[i].mappingCode,
                        targetNSPrefix: localTerminologySheetArr[i].targetNSPrefix,
                        targetTerm: localTerminologySheetArr[i].targetTerm,
                        targetLiteral: localTerminologySheetArr[i].targetLiteral,
                        targetDefinition: localTerminologySheetArr[i].targetDefinition,
                    }, { new: true });
                    if (!_.isEqual(rowExists, modData)) {
                        this.AuditLogService.update(collection.localterminologycomponents, auditUser, modData, rowExists);
                    }
                }
                else {
                    const newComponent = await this.LocalTerminologyComponentModel.create({
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
                    });
                    newComponent.save();
                    this.AuditLogService.create(collection.localterminologycomponents, auditUser, newComponent);
                }
            }
            const typeUnionSheetArr = JSON.parse(JSON.stringify(MappingComponentDto.typeUnionSheet));
            for (var i = 0; i < typeUnionSheetArr.length; i++) {
                const rowExists = await this.TypeUnionComponentModel.findOne({
                    packageId: MappingComponentDto.packageId,
                    key: typeUnionSheetArr[i].key,
                });
                if (rowExists) {
                    modData = await this.TypeUnionComponentModel.findOneAndUpdate({
                        packageId: MappingComponentDto.packageId,
                        key: typeUnionSheetArr[i].key,
                    }, {
                        sourceUnionNS: typeUnionSheetArr[i].sourceUnionNS,
                        sourceUnionTypeName: typeUnionSheetArr[i].sourceUnionTypeName,
                        sourceMemberNS: typeUnionSheetArr[i].sourceMemberNS,
                        sourceMemberTypeName: typeUnionSheetArr[i].sourceMemberTypeName,
                        mappingCode: typeUnionSheetArr[i].mappingCode,
                        targetUnionNS: typeUnionSheetArr[i].targetUnionNS,
                        targetUnionTypeName: typeUnionSheetArr[i].targetUnionTypeName,
                        targetMemberNS: typeUnionSheetArr[i].targetMemberNS,
                        targetMemberTypeName: typeUnionSheetArr[i].targetMemberTypeName,
                    }, { new: true });
                    if (!_.isEqual(rowExists, modData)) {
                        this.AuditLogService.update(collection.typeunioncomponents, auditUser, modData, rowExists);
                    }
                }
                else {
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
                    this.AuditLogService.create(collection.typeunioncomponents, auditUser, newComponent);
                }
            }
            const metadataSheetArr = JSON.parse(JSON.stringify(MappingComponentDto.metadataSheet));
            for (var i = 0; i < metadataSheetArr.length; i++) {
                const rowExists = await this.MetadataComponentModel.findOne({
                    packageId: MappingComponentDto.packageId,
                    key: metadataSheetArr[i].key,
                });
                if (rowExists) {
                    modData = await this.MetadataComponentModel.findOneAndUpdate({
                        packageId: MappingComponentDto.packageId,
                        key: metadataSheetArr[i].key,
                    }, {
                        sourceMetadataNS: metadataSheetArr[i].sourceMetadataNS,
                        sourceMetadataTypeName: metadataSheetArr[i].sourceMetadataTypeName,
                        sourceAppliesToNS: metadataSheetArr[i].sourceAppliesToNS,
                        sourceAppliesToTypeName: metadataSheetArr[i].sourceAppliesToTypeName,
                        mappingCode: metadataSheetArr[i].mappingCode,
                        targetMetadataNS: metadataSheetArr[i].targetMetadataNS,
                        targetMetadataTypeName: metadataSheetArr[i].targetMetadataTypeName,
                        targetAppliesToNS: metadataSheetArr[i].targetAppliesToNS,
                        targetAppliesToTypeName: metadataSheetArr[i].targetAppliesToTypeName,
                    }, { new: true });
                    if (!_.isEqual(rowExists, modData)) {
                        this.AuditLogService.update(collection.metadatacomponents, auditUser, modData, rowExists);
                    }
                }
                else {
                    const newComponent = await this.MetadataComponentModel.create({
                        packageId: MappingComponentDto.packageId,
                        key: metadataSheetArr[i].key,
                        sourceMetadataNS: metadataSheetArr[i].sourceMetadataNS,
                        sourceMetadataTypeName: metadataSheetArr[i].sourceMetadataTypeName,
                        sourceAppliesToNS: metadataSheetArr[i].sourceAppliesToNS,
                        sourceAppliesToTypeName: metadataSheetArr[i].sourceAppliesToTypeName,
                        mappingCode: metadataSheetArr[i].mappingCode,
                        targetMetadataNS: metadataSheetArr[i].targetMetadataNS,
                        targetMetadataTypeName: metadataSheetArr[i].targetMetadataTypeName,
                        targetAppliesToNS: metadataSheetArr[i].targetAppliesToNS,
                        targetAppliesToTypeName: metadataSheetArr[i].targetAppliesToTypeName,
                    });
                    newComponent.save();
                    this.AuditLogService.create(collection.metadatacomponents, auditUser, newComponent);
                }
            }
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
    async getCommonComponents(CommonComponentsDto) {
        let commonComponents = {};
        if (CommonComponentsDto.searchType === 'Property') {
            if (CommonComponentsDto.searchString === '') {
                commonComponents = await this.PropertyCommonNIEMComponentModel.find();
            }
            else {
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
        }
        else if (CommonComponentsDto.searchType === 'Type') {
            if (CommonComponentsDto.searchString === '') {
                commonComponents = await this.TypeCommonNIEMComponentModel.find();
            }
            else {
                const searchExpression = {
                    $regex: CommonComponentsDto.searchString.replace(/\s*/g, ''),
                    $options: '$i',
                };
                commonComponents = await this.TypeCommonNIEMComponentModel.find({
                    type_name: searchExpression,
                });
            }
        }
        else {
            return false;
        }
        return commonComponents;
    }
    async getArtifactChecklist(packageId) {
        try {
            const packageData = await this.PackageModel.find({
                _id: packageId,
            });
            const checklist = JSON.parse(packageData[0].isRequiredArtifactUploaded);
            const isChecklistComplete = !Object.values(checklist).includes(false);
            return { isChecklistComplete: isChecklistComplete, checklist: checklist };
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    async updateArtifactStatus(SavePackageDto, auditUser) {
        try {
            const ogPackageData = await this.PackageModel.findById(SavePackageDto.packageId);
            const packageData = await this.PackageModel.findByIdAndUpdate(SavePackageDto.packageId, {
                isRequiredArtifactUploaded: SavePackageDto.isRequiredArtifactUploaded,
            }, { new: true });
            if (!_.isEqual(ogPackageData, packageData)) {
                this.AuditLogService.update(collection.packages, auditUser, packageData, ogPackageData);
            }
            return packageData;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    async getTranslationGenerationStatus(packageId) {
        try {
            const packageData = await this.PackageModel.find({
                _id: packageId,
            });
            return {
                response: true,
                isTranslationGenerated: packageData[0].isTranslationGenerated,
            };
        }
        catch (err) {
            console.log(err);
            return { response: false };
        }
    }
    async updateTranslationGenerationStatus(SavePackageDto, auditUser) {
        try {
            const ogPackageData = await this.PackageModel.findById(SavePackageDto.packageId);
            const packageData = await this.PackageModel.findByIdAndUpdate(SavePackageDto.packageId, {
                isTranslationGenerated: SavePackageDto.isTranslationGenerated,
            }, { new: true });
            if (!_.isEqual(ogPackageData, packageData)) {
                this.AuditLogService.update(collection.packages, auditUser, packageData, ogPackageData);
            }
            return packageData;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    async transferPackages(transferData, auditUser) {
        try {
            const result = await this.findPackagesByUserId(transferData.transferFromUserId, auditUser);
            const transferedPackages = [];
            for (const pkg of transferData.packagesToTransfer) {
                const transferedPackage = await this.PackageModel.findByIdAndUpdate(pkg['_id'], {
                    userId: transferData.transferToUserId,
                    poc: transferData.packagePocMap[pkg['_id']],
                    pocEmail: transferData.packagePocEmailMap[pkg['_id']],
                }, { new: true });
                transferedPackages.push(transferedPackage);
                await this.AuditLogService.update(collection.packages, auditUser, transferedPackage, pkg);
            }
            return { isSuccess: true, data: { transferedPackages } };
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, auditUser, collection.packages);
        }
    }
    async isPackageOwner(userId, packageId) {
        const packageData = await this.findByPackageId(packageId);
        const packageOwner = packageData.mpdData.userId;
        return userId === packageOwner;
    }
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
    async saveCMEData(SaveCMEDataDto, auditUser) {
        try {
            const ogPackageData = await this.PackageModel.findById(SaveCMEDataDto.packageId);
            if (ogPackageData) {
                const modData = await this.PackageModel.findByIdAndUpdate(SaveCMEDataDto.packageId, {
                    cmeData: SaveCMEDataDto.cmeData,
                }, { new: true });
                if (!_.isEqual(ogPackageData, modData)) {
                    this.AuditLogService.update(collection.packages, auditUser, modData, ogPackageData);
                }
            }
            const cmeDataParsed = JSON.parse(SaveCMEDataDto.cmeData);
            const cmeDataElements = cmeDataParsed.children;
            const updatedIds = [];
            for (const i in cmeDataElements) {
                let element = cmeDataElements[i];
                let filter = {
                    packageId: SaveCMEDataDto.packageId,
                    elementType: element.elementType,
                    elementName: element.elementName,
                };
                let ogElement = await this.CMEModel.findOne(filter);
                if (ogElement) {
                    let modElement = await this.CMEModel.findOneAndUpdate(filter, {
                        elementLabel: element.elementLabel,
                        specificType: element.specificType,
                        dataType: element.dataType,
                        elementDefinition: element.elementDefinition
                            ? element.elementDefinition
                            : element.definition,
                        containerElements: element.containerElements,
                        code: element.code,
                    }, { new: true });
                    updatedIds.push(modElement._id);
                    if (!_.isEqual(ogElement, modElement)) {
                        this.AuditLogService.update(collection.custommodelextensions, auditUser, modElement, ogElement);
                    }
                }
                else {
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
                    this.AuditLogService.create(collection.custommodelextensions, auditUser, newRecord);
                }
            }
            const docsToDelete = await this.CMEModel.find({
                packageId: SaveCMEDataDto.packageId,
                _id: { $nin: updatedIds },
            });
            for (const i in docsToDelete) {
                await this.CMEModel.deleteOne({ _id: docsToDelete[i]._id });
                this.AuditLogService.delete(collection.custommodelextensions, auditUser, docsToDelete[i]);
            }
            return { isSuccess: true };
        }
        catch (error) {
            const dbRecord = await this.ErrorLogService.logError(collection.packages, auditUser, (0, querystring_1.stringify)(error.response));
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
        var self = this;
        return new Promise((resolve, reject) => {
            dataStream
                .pipe(fs.createWriteStream('./temp.zip'))
                .on('finish', async function () {
                try {
                    const zipData = fs.readFileSync('temp.zip');
                    const zip = await JSZip.loadAsync(zipData);
                    const extensionFile = zip.file('temp/extension/extension.xsd');
                    if (extensionFile) {
                        const fileBuffer = await extensionFile.async('nodebuffer');
                        const fileObj = new fileblob_class_1.FileBlobClass(fileBuffer, 'extension.xsd');
                        await self.FilesService.createUpdateFile({
                            packageId: packageId,
                            auditUser: auditUser,
                        }, fileObj, 'extension.xsd', '1.3');
                        fs.unlinkSync('temp.zip');
                        resolve({ isSuccess: true });
                    }
                    else {
                        fs.unlinkSync('temp.zip');
                        reject(new Error('There was an error when extracting extension.xsd'));
                    }
                }
                catch (err) {
                    fs.unlinkSync('temp.zip');
                    reject(err);
                }
            })
                .on('error', (err) => {
                fs.unlinkSync('temp.zip');
                reject(err);
            });
        });
    }
    async buildCMEData(SaveCMEDataDto, auditUser) {
        const saveResult = await this.saveCMEData(SaveCMEDataDto, auditUser);
        if (saveResult.isSuccess) {
            const cmfResult = await this.FilesService.generateCMFFile(SaveCMEDataDto.packageId, auditUser);
            if (cmfResult.isSuccess) {
                const transformResult = await this.GTRIService.transformModel('cmf', 'xsd', cmfResult.data, auditUser);
                if (transformResult.isSuccess) {
                    try {
                        const extractResult = await this.extractExstensionSchema(transformResult.data, SaveCMEDataDto.packageId, auditUser);
                        if (extractResult.isSuccess) {
                            return { isSuccess: true };
                        }
                        else {
                            throw new Error('Error when extracting extension.xsd');
                        }
                    }
                    catch (error) {
                        return await this.ErrorLogService.errorServiceResponse(error, auditUser);
                    }
                }
                else {
                    return transformResult;
                }
            }
            else {
                return cmfResult;
            }
        }
        else {
            return saveResult;
        }
    }
};
MongoRepoService = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, mongoose_1.InjectModel)('Package')),
    __param(7, (0, mongoose_1.InjectModel)('ArtifactTree')),
    __param(8, (0, mongoose_1.InjectModel)('FileBlob')),
    __param(9, (0, mongoose_1.InjectModel)('MappingDoc')),
    __param(10, (0, mongoose_1.InjectModel)('PropertyComponent')),
    __param(11, (0, mongoose_1.InjectModel)('TypeComponent')),
    __param(12, (0, mongoose_1.InjectModel)('TypeHasPropertyComponent')),
    __param(13, (0, mongoose_1.InjectModel)('CodesFacetsComponent')),
    __param(14, (0, mongoose_1.InjectModel)('NamespaceComponent')),
    __param(15, (0, mongoose_1.InjectModel)('LocalTerminologyComponent')),
    __param(16, (0, mongoose_1.InjectModel)('TypeUnionComponent')),
    __param(17, (0, mongoose_1.InjectModel)('MetadataComponent')),
    __param(18, (0, mongoose_1.InjectModel)('PropertyCommonNIEMComponent')),
    __param(19, (0, mongoose_1.InjectModel)('TypeCommonNIEMComponent')),
    __param(20, (0, mongoose_1.InjectModel)('CustomModelExtension')),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService,
        artifacttree_service_1.ArtifactTreeService,
        files_service_1.FilesService,
        gtri_service_1.GTRIService,
        error_log_service_1.ErrorLogService,
        user_service_1.UserService,
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
        mongoose_2.Model,
        mongoose_2.Model])
], MongoRepoService);
exports.MongoRepoService = MongoRepoService;
//# sourceMappingURL=mongorepo.service.js.map