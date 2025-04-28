import mongoose from "mongoose";
import Chat from "../models/chat.model.js"; // adjust the path if needed

async function addChatKeysToOldChats() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/chat-app");

        console.log("MongoDB connected");

        // Find all chats that don't have a chatKey
        const chatsWithoutChatKey = await Chat.find({ chatKey: { $exists: false } });

        console.log(`Found ${chatsWithoutChatKey.length} chats without chatKey`);

        for (const chat of chatsWithoutChatKey) {
            if (chat.participants.length === 2) {
                const participantIds = chat.participants.map(id => id.toString()).sort();
                const chatKey = participantIds.join("_");

                chat.chatKey = chatKey;

                await chat.save({ validateBeforeSave: false });
                console.log(`Updated chat ${chat._id} with chatKey: ${chatKey}`);
            } else {
                console.log(`Chat ${chat._id} has invalid number of participants`);
            }
        }

        console.log("Migration finished");
        process.exit(0);
    } catch (error) {
        console.error("Migration error:", error);
        process.exit(1);
    }
}

addChatKeysToOldChats();
