import {
  Controller,
  Res,
  Query,
  Get,
  HttpStatus,
  Post,
  Body,
  Param,
  NotFoundException,
  Put,
  Delete,
} from '@nestjs/common';
import { ReleasesService } from './releases.service';
import {
  ParentTypeDto,
  AugmentationDto,
  AssociationDto,
  MigrationDto,
  ReleaseDto,
  DomainDto,
} from './dto/releases.dto';
import { ErrorLogService } from 'src/error/error.log.service';

@Controller('Releases')
export class ReleasesController {
  constructor(
    private readonly ReleasesService: ReleasesService,
    private ErrorLogService: ErrorLogService,
  ) {}

  @Post('/getParentType')
  async getParentType(@Res() res, @Body() ParentTypeDto: ParentTypeDto) {
    const result = await this.ReleasesService.getParentType(ParentTypeDto);
    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        parentType: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/getAugmentations')
  async getAugmentations(@Res() res, @Body() AugmentationDto: AugmentationDto) {
    const result = await this.ReleasesService.getAugmentations(AugmentationDto);
    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        augmentations: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/getAssociations')
  async getAssociations(@Res() res, @Body() AssociationDto: AssociationDto) {
    const result = await this.ReleasesService.getAssociations(AssociationDto);
    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        associations: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/migrateRelease')
  async migrateRelease(@Res() res, @Body() MigrationDto: MigrationDto) {
    const result = await this.ReleasesService.migrateRelease(MigrationDto);
    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Release migrated successfully',
        status: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/migrateReleaseViaGTRI')
  async migrateReleaseViaGTRI(@Res() res, @Body() MigrationDto: MigrationDto) {
    const result = await this.ReleasesService.migrateReleasViaGTRI(
      MigrationDto,
    );

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json(result.data);
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

  @Post('/getNamespaceData')
  async getNamespaceData(@Res() res, @Body() ReleaseDto: ReleaseDto) {
    const result = await this.ReleasesService.getNamespaceData(ReleaseDto);
    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Namespace found successfully',
        status: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/getDomainElements')
  async getDomainItems(@Res() res, @Body() DomainDto: DomainDto) {
    const result = await this.ReleasesService.getDomainElements(DomainDto);
    if (result) {
      return res.status(HttpStatus.OK).json({
        message: 'Domain elements found successfully',
        status: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Get('/getReleaseProgressStatus')
  async getReleaseProgressStatus(@Res() res) {
    const result = this.ReleasesService.getReleaseProgressStatus();

    if (result) {
      return res.status(HttpStatus.OK).json({
        status: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/updateReleaseViaNiem')
  async updateReleaseViaNiem(
    @Res() res,
    @Body('userId') userId: string,
    @Body('currentRelease') currentRelease: string,
  ) {
    const result = await this.ReleasesService.updateReleaseViaNiem(
      userId,
      currentRelease,
    );
    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json({
        result: result.data,
      });
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Get('/checkAvailableReleases')
  async checkAvailableReleases(@Res() res) {
    const result = await this.ReleasesService.checkAvailableReleases();

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json({
        releases: result,
      });
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }

  @Get('/getLoadedReleases')
  async getLoadedReleases(@Res() res) {
    const result = await this.ReleasesService.getLoadedReleases();
    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json({
        releases: result.data,
      });
    } else {
      return this.ErrorLogService.errorControllerResponse(res, result.data);
    }
  }
}
