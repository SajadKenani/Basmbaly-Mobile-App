import { createStore, combineReducers } from 'redux';
import employeeReducer from './site/reducers/employeeReducer.js';

const rootReducer = combineReducers({
  employee: employeeReducer,
});

const store = createStore(rootReducer);

export default store;
