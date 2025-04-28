import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import client from "../../utils/axios/create.js";

export const fetchAllChats = createAsyncThunk(
    "chat/fetchAllChats",
    async (_, { rejectWithValue }) => {
        try {
            // // console.log('fetchAllChats');
            const { data } = await client.get("/chats");
            // console.log('fetchAllChats data :', data);
            return data.data; // Returns the authenticated user object
        } catch (error) {
            return rejectWithValue(error.response.data.message || "Authentication failed");
        }
    }
);

// 🔹 chat entity Adapter
const chatsAdapter = createEntityAdapter({
    selectId: (chat) => chat._id,
    // sortComparer: (a, b) => new Date(b.updatedAt).localeCompare(a.updatedAt), // optional sorting
    sortComparer: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(), // optional sorting
});

// 🔹 Initial State
const initialState = chatsAdapter.getInitialState({
    selectedChatID: null,
    loading: false,
    error: null,
});

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        selectChat: (state, action) => {
            state.selectedChatID = action.payload;
            const chat = state.entities[action.payload];
            if (chat) {
                chat.unreadCount = 0; // Reset unread count
            }
        },
        incrementUnread: (state, action) => {
            const payload = Array.isArray(action.payload) ? action.payload : [action.payload];
        
            payload.forEach(({ chatId, message }) => {
                const chat = state.entities[chatId];
                // console.log(chat);
                if (chat && state.selectedChatID !== chatId) {
                    const count = Array.isArray(message) ? message.length : 1;
                    chat.unreadCount = (chat.unreadCount || 0) + count;
                }
            });
        },
        updateLastMessage: (state, action) => {
            const payload = Array.isArray(action.payload) ? action.payload : [action.payload];
        
            payload.forEach(({ chatId, message }) => {
                const chat = state.entities[chatId];
                if (chat) {
                    const lastMsg = Array.isArray(message)
                        ? message[message.length - 1]
                        : message;
                    console.log("lastMsg :", lastMsg);    
                    // Use the chatAdapter's updateOne method to update the specific chat
                    chatsAdapter.updateOne(state, {
                        id: chatId,
                        changes: {
                            updatedAt: lastMsg.createdAt,
                            lastMessage: lastMsg,
                        }
                    });
                }
            });
        },
        deselectChat: (state, action) => {
            state.selectedChatID = null;
        }
        
    },
    extraReducers: (builder) => {
        builder

        // fetch All Contacts
        .addCase(fetchAllChats.fulfilled, (state, action) => {
            chatsAdapter.setAll(state, action.payload);
        })
        
        // ✅ Loading & Error Handling
        .addMatcher((action) => action.type.startsWith("chat/") &&  action.type.endsWith("/pending"), (state) => {
            state.loading = true;
            state.error = null;
        })
        .addMatcher((action) => action.type.startsWith("chat/") &&  action.type.endsWith("/fulfilled"), (state) => {
            state.loading = false;
        })
        .addMatcher((action) => action.type.startsWith("chat/") && action.type.endsWith("/rejected"), (state, action) => {
            state.loading = false;
            // // // console.log(action.payload);
            state.error = action.payload;
        });
    }
});

export const { selectChat, incrementUnread, updateLastMessage, deselectChat } = chatSlice.actions;
export const chatSelectors = chatsAdapter.getSelectors((state) => state.chats);
export default chatSlice.reducer;
