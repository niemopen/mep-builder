import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ErrorLogService } from 'src/error/error.log.service';
import { FilesService } from 'src/data/files/files.service';
import { MongoRepoService } from 'src/data/mongorepository/mongorepo.service';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { SearchPropertiesDto, SearchTypesDto } from './dto/gtri.api.2.0.dto';

const axios = require('axios');
const { writeFile } = require('fs').promises;
const baseURL = 'https://tools.niem.gov/api/v2';
const modelsURL = 'stewards/niem/models/model/versions';

@Injectable()
export class GTRIService {
  constructor(
    private ErrorLogService: ErrorLogService,
    @Inject(forwardRef(() => FilesService))
    private FilesService: FilesService,
    @Inject(forwardRef(() => MongoRepoService))
    private MongoRepoService: MongoRepoService,
  ) {}

  async transformModel(from, to, fileBuffer, userId): Promise<any> {
    let tempFileName;
    try {
      if (from === 'cmf') {
        tempFileName = 'temp.cmf.xml';
      } else {
        tempFileName = 'temp.zip';
      }

      await writeFile(tempFileName, fileBuffer);
      var data = new FormData();
      await data.append('file', fs.createReadStream(tempFileName));
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, userId);
    }

    var config = {
      method: 'post',
      url: baseURL + '/transforms/models?from=' + from + '&to=' + to,
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    if (to === 'xsd') {
      // returning an xsd will be returning a zip file, need to read this through a stream
      config['responseType'] = 'stream';
    }

    return await axios(config)
      .then((response) => {
        fs.unlinkSync(tempFileName); // delete temp file
        return { isSuccess: true, data: response.data };
      })
      .catch(async (error) => {
        fs.unlinkSync(tempFileName); // delete temp file

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
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, auditUser);
    }
    var config = {
      method: 'post',
      url: baseURL + '/migration/cmf',
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    return await axios(config)
      .then((response) => {
        fs.unlinkSync('cmf.xml'); // delete temp file

        return { isSuccess: true, data: response.data };
      })
      .catch(async (error) => {
        fs.unlinkSync('cmf.xml'); // delete temp file

        return await this.ErrorLogService.errorServiceResponse(
          error,
          auditUser,
        );
      });
  }

  async getAllProperties(version): Promise<any> {
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

  // Get Model Details
  async getProperty(version, qname): Promise<any> {
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

  async getFacets(version, qname): Promise<any> {
    const transformedTypeName = qname.replaceAll(':', '%3A');

    var config = {
      method: 'get',
      url:
        baseURL +
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

  async getPropertiesByNamespace(version, prefix): Promise<any> {
    var config = {
      method: 'get',
      url:
        baseURL +
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

  async getType(version, qname): Promise<any> {
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

  async getTypeCMF(version, qname): Promise<any> {
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

  async getTypesByNamespace(version, prefix): Promise<any> {
    var config = {
      method: 'get',
      url:
        baseURL +
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

  async getTypeSubproperties(version, qname): Promise<any> {
    var config = {
      method: 'get',
      url:
        baseURL +
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

  async getAllNamespaces(version): Promise<any> {
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

  async getNamespace(version, prefix): Promise<any> {
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

  async getNamespaceCMF(version, prefix): Promise<any> {
    var config = {
      method: 'get',
      url:
        baseURL + '/' + modelsURL + '/' + version + '/namespaces.cmf/' + prefix,
    };

    return await axios(config)
      .then(function (response) {
        return { isSuccess: true, data: response.data };
      })
      .catch(function (error) {
        return { isSuccess: false, data: error };
      });
  }

  // Search
  async searchProperties(
    SearchPropertiesDto: SearchPropertiesDto,
  ): Promise<any> {
    let urlString =
      baseURL +
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

  async searchTypes(SearchTypesDto: SearchTypesDto): Promise<any> {
    let urlString =
      baseURL +
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

  // Validate
  async validateMessageSpecification(packageId, auditUser): Promise<any> {
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
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, auditUser);
    }

    var config = {
      method: 'post',
      url: baseURL + '/validation/message-specification',
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    return await axios(config)
      .then((response) => {
        if (fs.existsSync('temp.zip')) {
          fs.unlinkSync('temp.zip'); // delete temp file
        }
        return { isSuccess: true, data: response.data };
      })
      .catch(async (error) => {
        if (fs.existsSync('temp.zip')) {
          fs.unlinkSync('temp.zip'); // delete temp file
        }

        return await this.ErrorLogService.errorServiceResponse(
          error,
          auditUser,
        );
      });
  }

  async validateMessageCatalog(fileBlobId, auditUser): Promise<any> {
    const fileBlob = await this.FilesService.retrieveFile(fileBlobId);
    const fileBuffer = Buffer.from(fileBlob.buffer.toString());
    const fileName = fileBlob.originalname;
    try {
      await writeFile(fileName, fileBuffer);
      var data = new FormData();
      data.append('file', fs.createReadStream(fileName));
    } catch (err) {
      return await this.ErrorLogService.errorServiceResponse(err, auditUser);
    }

    var config = {
      method: 'post',
      url: baseURL + '/validation/message-catalog',
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    return await axios(config)
      .then((response) => {
        if (fs.existsSync(fileName)) {
          fs.unlinkSync(fileName); // delete temp file
        }
        return { isSuccess: true, data: response.data };
      })
      .catch(async (error) => {
        if (fs.existsSync(fileName)) {
          fs.unlinkSync(fileName); // delete temp file
        }
        return await this.ErrorLogService.errorServiceResponse(
          error,
          auditUser,
        );
      });
  }

  async validateSchemaNDR(packageId, auditUser): Promise<any> {
    const packageResult = await this.MongoRepoService.getExportFileData({
      packageId: packageId,
      nodeId: '1', // base-xsd folder
      auditUser: auditUser,
    });

    const fileBuffer = packageResult.data;
    try {
      await writeFile('temp.zip', fileBuffer);
      var data = new FormData();
      await data.append('file', fs.createReadStream('temp.zip'));
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, auditUser);
    }

    var config = {
      method: 'post',
      url: baseURL + '/validation/schemas/ndr',
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    return await axios(config)
      .then((response) => {
        if (fs.existsSync('temp.zip')) {
          fs.unlinkSync('temp.zip'); // delete temp file
        }

        return { isSuccess: true, data: response.data };
      })
      .catch(async (error) => {
        if (fs.existsSync('temp.zip')) {
          fs.unlinkSync('temp.zip'); // delete temp file
        }
        return await this.ErrorLogService.errorServiceResponse(
          error,
          auditUser,
        );
      });
  }

  async validateSchemaXML(packageId, auditUser): Promise<any> {
    const packageResult = await this.MongoRepoService.getExportFileData({
      packageId: packageId,
      nodeId: '1', // base-xsd folder
      auditUser: auditUser,
    });
    const fileBuffer = packageResult.data;
    try {
      await writeFile('temp.zip', fileBuffer);
      var data = new FormData();
      await data.append('file', fs.createReadStream('temp.zip'));
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, auditUser);
    }

    var config = {
      method: 'post',
      url: baseURL + '/validation/schemas/xml',
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    return await axios(config)
      .then((response) => {
        if (fs.existsSync('temp.zip')) {
          fs.unlinkSync('temp.zip'); // delete temp file
        }

        return { isSuccess: true, data: response.data };
      })
      .catch(async (error) => {
        if (fs.existsSync('temp.zip')) {
          fs.unlinkSync('temp.zip'); // delete temp file
        }

        return await this.ErrorLogService.errorServiceResponse(
          error,
          auditUser,
        );
      });
  }

  async validateCmfXML(fileBlobId, auditUser) {
    const fileBlob = await this.FilesService.retrieveFile(fileBlobId);
    const fileBuffer = Buffer.from(fileBlob.buffer.toString());
    try {
      await writeFile('temp.xml', fileBuffer);
      var data = new FormData();
      data.append('file', fs.createReadStream('temp.xml'));
    } catch (error) {
      return this.ErrorLogService.errorServiceResponse(error, auditUser);
    }

    var config = {
      method: 'post',
      url: baseURL + '/validation/cmf/xml',
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    return await axios(config)
      .then((response) => {
        if (fs.existsSync('temp.xml')) {
          fs.unlinkSync('temp.xml'); // delete temp file
        }

        return { isSuccess: true, data: response.data };
      })
      .catch(async (error) => {
        if (fs.existsSync('temp.xml')) {
          fs.unlinkSync('temp.xml'); // delete temp file
        }

        return await this.ErrorLogService.errorServiceResponse(
          error,
          auditUser,
        );
      });
  }

  async validateInstanceXML(
    packageId,
    targetFileBlobId,
    auditUser,
  ): Promise<any> {
    // get target file information
    const targetFileBlob = await this.FilesService.retrieveFile(
      targetFileBlobId,
    );
    const targetFileBuffer = Buffer.from(targetFileBlob.buffer.toString());

    // get schema file information
    const xsdResult = await this.MongoRepoService.getExportFileData({
      packageId: packageId,
      nodeId: '1', // base-xsd folder used to validate
      auditUser: auditUser,
    });

    const schemaFileBuffer = xsdResult.data;

    try {
      // add target file to formData
      await writeFile('target.xml', targetFileBuffer);
      var data = new FormData();
      await data.append('xml', fs.createReadStream('target.xml'));

      // add schema file to formData
      await writeFile('xsd.zip', schemaFileBuffer);
      await data.append('xsd', fs.createReadStream('xsd.zip'));
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, auditUser);
    }

    var config = {
      method: 'post',
      url: baseURL + '/validation/instances/xml',
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    return await axios(config)
      .then((response) => {
        // delete temp files
        if (fs.existsSync('target.xml')) {
          fs.unlinkSync('target.xml');
        }
        if (fs.existsSync('xsd.zip')) {
          fs.unlinkSync('xsd.zip');
        }

        return { isSuccess: true, data: response.data };
      })
      .catch(async (error) => {
        // delete temp files
        if (fs.existsSync('target.xml')) {
          fs.unlinkSync('target.xml');
        }
        if (fs.existsSync('xsd.zip')) {
          fs.unlinkSync('xsd.zip');
        }

        return await this.ErrorLogService.errorServiceResponse(
          error,
          auditUser,
        );
      });
  }

  async validateInstanceJSON(
    targetFileBlobId,
    schemaFileBlobId,
    auditUser,
  ): Promise<any> {
    // get target file information
    const targetFileBlob = await this.FilesService.retrieveFile(
      targetFileBlobId,
    );
    const targetFileBuffer = Buffer.from(targetFileBlob.buffer.toString());

    // get schema file information
    const schemaFileBlob = await this.FilesService.retrieveFile(
      schemaFileBlobId,
    );
    const schemaFileBuffer = Buffer.from(schemaFileBlob.buffer.toString());

    try {
      // add target file to formData
      await writeFile('target.json', targetFileBuffer);
      var data = new FormData();
      await data.append('json', fs.createReadStream('target.json'));

      // add schema file to formData
      await writeFile('schema.json', schemaFileBuffer);
      await data.append('jsonSchema', fs.createReadStream('schema.json'));
    } catch (error) {
      return await this.ErrorLogService.errorServiceResponse(error, auditUser);
    }

    var config = {
      method: 'post',
      url: baseURL + '/validation/instances/json',
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    return await axios(config)
      .then((response) => {
        // delete temp files
        if (fs.existsSync('target.json')) {
          fs.unlinkSync('target.json');
        }
        if (fs.existsSync('schema.json')) {
          fs.unlinkSync('schema.json');
        }

        return { isSuccess: true, data: response.data };
      })
      .catch(async (error) => {
        // delete temp files
        if (fs.existsSync('target.json')) {
          fs.unlinkSync('target.json');
        }
        if (fs.existsSync('schema.json')) {
          fs.unlinkSync('schema.json');
        }

        return await this.ErrorLogService.errorServiceResponse(
          error,
          auditUser,
        );
      });
  }
}
