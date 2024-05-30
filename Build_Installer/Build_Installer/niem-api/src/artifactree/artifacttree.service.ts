import * as _ from 'lodash';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as collection from 'src/util/collection.name.util';
import { AuditLogService } from 'src/audit/audit.log.service';
import { ArtifactTree } from 'src/data/mongorepository/schemas/artifacttree.interface';
import { DeleteByFolderDto, DeleteItemDto } from './dto/artifactTree.dto';
import { FilesService } from 'src/data/files/files.service';
import { isStringValid } from 'src/util/dataValidation.util';

@Injectable()
export class ArtifactTreeService {
  constructor(
    private AuditLogService: AuditLogService,
    @InjectModel('ArtifactTree')
    private ArtifactTreeModel: Model<ArtifactTree>,
    @Inject(forwardRef(() => FilesService))
    private FilesService: FilesService,
  ) {}

  async saveArtifactTreeToDB(packageId, artifactTree, auditUser): Promise<any> {
    const ogArtifactTree = await this.ArtifactTreeModel.findOne({
      packageId: packageId,
    });

    const modArtifactTree = await this.ArtifactTreeModel.findOneAndUpdate(
      { packageId: packageId },
      { artifactTreeJSON: JSON.stringify(artifactTree) },
      { new: true }, // returns the document after update
    );

    // if artifact tree updated, create audit log
    if (!_.isEqual(ogArtifactTree, modArtifactTree)) {
      this.AuditLogService.update(
        collection.artifacttrees,
        auditUser,
        modArtifactTree,
        ogArtifactTree,
      );
    }
  }

  async makeBranchVisible(
    nodeId,
    packageId,
    auditUser,
    recursive = false,
  ): Promise<any> {
    // This makeBranchVisible function will make a specific artifact node visible in the artifact tree
    /* Note input parameters are:
            - nodeID (the specific artifact item that should be made visible)
            - packageID (the packageId used to resave the artifact tree in the DB)
            - auditUser (the user that initiated this action that will modify the DB, used to create audit log)
            - recursive (this is an optional parameter. If received as true, this will make the given node plus all its children visible)
    */
    // get initial artifact tree from DB
    let artifactTree = await this.getArtifactTreeJSON(packageId);

    const loopThrough = async (items, nodeBranch) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].nodeId === nodeBranch) {
          items[i].isVisible = true;
          return true; //break
        } else if (items[i].children && items[i].children.length > 0) {
          await loopThrough(items[i].children, nodeBranch);
        }
      }

      artifactTree = items;
    };

    if (recursive) {
      // get all nodeIDs in this branch
      const allBranchNodes = await this.getBranchChildren(artifactTree, nodeId);

      for (let i = 0; i < allBranchNodes.length; i++) {
        await loopThrough(artifactTree, allBranchNodes[i]);
      }
    } else {
      await loopThrough(artifactTree, nodeId);
    }

    // Update artifact tree in DB
    await this.saveArtifactTreeToDB(packageId, artifactTree, auditUser);
  }

  async getArtifactTreeJSON(packageId): Promise<any> {
    let artifactTree;

    const artifactTreeDBResult = await this.ArtifactTreeModel.findOne(
      { packageId: packageId },
      { artifactTreeJSON: 1 },
    );

    if (artifactTreeDBResult) {
      artifactTree = JSON.parse(artifactTreeDBResult.artifactTreeJSON);
    }

    // will return undefined if not exists.
    return artifactTree;
  }

  async getNodeIdByLabel(branch, label): Promise<any> {
    let nodeId = -1;

    const loopThrough = (items) => {
      items.every((item) => {
        if (item.label === label) {
          nodeId = item.nodeId;
          return false; // breaks out of .every function
        }
        const children = item.children;
        if (children && children.length > 0) {
          loopThrough(children);
        }

        return true; // continues iterating through .every function
      });
    };

    loopThrough(branch);

    return nodeId;
  }

  async getBranchChildren(branch, parentNodeId): Promise<any> {
    // This getBranchChildren returns the children in an array
    let returningChildren = [];

    const loopThrough = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].nodeId == parentNodeId) {
          returningChildren = items[i].children;
        }
        const children = items[i].children;
        if (children && children.length > 0) {
          loopThrough(children);
        }
      }
    };

    loopThrough(branch);

    return returningChildren;
  }

  getNextNodePart(items) {
    let nodeParts;
    let nodeMax = 0;

    items.forEach(function (item) {
      nodeParts = item.nodeId.split('.');
      if (parseInt(nodeParts[nodeParts.length - 1]) > nodeMax) {
        nodeMax = nodeParts[nodeParts.length - 1];
      }
    });

    nodeMax = nodeMax * 1 + 1;

    return nodeMax + 1;
  }

  async AddArtifactToTree(
    packageId,
    artifact,
    parentNodeId,
    auditUser,
  ): Promise<any> {
    // This AddArtifactToTree function returns the nodeId if the Artifact was added/uploaded/updated to the tree or false if not
    /* Note input parameters are:
        - packageId (the packageId associated with the target artifact tree),
        - artifact (the artifact item that needs to be added to the tree)
        - partentNodeId (the nodeId of the parent folder where the artifact needs to be added to)
        - auditUser (the userid of the user requesting this update, used to create event in audit log)
    */
    // get initial artifact tree from DB
    const artifactTree = await this.getArtifactTreeJSON(packageId);

    let newNode = ''; // This will be the nodeID of the new artifact

    // creating a loopThrough function that will search for the parentNodeId (folder) and can be recursively called for each child branch found
    const loopThroughToFindParentFolder = (items) => {
      items.map((item) => {
        // Loop through the items of the artifact tree, if the nodeID matches the target parentNodeId (aka folder), continue with code to add artifact to tree. Otherwise, skip this node.
        if (item.nodeId === parentNodeId) {
          // If found the target parentNodeId (The folder we want to add the artifact)
          // First check all the current children of this folder to see if an artifact with the same file name already exists
          const index = item.children.findIndex(
            (itemData) => itemData.label === artifact.label,
          );

          // update or add the artifact to the parentNode in the artifact tree
          if (index === -1) {
            // get the new nodeId that will be used for this artifact
            if (parentNodeId === '0') {
              newNode = this.getNextNodePart(item.children).toString();
            } else {
              newNode =
                parentNodeId.toString() +
                '.' +
                this.getNextNodePart(item.children).toString();
            }

            // add new artifact
            item.children.push({
              key: newNode,
              nodeId: newNode,
              label: artifact.label,
              fileType: artifact.fileType,
              fileBlobId: artifact.fileBlobId,
              tag: artifact.tag,
              needsReview: false,
              isVisible: true,
              children: [],
            });
          } else {
            // update existing node in the artifact tree
            item.children[index].fileBlobId = artifact.fileBlobId;
            item.children[index].isVisible = true;

            // return existing node
            newNode = item.children[index].nodeId;
          }

          return false;
        } else if (item.children && item.children.length > 0) {
          // Else, if this item does not match the target parentNodeId, check if this item has children and recursively loop through to also check them for the target parentNodeId
          loopThroughToFindParentFolder(item.children);
        }
        return 0;
      });
    };

    // initially call loopThrough function
    loopThroughToFindParentFolder(artifactTree);

    // Update artifact tree in DB
    await this.saveArtifactTreeToDB(packageId, artifactTree, auditUser);

    // make the parentNode visibile in the artifact tree
    await this.makeBranchVisible(parentNodeId, packageId, auditUser);

    // finally, return new nodeId of artifact
    return newNode;
  }

  getParentNodeId(nodeId) {
    // retrieve the parent Id of item
    let parentNodeId = '';

    if (nodeId.length === 1) {
      parentNodeId = nodeId;
    } else {
      const splitNodeId = nodeId.split('.');
      const removeLastItem = splitNodeId.slice(0, splitNodeId.length - 1);
      parentNodeId = removeLastItem.join('.');
    }

    return parentNodeId;
  }

  async getArtifactsByFileType(packageId, fileType) {
    const artifactTree = await this.getArtifactTreeJSON(packageId);

    const artifactTreeFiles = [];
    const loopThrough = (items) => {
      items.forEach((item) => {
        //grab files that match the fileType
        if (item.fileType.toLowerCase() === fileType.toLowerCase()) {
          artifactTreeFiles.push(item);
        }
        const children = item.children;
        if (children && children.length > 0) {
          loopThrough(children);
        }
      });
    };

    loopThrough(artifactTree[0].children);

    return artifactTreeFiles;
  }

  async getArtifactFileBlobId(packageId, label, parentNodeId = '0') {
    // Function Description: Gets a previously known fileBlobId of an artifact node based on label name.
    // Can search only in specific folder if parentNodeId given

    const artifactTree = await this.getArtifactTreeJSON(packageId);
    let fileBlobId = null;

    // if parentNodeId is known, get branch children
    let branch;
    if (parentNodeId !== '0') {
      branch = await this.getBranchChildren(artifactTree, parentNodeId);
    } else {
      branch = artifactTree;
    }

    // loop through to find the fileBlobId based on label name
    const loopThrough = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].label === label) {
          if (items[i].fileBlobId) {
            fileBlobId = items[i].fileBlobId;
          }
        }
        const children = items[i].children;
        if (children && children.length > 0) {
          loopThrough(children);
        }
      }
    };

    loopThrough(branch);

    // return fileBlobId, returns null if not exists
    return fileBlobId;
  }

  async getFilesAll(artifactTree) {
    // returns all artifact tree items that are files
    const files = [];

    const loopThrough = (items) => {
      items.forEach((item) => {
        if (item.fileType !== 'folder') {
          files.push(item);
        }
        const children = item.children;
        if (children && children.length > 0) {
          loopThrough(children);
        }
      });
    };

    loopThrough(artifactTree);
    return files;
  }

  async deleteItemFromTree(DeleteItemDto: DeleteItemDto) {
    try {
      const artifactTree = await this.getArtifactTreeJSON(
        DeleteItemDto.packageId,
      );

      // find the file in artifactTree, delete its fileblob, and delete from the artifactTree
      const loopThrough = async (items) => {
        for (const item of items) {
          if (item.nodeId === DeleteItemDto.nodeId) {
            const index = items.findIndex(function (child, i) {
              return child.nodeId === DeleteItemDto.nodeId;
            });

            items.splice(index, 1); // remove file from artifactTree
            if (
              isStringValid(item.fileBlobId) &&
              DeleteItemDto.deleteFileBlob
            ) {
              // if fileBlobId exists and deleteFileBlob is true, delete the fileBlob

              const FileRepo = {
                fileId: item.fileBlobId,
                packageId: DeleteItemDto.packageId,
                auditUser: DeleteItemDto.auditUser,
              };
              await this.FilesService.deleteFileFromDB(FileRepo);
            }
          }
          const children = item.children;
          if (children && children.length > 0) {
            loopThrough(children);
          }
        }

        return items;
      };

      const latestTree = await loopThrough(artifactTree);

      await this.saveArtifactTreeToDB(
        DeleteItemDto.packageId,
        latestTree,
        DeleteItemDto.auditUser,
      );
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async deleteItemsByFolder(DeleteByFolderDto: DeleteByFolderDto) {
    // deletes files and folders from the parent nodeId
    try {
      let artifactTree = await this.getArtifactTreeJSON(
        DeleteByFolderDto.packageId,
      );

      const folderItems = await this.getBranchChildren(
        artifactTree,
        DeleteByFolderDto.parentNodeId,
      ); // returns folder contents

      // grab files only from selected branch
      const branchFiles = await this.getFilesAll(folderItems);

      // delete file's fileBlob
      for (const file of branchFiles) {
        if (isStringValid(file.fileBlobId)) {
          let FileRepo = {
            fileId: file.fileBlobId,
            packageId: DeleteByFolderDto.packageId,
            auditUser: DeleteByFolderDto.auditUser,
          };
          await this.FilesService.deleteFileFromDB(FileRepo);
        }
      }

      // Remove all children from parent folder
      const loopThrough = async (items) => {
        let artifactTree = items;
        artifactTree.forEach((item) => {
          if (item.nodeId === DeleteByFolderDto.parentNodeId) {
            item.children = [];
          }
          const children = item.children;
          if (children && children.length > 0) {
            loopThrough(children);
          }
        });

        return artifactTree;
      };

      const parentFolderEmptied = await loopThrough(artifactTree);

      // reset the branch back to its default state
      const latestArtifactTree = await this.resetBranch(
        parentFolderEmptied,
        DeleteByFolderDto.parentNodeId,
        DeleteByFolderDto.initialTree,
      );

      await this.saveArtifactTreeToDB(
        DeleteByFolderDto.packageId,
        latestArtifactTree,
        DeleteByFolderDto.auditUser,
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async resetBranch(artifactTree, parentNodeId, initialTree) {
    // reset a branch back to its default state
    let updatedArtifactTree = artifactTree;

    // grab the default state of the branch
    const initialTreeBranchChildren = await this.getBranchChildren(
      initialTree,
      parentNodeId,
    ); // returns folder contents

    if (initialTreeBranchChildren.length > 0) {
      const loopThrough = (updatedArtifactTree) => {
        updatedArtifactTree.every((item, index) => {
          if (item.nodeId === parentNodeId) {
            // reset the parent folder's state
            updatedArtifactTree[index].children = initialTreeBranchChildren;
            return false; // break out of .every loop
          }
          const children = item.children;
          if (children && children.length > 0) {
            loopThrough(children);
          }
          return true; // continue through .every loop
        });
      };
      loopThrough(updatedArtifactTree);
    }
    return updatedArtifactTree;
  }
}
