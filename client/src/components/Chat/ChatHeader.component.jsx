// import { useNavigate as navigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import useUserStatus from '../../utils/socket/useUserStatus.js';
import dayjs from "dayjs"; // e.g. "5 minutes ago"
import relativeTime from 'dayjs/plugin/relativeTime';
import { contactSelectors } from '../../redux/slices/contactSlice.js';
import { useEffect } from 'react';

const ChatHeader = ({user}) => {

	dayjs.extend(relativeTime);
	console.log("user :", user);

	const contacts = useSelector(contactSelectors.selectAll);
	
	const getDisplayNameForUser = (userID, email) => {
		const contact = contacts.find((c) => c.savedUserID === userID);
		return contact ? contact.contactName : email;
	  };

	
    const { online, lastSeen } = useUserStatus(user.userID);
	useEffect(()=>{

		console.log("lastSeen :", lastSeen);
	},[lastSeen, online]);

  return (
    // <div className="d-flex justify-content-between align-items-center p-2 border-bottom bg-white">
    <div className="d-flex justify-content-start align-items-center p-2 border-bottom bg-white">
		{/* <div onClick={()=>openUserProfile()} style={{ cursor: "pointer" }}> */}
		<div style={{ cursor: "pointer" }}>
			<div className="fw-bold">{getDisplayNameForUser(user.userID, user.email)}</div>
			<div className="text-muted small">{online ? "🟢 Online" : `🔴 Last seen: ${dayjs(lastSeen).fromNow()}`}</div>
		</div>
    </div>
  );
};

export default ChatHeader;