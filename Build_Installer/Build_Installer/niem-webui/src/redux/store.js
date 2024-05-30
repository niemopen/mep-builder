import { createStore } from 'redux';
import RootReducer from './reducers/RootReducer';

const store = createStore(RootReducer);

export default store;
