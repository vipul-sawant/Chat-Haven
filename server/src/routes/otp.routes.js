import { Router } from "express";
import { handleOtp } from "../controllers/otp.controller.js";
const router = Router();

router.route('/').post(handleOtp);

export default router;