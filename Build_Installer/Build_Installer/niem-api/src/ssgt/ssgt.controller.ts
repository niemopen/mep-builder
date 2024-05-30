import { Controller, Res, HttpStatus, Body, Post } from '@nestjs/common';
import { SSGTService } from './ssgt.service';
import { SSGTDTO } from './dto/ssgt.dto';
import { MongoRepoService } from 'src/data/mongorepository/mongorepo.service';
import { ErrorLogService } from 'src/error/error.log.service';

@Controller('SSGT')
export class SSGTController {
  constructor(
    private readonly SSGTService: SSGTService,
    private readonly MongoRepoService: MongoRepoService,
    private readonly ErrorLogService: ErrorLogService,
  ) {}

  @Post('/search')
  async search(@Res() res, @Body() SSGTDTO: SSGTDTO) {
    const results = await this.SSGTService.search(SSGTDTO);
    return res.status(HttpStatus.OK).send(results);
  }

  @Post('/getElement')
  async getElement(@Res() res, @Body() SSGTDTO: SSGTDTO) {
    const results = await this.SSGTService.getElement(SSGTDTO);
    return res.status(HttpStatus.OK).send(results);
  }

  @Post('/getElementType')
  async getElementType(@Res() res, @Body() SSGTDTO: SSGTDTO) {
    const results = await this.SSGTService.getElementType(SSGTDTO);
    return res.status(HttpStatus.OK).send(results);
  }

  @Post('/getSubsetSchema')
  async getSubsetSchema(@Res() res, @Body() SSGTDTO: SSGTDTO) {
    // get encoded response from SSGT API
    const subsetSchemaResult = await this.SSGTService.getSubsetSchema(SSGTDTO);

    if (subsetSchemaResult.isSuccess) {
      const encodedResponse =
        subsetSchemaResult.data['SOAP-ENV:Envelope']['SOAP-ENV:Body'][
          'nm:GenerateSchemaResponse'
        ]['nm:Response']['nm:DataFile'];

      // the encoded response has invalid characters and whitespace that need to be removed
      let cleanedEncodedResponse = encodedResponse.replace(/&amp;#13;/g, '');
      cleanedEncodedResponse = cleanedEncodedResponse.replace(/\s/g, '');

      // convert response to file
      const saveSubsetResult = await this.MongoRepoService.saveSubsetSchema(
        cleanedEncodedResponse,
        SSGTDTO,
      );

      if (saveSubsetResult.isSuccess) {
        return res.status(HttpStatus.OK).send(cleanedEncodedResponse);
      } else {
        return this.ErrorLogService.errorControllerResponse(
          res,
          saveSubsetResult.data,
        );
      }
    } else {
      return this.ErrorLogService.errorControllerResponse(
        res,
        subsetSchemaResult.data,
      );
    }
  }
}
