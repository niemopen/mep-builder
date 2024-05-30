import React, { useState } from 'react';
import * as actionTypes from '../redux/actions';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { connect } from 'react-redux';
import { Dropdown, Icon } from 'semantic-ui-react';
import { exportArtifactItem, getTopmostParentNodeId } from '../Util/ArtifactTreeUtil';
import { getArtifactChecklist } from '../Shared/ArtifactChecklist';

const useStyles = makeStyles({
	root: {
		maxheight: 800,
		flexGrow: 1,
		maxWidth: 400,
	},
});

let allDefaultExpandedNodes = [];

const getIconType = (fileType) => {
	if (fileType === 'folder') {
		return <Icon name='folder outline' />;
	} else if (fileType === 'pptx' || fileType === 'ppt' || fileType === 'pptx' || fileType === 'pptm') {
		return <Icon name='file powerpoint outline' />;
	} else if (fileType === 'xlsx' || fileType === 'xlsm' || fileType === 'xls' || fileType === 'xlb' || fileType === 'xltx') {
		return <Icon name='file excel outline' />;
	} else if (fileType === 'doc' || fileType === 'docx' || fileType === 'docm' || fileType === 'dot' || fileType === 'dotm' || fileType === 'dotx') {
		return <Icon name='file word outline' />;
	} else if (fileType === 'pdf') {
		return <Icon name='file pdf outline' />;
	} else {
		return <Icon name='file alternate outline' />;
	}
};

const getAllDefaultExpandedNodes = (treeItems) => {
	return treeItems.map((treeItemData) => {
		if (treeItemData.children && treeItemData.children.length > 0) {
			getAllDefaultExpandedNodes(treeItemData.children);
		}

		if (treeItemData.nodeId.length < 5) {
			allDefaultExpandedNodes.push(treeItemData.nodeId);
		}

		return allDefaultExpandedNodes;
	});
};

const ArtifactTree = (props) => {
	const dispatch = useDispatch();
	const classes = useStyles();
	allDefaultExpandedNodes = getAllDefaultExpandedNodes(props.treeItems);
	const packageName = useSelector((state) => state.mpd.packageName);
	const packageId = useSelector((state) => state.mpd.packageId);
	const [isExpanded, setIsExpanded] = useState(allDefaultExpandedNodes['0']);
	const [ellipses, setEllipses] = useState('ellipsis horizontal');
	let isRootNode = false;

	const handleToggle = (event, nodeIds) => {
		setIsExpanded(nodeIds);
	};

	const showEllipsis = (dispatch, treeItemData) => {
		const hideAllEllipses = () => {
			setEllipses('');
		};

		const displayAllEllipses = () => {
			setEllipses('ellipsis horizontal');
		};

		if (treeItemData.fileType === 'folder' && !isRootNode) {
			return (
				<Dropdown icon={ellipses} id='artifactTreeEllipsisDropdown' pointing='left' onOpen={hideAllEllipses} onClose={displayAllEllipses}>
					<Dropdown.Menu className='artifacttree-ellipsis-dropdown'>
						{getTopmostParentNodeId(treeItemData.nodeId) === '1' ? null : (
							// Disallow modifications to the base-xsd folder and its contents
							<>
								<Dropdown.Item
									text='Create New Folder'
									onClick={(e, d) => {
										dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: true });
										dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: 'newFolder' });
										// push artifact tree data into a variable to be read in other files
										dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: treeItemData });
									}}
								/>
								<Dropdown.Item
									text='Import'
									onClick={() => {
										dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_OPEN });
										dispatch({
											type: actionTypes.UPDATE_UPLOAD_WORKFLOW,
											payload: { allowUserChoice: true, artifactTag: null, uploadItem: null },
										});
										dispatch({ type: actionTypes.UPDATE_UPLOAD_MODAL_NODE_ID, payload: treeItemData.nodeId });
									}}
								/>
							</>
						)}
						<Dropdown.Item
							text='Export'
							onClick={() => {
								exportArtifactItem(props.treeItems, treeItemData.nodeId, packageName, packageId);
							}}
						/>
						{getTopmostParentNodeId(treeItemData.nodeId) === '1' ? null : (
							// Disallow modifications to the base-xsd folder and its contents
							<>
								<Dropdown.Item
									text='Move'
									onClick={(e, d) => {
										dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: true });
										dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: 'moveItem' });
										// push artifact tree data into a variable to be read in other files
										dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: treeItemData });
									}}
								/>
								<Dropdown.Item
									text='Rename'
									onClick={(e, d) => {
										dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: true });
										dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: 'renameItem' });
										// push artifact tree data into a variable to be read in other files
										dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: treeItemData });
									}}
								/>
								<Dropdown.Item
									text='Delete'
									onClick={async (e, d) => {
										dispatch({ type: actionTypes.UPDATE_CONFIRM_DELETE_MODE, payload: 'folder' });
										dispatch({ type: actionTypes.UPDATE_CONFIRM_ARTIFACT_TO_DELETE, payload: treeItemData });
										dispatch({ type: actionTypes.SET_SHOW_CONFIRM_ARTIFACT_DELETE_MODAL, payload: true });
									}}
								/>
							</>
						)}
					</Dropdown.Menu>
				</Dropdown>
			);
		}
		// MPD-Catalog should not be moved or renamed, only allow export
		else if (!isRootNode && treeItemData.fileType !== 'folder') {
			if (treeItemData.label === 'mpd-catalog.xml') {
				return (
					<Dropdown icon={ellipses} id='artifactTreeEllipsisDropdown' pointing='left' onOpen={hideAllEllipses} onClose={displayAllEllipses}>
						<Dropdown.Menu className='artifacttree-ellipsis-dropdown'>
							<Dropdown.Item
								text='Export'
								onClick={() => {
									exportArtifactItem(props.treeItems, treeItemData.nodeId, packageName, packageId);
								}}
							/>
						</Dropdown.Menu>
					</Dropdown>
				);
			} else
				return (
					<Dropdown icon={ellipses} id='artifactTreeEllipsisDropdown' pointing='left' onOpen={hideAllEllipses} onClose={displayAllEllipses}>
						<Dropdown.Menu className='artifacttree-ellipsis-dropdown'>
							<Dropdown.Item
								text='Export'
								onClick={() => {
									exportArtifactItem(props.treeItems, treeItemData.nodeId, packageName, packageId);
								}}
							/>

							{getTopmostParentNodeId(treeItemData.nodeId) === '1' ? null : (
								// Disallow modifications to the base-xsd folder and its contents
								<>
									<Dropdown.Item
										text='Move'
										onClick={(e, d) => {
											dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: true });
											dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: 'moveItem' });
											// push artifact tree data into a variable to be read in other files
											dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: treeItemData });
										}}
									/>
									<Dropdown.Item
										text='Rename'
										onClick={(e, d) => {
											dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: true });
											dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: 'renameItem' });
											// push artifact tree data into a variable to be read in other files
											dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: treeItemData });
										}}
									/>
									<Dropdown.Item
										text='Delete'
										onClick={async (e, d) => {
											dispatch({ type: actionTypes.UPDATE_CONFIRM_DELETE_MODE, payload: 'file' });
											dispatch({ type: actionTypes.UPDATE_CONFIRM_ARTIFACT_TO_DELETE, payload: treeItemData });
											dispatch({ type: actionTypes.SET_SHOW_CONFIRM_ARTIFACT_DELETE_MODAL, payload: true });
										}}
									/>
								</>
							)}
						</Dropdown.Menu>
					</Dropdown>
				);
		}
		// at the MEP root folder level, allow only the ability to create new subfolders or export
		else {
			return (
				<Dropdown icon={ellipses} id='artifactTreeEllipsisDropdown' pointing='left' onOpen={hideAllEllipses} onClose={displayAllEllipses}>
					<Dropdown.Menu className='artifacttree-ellipsis-dropdown'>
						<Dropdown.Item
							text='Create New Folder'
							onClick={(e, d) => {
								dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: true });
								dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: 'newFolder' });
								// push artifact tree data into a variable to be read in other files
								dispatch({ type: actionTypes.UPDATE_ITEM_DATA, payload: treeItemData });
							}}
						/>
						<Dropdown.Item
							text='Export'
							onClick={async () => {
								const artifactChecklist = await getArtifactChecklist(packageId);

								if (artifactChecklist.isChecklistComplete) {
									// if all items are uploaded, allow export
									exportArtifactItem(props.treeItems, treeItemData.nodeId, packageName, packageId);
								} else {
									// if all items are not fully uploaded, display modal
									// push artifact tree data and artifactChecklist into a variable to be read in ModifyArtifactTree.js
									dispatch({
										type: actionTypes.UPDATE_ITEM_DATA,
										payload: { ...treeItemData, artifactChecklist: artifactChecklist.checklist },
									});
									// display modal to confirm export - this flag gets updated in ArtfifactChecklist.js
									dispatch({ type: actionTypes.MODIFY_ARTIFACT_TREE_MODAL_OPEN, payload: true });
									dispatch({ type: actionTypes.UPDATE_MODIFY_ARTIFACT_TREE_WORKFLOW, payload: 'exportMEP' });
								}
							}}
						/>
					</Dropdown.Menu>
				</Dropdown>
			);
		}
	};

	const renderTree = (treeItems) => {
		return treeItems
			.filter(function (treeItemData) {
				if (treeItemData.isVisible) {
					return true;
				}
				return false; // skip this item
			})
			.map((treeItemData) => {
				let children = undefined;

				if (treeItemData.children && treeItemData.children.length > 0) {
					children = renderTree(treeItemData.children);
				}

				if (treeItemData.nodeId === '0') {
					isRootNode = true;
				} else {
					isRootNode = false;
				}

				return (
					<TreeItem
						key={treeItemData.nodeId}
						nodeId={String(treeItemData.nodeId)}
						label={
							isRootNode ? (
								<>
									{getIconType(treeItemData.fileType)} {packageName} {showEllipsis(dispatch, treeItemData)}
								</>
							) : (
								<>
									{getIconType(treeItemData.fileType)} {treeItemData.label} {showEllipsis(dispatch, treeItemData)}
								</>
							)
						}
						filetype={treeItemData.fileType}
						isvisible={treeItemData.isVisible.toString()}
						children={children}
					/>
				);
			});
	};

	return (
		<div>
			<TreeView
				className={classes.root}
				defaultCollapseIcon={<ExpandMoreIcon />}
				defaultExpandIcon={<ChevronRightIcon />}
				style={{ overflow: 'auto', maxHeight: 800 }}
				expanded={isExpanded}
				onNodeToggle={handleToggle}
			>
				{packageName !== '' && packageName != null ? renderTree(props.treeItems) : null}
			</TreeView>
		</div>
	);
};

const mapStateToProps = function (state) {
	return {
		treeItems: state.artifact.treeItems,
		rerender: state.artifact.rerender,
	};
};

export default connect(mapStateToProps)(ArtifactTree);
