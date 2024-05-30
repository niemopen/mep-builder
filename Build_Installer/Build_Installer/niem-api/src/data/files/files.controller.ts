import {
  Controller,
  Body,
  Res,
  Post,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { ErrorLogService } from 'src/error/error.log.service';
import { CreateFileDto } from './dto/files.dto';
import { TranslateDto } from './dto/files.dto';
import { DeleteFileDto } from './dto/files.dto';
import { Express } from 'express';
import { UserService } from 'src/user/user.service';
import { MongoRepoService } from '../mongorepository/mongorepo.service';

@Controller('Files')
export class FilesController {
  constructor(
    private readonly FilesService: FilesService,
    private readonly UserService: UserService,
    private readonly MongoRepoService: MongoRepoService,
    private readonly ErrorLogService: ErrorLogService,
  ) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() CreateFileDto: CreateFileDto,
    @Res() res,
  ) {
    const result = await this.FilesService.saveFileToDB(file, CreateFileDto);

    if (result != false || result.isSuccess == true) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        fileBlobId: result.fileBlobId,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Post('/retrieveFile')
  async retrieveFile(@Body() CreateFileDto: CreateFileDto, @Res() res) {
    const userHasAccess = await this.UserService.userHasAccess(
      CreateFileDto.auditUser,
    );
    const userOwnsPackage = await this.MongoRepoService.isPackageOwner(
      CreateFileDto.auditUser,
      CreateFileDto.packageId,
    );

    if (userHasAccess && userOwnsPackage) {
      // receive data as buffer
      const file = await this.FilesService.retrieveFile(CreateFileDto.fileId);
      const fileBuffer = file.buffer;

      if (fileBuffer) {
        // create a JSON string that contains the data in the property "blob"
        const json = JSON.stringify({
          blob: fileBuffer.toString(CreateFileDto.encoding),
        });

        return res.status(HttpStatus.OK).json({
          message: 'Post has been created successfully',
          fileData: json,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Post('/translateToJsonLd')
  async translateToJsonLd(@Body() CreateFileDto: CreateFileDto, @Res() res) {
    const userHasAccess = await this.UserService.userHasAccess(
      CreateFileDto.auditUser,
    );
    const userOwnsPackage = await this.MongoRepoService.isPackageOwner(
      CreateFileDto.auditUser,
      CreateFileDto.packageId,
    );

    if (userHasAccess && userOwnsPackage) {
      const result = await this.FilesService.translateToJsonLd(CreateFileDto);
      // return results
      if (result.isSuccess) {
        return res.status(HttpStatus.OK).send();
      } else {
        return this.ErrorLogService.errorControllerResponse(res, result.data);
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Post('/translateViaCMF')
  async translateViaCMF(@Body() TranslateDto: TranslateDto, @Res() res) {
    const userHasAccess = await this.UserService.userHasAccess(
      TranslateDto.auditUser,
    );
    const userOwnsPackage = await this.MongoRepoService.isPackageOwner(
      TranslateDto.auditUser,
      TranslateDto.packageId,
    );

    if (userHasAccess && userOwnsPackage) {
      // generate base files from GTRI API
      const result = await this.FilesService.translateViaCMF(TranslateDto);

      // if translation was to CMF, update CMF files with extension data
      if (TranslateDto.translateType === 'cmf') {
        await this.FilesService.generateCMFFile(
          TranslateDto.packageId,
          TranslateDto.auditUser,
        );
      }

      // return results
      if (result.isSuccess) {
        return res.status(HttpStatus.OK).send();
      } else {
        return this.ErrorLogService.errorControllerResponse(res, result.data);
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Post('/generateCMFFile')
  async generateCMFFile(@Body() TranslateDto: TranslateDto, @Res() res) {
    const userHasAccess = await this.UserService.userHasAccess(
      TranslateDto.auditUser,
    );
    const userOwnsPackage = await this.MongoRepoService.isPackageOwner(
      TranslateDto.auditUser,
      TranslateDto.packageId,
    );

    if (userHasAccess && userOwnsPackage) {
      const result = await this.FilesService.generateCMFFile(
        TranslateDto.packageId,
        TranslateDto.auditUser,
      );

      if (result.isSuccess) {
        return res.status(HttpStatus.OK).json(result.data);
      } else {
        return this.ErrorLogService.errorControllerResponse(res, result.data);
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }

  @Post('/copySaveFile')
  async copySaveFile(@Body() CreateFileDto: CreateFileDto, @Res() res) {
    const result = await this.FilesService.copySaveFile(CreateFileDto);

    if (result.isSuccess) {
      return res.status(HttpStatus.OK).json({
        message: 'Post has been created successfully',
        data: result,
      });
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  @Delete('/deleteFile')
  async deleteFile(@Body() DeleteFileDto: DeleteFileDto, @Res() res) {
    const userHasAccess = await this.UserService.userHasAccess(
      DeleteFileDto.auditUser,
    );
    const userOwnsPackage = await this.MongoRepoService.isPackageOwner(
      DeleteFileDto.auditUser,
      DeleteFileDto.packageId,
    );

    if (userHasAccess && userOwnsPackage) {
      const result = await this.FilesService.deleteFileFromDB(DeleteFileDto);

      if (result.isSuccess) {
        return res.status(HttpStatus.OK).json({
          message: 'File has been deleted successfully',
          data: result,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send();
    }
  }
}
