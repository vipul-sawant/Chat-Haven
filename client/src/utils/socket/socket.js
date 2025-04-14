// src/socket.js
import { io } from "socket.io-client";
const url = import.meta.env.VITE_BACKEND_SERVER;
const socket = io(url, {
    autoConnect:false,
    transports: ["websocket", "polling"], // include both
    reconnectionAttempts: 5,
    reconnectionDelay: 1000, 
});

export default socket;
