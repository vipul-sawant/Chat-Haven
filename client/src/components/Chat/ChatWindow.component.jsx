// import { useLocation as location } from "react-router-dom";
import ChatHeader from "./ChatHeader.component.jsx";
// import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Message from "../Message/Message.component.jsx";
// import { messageSelectors } from "../../redux/slices/messageSlice.js";
// import { chatSelectors } from "../../redux/slices/chatSlice.js";
// import messagesAdapter from "../../redux/slices/messageSlice.js";
import { selectMessagesByChatId } from "../../redux/slices/messageSlice.js";
import { useEffect, useState } from "react";
import { chatSelectors } from "../../redux/slices/chatSlice.js";
import MessageForm from "../Message/MessageForm.component.jsx";
import { fields } from "../../utils/form/fields/message/sendMessage.js";
import { contactSelectors } from "../../redux/slices/contactSlice.js";

const ChatWindow = () => {
	
	// Correctly select the selected chat id from the chats slice
	const selectedChatID = useSelector((state) => state.chats.selectedChatID);
	console.log("selectedChatID :", selectedChatID);
	// Use selectors directly at the top level of your component
	const chat = useSelector((state) =>
		selectedChatID ? chatSelectors.selectById(state, selectedChatID) : null
	);
	console.log("chats :", chat);
	const messages = useSelector((state) =>
		selectedChatID ? selectMessagesByChatId(state, selectedChatID) : []
	);

	const contacts = useSelector(contactSelectors.selectAll);
	const iscontact = (userID) => {

		return contacts.find(c => c.savedUser.userID === userID);
	};
	// const getDisplayNameForUser = (userID, email) => {
	// 	const contact = contacts.find((c) => c.savedUser.userID === userID);
	// 	return contact ? contact.contactName : email;
	//   };
	  
	// const messages = useSelector((state) => selectMessagesByChatId(state, selectedChatID));
	return (
		<>
			<div className="d-flex flex-column h-100">
				{ chat?._id ? (
					<>
						<ChatHeader user={chat.participant} />
						<div className="flex-grow-1 p-3 overflow-auto bg-light">
							{messages.length > 0 ? (
								messages.map(msg => (
									<Message key={msg._id} msg={msg} viewType={"chat"} />
								))
							) : (
								<div className="text-center text-muted mt-5">No messages yet. Start chatting!</div>
								)}
						</div>
						<MessageForm fieldsArray={fields} data={{
							...(chat?._id && { chatID: chat._id }),
							...(iscontact(chat.participant.userID) && { contactID: iscontact(chat.participant.userID)._id }),
						}} />
					</>
				):(
					<div className="flex-grow-1 d-flex justify-content-center align-items-center bg-light">
						<div className="text-center text-muted">
							<h5>👋 Welcome!</h5>
							<p>Select a chat from the list to start messaging.</p>
						</div>
					</div>
				) }
			</div>
		</>
	);
};

export default ChatWindow;