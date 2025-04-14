import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";

const otpSchema = new Schema({
    email: { 
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: { 
        type: String,
        required: true
     }
     ,
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 300 // ⏳ Auto-delete after 5 minutes
    }
}, {
    timestamps:true
});

otpSchema.methods.generateVerifiedOtpToken = function(){
    return jwt.sign(
            {
                id:this._id,
                email:this.email,
                verified: true
            },
            process.env.OTP_TOKEN_SECRET,
            {
                expiresIn:process.env.OTP_TOKEN_EXPIRY
            }
        );
};

const Otp = model('Otp', otpSchema);

export default Otp;