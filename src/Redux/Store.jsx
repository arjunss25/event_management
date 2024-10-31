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

export const store = configureStore({
  reducer: {
    // SuperAdmin reducers
    events: eventsReducer,
    eventGroups: eventgroupsReducer,
    // Admin reducer
    adminEvents: adminEventsReducer,
  },
});

export default store;
