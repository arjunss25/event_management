// import { configureStore } from '@reduxjs/toolkit';
// import eventsReducer from './eventssuperadminSlice.jsx';
// import eventgroupsSuperadminReducer from './EventgroupssuperadminSlice';

// export const store = configureStore({
//   reducer: {
//     events: eventsReducer,
//     eventgroupsSuperadmin: eventgroupsSuperadminReducer,
//   },
// });

import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './Slices/SuperAdmin/eventssuperadminSlice';
import eventgroupsReducer from './Slices/SuperAdmin/EventgroupssuperadminSlice';

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    eventGroups: eventgroupsReducer
  },
});