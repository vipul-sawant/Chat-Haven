import { useSelector } from 'react-redux';
import useUserStatus from '../../utils/socket/useUserStatus';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { contactSelectors } from '../../redux/slices/contactSlice';
import { useEffect } from 'react';

dayjs.extend(relativeTime);

const ChatHeader = ({ user }) => {
  const contacts = useSelector(contactSelectors.selectAll);

  const getDisplayNameForUser = (userID, email) => {
    const contact = contacts.find((c) => c.savedUserID === userID);
    return contact ? contact.contactName : email;
  };

  const { online, lastSeen } = useUserStatus(user.userID);

  useEffect(() => {
    // console.log("lastSeen :", lastSeen);
  }, [lastSeen, online]);

  return (
    <div className="chat-header d-flex justify-content-start align-items-center p-2 border-bottom bg-white shadow-sm sticky-top">
      <div style={{ cursor: "pointer" }}>
        <div className="fw-bold">{getDisplayNameForUser(user.userID, user.email)}</div>
        <div className="text-muted small">
          {online ? "🟢 Online" : `🔴 Last seen: ${dayjs(lastSeen).fromNow()}`}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
