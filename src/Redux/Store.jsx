import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './eventsadminSlice.jsx';

export const store = configureStore({
  reducer: {
    events: eventsReducer,
  },
});
