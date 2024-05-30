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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_service_1 = require("../../audit/audit.log.service");
const mongorepo_service_1 = require("../mongorepository/mongorepo.service");
const gtri_service_1 = require("../../GTRIAPI2.0/gtri.service");
const error_log_service_1 = require("../../error/error.log.service");
const collection = require("../../util/collection.name.util");
const artifacttree_service_1 = require("../../artifactree/artifacttree.service");
const fileblob_class_1 = require("../files/schemas/fileblob.class");
const translation_util_1 = require("../../util/translation.util");
const xmlbuilder2_1 = require("xmlbuilder2");
let FilesService = class FilesService {
    constructor(FileBlobModel, PackageModel, AuditLogService, ArtifactTreeService, MongoRepoService, GTRIService, ErrorLogService) {
        this.FileBlobModel = FileBlobModel;
        this.PackageModel = PackageModel;
        this.AuditLogService = AuditLogService;
        this.ArtifactTreeService = ArtifactTreeService;
        this.MongoRepoService = MongoRepoService;
        this.GTRIService = GTRIService;
        this.ErrorLogService = ErrorLogService;
    }
    async saveFileToDB(file, FileRepo) {
        let createdFileBlob;
        try {
            if (FileRepo.fileId !== 'null' && FileRepo.fileId !== null) {
                createdFileBlob = await this.FileBlobModel.findByIdAndUpdate(FileRepo.fileId, {
                    packageId: FileRepo.packageId,
                    fileBlob: file,
                }, { upsert: true, new: true });
            }
            else {
                createdFileBlob = await this.FileBlobModel.create({
                    packageId: FileRepo.packageId,
                    fileBlob: file,
                });
            }
            createdFileBlob.save();
            this.AuditLogService.create(collection.fileblobs, FileRepo.auditUser, createdFileBlob);
            return { isSuccess: true, fileBlobId: createdFileBlob._id };
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
    async createUpdateFile(FileRepo, fileObj, fileName, parentNodeId = null) {
        let fileNode = null;
        const fileType = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
        let fileBlobId = await this.ArtifactTreeService.getArtifactFileBlobId(FileRepo.packageId, fileName, parentNodeId);
        const saveFile = await this.saveFileToDB(fileObj, {
            packageId: FileRepo.packageId,
            fileId: fileBlobId,
            auditUser: FileRepo.auditUser,
        });
        if (saveFile.isSuccess) {
            let artifact;
            if (fileName === 'wantlist.xml') {
                artifact = {
                    label: fileName,
                    fileType: fileType,
                    fileBlobId: saveFile.fileBlobId,
                    tag: 'Wantlist',
                    needsReview: false,
                };
            }
            else if (fileName === 'extension.xsd') {
                artifact = {
                    label: fileName,
                    fileType: fileType,
                    fileBlobId: saveFile.fileBlobId,
                    tag: 'extension',
                    needsReview: false,
                };
            }
            else {
                artifact = {
                    label: fileName,
                    fileType: fileType,
                    fileBlobId: saveFile.fileBlobId,
                    needsReview: false,
                };
            }
            fileNode = await this.ArtifactTreeService.AddArtifactToTree(FileRepo.packageId, artifact, parentNodeId, FileRepo.auditUser);
        }
        return fileNode;
    }
    async retrieveFile(fileId) {
        const file = await this.FileBlobModel.findOne({
            _id: fileId,
        }).exec();
        return file.fileBlob;
    }
    async translateToJsonLd(FileRepo) {
        try {
            const getFileData = async (xmlFiles) => {
                const validXmlFiles = [];
                xmlFiles.forEach((file) => {
                    if (file.hasOwnProperty('fileBlobId') &&
                        !file.label.includes('xml-catalog') &&
                        !file.label.includes('mpd-catalog') &&
                        !file.label.includes('iepd-catalog')) {
                        validXmlFiles.push(file);
                    }
                });
                const data = [];
                for (const file of validXmlFiles) {
                    const blobData = await this.FileBlobModel.findOne({
                        _id: file.fileBlobId,
                    }).exec();
                    if (blobData !== null) {
                        const blob = blobData.fileBlob;
                        data.push({ artifactTreeData: file, fileBlobData: blob });
                    }
                }
                return data;
            };
            const translateFiles = async (fileData) => {
                for (const file of fileData) {
                    const buffer = file.fileBlobData.buffer.toString('utf-8');
                    const parsed = await (0, translation_util_1.xmlToJson)(buffer);
                    const context = (0, translation_util_1.createContext)(parsed);
                    parsed['@context'] = context;
                    const jsonld = JSON.stringify(parsed, null, 4);
                    const jsonldBuffer = Buffer.from(jsonld);
                    const label = file.artifactTreeData.label;
                    const fileExtension = label.substring(label.lastIndexOf('.') + 1);
                    let jsonldLabel = '';
                    if (fileExtension === 'xml' || fileExtension === 'xsd') {
                        jsonldLabel = label.replace(fileExtension, 'jsonld');
                    }
                    const fileBlob = new fileblob_class_1.FileBlobClass(jsonldBuffer, jsonldLabel);
                    if (file.artifactTreeData.isDuplicate) {
                        await this.FileBlobModel.findOneAndReplace({ _id: file.artifactTreeData.jsonldBlobId }, { packageId: FileRepo.packageId, fileBlob: fileBlob }, { new: true });
                    }
                    else {
                        const parentNodeId = this.ArtifactTreeService.getParentNodeId(file.artifactTreeData.nodeId);
                        await this.createUpdateFile(FileRepo, fileBlob, jsonldLabel, parentNodeId);
                    }
                }
            };
            const artifactTreeXML = await this.ArtifactTreeService.getArtifactsByFileType(FileRepo.packageId, 'xml');
            const artifactTreeXSD = await this.ArtifactTreeService.getArtifactsByFileType(FileRepo.packageId, 'xsd');
            const artifactTreeJSONLD = await this.ArtifactTreeService.getArtifactsByFileType(FileRepo.packageId, 'jsonld');
            const artifactTreeXMLAndXSD = artifactTreeXML.concat(artifactTreeXSD);
            const xmlFiles = await (0, translation_util_1.checkForDuplicates)(artifactTreeXMLAndXSD, artifactTreeJSONLD);
            const fileData = await getFileData(xmlFiles);
            await translateFiles(fileData);
            return { isSuccess: true };
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, FileRepo.auditUser);
        }
    }
    async translateViaCMF(TranslateDto) {
        try {
            const xsdBuffer = await this.MongoRepoService.getExportFileData({
                packageId: TranslateDto.packageId,
                nodeId: '1.1',
                auditUser: TranslateDto.auditUser,
            });
            const result = await this.GTRIService.transformModel('xsd', TranslateDto.translateType, xsdBuffer.data, TranslateDto.auditUser);
            if (result.isSuccess) {
                let fileData = result.data;
                const packageData = await this.PackageModel.findById(TranslateDto.packageId);
                let extension;
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
                const fileObj = new fileblob_class_1.FileBlobClass(buff, fileName);
                const newFileNodeId = await this.createUpdateFile({
                    packageId: TranslateDto.packageId,
                    auditUser: TranslateDto.auditUser,
                }, fileObj, fileName, '8');
                if (newFileNodeId) {
                    return {
                        isSuccess: true,
                        data: { fileNodeId: newFileNodeId, fileName: fileName },
                    };
                }
                else {
                    return {
                        isSuccess: false,
                        data: {
                            errorId: null,
                            errorStatus: 500,
                            errorMessage: 'Internal Server Error',
                        },
                    };
                }
            }
            else {
                return result;
            }
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, TranslateDto.auditUser);
        }
    }
    async generateCMFFile(packageId, auditUser) {
        const xmlBufferToString = require('xml-buffer-tostring');
        const result = await this.translateViaCMF({
            translateType: 'cmf',
            packageId: packageId,
            auditUser: auditUser,
        });
        let cmfFileNodeId = '';
        let cmfFileName = '';
        if (result.isSuccess) {
            try {
                cmfFileNodeId = result.data.fileNodeId;
                cmfFileName = result.data.fileName;
                const cmfBuffer = await this.MongoRepoService.getExportFileData({
                    packageId: packageId,
                    nodeId: cmfFileNodeId,
                    auditUser: auditUser,
                });
                const cmfFileBinary = cmfBuffer.data;
                const cmfFileBuffer = await Buffer.from(cmfFileBinary.toString());
                const xmlString = xmlBufferToString(cmfFileBuffer);
                const doc = (0, xmlbuilder2_1.create)(xmlString);
                const rootInfo = await this.MongoRepoService.getCMERootInfo(packageId);
                const extensions = await this.MongoRepoService.getAllCustomModelExtensions(packageId);
                if (extensions.length !== 0) {
                    await (0, translation_util_1.addExtensionsToCMF)(doc, rootInfo, extensions, this.GTRIService, this.ErrorLogService, auditUser);
                }
                try {
                    const xml = doc.end({ prettyPrint: true });
                    const xmlBuffer = Buffer.from(xml, 'utf-8');
                    const finalResult = await this.GTRIService.transformModel('cmf', 'cmf', xmlBuffer, auditUser);
                    if (finalResult.isSuccess) {
                        const finalBuffer = Buffer.from(finalResult.data, 'utf-8');
                        const fileObj = new fileblob_class_1.FileBlobClass(finalBuffer, cmfFileName);
                        await this.createUpdateFile({ packageId: packageId, auditUser: auditUser }, fileObj, cmfFileName, '8');
                        return { isSuccess: true, data: finalBuffer };
                    }
                    else {
                        return await this.ErrorLogService.errorServiceResponse({
                            status: 500,
                            message: 'Error when saving cmf file.',
                        }, auditUser);
                    }
                }
                catch (error) {
                    return await this.ErrorLogService.errorServiceResponse(error, auditUser);
                }
            }
            catch (error) {
                return await this.ErrorLogService.errorServiceResponse(error, auditUser);
            }
        }
        else {
            return result;
        }
    }
    async copySaveFile(FileRepo) {
        const file = await this.FileBlobModel.findOne({
            _id: FileRepo.fileId,
        }).exec();
        const FileRepoParam = Object.assign(Object.assign({}, FileRepo), { fileId: null });
        const savetoFileResult = await this.saveFileToDB(file.fileBlob, FileRepoParam);
        return savetoFileResult;
    }
    async deleteFileFromDB(FileRepo) {
        let deletedFileBlob;
        try {
            if (FileRepo.fileId !== 'null' && FileRepo.fileId !== null) {
                deletedFileBlob = await this.FileBlobModel.findOneAndDelete({
                    _id: FileRepo.fileId,
                });
                this.AuditLogService.delete(collection.fileblobs, FileRepo.auditUser, deletedFileBlob);
                return { isSuccess: true, fileBlobId: deletedFileBlob._id };
            }
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
};
FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('FileBlob')),
    __param(1, (0, mongoose_1.InjectModel)('Package')),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => artifacttree_service_1.ArtifactTreeService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => mongorepo_service_1.MongoRepoService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        audit_log_service_1.AuditLogService,
        artifacttree_service_1.ArtifactTreeService,
        mongorepo_service_1.MongoRepoService,
        gtri_service_1.GTRIService,
        error_log_service_1.ErrorLogService])
], FilesService);
exports.FilesService = FilesService;
//# sourceMappingURL=files.service.js.map