
import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './Slices/SuperAdmin/eventssuperadminSlice';
import eventgroupsReducer from './Slices/SuperAdmin/EventgroupssuperadminSlice';
import adminEventsReducer from './Slices/Admin/AdminEventSlice';
import employeeAllocationReducer from './Slices/Admin/employeeAllocationSlice'; // Add this import

export const store = configureStore({
  reducer: {
    // SuperAdmin reducers
    events: eventsReducer,
    eventGroups: eventgroupsReducer,
    // Admin reducers
    adminEvents: adminEventsReducer,
    adminEmployeeAllocation: employeeAllocationReducer, 
  },
});

export default store;

