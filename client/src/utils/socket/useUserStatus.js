import { useEffect, useState } from "react";
import socket from "./socket.js";

const useUserStatus = (userID) => {
    const [status, setStatus] = useState({
        online: false,
        lastSeen: null,
    });

    useEffect(() => {
        if (!userID) return;

        // Initial status request
        const requestStatus = () => {
            if (socket.connected) {
                socket.emit("getUserStatus", { userID });
            }
        };

        const handleUserStatus = ({ userID: incomingID, online, lastSeen }) => {
            if (incomingID === userID) {
                setStatus({ online, lastSeen });
            }
        };

        const handleUserOnline = ({ userID: incomingID }) => {
            if (incomingID === userID) {
                setStatus((prev) => ({ ...prev, online: true }));
            }
        };

        const handleUserOffline = ({ userID: incomingID, lastSeen }) => {
            if (incomingID === userID) {
                setStatus({ online: false, lastSeen });
            }
        };

        socket.on("connect", requestStatus);
        socket.on("userStatus", handleUserStatus);
        socket.on("userOnline", handleUserOnline);
        socket.on("userOffline", handleUserOffline);

        requestStatus();

        // Cleanup on unmount
        return () => {
            socket.off("connect", requestStatus);
            socket.off("userStatus", handleUserStatus);
            socket.off("userOnline", handleUserOnline);
            socket.off("userOffline", handleUserOffline);
        };
    }, [userID]);

    // // console.log("userID :", userID, "status :", status);
    return status; // { online, lastSeen }
};

export default useUserStatus;
