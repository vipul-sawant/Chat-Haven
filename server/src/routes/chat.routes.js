import { Router } from "express";
import { verifyLogin } from "../middlewares/auth.middleware.js";
import { fetchAllChats, getAllMessages, markChatAsRead, markMessageDelivered, sendMessage } from "../controllers/chat.controller.js";

const router = Router();

router.route('/send-message').post(verifyLogin, sendMessage);
router.route('/mark/delivered').post(markMessageDelivered);
router.route('/mark/read').post(markChatAsRead);

router.route('/').get(verifyLogin, fetchAllChats);
router.route('/all-messages').get(verifyLogin, getAllMessages);

export default router;