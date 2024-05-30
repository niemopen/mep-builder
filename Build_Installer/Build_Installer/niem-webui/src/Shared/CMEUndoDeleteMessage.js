import { Message } from 'semantic-ui-react';
import { handleUndoDelete } from '../Util/CMEBuilderUtil';

export const CMEUndoDeleteMessage = (props) => {
	return (
		<>
			<Message
				hidden={!props.visible}
				positive={props.success}
				negative={!props.success}
				content={
					props.success
						? [
								<b>{props.objName}</b>,
								' has been deleted.',
								<span
									style={{ float: 'right' }}
									className='basicLinkWithColor'
									onClick={() => {
										handleUndoDelete(props.dataType, props.data);
									}}
								>
									<b>Undo</b>
								</span>,
						  ]
						: [<b>{props.objType} failed to delete</b>, '.', ' Please try again.']
				}
			></Message>
		</>
	);
};

export default CMEUndoDeleteMessage;
