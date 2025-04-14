import mongoose, { Schema, Types } from "mongoose";

const STATUS_ENUM = ['sent', 'delivered', 'read'];

const messageSchema = new Schema({
    chatID:{
        type :Types.ObjectId,
        ref: "Chat",
        required:true
    },
    authorID:{
        type: Types.ObjectId,
        ref: "User",
        required:true
    },
    recipientID:{
        type: Types.ObjectId,
        ref: "User",
        required:true
    },
    text:{
        type: String,
        required: true,
        trim: true,
        index:true
    },
    status:{
        type: String,
        required: true,
        enum: STATUS_ENUM,
        default: "sent"
    }
}, {
    timestamps:true
});

// Pre-save hook to sanitize text
messageSchema.pre('save', function (next) {
    if (this.text) {
        this.text = this.text.trim().replace(/\s+/g, ' ');
    }
    next();
});

messageSchema.statics.createNewMessage = async function(authorID, recipientID, text, chatID){
    return await this.create({authorID, recipientID, text, chatID});

};

const Message = mongoose.model('Message', messageSchema);

export default Message;