// get folder path of item's parent folder based on nodeId
export const getFolderPath = (artifactTree, nodeId) => {
  let folderPath = '';
  let nodeNameLib = {}; // library to store labels for each node so we can build parent folder path
  let parentNodeId = '';

  // retrieve the parent Id of item
  if (nodeId.length === 1) {
    parentNodeId = nodeId;
  } else {
    const splitNodeId = nodeId.split('.');
    const removeLastItem = splitNodeId.slice(0, splitNodeId.length - 1);
    parentNodeId = removeLastItem.join('.');
  }
  // Loop through artifactTree and create local folder structure
  const loopThrough = (items) => {
    items.forEach((item) => {
      if (
        // only make folders for items that are not the root, and are marked as visible folders
        item.nodeId != 0 &&
        item.fileType === 'folder' &&
        item.isVisible === true
      ) {
        // add entry into library as {nodeId: label}
        nodeNameLib[item.nodeId] = item.label;
        // start building parent folder path for this branch based on nodeID.
        let parentFolderPath = '/';
        let nodeParts = item.nodeId.split('.');
        let currentNode = '';
        for (let i = 0; i < nodeParts.length; i++) {
          if (i === 0) {
            currentNode = currentNode + nodeParts[i];
          } else {
            currentNode = currentNode + '.' + nodeParts[i];
          }
          parentFolderPath = parentFolderPath + nodeNameLib[currentNode] + '/';

          // retrieve path name of parent folder and end loop
          if (currentNode === parentNodeId) {
            folderPath = parentFolderPath;
            break;
          }
        }
      }

      // check for children branches
      const children = item.children;
      if (children && children.length > 0) {
        loopThrough(children);
      }
    });
  };

  loopThrough(artifactTree);

  return folderPath;
};
