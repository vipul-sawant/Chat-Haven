// import { useEffect, useState } from "react";
// import socket from "./socket.js";
import { incrementUnread, updateLastMessage } from "../../redux/slices/chatSlice.js";
import { addMessage, addMessagesBulk } from "../../redux/slices/messageSlice.js";
// import { useDispatch } from "react-redux";
const setupMessageListeners = (socket, dispatch) => {
  // const dispatch = useDispatch();
    socket.on("singleMessageDelivered", (payload) => {
        // const { chatID, message } = payload;
    
        console.log("singleMessageDelivered");
        dispatch(addMessage(payload));
        dispatch(incrementUnread(payload));
        dispatch(updateLastMessage(payload));
      });

      // Handle bulk delivered messages
  socket.on("bulkMessagesDelivered", (payload) => {
    // payload should already be in format: [{ chatID, messages: [...] }]
    dispatch(addMessagesBulk(payload));
    dispatch(incrementUnread(payload));
    dispatch(updateLastMessage(payload));
  });
};

export default setupMessageListeners;
