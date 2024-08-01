import { createStore, combineReducers } from 'redux';
import employeeReducer from './reducers/employeeReducer';

const rootReducer = combineReducers({
  employee: employeeReducer,
});

const store = createStore(rootReducer);

export default store;
