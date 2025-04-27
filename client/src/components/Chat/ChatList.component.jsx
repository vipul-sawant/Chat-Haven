import { ListGroup } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { chatSelectors, selectChat } from "../../redux/slices/chatSlice";
import { contactSelectors } from "../../redux/slices/contactSlice";
import Message from "../Message/Message.component";

const ChatList = () => {
  const dispatch = useDispatch();
  const allChats = useSelector(chatSelectors.selectAll);
  const selectedChatID = useSelector(state => state.chats.selectedChatID);
  const contacts = useSelector(contactSelectors.selectAll);

  const openChat = (chatID) => {
    dispatch(selectChat(chatID));
  };

  const getDisplayNameForUser = (userID, email) => {
    const contact = contacts.find((c) => c.savedUser.userID === userID);
    return contact ? contact.contactName : email;
  };

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
