import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";
import Otp from "../models/otp.model.js";
import transporter from "../config/mailer.js";
import { cookieOptions } from "../constants.js";

const handleOtp = asyncHandler( async(req, res, next) => { 

    const step = req.query.step;
    const { email, otp } = req.body;

    try {
        if (!step) {
            
            throw new ApiError(400, "Please check your request");
        }

        if (!email) {
            
            throw new ApiError(400, "Some fields are missing");
        }

        if (step === 'request') {
            const code = crypto.randomInt(100000, 999999).toString();
            await Otp.findByIdAndUpdate({ email }, { otp:code }, { upsert:true, new:true });
            await transporter.sendMail({
                from: process.env.USER_EMAIL,
                to: parsedData.email,
                subject: "Your OTP Code",
                text: `Your OTP code is: ${code}. It expires in 5 minutes.`
            });
        
            return res.status(200).json(new ApiResponse(201, {}, "OTP sent"));
        }

        if (step === "verify") {

            if (!otp) {
                
                throw new ApiError(400, "Please enter otp");
            }
            const record = await Otp.findOne({email});
            if (!record || record.otp !== otp) {

                throw new ApiError(400, 'Invalid or expired OTP');
            }
            
            const tempToken = await record.generateVerifiedOtpToken();

            return res.status(200)
            .cookie('verifiedOtpToken', tempToken, cookieOptions('otp'))
            .json(new ApiResponse(201, {}, "Otp Verified"));
        }
    } catch (error) {
        
        console.log("error :", error);

        if (error instanceof ApiError) {
            const { statusCode=400, message="" } = error;
            return res.status(statusCode).json(
                new ApiResponse(statusCode, {}, message)
            )
        }

        return res.status(500).json(
            new ApiResponse(500, {}, error.message || "Invalid step")
        )
        
    }
} );

export { handleOtp };