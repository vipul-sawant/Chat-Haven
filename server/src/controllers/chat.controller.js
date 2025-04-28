import asyncHandler from "../utils/asyncHandler.js";

import checkRequiredFields from "../utils/checkRequiredFields.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import checkID from "../utils/validateObjectId.js";

import Contact from "../models/contact.model.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

const sendMessage = asyncHandler( async (req, res) => {

    const { user, body={}, io } = req;

    const requiredFields = ['text'];
    const missingFields = checkRequiredFields(requiredFields, body);

    console.log("missingFields :", missingFields);

    try {
        if (missingFields.length > 0) {
            throw new ApiError(400, "Enter all Required fields!");

        }

        const text = body.text;

        const authorID = checkID(user._id, "User ID");
        // const chatID = body.chatID?checkID(body.chatID, "chat ID"):null;
        const chatKey = body.chatKey;
        const contactID = body.contactID?checkID(body.contactID, "contact ID"):null;

        let chat;
        let contact;
        let recipientID;
        // let newMessage;

		console.log("body :", body);
        if (chatKey) {
            // chat = await Chat.findById(chatID);
            chat = await Chat.findOne({chatKey});
			// console.log("chat found :", chat);
            
            if (!chat) {
				throw new ApiError(404, "Chat not found");
            }

        } else if (contactID){
            contact = await Contact.isValidContact(contactID, authorID)
			// console.log("contact found :", contact);

			if (!contact) {
				throw new ApiError(400, "Invalid Contact");
			}
			
            recipientID = contact.savedUserID;
			const participantsIDs = [authorID.toString(), recipientID.toString()].sort();
			const chatKey = participantsIDs.join("_")
			chat = await Chat.findOne({ chatKey });
		
			if (!chat) {
				chat = await Chat.createNewChat(participantsIDs, chatKey);
			}
        }else {
			throw new ApiError(400, "Provide either chatKey or contactID");
		}

		if (!chat) {
			throw new ApiError(500, "Chat creation failed");
		}

		// Send the message
		recipientID = recipientID || await chat.getOtherParticipantID(authorID);
		const newMessage = await Message.createNewMessage(authorID, recipientID, text, chat._id);
		
		chat.messages.push(newMessage._id);
		chat.lastMessage = newMessage._id;

		await chat.save({validateBeforeSave:false});

        const userSocketID = global.chatOnlineUsers.get(user._id.toString());
		if (userSocketID) {
			
			console.log("userSocketID :",userSocketID);
			io.to(userSocketID).emit("single-message-sent", newMessage);
			console.log("single-message-sent");
		}
        
		// Notify recipient of new message
		// Check if recipient is online
        const recipientSocketID = global.chatOnlineUsers.get(recipientID.toString());

		if (recipientSocketID) {
			console.log('single-message-will-be-delivered-from', user.fullName);

			// Call the separate function to mark as delivered if recipient is online
			await markMessageDelivered(io,recipientID, newMessage, []);
		}
			return res.status(200).json(
				new ApiResponse(201, newMessage, `New message sent`)
			);

    } catch (error) {
        
        console.log("error :", error);

        if (error instanceof ApiError) {
            const { statusCode=400, message="" } = error;
            return res.status(statusCode).json(
                new ApiResponse(statusCode, {}, message)
            )
        }

        return res.status(500).json(
            new ApiResponse(500, {}, error.message || "Something went wrong")
        )
    }
} );

// const markMessagesAsRead = async (io, chatID, readerID) => {
//   if (!chatID || !readerID) return;

//   console.log("readerID :", readerID);
//   try {
//     // Find all messages that are delivered but not yet read
//     const messagesToUpdate = await Message.find({
//       chatID,
//       recipientID: readerID,
//       status: { $in: ["sent", "delivered"] },
//     });

//     if (!messagesToUpdate.length) return;
    
//     // Group messages by authorID
//     const groupedMessages = new Map();

    
//     for (let message of messagesToUpdate) {
//       // Update status to "read"
//       message.status = "read";
//       await message.save({ validateBeforeSave: false });

//       const authorID = message.authorID.toString();
//       if (!groupedMessages.has(authorID)) {
//         groupedMessages.set(authorID, []);
//       }
//       groupedMessages.get(authorID).push(message);
//     }
    
//     // Emit grouped messages to each sender
//     for (let [authorID, messages] of groupedMessages.entries()) {
//       const senderSocketID = global.chatOnlineUsers.get(authorID);

//       if (senderSocketID) {
//         io.to(senderSocketID).emit("chat-marked-as-read", {
//           chatID,
//           messages,
//           authorID
//         });
//       }
//     }
//   } catch (error) {
//     console.error("❌ Error marking messages as read:", error);
//   }
// };

const markMessagesAsRead = async (io, chatID, readerID) => {
  if (!chatID || !readerID) return;

  console.log("readerID :", readerID);
  try {
    const messagesToUpdate = await Message.find({
      chatID,
      recipientID: readerID,
      status: { $in: ["sent", "delivered"] },
    });

    if (!messagesToUpdate.length) return;

    // Update all messages to 'read'
    const updatedMessages = [];
    for (const message of messagesToUpdate) {
      message.status = "read";
      await message.save({ validateBeforeSave: false });
      updatedMessages.push(message);
    }

    // Notify the sender (single author)
    const senderID = updatedMessages[0].authorID.toString();
    const senderSocketID = global.chatOnlineUsers.get(senderID);

    console.log(senderSocketID);

    if (senderSocketID) {
      io.to(senderSocketID).emit("chat-marked-as-read", {
        chatID,
        messages: updatedMessages,
        authorID: senderID,
      });
    }

  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
  }
};

const markMessageDelivered = async (io, recipientID, message, deliveredMessagesForBulk) => {
  // Example logic
	console.log('deliveredMessagesForBulk :', deliveredMessagesForBulk);
	if (deliveredMessagesForBulk && !deliveredMessagesForBulk.includes(message._id)) {
		deliveredMessagesForBulk.push(message._id);
		
	}
	const recipientSocketID = global.chatOnlineUsers.get(recipientID.toString());
	console.log('OnlineUsers from markMessageDelivered function:', global.chatOnlineUsers);
	if (recipientSocketID) {
		console.log('recipentSocketID :', recipientSocketID);
		console.log('singleMessageelivered to', recipientID);
		message.status = "delivered";
		await message.save({validateBeforeSave:false});

		io.to(recipientSocketID).emit("single-message-recieved", message);
		io.to(recipientSocketID).emit("single-message-delivered", message);
	
	}
};


const deliverPendingMessages = async(io, recipientID) => {

    try {
        const undeliveredMessages = await Message.find({ $and: [{recipientID}, {status: "sent"}] });
        const deliveredMessagesForBulk = []; // Track delivered messages by chat
        for (let message of undeliveredMessages) {
            await markMessageDelivered(io, recipientID, message, deliveredMessagesForBulk);
        }
        
        // Notify recipient for each chatID
        const recipientSocketID = global.chatOnlineUsers.get(recipientID.toString());
        if (recipientSocketID && deliveredMessagesForBulk.length > 0) {
          // Group messages by chatID
          const grouped = {};
          for (const { chatID, message } of deliveredMessagesForBulk) {
            if (!grouped[chatID]) grouped[chatID] = [];
            grouped[chatID].push(message);
        }
         // Convert to desired format: [{ chatID, messages: [...] }, ...]
         const finalPayload = Object.entries(grouped).map(([chatID, messages]) => ({
          chatID,
          messages,
      }));
            // for (const [chatID, count] of Object.entries(deliveredCountByChat)) {
              console.log('bulk-messages-recieved to', recipientID);
              io.to(recipientSocketID).emit("bulk-messages-recieved", finalPayload);
            // }
        }
    } catch (error) {
        
        console.log("Deliever Pending Messages Error", error);
    }
};

const fetchAllChats = asyncHandler(async (req, res) => {

    const { user } = req;

    try {
        
        const chats = await Chat.aggregate([
            {
              $match: {
                participants: user._id
              }
            },
            // Lookup last message
            {
              $lookup: {
                from: "messages",
                localField: "lastMessage",
                foreignField: "_id",
                as: "lastMessage"
              }
            },
            {
              $unwind: {
                path: "$lastMessage",
                preserveNullAndEmptyArrays: true
              }
            },
            // Lookup participant user info
            {
              $lookup: {
                from: "users",
                localField: "participants",
                foreignField: "_id",
                as: "participantsInfo"
              }
            },
            // Project final result
            {
              $project: {
                chatID: "$_id",
                participant: {
                  $let: {
                    vars: {
                      otherParticipant: {
                        $filter: {
                          input: "$participantsInfo",
                          as: "user",
                          cond: { $ne: ["$$user._id", user._id] }
                        }
                      }
                    },
                    in: {
                      userID: { $arrayElemAt: ["$$otherParticipant._id", 0] },
                      fullName: { $arrayElemAt: ["$$otherParticipant.fullName", 0] },
                      email: { $arrayElemAt: ["$$otherParticipant.email", 0] }
                    }
                  }
                },
				lastMessage:1,
				chatKey:1,
				updatedAt:"$lastMessage.updatedAt",
				// updatedAt:1,
				// createdAt:"$lastMessage.createdAt"
				createdAt:1
              }
            }
          ]);          
        
        if (Array.isArray(chats) && chats.length === 0) {
            
            return res.status(200).json(
                new ApiResponse(200, {}, "No Chats Found !")
            );
        }

        return res.status(200).json(
            new ApiResponse(200, chats, "Fetched All Chats Successfully !!")
        );
    } catch (error) {
        console.log("fetchAllChats Error :", error);

        if (error instanceof ApiError) {
            const { statusCode=400, message="" } = error;
            return res.status(statusCode).json(
                new ApiResponse(statusCode, {}, message)
            )
        }

        return res.status(500).json(
            new ApiResponse(500, {}, error.message || "Something went wrong")
        )

    }
} );

const getAllMessages = asyncHandler( async (req, res) => {

  const { user } = req;

  try {
    
    const messages = await Message.aggregate([
		{
			$match: {
				$or: [
					{ authorID: user._id },
					{ recipientID: user._id }
				]
			}
		},
		{
			$project: {
				chatID: 1,
				messageWithoutChatID: {
				$mergeObjects: [
					"$$ROOT",
					{ chatID: "$$REMOVE" } // remove chatID
				]
				}
			}
		},
		{
			$group: {
				_id: "$chatID",
				messages: { $push: "$messageWithoutChatID" }
			}
		},
		{
			$project: {
				chatID: "$_id",
				messages: 1,
				_id: 0
			}
		}
    ]);

    if (messages.length === 0) {
      
        return res.status(200).json(
          new ApiResponse(204, {}, "No Messages")
        );
    }

	return res.status(200).json(
		new ApiResponse(200, messages, "All messages fetched")
	)
  } catch (error) {
	console.log("fetchAllChats Error :", error);

	if (error instanceof ApiError) {
		const { statusCode=400, message="" } = error;
		return res.status(statusCode).json(
			new ApiResponse(statusCode, {}, message)
		)
	}

	return res.status(500).json(
		new ApiResponse(500, {}, error.message || "Something went wrong")
	)

  }
} );

export { sendMessage, deliverPendingMessages, fetchAllChats, getAllMessages, markMessagesAsRead };