import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useMemo } from "react";
import { format, isToday, isYesterday, differenceInCalendarDays } from "date-fns";

import ChatHeader from "./ChatHeader.component";
import Message from "../Message/Message.component";
import MessageForm from "../Message/MessageForm.component";
import { fields } from "../../utils/form/fields/message/sendMessage";
import { selectMessagesByChatId, markMessagesAsRead } from "../../redux/slices/messageSlice";
import { chatSelectors } from "../../redux/slices/chatSlice";
import { contactSelectors } from "../../redux/slices/contactSlice";
import socket from "../../utils/socket/socket";

// Helper to format date title
const getDateTitle = (dateString) => {
  const date = new Date(dateString);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  const diffInDays = differenceInCalendarDays(new Date(), date);
  if (diffInDays < 7) return format(date, "EEEE"); // e.g., Monday

  return format(date, "dd MMM yyyy"); // e.g., 27 Apr 2025
};

// Helper to group messages by formatted date
const groupMessagesByDate = (messages) => {
  return messages.reduce((groups, message) => {
    const dateKey = getDateTitle(message.updatedAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(message);
    return groups;
  }, {});
};

const ChatWindow = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth || {});
  const { selectedChatID, chat, messages, isLoading } = useSelector(state => {
    const selectedChatID = state.chats.selectedChatID;
    const chat = selectedChatID ? chatSelectors.selectById(state, selectedChatID) : null;
    const messages = selectedChatID ? selectMessagesByChatId(state, selectedChatID) : [];
    const isLoading = state.messages.isLoading;  // Assuming you are using a loading state
    return { selectedChatID, chat, messages, isLoading };
  });

  const contacts = useSelector(contactSelectors.selectAll);

  const isContact = (userID) => contacts.find((c) => c.savedUser.userID === userID);

  const markChatAsRead = (chatId) => {
    if (socket && chatId) {
      socket.emit("mark-as-read", chatId);
    }
  };

  // Ref for chat container to scroll to bottom
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chat?._id && chat?.lastMessage?._id && chat.lastMessage.recipientID === user._id) {
      markChatAsRead(chat._id);
    }
  }, [chat?._id, chat?.lastMessage?._id]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Memoize grouped messages to avoid unnecessary recomputations
  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  useEffect(() => {
    // console.log("chat opened :", chat?.chatKey);
  }, [chat]);

  return (
    <div className="chat-window d-flex flex-column h-100">
      {chat?._id ? (
        <>
          {chat?.participant && <ChatHeader user={chat.participant} />}

          <div ref={chatContainerRef} className="flex-grow-1 px-3 py-2 overflow-auto bg-light" style={{ height: "0px" }}>
            {messages.length > 0 ? (
              Object.keys(groupedMessages).map((dateKey) => (
                <div key={dateKey} className="mb-3">
                  <div className="text-center text-muted my-2" style={{ fontSize: "0.9rem" }}>
                    {dateKey}
                  </div>
                  {groupedMessages[dateKey].map((msg) => (
                    <Message key={msg._id} msg={msg} viewType="chat" />
                  ))}
                </div>
              ))
            ) : (
              <div className="text-center text-muted mt-5">
                {isLoading ? "Loading messages..." : "No messages yet. Start chatting!"}
              </div>
            )}
          </div>

          <MessageForm
            key={selectedChatID}
            fieldsArray={fields}
            data={{
              ...(chat?._id && { chatKey: chat.chatKey }),
              ...(isContact(chat.participant.userID) && {
                contactID: isContact(chat.participant.userID)._id,
              }),
            }}
          />
        </>
      ) : (
        <div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light">
          <div className="text-center text-muted">
            <h5>👋 Welcome!</h5>
            <p>Select a chat from the list to start messaging.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
