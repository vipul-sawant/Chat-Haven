import { Router } from "express";
import {createAccount, loginUser, logoutUser, verifyUser } from "../controllers/auth.controller.js";
import { verifyLogin } from "../middlewares/auth.middleware.js";
import otpAuth from "../middlewares/otp.middleware.js";

const router = Router();

router.route('/register/create-account').post(otpAuth, createAccount);

router.route('/login').post(loginUser);
router.route('/verify-login').get(verifyLogin, verifyUser);

router.route('/logout').post(verifyLogin, logoutUser);

export default router;