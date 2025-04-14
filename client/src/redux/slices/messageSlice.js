import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import client from "../../utils/axios/create.js";

export const fetchMessages = createAsyncThunk("messages/fetchMessages", async (_, { rejectWithValue }) => {
    try {
        const { data } = await client.get(`/chats/all-messages`);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response.data.message || "Failed to fetch messages");
    }
});

export const sendMessage = createAsyncThunk("messages/sendMessage", async (chatDetails, { rejectWithValue }) => {
    try {
      console.log('chatetails :', chatDetails);
        const { data } = await client.post(`/chats/send-message`, chatDetails);
        return data.data;
    } catch (err) {
        return rejectWithValue(err.response.data.message || "Failed to send messages");
    }
});

// 🔹 Single message adapter (to reuse per chat)
const messagesAdapter = createEntityAdapter({
    selectId: (msg) => msg._id,
    sortComparer: (a, b) => a.createdAt.localeCompare(b.createdAt),
  });
  
  // 🔹 Initial state
  const initialState = {
    byChatId: {}, // each chatId will hold its own adapter state
    loading: false,
    error: null,
  };
  

// 🔹 User Slice
const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
      addMessage: (state, action) => {
        console.log("addMessage in reducer");
        const message = action.payload;
        const chatId = message.chatId;
  
        if (!state.byChatId[chatId]) {
          state.byChatId[chatId] = messagesAdapter.getInitialState();
        }
  
        messagesAdapter.upsertOne(state.byChatId[chatId], message);
      },
  
      addMessagesBulk: (state, action) => {
        console.log("addMessagesBulk in reducer");
        const payload = action.payload;
  
        payload.forEach(chatGroup => {
            // console.log('chatGroup :', chatGroup);
            const { chatID, messages } = chatGroup;
        
            if (!state.byChatId[chatID]) {
              state.byChatId[chatID] = messagesAdapter.setAll(messagesAdapter.getInitialState(), messages);
            } else {
              state.byChatId[chatID] = messagesAdapter.upsertMany(
                state.byChatId[chatID],
                messages
            );
            }
            
        });
      },
    },
  
    extraReducers: (builder) => {
      builder
        .addCase(fetchMessages.fulfilled, (state, action) => {
            const payload = action.payload; // your array: [{ chatID, messages: [] }]

            console.log("fetchMessages :", payload);
            payload.forEach(chatGroup => {
                // console.log('chatGroup :', chatGroup);
              const { chatID, messages } = chatGroup;
          
              state.byChatId[chatID] = messagesAdapter.setAll(
                messagesAdapter.getInitialState(),
                messages
              );
            });
        })
        .addCase(sendMessage.fulfilled, (state, action) => {

          const message = action.payload;
          console.log("sendMessage payload :", message);
          const chatId = message.chatID;
  
        if (!state.byChatId[chatId]) {
          state.byChatId[chatId] = messagesAdapter.getInitialState();
        }
  
        messagesAdapter.upsertOne(state.byChatId[chatId], message);

        })

        // ✅ Loading & Error Handling
        .addMatcher((action) => action.type.startsWith("messages/") &&  action.type.endsWith("/pending"), (state) => {
            state.loading = true;
            state.error = null;
        })
        .addMatcher((action) => action.type.startsWith("messages/") &&  action.type.endsWith("/fulfilled"), (state) => {
            state.loading = false;
        })
        .addMatcher((action) => action.type.startsWith("messages/") && action.type.endsWith("/rejected"), (state, action) => {
            state.loading = false;
            // console.log(action.payload);
            state.error = action.payload;
        });
}
});

export const { addMessage, addMessagesBulk } = messagesSlice.actions;


// 🧪 Optional helper: select messages by chatId
export const selectMessagesByChatId = (state, chatId) => {
   console.log("chatId :", state.messages.byChatId[chatId]);
    // Make sure state.messages is defined and check for the chat's messages.
    // If not present, default to the adapter's initial state.
    const chatMessages =
    (state.messages && state.messages.byChatId && state.messages.byChatId[chatId]) ||
    messagesAdapter.getInitialState();

    console.log("chatMessages :", chatMessages);
    // Create selectors for that specific chat's message adapter state.
    const selectors = messagesAdapter.getSelectors(() => chatMessages);
    return selectors.selectAll(chatMessages); // returns an array of messages
};

  export const messageSelectors = messagesAdapter.getSelectors((state) => state.messages);
// Export Reducer
export default messagesSlice.reducer;
