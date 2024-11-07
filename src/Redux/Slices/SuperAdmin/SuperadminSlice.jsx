// superadminSlice.js
import { combineReducers } from '@reduxjs/toolkit';
import eventsReducer from './eventssuperadminSlice';
import eventgroupsSuperadminReducer from './EventgroupssuperadminSlice';
// import chartReducer from './chartSlice';

const superadminReducer = combineReducers({
  events: eventsReducer,
  eventGroups: eventgroupsSuperadminReducer,
  // chart: chartReducer
});

export { superadminReducer };