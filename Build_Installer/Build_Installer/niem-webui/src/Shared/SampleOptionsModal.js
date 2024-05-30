import { Button, Form, Modal } from 'semantic-ui-react'
import { useState } from 'react';
import { deleteItemFromTree, getFilesByTag } from '../Util/ArtifactTreeUtil';
import { artifactTags } from '../Util/ArtifactTreeUtil';
import { useDispatch, useSelector } from 'react-redux';
import store from '../redux/store';
import { SET_SHOW_SAMPLE_OPTIONS_MODAL } from '../redux/actions';
import { exportArtifactItem } from '../Util/ArtifactTreeUtil';
import { updateArtifactTreeFileBlobId } from '../Util/ArtifactTreeUtil';
import { setActiveSidebarTab } from '../Navigation/LeftNavContent';
import { updateArtifactChecklist } from './ArtifactChecklist';

const initialSelections = () => {
    const state = store.getState();
    const artifactTree = state.artifact.treeItems;
    const samples = getFilesByTag(artifactTree, artifactTags.sample);
    const optionSelections = []
    samples.forEach((sample) => {
        optionSelections.push(
            {name: sample.label, action: 'accept'}
        )
    })
    return optionSelections;

}

const SampleOptionsModal = () => {
    const artifactTree = useSelector((state) => state.artifact.treeItems);
    const sampleNeedsReview = useSelector((state) => state.artifact.sampleNeedsReview);
    const showSampleOptionsModal = useSelector((state) => state.sample.showSampleOptionsModal)
    const packageName = useSelector((state) => state.mpd.packageName);
    const packageId = useSelector((state) => state.mpd.packageId);
    const [optionSelection, setOptionSelection] = useState(() => initialSelections());
    const samples = getFilesByTag(artifactTree, artifactTags.sample);
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        const samples = getFilesByTag(artifactTree, artifactTags.sample);
        let newTree = artifactTree;
        for (let i = 0; i < samples.length; i++) {
            const sample = samples[i];
            const selection = optionSelection[i];
            let accepted = 0;
            
            switch(selection.action) {
                case('accept'): {
                    // set needsReview for sample file to false
                    if (accepted === 0) {
                        for (const sample of samples) {
                            accepted++;
                            sample.needsReview = false;
                            await updateArtifactTreeFileBlobId(newTree, sample.nodeId, sample.fileBlobId);
                        }
                    }
                    break;
                }
                case('download'): {
                    await exportArtifactItem(newTree, sample.nodeId, packageName, packageId);
                    setActiveSidebarTab('AnalyzeRequirements', dispatch);
                    break;
                }
                case ('delete'): {
                    newTree = await deleteItemFromTree(sample.nodeId);
                    break;
                }
                default: {
                    // do nothing
                }
            }

            const samplesAfterAction = getFilesByTag(newTree, artifactTags.sample);
            if (samplesAfterAction.length === 0) {
                // all samples deleted
                await updateArtifactChecklist(packageId, 'sample', false);
            } else if (accepted > 0) {
                // one or more samples were accepted
                await updateArtifactChecklist(packageId, 'sample', true);

            }
        }
    }

    const handleChange = (e) => {
        const currentSelections = optionSelection;
        const label = e.target.name;
        const newAction = e.target.value;
        const newSelections = currentSelections.map((option) => option.name === label ? {...option, action : newAction} : option);
        setOptionSelection(newSelections);
    }

  return (
    <Modal open={showSampleOptionsModal} size='mini'>
        <Modal.Header>Review Sample Message(s)</Modal.Header>
        <Modal.Content>
            <>
                <p><strong>This package was copied from an existing package.</strong></p>
                <p>To ensure your package is built with the most accurate artifacts, how would you like to proceed with the following Sample Message artifact(s)?</p>
                <Form>
                    <Form.Group grouped>
                        {samples.map((sample, i) => {
                            if (sample.needsReview) {
                                return (
                                    <>
                                        <label>{sample.label}</label><label style={{color:"red"}}>*</label>
                                        <Form.Field
                                            label='Accept'
                                            type='radio'
                                            control='input'
                                            id={i}
                                            name={sample.label}
                                            value= {'accept'}
                                            onClick={handleChange}
                                        />
                                        <Form.Field
                                            label='Download and upload updated file'
                                            type='radio'
                                            control='input'
                                            index={i}
                                            name={sample.label}
                                            value='download'
                                            onClick={handleChange}
                                        />
                                        <Form.Field
                                            label='Delete'
                                            type='radio'
                                            control='input'
                                            index={i}
                                            name={sample.label}
                                            value='delete'
                                            onClick={handleChange}
                                        />
                                    </>                
                                )
                            } else {
                                return null
                            }
                        })}
                    </Form.Group>
                </Form>
            </>
        </Modal.Content>
        <Modal.Actions>
            {sampleNeedsReview ? (
                <>
                    <Button className='secondaryButton' onClick={() => dispatch({ type: SET_SHOW_SAMPLE_OPTIONS_MODAL, payload: false })}>Cancel</Button>
                    <Button className='primaryButton' onClick={() => {handleSubmit(); dispatch({ type: SET_SHOW_SAMPLE_OPTIONS_MODAL, payload: false });}}>Submit</Button>
                </>
            ) : (
                <Button className='primaryButton' onClick={() => {dispatch({ type: SET_SHOW_SAMPLE_OPTIONS_MODAL, payload: false });}}>OK</Button>
            )}
        </Modal.Actions>
    </Modal>
  )
}

export default SampleOptionsModal