// import { configureStore } from '@reduxjs/toolkit';
// import eventsReducer from './eventssuperadminSlice.jsx';
// import eventgroupsSuperadminReducer from './EventgroupssuperadminSlice';

// export const store = configureStore({
//   reducer: {
//     events: eventsReducer,
//     eventgroupsSuperadmin: eventgroupsSuperadminReducer,
//   },
// });

// store.js
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
    adminEmployeeAllocation: employeeAllocationReducer, // Add this line
  },
});

export default store;

