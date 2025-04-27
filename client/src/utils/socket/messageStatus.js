import { 
  incrementUnread, 
  updateLastMessage 
} from "../../redux/slices/chatSlice.js";

import { 
  addMessage, 
  addMessagesBulk, 
  markMessagesAsRead 
} from "../../redux/slices/messageSlice.js";

const setupMessageListeners = (socket, dispatch) => {
  if (socket.hasListenersSet) return;
  console.log(socket);
  // 🔁 Single Message
  socket.on("single-message-recieved", (payload) => {
    console.log("client single-message-recieved ", payload);
    if (!payload || !payload.chatID || !payload.text) return;
  
    dispatch(addMessage(payload));
    dispatch(incrementUnread({ chatId: payload.chatID, message: payload }));
    dispatch(updateLastMessage({ chatId: payload.chatID, message: payload }));
  });  

  socket.on('chat-marked-as-read', (payload) => {

    if (!payload || !payload.chatID || !payload.messages?.length) return;
    console.log(payload);
    dispatch(markMessagesAsRead(payload));
  });

  socket.on('single-message-delivered', (payload) => {
    console.log("client single-message-delivered ", payload);
    if (!payload || !payload.chatID || !payload.text) return;
    dispatch(updateLastMessage({ chatId: payload.chatID, message: payload }));
  });

  socket.on('single-message-sent', (payload) => {
    console.log("client single-message-delivered ", payload);
    if (!payload || !payload.chatID || !payload.text) return;
    dispatch(updateLastMessage({ chatId: payload.chatID, message: payload }));
  });

  // 📦 Bulk Message
  socket.on("bulk-messages-recieved", (payload) => {
    if (!Array.isArray(payload)) return;
  
    dispatch(addMessagesBulk(payload));
  
    const messagesGroupedByChat = {};
  
    payload.forEach(msg => {
      if (!messagesGroupedByChat[msg.chatID]) {
        messagesGroupedByChat[msg.chatID] = [];
      }
      messagesGroupedByChat[msg.chatID].push(msg);
    });
  
    const unreadPayload = [];
    const lastMessagePayload = [];
  
    for (const chatID in messagesGroupedByChat) {
      unreadPayload.push({ chatId: chatID, message: messagesGroupedByChat[chatID] });
      lastMessagePayload.push({ chatId: chatID, message: messagesGroupedByChat[chatID] });
    }
  
    dispatch(incrementUnread(unreadPayload));
    dispatch(updateLastMessage(lastMessagePayload));
  });

  // ✅ Optional server push (if backend emits read updates)
  // socket.on("chatMarkedAsRead", (chatID) => {
  //   dispatch(markMessagesAsRead(chatID));
  // });

  socket.hasListenersSet = true;
  socket._removeChatListeners = () => {
    socket.off("single-message-recieved");
    socket.off("bulk-messages-recieved");
    socket.off("chatMarkedAsRead");
    socket.hasListenersSet = false;
  };
};

export default setupMessageListeners;
