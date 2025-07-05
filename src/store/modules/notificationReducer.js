import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    count: 0,
    messages: [],
  },
  reducers: {
    addNotification: (state, action) => {
      state.count += 1;
      state.messages.push(action.payload);
    },
    clearNotifications: (state) => {
      state.count = 0;
      state.messages = [];
    },
  },
});

export const { addNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
