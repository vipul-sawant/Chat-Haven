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
        const chatID = body.chatID?checkID(body.chatID, "chat ID"):null;
        const contactID = body.contactID?checkID(body.contactID, "contact ID"):null;

        let chat;
        let contact;

        if (chatID) {
            chat = await Chat.findById(chatID);

        } else if (contactID){
            contact = await Contact.isValidContact(contactID, authorID)

        }

        // const ;

        // let chat;
        let recipientID;

        if (!contact && !chat) {

          throw new ApiError(500, "You can only message your contacts first.");
        }
        if (contact) {
        
            recipientID = contact.savedUserID;
            chat = await Chat.findOne({ 
                participants: { $all: [authorID, recipientID] }, 
                $expr: { $eq: [{ $size: "$participants" }, 2] } 
            });

            // if (chat) {
                
            //     chatID = chat._id;
            // }
        }


        // console.log(contact);
        // console.log(chat);
        // const chatID = chat._id;
        // Step 2: Create a new message
        // const newMessage = await Message.create({
        //     authorID,
        //     recipientID,
        //     text,
        //     chatID
        // });

        let newMessage;

        // console.log('text :', text);

        if (!chat) {
            // Step 3: Create a new chat if it doesn’t exist
            
            // chat = await Chat.create({
            //     participants: [authorID, recipientID],
            //     messages: [newMessage._id],
            //     lastMessage: newMessage._id
            // });

            recipientID = contact.savedUserID;
            chat = await Chat.createNewChat(authorID, recipientID);
            const chatID = chat._id;

            newMessage = await Message.createNewMessage(authorID, recipientID, text, chatID);

            chat.messages = [newMessage._id];
            chat.lastMessage = newMessage._id;

            await chat.save({validateBeforeSave:false});

        } else {
            // Step 4: Update existing chat

            const chatID = chat._id;
            recipientID = await chat.getOtherParticipantID(authorID);

            newMessage = await Message.createNewMessage(authorID, recipientID, text, chatID);

            chat.messages.push(newMessage._id);
            chat.lastMessage = newMessage._id;
            await chat.save({validateBeforeSave:false});
        }
        
            // Notify recipient of new message
            // Check if recipient is online
        const recipientSocketID = global.chatOnlineUsers.get(recipientID.toString());

    if (recipientSocketID) {
        io.to(recipientSocketID).emit("singleMessageDelivered", newMessage);

        // Call the separate function to mark as delivered if recipient is online
        await markMessageDelivered(io,recipientID, newMessage);
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

const markMessageDelivered = async(io, recipientID, message, deliveredMessagesForBulk) => {
    if (!global.chatOnlineUsers.has(recipientID.toString())) return; // Only proceed if recipient is online

    // Update message status to "delivered"
    try {
        message.status = "delivered";
        await message.save({validateBeforeSave:false});
        const chatID = message.chatID.toString();

        if (deliveredMessagesForBulk) {
         // Bulk mode: accumulate for later emit
         deliveredMessagesForBulk.push({ chatID, message });
        } else {
            // Single message delivery — emit directly
            const socketID = global.chatOnlineUsers.get(recipientID.toString());
            if (socketID) {
              io.to(socketID).emit("singleMessageDelivered", { chatID, message });
            }
        }
    } catch (error) {
        
        console.log("Message deliver Error", error);
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
              io.to(recipientSocketID).emit("bulkMessagesDelivered", finalPayload);
            // }
        }
    } catch (error) {
        
        console.log("Deliever Pending Messages Error", error);
    }
};

const markChatAsRead = async(recipientID, chatID) => {

    try {
        const unreadMessages = await Message.find({ $and: [{recipientID}, {chatID}, {status: "delivered"}] });
    
        for (let message of unreadMessages) {
             message.status = "sent";
             await message.save({validateBeforeSave:false});
        }
    } catch (error) {
        
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
				lastMessage:1
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

export { sendMessage, markMessageDelivered, deliverPendingMessages, markChatAsRead, fetchAllChats, getAllMessages };