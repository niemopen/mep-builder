import {
  Controller,
  Body,
  Res,
  Post,
  HttpStatus,
  Param,
  Get,
} from '@nestjs/common';
import { GTRIService } from './gtri.service';
import { ErrorLogService } from 'src/error/error.log.service';
import {
  SearchPropertiesDto,
  SearchTypesDto,
  ValidationDto,
} from './dto/gtri.api.2.0.dto';

@Controller('GTRIAPI')
export class GTRIAPIController {
  constructor(
    private readonly GTRIService: GTRIService,
    private ErrorLogService: ErrorLogService,
  ) {}

  @Post('/transformModels')
  async transformModels(
    @Res() res,
    @Body('from') from: string,
    @Body('to') to: string,
    @Body('file') file: Buffer,
    @Body('userId') userId: string,
  ) {
    const result = await this.GTRIService.transformModel(
      from,
      to,
      file,
      userId,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Get('/getAllProperties/:version')
  async getAllProperties(@Res() res, @Param('version') version: string) {
    const result = await this.GTRIService.getAllProperties(version);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).send(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getProperty/:version/:qname')
  async getProperty(
    @Res() res,
    @Param('version') version: string,
    @Param('qname') qname: string,
  ) {
    const result = await this.GTRIService.getProperty(version, qname);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).send(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getPropertiesByNamespace/:version/:prefix')
  async getPropertiesByNamespace(
    @Res() res,
    @Param('version') version: string,
    @Param('prefix') prefix: string,
  ) {
    const result = await this.GTRIService.getPropertiesByNamespace(
      version,
      prefix,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).send(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getType/:version/:qname')
  async getType(
    @Res() res,
    @Param('version') version: string,
    @Param('qname') qname: string,
  ) {
    const result = await this.GTRIService.getType(version, qname);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).send(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getTypesByNamespace/:version/:prefix')
  async getTypesByNamespace(
    @Res() res,
    @Param('version') version: string,
    @Param('prefix') prefix: string,
  ) {
    const result = await this.GTRIService.getTypesByNamespace(version, prefix);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).send(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getTypeSubproperties/:version/:qname')
  async getTypeSubproperties(
    @Res() res,
    @Param('version') version: string,
    @Param('qname') qname: string,
  ) {
    const result = await this.GTRIService.getTypeSubproperties(version, qname);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).send(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getAllNamespaces/:version')
  async getAllNamespaces(@Res() res, @Param('version') version: string) {
    const result = await this.GTRIService.getAllNamespaces(version);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).send(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getNamespace/:version/:prefix')
  async getNamespace(
    @Res() res,
    @Param('version') version: string,
    @Param('prefix') prefix: string,
  ) {
    const result = await this.GTRIService.getNamespace(version, prefix);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).send(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getFacets/:version/:qname')
  async getFacets(
    @Res() res,
    @Param('version') version: string,
    @Param('qname') qname: string,
  ) {
    const result = await this.GTRIService.getFacets(version, qname);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).send(result.data);
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/searchProperties')
  async searchProperties(
    @Res() res,
    @Body() SearchPropertiesDto: SearchPropertiesDto,
  ) {
    const result = await this.GTRIService.searchProperties(SearchPropertiesDto);
    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/searchTypes')
  async searchTypes(@Res() res, @Body() SearchTypesDto: SearchTypesDto) {
    const result = await this.GTRIService.searchTypes(SearchTypesDto);
    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/validation/message-specification')
  async validationMessageSpecification(
    @Res() res,
    @Body() ValidationDto: ValidationDto,
  ) {
    // packageId - packageId for the package
    const result = await this.GTRIService.validateMessageSpecification(
      ValidationDto.packageId,
      ValidationDto.auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Post('/validation/message-catalog')
  async validationMessageCatalog(
    @Res() res,
    @Body() ValidationDto: ValidationDto,
  ) {
    // Validate an IEPD/MPD catalog
    // fileBlobId - fileBlobId for the target catalog file
    const result = await this.GTRIService.validateMessageCatalog(
      ValidationDto.fileBlobId,
      ValidationDto.auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Post('/validation/schemas/ndr')
  async validationSchemaNDR(@Res() res, @Body() ValidationDto: ValidationDto) {
    // Validate all XML schema against the NIEM Naming and Design Rules (NDR)
    // packageId - packageId for the package
    // Note: This function will pass in the base-xsd folder and validate the entire contents against the NDR rules
    const result = await this.GTRIService.validateSchemaNDR(
      ValidationDto.packageId,
      ValidationDto.auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Post('/validation/schemas/xml')
  async validationSchemaXML(@Res() res, @Body() ValidationDto: ValidationDto) {
    // Validate one XML schema
    // fileBlobId - fileBlobId for the target XML Schema
    // Note: The GTRI API 2.0 could support validating multiple xml schemas at a time, but this is written to do one at a time
    const result = await this.GTRIService.validateSchemaXML(
      ValidationDto.packageId,
      ValidationDto.auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Post('/validation/cmf/xml')
  async validationCmfXML(
    @Res() res,
    @Body() ValidationDto: ValidationDto,
  ) {
    const result = await this.GTRIService.validateCmfXML(
      ValidationDto.fileBlobId,
      ValidationDto.auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Post('/validation/instances/json')
  async validationInstanceJSON(
    @Res() res,
    @Body() ValidationDto: ValidationDto,
  ) {
    // Validate one json file against a json schema
    // fileBlobId - FileBlobId for the target json file
    // schemaFileBlobId - FileBlobId for the json schema
    // Note: The GTRI API 2.0 could support validating multiple instances at a time, but this is written to do one at a time

    if (!ValidationDto.schemaFileBlobId) {
      const stringify = require('json-stringify-safe');
      const dbRecord = await this.ErrorLogService.logError(
        '',
        ValidationDto.auditUser,
        stringify('Schema not found to validate this instance file.'),
      );

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorId: dbRecord._id,
        errorStatus: 500,
        errorMessage:
          'Internal Server Error - Schema not found to validate this instance file. Try translating the package to JSON Schema.',
      });
    }

    const result = await this.GTRIService.validateInstanceJSON(
      ValidationDto.fileBlobId,
      ValidationDto.schemaFileBlobId,
      ValidationDto.auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Post('/validation/instances/xml')
  async validationInstanceXML(
    @Res() res,
    @Body() ValidationDto: ValidationDto,
  ) {
    // Validate one xml file against an xml schema
    // packageId - target packageId
    // targetFileBlobId - FileBlobId for the target xml file
    // Note: The GTRI API 2.0 could support validating multiple instances at a time, but this is written to do one at a time

    const result = await this.GTRIService.validateInstanceXML(
      ValidationDto.packageId,
      ValidationDto.fileBlobId,
      ValidationDto.auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }
}
