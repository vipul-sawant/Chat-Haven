import { Router } from "express";
import { verifyLogin } from "../middlewares/auth.middleware.js";
import { addNewContact, fetchAllContacts } from "../controllers/contact.controller.js";

const router = Router();

router.route('/').post(verifyLogin, addNewContact);
router.route('/').get(verifyLogin, fetchAllContacts);

export default router;