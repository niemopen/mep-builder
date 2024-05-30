import {
  Controller,
  Body,
  Res,
  Get,
  Post,
  Param,
  HttpStatus,
  Delete,
  Patch,
} from '@nestjs/common';
import { MongoRepoService } from './mongorepo.service';
import {
  SavePackageDto,
  SaveCMEDataDto,
  ExportPackageDto,
  DeletePackageDto,
  MappingComponentDto,
  CommonComponentsDto,
  TransferPackagesDto,
} from './dto/mongorepo.dto';
import { ErrorLogService } from 'src/error/error.log.service';
import { UserService } from 'src/user/user.service';

@Controller('MongoRepo')
export class MongoRepoController {
  constructor(
    private readonly MongoRepoService: MongoRepoService,
    private readonly ErrorLogService: ErrorLogService,
    private readonly UserService: UserService,
  ) {}

  @Post('/savePackage')
  async savePackage(
    @Res() res,
    @Body('packageData') SavePackageDto: SavePackageDto,
    @Body('auditUser') auditUser: string,
  ) {
    const result = await this.MongoRepoService.savePackage(
      SavePackageDto,
      auditUser,
    );

    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        packageId: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Delete('/deletePackage')
  async deletePackage(@Res() res, @Body() DeletePackageDto: DeletePackageDto) {
    const userHasAccess = await this.UserService.userHasAccess(
      DeletePackageDto.auditUser,
    );

    if (userHasAccess) {
      const isSuccess = await this.MongoRepoService.deletePackage(
        DeletePackageDto,
      );

      if (isSuccess) {
        return res.status(HttpStatus.OK).json({
          message: 'Package deleted successfully',
          isSuccess,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    } else {
      res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Get('/packages/:userId')
  async findPackagesByUserId(@Res() res, @Param('userId') userId: string) {
    const result = await this.MongoRepoService.findPackagesByUserId(userId);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return await this.ErrorLogService.errorControllerResponse(
        res,
        result.data,
      );
    }
  }

  @Post('/publishedPackages/')
  async findPublishedPackages(
    @Res() res,
    @Body('auditUser') auditUser: string,
  ) {
    const userHasAccess = await this.UserService.userHasAccess(
      auditUser,
      'User',
    );

    const result = await this.MongoRepoService.findPublishedPackages();

    if (userHasAccess) {
      if (result.response) {
        return res.status(HttpStatus.OK).json({
          message: 'Post has been created successfully',
          publishedPackages: result.publishedPackages,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send(); // status 403
    }
  }

  // used when using a non-stand-alone instance of the application
  // NOTE: Returns user's unpublished and ALL published (regardless of userId)
  @Get('/mpdData/:userId')
  async findMPDData(@Res() res, @Param('userId') userId: string) {
    const mpdData = await this.MongoRepoService.findMPDData(userId);
    return res.status(HttpStatus.OK).json(mpdData);
  }

  // used when using a stand-alone instance of the application
  @Get('/sortedMpdData/')
  async getSortedMpdDataStandlone(
    @Res() res,
    @Body('auditUser') auditUser: string,
  ) {
    const userHasAccess = await this.UserService.userHasAccess(
      auditUser,
      'User',
    );
    if (userHasAccess) {
      const mpdData = await this.MongoRepoService.getSortedMpdData();
      return res.status(HttpStatus.OK).json(mpdData);
    } else {
      return res.status(HttpStatus.FORBIDDEN).send(); // status 403
    }
  }

  // used when using a non-stand-alone instance of the application
  // NOTE: Returns user's unpublished and ALL published (regardless of userId)
  @Get('/sortedMpdData/:userId')
  async getSortedMpdData(@Res() res, @Param('userId') userId: string) {
    const userHasAccess = await this.UserService.userHasAccess(userId, 'User');
    if (userHasAccess) {
      const mpdData = await this.MongoRepoService.getSortedMpdData(userId);
      return res.status(HttpStatus.OK).json(mpdData);
    } else {
      return res.status(HttpStatus.FORBIDDEN).send(); // status 403
    }
  }

  @Post('/getPackageData/:packageId')
  async findByPackageId(
    @Res() res,
    @Param('packageId') packageId: string,
    @Body('auditUser') auditUser: string,
  ) {
    const userHasAccess = await this.UserService.userHasAccess(
      auditUser,
      'User',
    );

    if (userHasAccess) {
      const packageData = await this.MongoRepoService.findByPackageId(
        packageId,
      );
      return res.status(HttpStatus.OK).json(packageData);
    } else {
      return res.status(HttpStatus.FORBIDDEN).send(); // status 403
    }
  }

  @Post('/saveComponents')
  async saveComponents(
    @Res() res,
    @Body('componentData') MappingComponentDto: MappingComponentDto,
    @Body('auditUser') auditUser: string,
  ) {
    const result = await this.MongoRepoService.saveComponents(
      MappingComponentDto,
      auditUser,
    );
    // TODO: handle fails
    return res.status(HttpStatus.OK).json({
      message: 'Post has been created successfully',
      packageId: result,
    });
  }

  @Post('/saveCMEData')
  async saveCMEData(
    @Res() res,
    @Body('cmeData') SaveCMEDataDto: SaveCMEDataDto,
    @Body('auditUser') auditUser: string,
  ) {
    const result = await this.MongoRepoService.saveCMEData(
      SaveCMEDataDto,
      auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    } else if (result.data.errorStatus !== undefined) {
      return res.status(result.data.errorStatus).json(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorId: null,
        errorStatus: 500,
        errorMessage: 'Internal Server Error',
      });
    }
  }

  @Post('/buildCMEData')
  async buildCMEData(
    @Res() res,
    @Body('cmeData') SaveCMEDataDto: SaveCMEDataDto,
    @Body('auditUser') auditUser: string,
  ) {
    const result = await this.MongoRepoService.buildCMEData(
      SaveCMEDataDto,
      auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result);
    } else if (result.data.errorStatus !== undefined) {
      return res.status(result.data.errorStatus).json(result.data);
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        errorId: null,
        errorStatus: 500,
        errorMessage: 'Internal Server Error',
      });
    }
  }

  @Post('/export')
  async getExportFileData(
    @Res() res,
    @Body() ExportPackageDto: ExportPackageDto,
  ) {
    const userHasAccess = await this.UserService.userHasAccess(
      ExportPackageDto.auditUser,
    );

    if (userHasAccess) {
      const fileDataBuffer = await this.MongoRepoService.getExportFileData(
        ExportPackageDto,
      );

      if (fileDataBuffer.data === false) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      } else {
        const json = JSON.stringify({
          blob: fileDataBuffer.data.toString('base64'),
          type: fileDataBuffer.type,
        });
        return res.status(HttpStatus.OK).json(json);
      }
    } else {
      res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Post('/getCommonComponents')
  async getCommonComponents(
    @Res() res,
    @Body() CommonComponentsDto: CommonComponentsDto,
  ) {
    const result = await this.MongoRepoService.getCommonComponents(
      CommonComponentsDto,
    );
    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        commonComponents: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/updateArtifactChecklist')
  async updateArtifactStatus(
    @Res() res,
    @Body('packageData') SavePackageDto: SavePackageDto,
    @Body('auditUser') auditUser: string,
  ) {
    const result = await this.MongoRepoService.updateArtifactStatus(
      SavePackageDto,
      auditUser,
    );

    if (result !== false) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        artifactChecklist: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getArtifactChecklist/:packageId')
  async getArtifactChecklist(
    @Res() res,
    @Param('packageId') packageId: string,
  ) {
    const result = await this.MongoRepoService.getArtifactChecklist(packageId);

    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        artifactChecklist: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getTranslationGenerationStatus/:packageId')
  async getTransaltionGenerationStatus(
    @Res() res,
    @Param('packageId') packageId: string,
  ) {
    const result = await this.MongoRepoService.getTranslationGenerationStatus(
      packageId,
    );

    if (result.response) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        isTranslationGenerated: result.isTranslationGenerated,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Patch('/updateTranslationGenerationStatus')
  async updateTranslationGenerationStatus(
    @Res() res,
    @Body('packageData') SavePackageDto: SavePackageDto,
    @Body('auditUser') auditUser: string,
  ) {
    const result =
      await this.MongoRepoService.updateTranslationGenerationStatus(
        SavePackageDto,
        auditUser,
      );

    if (result !== false) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        translationGenerationStaus: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getCustomExtensions/:packageId')
  async getCustomExtensionsById(
    @Res() res,
    @Param('packageId') packageId: string,
  ) {
    const result = await this.MongoRepoService.getAllCustomModelExtensions(
      packageId,
    );
    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Data has been retrieved successfully',
        customExtensions: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/transferPackages/')
  async transferPackages(
    @Res() res,
    @Body('transferData') transferPackagesDto: TransferPackagesDto,
    @Body('auditUser') auditUser: string,
  ) {
    const result = await this.MongoRepoService.transferPackages(
      transferPackagesDto,
      auditUser,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
    } else {
      return await this.ErrorLogService.errorControllerResponse(
        res,
        result.data,
      );
    }
  }
}
