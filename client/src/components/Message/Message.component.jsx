import { useSelector } from "react-redux";
import { parseISO, format } from "date-fns";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { chatSelectors, selectChat } from "../../redux/slices/chatSlice";

const Message = ({msg, viewType}) => {
	const unreadCount = useSelector((state)=>{
		const chat = selectChat(state, msg.chatID);
		return chat?.unreadCount ?? 0;
	});
	const { user } = useSelector(state => state.auth || {});

	const isMine = msg.authorID === user._id;
	const time = format(parseISO(msg.updatedAt), "p"); // local am/pm
	const status = msg.status;

	// Determine tick icon
	let TickIcon = null;
	let tickColor = "gray";

	if (status === "sent") {
	  TickIcon = BsCheck;

	} else if (status === "delivered") {
	  TickIcon = BsCheckAll;

	} else if (status === "read") {
	  TickIcon = BsCheckAll;
	  tickColor = "dodgerblue";
	  
	}

  // Styles for the chat view
  const messageStyles = {
    backgroundColor: isMine ? "#1E3A5F" : "#ffffff",
    color: isMine ? "#ffffff" : "#000000",
    maxWidth: "75%", // Adjust this value as per your requirement
    fontWeight: "bold",
  };

	return (
		<div className={`mb-2 d-flex ${isMine ? "justify-content-end" : "justify-content-start"}`}>
			<div
				className="p-2 rounded position-relative"
				style={viewType === "chat" ? messageStyles:{}}
			>
				<div>{msg.text}</div>
				<div className="d-flex align-items-center justify-content-end mt-1" style={{ fontSize: "0.75rem", color: "#ccc" }}>
					<span className="me-1">{time}</span>
					{isMine && TickIcon && <TickIcon size={14} color={tickColor} />}
					{ viewType === "chatList" && !isMine && unreadCount > 0 ? unreadCount : "" }
				</div>
			</div>
		</div>
	)
};

export default Message;