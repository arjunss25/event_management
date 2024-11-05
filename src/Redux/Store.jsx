
import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './Slices/SuperAdmin/eventssuperadminSlice';
import eventgroupsReducer from './Slices/SuperAdmin/EventgroupssuperadminSlice';
import adminEventsReducer from './Slices/Admin/AdminEventSlice';
import employeeAllocationReducer from './Slices/Admin/employeeAllocationSlice'; 
import eventFoodReducer from './Slices/Admin/eventFoodSlice';


export const store = configureStore({
  reducer: {
    // SuperAdmin reducers
    events: eventsReducer,
    eventGroups: eventgroupsReducer,
    // Admin reducers
    adminEvents: adminEventsReducer,
    adminEmployeeAllocation: employeeAllocationReducer, 
    eventFood: eventFoodReducer,
  },
});

export default store;

