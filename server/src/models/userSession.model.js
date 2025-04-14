import { Schema, Types, model } from "mongoose";

const UserSessionSchema = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },
    connectedAt: {
        type: Date,
        required: true,
        index: true
    },
    disconnectedAt: {
        type: Date,
        default: null
    },
},
{
    timestamps:true
});

UserSessionSchema.index({ userID: 1, connectedAt: -1 });

const UserSession = model("UserSession", UserSessionSchema);

export default UserSession;