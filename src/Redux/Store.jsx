import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './Slices/SuperAdmin/eventssuperadminSlice';
import eventgroupsReducer from './Slices/SuperAdmin/EventgroupssuperadminSlice';
import adminEventsReducer from './Slices/Admin/AdminEventSlice';
import employeeAllocationReducer from './Slices/Admin/employeeAllocationSlice'; 
import eventFoodReducer from './Slices/Admin/eventFoodSlice';
import adminUserRegistrationReducer from './Slices/Admin/adminUserRegistrationSlice';
import mealScannerReducer from './Slices/Employee/mealScannerSlice';
import authReducer from '../Redux/authSlice';
// import chartReducer from './Slices/SuperAdmin/chartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // SuperAdmin reducers
    events: eventsReducer,
    eventGroups: eventgroupsReducer,
    // Admin reducers
    adminEvents: adminEventsReducer,
    adminEmployeeAllocation: employeeAllocationReducer, 
    eventFood: eventFoodReducer,
    adminUserRegistration: adminUserRegistrationReducer,
    // employee

    mealScanner: mealScannerReducer,
  },
});

export default store;