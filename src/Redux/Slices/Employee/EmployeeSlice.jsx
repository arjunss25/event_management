import { combineReducers } from '@reduxjs/toolkit';
import mealScannerReducer from './mealScannerSlice';


const employeeReducer = combineReducers({
    mealScanner: mealScannerReducer,
  
});

export { employeeReducer };