import { useSelector } from "react-redux";
import { parseISO, format } from "date-fns";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { selectChat } from "../../redux/slices/chatSlice";

const Message = ({ msg, viewType }) => {
  const { user } = useSelector(state => state.auth || {});
  const unreadCount = useSelector(state => selectChat(state, msg.chatID)?.unreadCount ?? 0);

  const isMine = msg.authorID === user?._id;
  const time = format(parseISO(msg.updatedAt), "p"); // Format to local time (AM/PM)

  const tickProps = {
    sent: { Icon: BsCheck, color: "gray" },
    delivered: { Icon: BsCheckAll, color: "gray" },
    read: { Icon: BsCheckAll, color: "dodgerblue" }
  }[msg.status] || {};

  const messageStyles = viewType === "chat" ? {
    backgroundColor: isMine ? "#1E3A5F" : "#ffffff",
    color: isMine ? "#ffffff" : "#000000",
    maxWidth: "75%",
    fontWeight: "bold",
  } : {};

  return (<>
        {viewType === "chatList" ? (
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-truncate" style={{ maxWidth: "70%" }}>{msg.text}</div>
            <div className="d-flex align-items-center text-muted" style={{ fontSize: "0.75rem" }}>
              <span className="me-1">{time}</span>
              {isMine && tickProps.Icon && <tickProps.Icon size={14} color={tickProps.color} />}
              {!isMine && unreadCount > 0 && (
                <span className="ms-2 badge bg-danger rounded-pill">{unreadCount}</span>
              )}
            </div>
          </div>
        ) : (
          <>
		  <div className={`mb-2 d-flex ${isMine ? "justify-content-end" : "justify-content-start"}`}>
			<div className="p-2 rounded position-relative" style={messageStyles}>
				<div>{msg.text}</div>
				<div className="d-flex align-items-center justify-content-end mt-1" style={{ fontSize: "0.75rem", color: "#ccc" }}>
					<span className="me-1">{time}</span>
					{isMine && tickProps.Icon && <tickProps.Icon size={14} color={tickProps.color} />}
				</div>
			</div>
		</div>
			</>
        )}
	</>
  );
};

export default Message;
