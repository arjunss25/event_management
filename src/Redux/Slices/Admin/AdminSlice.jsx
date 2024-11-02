import { createSlice } from '@reduxjs/toolkit';
import adminEventsReducer from './AdminEventSlice';
import employeeAllocationReducer from './employeeAllocationSlice';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {},
  reducers: {},
});

export const adminReducers = {
  events: adminEventsReducer,
  employeeAllocation: employeeAllocationReducer
};

export default adminSlice.reducer;