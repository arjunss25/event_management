import { createSlice } from '@reduxjs/toolkit';
import adminEventsReducer from './AdminEventSlice';
import employeeAllocationReducer from './employeeAllocationSlice';
import eventFoodReducer from './eventFoodSlice';
import adminUserRegistrationReducer from './adminUserRegistrationSlice';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {},
  reducers: {},
});

export const adminReducers = {
  events: adminEventsReducer,
  employeeAllocation: employeeAllocationReducer,
  eventFood: eventFoodReducer,
  adminUserRegistration: adminUserRegistrationReducer,
};

export default adminSlice.reducer;