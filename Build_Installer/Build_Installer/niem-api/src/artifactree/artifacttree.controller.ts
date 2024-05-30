import {
  Controller,
  Get,
  Res,
  Param,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { ArtifactTreeService } from './artifacttree.service';
import { DeleteItemDto, DeleteByFolderDto } from './dto/artifactTree.dto';
import { UserService } from 'src/user/user.service';
import { MongoRepoService } from 'src/data/mongorepository/mongorepo.service';

@Controller('ArtifactTree')
export class ArtifactTreeController {
  constructor(
    private readonly ArtifactTreeService: ArtifactTreeService,
    private readonly UserService: UserService,
    private readonly MongoRepoService: MongoRepoService,
  ) {}

  @Post('/getArtifactTree/:packageId')
  async retrieveArtifactTree(
    @Param('packageId') packageId: string,
    @Body('auditUser') auditUser: string,
    @Res() res,
  ) {
    const userHasAccess = await this.UserService.userHasAccess(
      auditUser,
      'User',
    );
    const isPackageOwner = await this.MongoRepoService.isPackageOwner(
      auditUser,
      packageId,
    );

    if (userHasAccess && isPackageOwner) {
      // receive json from DB
      const artifactTreeJSON =
        await this.ArtifactTreeService.getArtifactTreeJSON(packageId);

      if (artifactTreeJSON) {
        // create a JSON string that contains the data in the property "blob"
        const jsonString = JSON.stringify(artifactTreeJSON);

        return res.status(HttpStatus.OK).json({
          message: 'Post has been created successfully',
          data: jsonString,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send(); // status 403
    }
  }

  @Post('/deleteItemFromTree')
  async deleteItemFromTree(@Body() DeleteItemDto: DeleteItemDto, @Res() res) {
    const userHasAccess = await this.UserService.userHasAccess(
      DeleteItemDto.auditUser,
      'User',
    );
    const isPackageOwner = await this.MongoRepoService.isPackageOwner(
      DeleteItemDto.auditUser,
      DeleteItemDto.packageId,
    );

    const result = await this.ArtifactTreeService.deleteItemFromTree(
      DeleteItemDto,
    );

    if (userHasAccess && isPackageOwner) {
      if (result) {
        return res.status(HttpStatus.OK).json({
          message: 'Post has been created successfully',
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send(); // status 403
    }
  }

  @Post('/deleteItemsByFolder')
  async deleteItemsByFolder(
    @Body() DeleteByFolderDto: DeleteByFolderDto,
    @Res() res,
  ) {
    const result = await this.ArtifactTreeService.deleteItemsByFolder(
      DeleteByFolderDto,
    );
    const userHasAccess = await this.UserService.userHasAccess(
      DeleteByFolderDto.auditUser,
      'User',
    );
    const isPackageOwner = await this.MongoRepoService.isPackageOwner(
      DeleteByFolderDto.auditUser,
      DeleteByFolderDto.packageId,
    );

    if (userHasAccess && isPackageOwner) {
      if (result) {
        return res.status(HttpStatus.OK).json({
          message: 'Post has been created successfully',
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    } else {
      return res.status(HttpStatus.FORBIDDEN).send(); // status 403
    }
  }
}
