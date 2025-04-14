import mongoose, { Schema, Types } from "mongoose";
import ApiError from "../utils/ApiError.js";

const chatSchema = new Schema({
    participants: [
        {
            type: Types.ObjectId,
            ref: "User",
            required: true 
        }
    ],
    messages:[
        {
            type:Types.ObjectId,
            ref: "Message"
        }
    ],
    lastMessage: { // ✅ Store the latest message for quick access
        type: Types.ObjectId,
        ref: "Message"
    }
}, {
    timestamps:true
});

// ✅ Unique Index to prevent duplicate chats between the same users
chatSchema.index({ participants: 1 }, { unique: true });

// Ensure exactly 2 participants before saving
chatSchema.pre('validate', function (next) {
    if (this.participants.length !== 2) {
        return next(new ApiError(500,'A chat must have exactly 2 participants.'));
    }
    next();
});

chatSchema.statics.createNewChat = async function(authorID, recipientID){
    return await this.create({
        participants:[authorID, recipientID]
    });
};

chatSchema.methods.getOtherParticipantID = function (authorID) {
    // Ensure authorID is an ObjectId
    const authorObjectId = new Types.ObjectId(authorID);

    // Filter out the current user from participants array
    const otherParticipant = this.participants.filter(
        (participant) => !participant.equals(authorObjectId)
    );

    // Return the other participant's ID as a string (if exists)
    return otherParticipant.length > 0 ? otherParticipant[0].toString() : null;
};

// chatSchema.methods.addLastMessage = async function(message){

//     this.lastMessage = message;
//     this.save({validateBeforeSave:false});
// };

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;