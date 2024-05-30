import * as actionTypes from '../redux/actions';
import { useTimer } from 'react-timer-hook';
import store from '../redux/store';

export default function Timer() {
	let time = new Date();
	time.setSeconds(time.getSeconds() + 600); // 10 minutes for autosave

	const { isRunning, restart } = useTimer({
		expiryTimestamp: time,
		onExpire: () => {
			store.dispatch({ type: actionTypes.UPDATE_IS_AUTO_SAVING, payload: true });
		},
	});

	if (isRunning === false || isRunning == null) {
		time = new Date();
		time.setSeconds(time.getSeconds() + 600);
		restart(time);
	}

	return null;
}
