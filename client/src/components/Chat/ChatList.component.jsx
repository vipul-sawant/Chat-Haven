import { ListGroup } from "react-bootstrap";
// import { useSelector, useDispatch as dispatch } from "react-redux";
import { useSelector, useDispatch } from "react-redux";
// import { useNavigate as navigate } from "react-router-dom";
import { chatSelectors, selectChat } from "../../redux/slices/chatSlice.js";
import { contactSelectors } from "../../redux/slices/contactSlice.js";
import Message from "../Message/Message.component.jsx";
import { useEffect } from "react";
import { addMessage } from "../../redux/slices/messageSlice.js";
import socket from "../../utils/socket/socket.js";

const ChatList = () => {
	const dispatch = useDispatch();
	const allChats = useSelector(chatSelectors.selectAll);
	console.log("allChats :", allChats);

	const contacts = useSelector(contactSelectors.selectAll);
	const openChat = (chatID) => {

		console.log("openChat");
		dispatch(selectChat(chatID));
	};

	const getDisplayNameForUser = (userID, email) => {
		const contact = contacts.find((c) => c.savedUser.userID === userID);
		return contact ? contact.contactName : email;
	  };

	// useEffect(()=>{
	// 	socket.on('singleMessageDelivered', (message) => {
	// 		console.log("📩 New message received:", message);
	// 		addMessage(message);
	// 	});

	// 	socket.on('bulkMessagesDelivered', (payload) => {
	// 		// payload should already be in format: [{ chatID, messages: [...] }]
	// 		dispatch(addMessagesBulk(payload));
	// 	  });
	// 	// Cleanup to avoid duplicate listeners
	// 	return () => {
	// 		socket.off('singleMessageDelivered');
	// 	};
	// }, []);

  return (
    <>
		{allChats.length === 0 && (
			<div className="p-3 text-muted">No chats yet. Start a conversation!</div>
		)}

		{allChats.length > 0 && <ListGroup variant="flush">
			{allChats.map(chat => {
				const participant = chat.participant;
				const lastMessage = chat.lastMessage;
				return (
					<ListGroup.Item key={chat._id} action onClick={() => openChat(chat._id)}>
						<div className="fw-bold">{getDisplayNameForUser(participant.userID, participant.email)}</div>
						<div className="text-muted small text-truncate">{lastMessage ? <Message msg={lastMessage} viewType={"chatList"} /> : "No messages yet"}</div>
					</ListGroup.Item>
			)})}
		</ListGroup>}
    </>
  )
}

export default ChatList;