import { configureStore } from '@reduxjs/toolkit';
import saleReducer from './modules/saleReducer';
// import authReducer from './modules/authReducer';
import { loginReducer } from './modules/loginReducer';
import mapReducer from './modules/mapReducer';
import chatReducer from './modules/chatReducer';
import notificationReducer from './modules/notificationReducer';

const store = configureStore({
  reducer: {
    sale: saleReducer,
    isLogin: loginReducer,
    map: mapReducer,
    chat: chatReducer,
    notifications: notificationReducer,
  },
});

export default store;
