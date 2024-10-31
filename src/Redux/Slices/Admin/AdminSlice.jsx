import { createSlice } from '@reduxjs/toolkit';
import { adminEventsReducer } from './AdminEventSlice';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {},
  reducers: {},
});

export const adminReducers = {
  events: adminEventsReducer
};

export default adminSlice.reducer;