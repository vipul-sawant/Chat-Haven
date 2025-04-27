import { Router } from "express";
import { verifyLogin } from "../middlewares/auth.middleware.js";
import { addNewContact, deleteContact, editContact, fetchAllContacts } from "../controllers/contact.controller.js";

const router = Router();

router.route('/').post(verifyLogin, addNewContact);
router.route('/').get(verifyLogin, fetchAllContacts);

router.route('/:contactID').patch(verifyLogin, editContact);

router.route('/:contactID').delete(verifyLogin, deleteContact);

export default router;