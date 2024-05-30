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
exports.GTRIService = void 0;
const common_1 = require("@nestjs/common");
const error_log_service_1 = require("../error/error.log.service");
const files_service_1 = require("../data/files/files.service");
const mongorepo_service_1 = require("../data/mongorepository/mongorepo.service");
const FormData = require("form-data");
const fs = require("fs");
const axios = require('axios');
const { writeFile } = require('fs').promises;
const baseURL = 'https://tools.niem.gov/api/v2';
const modelsURL = 'stewards/niem/models/model/versions';
let GTRIService = class GTRIService {
    constructor(ErrorLogService, FilesService, MongoRepoService) {
        this.ErrorLogService = ErrorLogService;
        this.FilesService = FilesService;
        this.MongoRepoService = MongoRepoService;
    }
    async transformModel(from, to, fileBuffer, userId) {
        let tempFileName;
        try {
            if (from === 'cmf') {
                tempFileName = 'temp.cmf.xml';
            }
            else {
                tempFileName = 'temp.zip';
            }
            await writeFile(tempFileName, fileBuffer);
            var data = new FormData();
            await data.append('file', fs.createReadStream(tempFileName));
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, userId);
        }
        var config = {
            method: 'post',
            url: baseURL + '/transforms/models?from=' + from + '&to=' + to,
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        if (to === 'xsd') {
            config['responseType'] = 'stream';
        }
        return await axios(config)
            .then((response) => {
            fs.unlinkSync(tempFileName);
            return { isSuccess: true, data: response.data };
        })
            .catch(async (error) => {
            fs.unlinkSync(tempFileName);
            return await this.ErrorLogService.errorServiceResponse(error, userId);
        });
    }
    async migrateModel(from, to, cmfFileBuffer, auditUser) {
        try {
            await fs.writeFileSync('cmf.xml', cmfFileBuffer);
            var data = new FormData();
            data.append('from', from);
            data.append('to', to);
            await data.append('file', fs.createReadStream('cmf.xml'));
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        }
        var config = {
            method: 'post',
            url: baseURL + '/migration/cmf',
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        return await axios(config)
            .then((response) => {
            fs.unlinkSync('cmf.xml');
            return { isSuccess: true, data: response.data };
        })
            .catch(async (error) => {
            fs.unlinkSync('cmf.xml');
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        });
    }
    async getAllProperties(version) {
        var config = {
            method: 'get',
            url: baseURL + '/' + modelsURL + '/' + version + '/properties',
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            console.log('error', error);
            return { isSuccess: false, data: error };
        });
    }
    async getProperty(version, qname) {
        var config = {
            method: 'get',
            url: baseURL + '/' + modelsURL + '/' + version + '/properties/' + qname,
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async getFacets(version, qname) {
        const transformedTypeName = qname.replaceAll(':', '%3A');
        var config = {
            method: 'get',
            url: baseURL +
                '/' +
                modelsURL +
                '/' +
                version +
                '/types/' +
                transformedTypeName +
                '/facets',
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async getPropertiesByNamespace(version, prefix) {
        var config = {
            method: 'get',
            url: baseURL +
                '/' +
                modelsURL +
                '/' +
                version +
                '/namespaces/' +
                prefix +
                '/properties',
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async getType(version, qname) {
        var config = {
            method: 'get',
            url: baseURL + '/' + modelsURL + '/' + version + '/types/' + qname,
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async getTypeCMF(version, qname) {
        var config = {
            method: 'get',
            url: baseURL + '/' + modelsURL + '/' + version + '/types.cmf/' + qname,
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async getTypesByNamespace(version, prefix) {
        var config = {
            method: 'get',
            url: baseURL +
                '/' +
                modelsURL +
                '/' +
                version +
                '/namespaces/' +
                prefix +
                '/types',
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async getTypeSubproperties(version, qname) {
        var config = {
            method: 'get',
            url: baseURL +
                '/' +
                modelsURL +
                '/' +
                version +
                '/types/' +
                qname +
                '/subproperties',
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async getAllNamespaces(version) {
        var config = {
            method: 'get',
            url: baseURL + '/' + modelsURL + '/' + version + '/namespaces',
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async getNamespace(version, prefix) {
        var config = {
            method: 'get',
            url: baseURL + '/' + modelsURL + '/' + version + '/namespaces/' + prefix,
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async getNamespaceCMF(version, prefix) {
        var config = {
            method: 'get',
            url: baseURL + '/' + modelsURL + '/' + version + '/namespaces.cmf/' + prefix,
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async searchProperties(SearchPropertiesDto) {
        let urlString = baseURL +
            '/search/properties?niemVersionNumber=' +
            SearchPropertiesDto.niemVersionNumber;
        if (SearchPropertiesDto.token) {
            urlString = urlString + '&token=' + SearchPropertiesDto.token;
        }
        if (SearchPropertiesDto.substring) {
            urlString = urlString + '&substring=' + SearchPropertiesDto.substring;
        }
        if (SearchPropertiesDto.prefix) {
            urlString = urlString + '&prefix=' + SearchPropertiesDto.prefix;
        }
        if (SearchPropertiesDto.type) {
            urlString = urlString + '&type=' + SearchPropertiesDto.type;
        }
        if (SearchPropertiesDto.isAbstract) {
            urlString = urlString + '&isAbstract=' + SearchPropertiesDto.isAbstract;
        }
        if (SearchPropertiesDto.isElement) {
            urlString = urlString + '&isElement=' + SearchPropertiesDto.isElement;
        }
        if (SearchPropertiesDto.offset) {
            urlString = urlString + '&offset=' + SearchPropertiesDto.offset;
        }
        if (SearchPropertiesDto.limit) {
            urlString = urlString + '&limit=' + SearchPropertiesDto.limit;
        }
        var config = {
            method: 'get',
            url: urlString,
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async searchTypes(SearchTypesDto) {
        let urlString = baseURL +
            '/search/types?niemVersionNumber=' +
            SearchTypesDto.niemVersionNumber;
        if (SearchTypesDto.token) {
            urlString = urlString + '&token=' + SearchTypesDto.token;
        }
        if (SearchTypesDto.substring) {
            urlString = urlString + '&substring=' + SearchTypesDto.substring;
        }
        if (SearchTypesDto.prefix) {
            urlString = urlString + '&prefix=' + SearchTypesDto.prefix;
        }
        if (SearchTypesDto.offset) {
            urlString = urlString + '&offset=' + SearchTypesDto.offset;
        }
        if (SearchTypesDto.limit) {
            urlString = urlString + '&limit=' + SearchTypesDto.limit;
        }
        var config = {
            method: 'get',
            url: urlString,
        };
        return await axios(config)
            .then(function (response) {
            return { isSuccess: true, data: response.data };
        })
            .catch(function (error) {
            return { isSuccess: false, data: error };
        });
    }
    async validateMessageSpecification(packageId, auditUser) {
        const packageResult = await this.MongoRepoService.getExportFileData({
            packageId: packageId,
            nodeId: '0',
            auditUser: auditUser,
        });
        const fileBuffer = packageResult.data;
        try {
            await writeFile('temp.zip', fileBuffer);
            var data = new FormData();
            await data.append('file', fs.createReadStream('temp.zip'));
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        }
        var config = {
            method: 'post',
            url: baseURL + '/validation/message-specification',
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        return await axios(config)
            .then((response) => {
            if (fs.existsSync('temp.zip')) {
                fs.unlinkSync('temp.zip');
            }
            return { isSuccess: true, data: response.data };
        })
            .catch(async (error) => {
            if (fs.existsSync('temp.zip')) {
                fs.unlinkSync('temp.zip');
            }
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        });
    }
    async validateMessageCatalog(fileBlobId, auditUser) {
        const fileBlob = await this.FilesService.retrieveFile(fileBlobId);
        const fileBuffer = Buffer.from(fileBlob.buffer.toString());
        const fileName = fileBlob.originalname;
        try {
            await writeFile(fileName, fileBuffer);
            var data = new FormData();
            data.append('file', fs.createReadStream(fileName));
        }
        catch (err) {
            return await this.ErrorLogService.errorServiceResponse(err, auditUser);
        }
        var config = {
            method: 'post',
            url: baseURL + '/validation/message-catalog',
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        return await axios(config)
            .then((response) => {
            if (fs.existsSync(fileName)) {
                fs.unlinkSync(fileName);
            }
            return { isSuccess: true, data: response.data };
        })
            .catch(async (error) => {
            if (fs.existsSync(fileName)) {
                fs.unlinkSync(fileName);
            }
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        });
    }
    async validateSchemaNDR(packageId, auditUser) {
        const packageResult = await this.MongoRepoService.getExportFileData({
            packageId: packageId,
            nodeId: '1',
            auditUser: auditUser,
        });
        const fileBuffer = packageResult.data;
        try {
            await writeFile('temp.zip', fileBuffer);
            var data = new FormData();
            await data.append('file', fs.createReadStream('temp.zip'));
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        }
        var config = {
            method: 'post',
            url: baseURL + '/validation/schemas/ndr',
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        return await axios(config)
            .then((response) => {
            if (fs.existsSync('temp.zip')) {
                fs.unlinkSync('temp.zip');
            }
            return { isSuccess: true, data: response.data };
        })
            .catch(async (error) => {
            if (fs.existsSync('temp.zip')) {
                fs.unlinkSync('temp.zip');
            }
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        });
    }
    async validateSchemaXML(packageId, auditUser) {
        const packageResult = await this.MongoRepoService.getExportFileData({
            packageId: packageId,
            nodeId: '1',
            auditUser: auditUser,
        });
        const fileBuffer = packageResult.data;
        try {
            await writeFile('temp.zip', fileBuffer);
            var data = new FormData();
            await data.append('file', fs.createReadStream('temp.zip'));
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        }
        var config = {
            method: 'post',
            url: baseURL + '/validation/schemas/xml',
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        return await axios(config)
            .then((response) => {
            if (fs.existsSync('temp.zip')) {
                fs.unlinkSync('temp.zip');
            }
            return { isSuccess: true, data: response.data };
        })
            .catch(async (error) => {
            if (fs.existsSync('temp.zip')) {
                fs.unlinkSync('temp.zip');
            }
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        });
    }
    async validateCmfXML(fileBlobId, auditUser) {
        const fileBlob = await this.FilesService.retrieveFile(fileBlobId);
        const fileBuffer = Buffer.from(fileBlob.buffer.toString());
        try {
            await writeFile('temp.xml', fileBuffer);
            var data = new FormData();
            data.append('file', fs.createReadStream('temp.xml'));
        }
        catch (error) {
            return this.ErrorLogService.errorServiceResponse(error, auditUser);
        }
        var config = {
            method: 'post',
            url: baseURL + '/validation/cmf/xml',
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        return await axios(config)
            .then((response) => {
            if (fs.existsSync('temp.xml')) {
                fs.unlinkSync('temp.xml');
            }
            return { isSuccess: true, data: response.data };
        })
            .catch(async (error) => {
            if (fs.existsSync('temp.xml')) {
                fs.unlinkSync('temp.xml');
            }
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        });
    }
    async validateInstanceXML(packageId, targetFileBlobId, auditUser) {
        const targetFileBlob = await this.FilesService.retrieveFile(targetFileBlobId);
        const targetFileBuffer = Buffer.from(targetFileBlob.buffer.toString());
        const xsdResult = await this.MongoRepoService.getExportFileData({
            packageId: packageId,
            nodeId: '1',
            auditUser: auditUser,
        });
        const schemaFileBuffer = xsdResult.data;
        try {
            await writeFile('target.xml', targetFileBuffer);
            var data = new FormData();
            await data.append('xml', fs.createReadStream('target.xml'));
            await writeFile('xsd.zip', schemaFileBuffer);
            await data.append('xsd', fs.createReadStream('xsd.zip'));
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        }
        var config = {
            method: 'post',
            url: baseURL + '/validation/instances/xml',
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        return await axios(config)
            .then((response) => {
            if (fs.existsSync('target.xml')) {
                fs.unlinkSync('target.xml');
            }
            if (fs.existsSync('xsd.zip')) {
                fs.unlinkSync('xsd.zip');
            }
            return { isSuccess: true, data: response.data };
        })
            .catch(async (error) => {
            if (fs.existsSync('target.xml')) {
                fs.unlinkSync('target.xml');
            }
            if (fs.existsSync('xsd.zip')) {
                fs.unlinkSync('xsd.zip');
            }
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        });
    }
    async validateInstanceJSON(targetFileBlobId, schemaFileBlobId, auditUser) {
        const targetFileBlob = await this.FilesService.retrieveFile(targetFileBlobId);
        const targetFileBuffer = Buffer.from(targetFileBlob.buffer.toString());
        const schemaFileBlob = await this.FilesService.retrieveFile(schemaFileBlobId);
        const schemaFileBuffer = Buffer.from(schemaFileBlob.buffer.toString());
        try {
            await writeFile('target.json', targetFileBuffer);
            var data = new FormData();
            await data.append('json', fs.createReadStream('target.json'));
            await writeFile('schema.json', schemaFileBuffer);
            await data.append('jsonSchema', fs.createReadStream('schema.json'));
        }
        catch (error) {
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        }
        var config = {
            method: 'post',
            url: baseURL + '/validation/instances/json',
            headers: Object.assign({}, data.getHeaders()),
            data: data,
        };
        return await axios(config)
            .then((response) => {
            if (fs.existsSync('target.json')) {
                fs.unlinkSync('target.json');
            }
            if (fs.existsSync('schema.json')) {
                fs.unlinkSync('schema.json');
            }
            return { isSuccess: true, data: response.data };
        })
            .catch(async (error) => {
            if (fs.existsSync('target.json')) {
                fs.unlinkSync('target.json');
            }
            if (fs.existsSync('schema.json')) {
                fs.unlinkSync('schema.json');
            }
            return await this.ErrorLogService.errorServiceResponse(error, auditUser);
        });
    }
};
GTRIService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => files_service_1.FilesService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => mongorepo_service_1.MongoRepoService))),
    __metadata("design:paramtypes", [error_log_service_1.ErrorLogService,
        files_service_1.FilesService,
        mongorepo_service_1.MongoRepoService])
], GTRIService);
exports.GTRIService = GTRIService;
//# sourceMappingURL=gtri.service.js.map