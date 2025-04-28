import { ListGroup } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { chatSelectors, selectChat } from "../../redux/slices/chatSlice.js";
import { contactSelectors } from "../../redux/slices/contactSlice.js";
import Message from "../Message/Message.component.jsx";
import { useEffect } from "react";

const ChatList = () => {
  const dispatch = useDispatch();
  const allChats = useSelector(chatSelectors.selectAll); // Get all chats from Redux
  const selectedChatID = useSelector(state => state.chats.selectedChatID);
  const contacts = useSelector(contactSelectors.selectAll);

  // Open chat when clicked
  const openChat = (chatID) => {
    dispatch(selectChat(chatID));
  };

  const getDisplayNameForUser = (userID, email) => {
    const contact = contacts.find((c) => c.savedUser.userID === userID);
    return contact ? contact.contactName : email;
  };

  // Listen for updates on `allChats` state, which should trigger re-render automatically
  useEffect(() => {
    // This will trigger when the `allChats` data in Redux changes
    // You don't need to do anything extra here since React will automatically re-render
    console.log(allChats);
  }, [allChats]);

  return (
    <>
      {allChats.length === 0 && (
        <div className="p-3 text-muted">No chats yet. Start a conversation!</div>
      )}

      {allChats.length > 0 && (
        <ListGroup variant="flush">
          {allChats.map(chat => {
            const participant = chat.participant;
            const lastMessage = chat.lastMessage;

            return (
              <ListGroup.Item
                key={chat._id}
                action
                active={chat._id === selectedChatID}
                onClick={() => openChat(chat._id)}
                className="py-2 px-3"
                style={
                  chat._id === selectedChatID
                    ? {
                        backgroundColor: '#5F431E', // high-contrast hover shade
                        color: '#FFFFFF',           // white text for AAA contrast
                      }
                    : {}
                }
              >
                <div className="fw-semibold">{getDisplayNameForUser(participant.userID, participant.email)}</div>
                <div className="text-muted small text-truncate">
                  {lastMessage ? <Message msg={lastMessage} viewType={"chatList"} /> : "No messages yet"}
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </>
  );
};

export default ChatList;
