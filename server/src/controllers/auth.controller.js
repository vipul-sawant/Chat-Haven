import asyncHandler from "../utils/asyncHandler.js";

import checkRequiredFields from "../utils/checkRequiredFields.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import User from "../models/user.model.js";

import { cookieOptions } from "../constants.js";

const createAccount = asyncHandler( async (req, res) => {

    const { body={}, openAuth } = req;

    // const requiredFields = ['email', 'fullName', 'c_pass', 'otp'];
    const requiredFields = ['fullName', 'c_pass'];
    // const requiredFields = ['email', 'otp'];
    const missingFields = checkRequiredFields(requiredFields, body);

    console.log("missingFields :", missingFields);

    try {
        if (missingFields.length > 0) {
            
            throw new ApiError(400, "Enter all Required fields!");
        }

        // const parsedData = transformUserData(body);

        const email = openAuth.email;
        const fullName = body.fullName;
        const password = body.c_pass;

        const existingUser = await User.isRegistered({email});

        if (existingUser) {
            
            throw new ApiError(400, "E-mail already registered!!");
        }

         const createUser = await User.createUser({email, fullName, password});

         return res.status(200)
        .json(new ApiResponse(201, createUser, "User Account Created Successfully!"));
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

const loginUser = asyncHandler( async (req, res) => {

    // console.log("req :", req);
    const { body={}, io } = req;
    
    // console.log("body :", body);
    // console.log("io in login :", io);

    const requiredFields = ["email", "password"];
    const missingFields = checkRequiredFields(requiredFields, body);
    
        try {
            console.log("Missing Fields :", missingFields);

            if (missingFields.length > 0) {
                throw new ApiError(400, "Please Enter All Details");
            }

           const findUser = await User.isRegistered({email:body.email});
    
            // console.log('findUser :', findUser);
    
            if (!findUser) {
                throw new ApiError(401, "Invalid E-mail");
            }
            
            // const userObj = transformUserData(body);
            // console.log('userObj :', userObj);

            const correctPassword = await findUser.checkPassword(body.password);
            console.log('correctPasword :', correctPassword);

            if (!correctPassword) {

                throw new ApiError(401, "Enter Correct Password");
            }
    
            const { accessToken, refreshToken } = await findUser.generate_access_and_refresh_token();
    
            console.log("after generate : access token :", accessToken, " and refresh token :", refreshToken);

            const user = await findUser.loginUser();

            return res.status(200)
            .cookie("accessToken", accessToken, cookieOptions('accessToken'))
            .cookie("refreshToken", refreshToken, cookieOptions('refreshToken'))
            .json(
                new ApiResponse(201, 
                    {
                        user, accessToken, refreshToken
                    },
                    `User ${user.fullName} logged-in successfully!`)
            );
    
        } catch (error) {
            if (error instanceof ApiError) {
                // console.log(error);
                return res.status(error.statusCode)
                .json(
                    new ApiResponse(error.statusCode,{}, error.message));
            }
        }
} );

const logoutUser = asyncHandler( async (req, res) => {

    const user = req.user;
    // console.log('user :', user);

    await User.findByIdAndUpdate(user._id,
        {
            $set:
                {
                    refresh_token: undefined
                }
        },
        {
            new:true
        });

    return res.status(200)
    .clearCookie('accessToken', cookieOptions('logout'))
    .clearCookie('refreshToken', cookieOptions('logout'))
    .json(new ApiResponse(201, {}, "User Logged Out"));
} );

const verifyUser = asyncHandler( async (req, res) => {

    const {user, cookies} = req;

    return res.status(200)
    .json(new ApiResponse(201, {user, accessToken:cookies.accessToken, refreshToken:cookies.refreshToken}, "User Verified !"));
} );

export { createAccount, loginUser, logoutUser, verifyUser };