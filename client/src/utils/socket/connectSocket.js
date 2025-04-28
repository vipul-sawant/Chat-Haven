import setupMessageListeners from "./messageStatus.js";
import socket  from "./socket.js"; // wherever you initialize your socket
import updateSocketAuth from "./updateSocketAuth.js";
import { useNavigate as navigate, replace } from "react-router-dom"; // or pass in from caller if needed

export const connectSocket = (accessToken, dispatch, options = {}) => {
    const { onAuthFailRedirect = true } = options;

    updateSocketAuth(accessToken); // step 1: update token
    socket.connect();              // step 2: connect

    setupMessageListeners(socket, dispatch);
    const handleConnect = () => {
        // // console.log("✅ Socket connected");
    
    };

    const handleConnectError = (err) => {
        
        console.error("❌ Socket connection failed:", err.message);

        if (err.message === "Authentication error" && onAuthFailRedirect) {
            alert("Session expired. Please log in again.");
            navigate("/user/login", replace);
        }
    };
    const handleDisconnect = (reason) => {
        console.warn("⚠️ Socket disconnected:", reason);
    
        if (reason === "io server disconnect") {
          // Token invalid or explicitly kicked
          socket.disconnect(); // Prevent automatic reconnection
        }
    
        // If disconnected due to network or other, auto reconnect will happen
        // But make sure token is still valid before reconnecting (handled in backend)
    }

    // ✅ Online status logic
    // const handleUserStatus = ({ userID, online, lastSeen }) => {
    //     if (online) {
    //         // // console.log(`🟢 User ${userID} is online`);
    //     } else {
    //         // // console.log(`🔴 User ${userID} is offline. Last seen at: ${lastSeen}`);
    //     }
    //     // You can call a callback or dispatch state update here
    // };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    // socket.on("userStatus", handleUserStatus);

    // 🔄 Expose a method to check user status
    // socket.checkUserStatus = (userID) => {
    //     if (socket.connected) {
    //         socket.emit("getUserStatus", { userID });
    //     }
    // };

    // ✅ Return a cleanup function
    return () => {
    socket.off("connect", handleConnect);
    socket.off("connect_error", handleConnectError);
    socket.off("disconnect", handleDisconnect);
    // socket.disconnect();
    };

};
