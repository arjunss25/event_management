import { createSlice } from '@reduxjs/toolkit';
import eventsReducer from './eventssuperadminSlice';
import eventgroupsSuperadminReducer from './EventgroupssuperadminSlice';

const superadminSlice = createSlice({
  name: 'superadmin',
  initialState: {},
  reducers: {},
});

export const superadminReducer = {
  events: eventsReducer,
  eventGroups: eventgroupsSuperadminReducer,
};

export default superadminSlice.reducer;