import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
// import crypto from "crypto";
// import Otp from "../models/otp.model.js";
import ApiError from "../utils/ApiError.js";
// import transporter from "../config/mailer.js";
import ApiResponse from "../utils/ApiResponse.js";
// import { cookieOptions } from "../constants.js";

const otpAuth = asyncHandler( async(req, res, next) => {

    try {
        const token = req.cookies?.verifiedOtpToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "No token");
        }

        const payload = jwt.verify(token, process.env.OTP_TOKEN_SECRET);

        if (!payload.email || !payload.verified) {
            throw new ApiError(403, "Invalid OTP token");

        }
        
        req.otpAuth = payload; // email, verified
        next();

    } catch (error) {
        
        console.log("error :", error);

        if (error instanceof ApiError) {
            const { statusCode=400, message="" } = error;
            return res.status(statusCode).json(
                new ApiResponse(statusCode, {}, message)
            )
        }

        return res.status(500).json(
            new ApiResponse(500, {}, error.message || "OTP token expired or invalid")
        )
        
    }
} );

export default otpAuth;