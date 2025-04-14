import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import authReducer from "./slices/authSlice.js";
import contactSlice from "./slices/contactSlice.js";
import chatSlice from "./slices/chatSlice.js";
import messagesSlice from "./slices/messageSlice.js";

const rootReducer = combineReducers({
    auth: authReducer,
    contacts: contactSlice,
    chats: chatSlice,
    messages: messagesSlice
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

export { store };
