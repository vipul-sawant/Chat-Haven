import fs from "fs";
import path from "path";

import { config } from "dotenv";

const mode = process.env.NODE_ENV || "development";
console.log("Mode is ", mode);

if (mode === "development") {
    const basePath = process.cwd();

    const possibleFiles = [
        `.env.${mode}.local`,
        `.env.${mode}`,
        `.env`
    ];

    const envFile = possibleFiles
        .map(file => path.resolve(basePath, file))
        .find(fs.existsSync);

    if (envFile) {
        const envData = config({ path: envFile });
        console.log('server envData :',envData);
        console.log(`Loaded environment from: ${path.basename(envFile)}`);
    } else {
        console.warn("No environment file found for development mode.");
    }

}

import initApp from "./app.js";
import connectToDB  from "./db/index.js";
import ApiError from "./utils/ApiError.js";

import http from "http";
import { Server } from "socket.io";

import jwt from "jsonwebtoken";
import User from "./models/user.model.js";

import { deliverPendingMessages } from "./controllers/chat.controller.js";
// import UserSession from "./models/userSession.model.js";

const port = process.env.PORT || 4000;
const startServer = async () => {
    try {
        if (process.env.NODE_ENV !== "test") {
            await connectToDB();
        }
        // const app = initApp();
        
        const server = http.createServer();
        
        const io = await new Server(server, {cors:{origin:"*", methods:["GET", "POST"]},
            credentials: true});
        
        const app = await initApp(io);

        await server.on("request", app);

        global.io = io;
        global.chatOnlineUsers = new Map(); // Store online users by userID
        
        const socketAuthMiddleware = async (socket, next) => {
            try {
              console.log("🔐 Handshake Headers:", socket.handshake.headers);
          
              const token =
                socket.handshake.headers.authorization?.split(" ")[1] ||
                socket.handshake.auth?.token;
          
              if (!token) {
                console.log("❌ No token provided");
                return next(new ApiError(401, "Authentication error"));
              }
          
              const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
              const user = await User.findById(decodedToken?.id).select(
                "-password -refresh_token"
              );
          
              if (!user) {
                console.log("❌ Invalid token: user not found");
                return next(new ApiError(401, "Authentication error"));
              }
          
              socket.userID = user._id;
              console.log("✅ Authenticated socket:", user._id);
              return next(); // allow connection
            } catch (error) {
              console.error("❌ Socket authentication failed:", error.message);
              return next(new ApiError(401, "Authentication error")); // ALWAYS use next(err)
            }
          };
          

        // Middleware to verify JWT for Socket.IO connections
        io.use(socketAuthMiddleware);

        // Handle new socket connections
        io.on("connection", (socket) => {
            // console.log("New connection:", socket.id);

            // Listen for messages from the client
            // console.log(`✅ Client connected: ${socket.id}`);

            // Debugging handshake
            // console.log("📡 Handshake Headers:", socket.handshake.headers);
        
            // Listen for messages from the client
            // socket.on("message", (msg) => {
            //     console.log(`📩 Message received: ${msg}`);
            // });

            socket.on("joinChat", async (data) => {
                // console.log('joinChat');
                // if (!userID) return;
            
                // Ensure global.chatOnlineUsers is initialized as a Map
                if (!global.chatOnlineUsers) global.chatOnlineUsers = new Map();
            
                const userID = data.userID;
                if (!userID) return;
                
                // Track online users
                global.chatOnlineUsers.set(userID, socket.id);

                // Notify others that user is online
                socket.broadcast.emit("userOnline", { userID });
                socket.userID = userID;
                console.log("users active after connect",global.chatOnlineUsers);
                // console.log(`Chat user ${userID} is online`);

                // 🔥 Deliver pending messages right after connecting
                await deliverPendingMessages(io, userID);
            });

            socket.on("getUserStatus", async ({ userID }) => {
                const online = global.chatOnlineUsers.has(userID);
                let lastSeen = null;
              
                if (!online) {
                  const user = await User.findById(userID).select("last_seen");
                  lastSeen = user?.last_seen ?? null;
                }
              
                socket.emit("userStatus", { userID, online, lastSeen });
              });              
              
            socket.on("disconnect", async () => {
                let userIDToRemove = socket.userID;
                global.chatOnlineUsers.forEach((socketID, userID) => {
                    if (socketID === socket.id) {
                        userIDToRemove = userID;
                    }
                });

                if (userIDToRemove) {
                    const lastSeen = new Date();
                    global.chatOnlineUsers.delete(userIDToRemove);

                    await User.findByIdAndUpdate(userIDToRemove, { last_seen: lastSeen });
                    
                    // Notify others this user went offline
                    socket.broadcast.emit("userOffline", {
                        userID: userIDToRemove,
                        lastSeen,
                    });
                    console.log("users active after disconect", global.chatOnlineUsers);
                }
            });
        });

        server.listen(port, () => {
            console.log(`✅ Server running on url ${process.env.SERVER_URL}:${port}`);
        });
    } catch (error) {
        if (error instanceof ApiError) {
            console.error("❌ Database Error:", error.message);
        } else {
            console.error("❌ Unexpected Error:", error);
        }
        process.exit(1); // Exit if DB connection fails
    }
};

startServer();