import { forwardRef } from 'react';
import { ArrowDownward } from '@material-ui/icons';
import { Icon } from 'semantic-ui-react';

export const TableIcons = {
	Add: forwardRef((props, ref) => <Icon name='add square' {...props} ref={ref} />),
	Check: forwardRef((props, ref) => <Icon name='check' {...props} ref={ref} />),
	Clear: forwardRef((props, ref) => <Icon name='cancel' {...props} ref={ref} />),
	Delete: forwardRef((props, ref) => <Icon name='trash alternate' {...props} ref={ref} />),
	DetailPanel: forwardRef((props, ref) => <Icon name='chevron right' {...props} ref={ref} />),
	Edit: forwardRef((props, ref) => <Icon name='pencil' {...props} ref={ref} />),
	Export: forwardRef((props, ref) => <Icon name='download' {...props} ref={ref} />),
	Filter: forwardRef((props, ref) => <Icon name='filter' {...props} ref={ref} />),
	FirstPage: forwardRef((props, ref) => <Icon name='step backward' {...props} ref={ref} />),
	LastPage: forwardRef((props, ref) => <Icon name='step forward' {...props} ref={ref} />),
	NextPage: forwardRef((props, ref) => <Icon name='chevron right' {...props} ref={ref} />),
	PreviousPage: forwardRef((props, ref) => <Icon name='chevron left' {...props} ref={ref} />),
	ResetSearch: forwardRef((props, ref) => <Icon name='cancel' {...props} ref={ref} />),
	Search: forwardRef((props, ref) => <Icon name='search' {...props} ref={ref} />),
	SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
	// SortArrow: forwardRef((props, ref) => <Icon name='sort up' {...props} ref={ref} />),
	ThirdStateCheck: forwardRef((props, ref) => <Icon name='minus' {...props} ref={ref} />),
	ViewColumn: forwardRef((props, ref) => <Icon name='columns' {...props} ref={ref} />),
};
