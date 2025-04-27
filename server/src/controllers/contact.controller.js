import asyncHandler from "../utils/asyncHandler.js";

import checkRequiredFields from "../utils/checkRequiredFields.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import User from "../models/user.model.js";
import Contact from "../models/contact.model.js";

import checkID from "../utils/validateObjectId.js";

// import { cookieOptions } from "../constants.js";

const addNewContact = asyncHandler( async (req, res) => {

    const { user, body={} } = req;

    const requiredFields = ['email', 'contactName'];
    const missingFields = checkRequiredFields(requiredFields, body);

    console.log("missingFields :", missingFields);

    try {
        if (missingFields.length > 0) {
            
            throw new ApiError(400, "Enter all Required fields!");
        }

        const email = body.email;
        const contactName = body.contactName;

        console.log("add contact body :", body);
        const userID = checkID(user._id, "User ID");
        
        const isUserOnApp = await User.isUserOnApp(email);

        if (!isUserOnApp) {
            
            throw new ApiError(400, "This email is not of a App User!!");
        }

        const contactToSaveUserID = checkID(isUserOnApp._id, "Contact to save User ID");

        if (userID.equals(contactToSaveUserID)) {
            
            throw new ApiError(400, "Cannot Add Yourself as your contact");
        }

        const isUserSaved = await Contact.isUserSaved(userID, contactToSaveUserID);

        if (isUserSaved) {
            
            throw new ApiError(400, "User is already in your contacts");
        }

        const isContactNameAvailable = await Contact.isContactNameAvailable(userID, contactName);

        // console.log(isContactNameAvailable);

        if (isContactNameAvailable) {
            
            throw new ApiError(400, "User with same contactName is already in your contacts");
        }

        // const savedContact = await Contact.saveContact(userID, contactToSaveUserID, contactName);
        const savedContact = await Contact.saveContact(userID, isUserOnApp, contactName);

        await user.saveContact(savedContact._id);

        return res.status(200).json(
            new ApiResponse(201, savedContact, `Contact saved successfully with name ${contactName}`)
        );

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

const fetchAllContacts = asyncHandler(async (req, res) => {

    const { user } = req;

   try {
    
    const contacts = await Contact.aggregate([
        { $match: { userID: user._id } },
        {
          $lookup: {
            from: "users",
            localField: "savedUserID",
            foreignField: "_id",
            as: "savedUser"
          }
        },
        { $unwind: "$savedUser" },
        {
          $project: {
            _id:1,
            contactID: "$_id",
            // userID: 1,
            contactName: 1,
            savedUser: {
              userID: "$savedUser._id",
              email: "$savedUser.email",

            }
          }
        }
      ]);

    if (Array.isArray(contacts) && contacts.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, {}, "No Contacts Found !")
        );

    }

    return res.status(200).json(
        new ApiResponse(200, contacts, "Fetched All Contacts Successfully !!")
    );

   } catch (error) {
        console.log("fetchAllContacts Error :", error);

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

const editContact = asyncHandler( async (req, res) => {

    const { params = {}, body = {}, user } = req;

    const requiredFields = ['email', 'contactName'];
    const missingFields = checkRequiredFields(requiredFields, body);

    console.log("missingFields :", missingFields);

    try {
        console.log("editContact");
        console.log("body :", body);
        console.log("params :", params);
        const userID = user._id;
        const contactID = checkID(params.contactID, "ContactID to edit");

        if (missingFields.length > 0) {
            
            throw new ApiError(400, "Enter all details");
        }

        const email = body.email;
        const contactName = body.contactName;
        const isUserOnApp = await User.isUserOnApp(email);

        if (!isUserOnApp) {
            
            throw new ApiError(400, "This email is not of a App User!!");
        }

        // const contactToSaveUserID = checkID(isUserOnApp._id, "Contact to save User ID");

        // if (userID.equals(contactToSaveUserID)) {
            
        //     throw new ApiError(400, "Cannot Add Yourself as your contact");
        // }

        const isValidContact = await Contact.isValidContact(contactID, userID);

        if (!isValidContact) {
            
            throw new ApiError(400, "Contact does'nt exist");
        }
        // const isUserSaved = await Contact.isUserSaved(userID, contactToSaveUserID);

        // if (!isUserSaved) {
            
        //     throw new ApiError(400, "User not in your contacts");
        // }

        const isContactNameAvailable = await Contact.isContactNameAvailable(userID, contactName);

        // console.log(isContactNameAvailable);

        if (isContactNameAvailable) {
            
            throw new ApiError(400, "User with same contactName is already in your contacts");
        }

        const editedContact = await isValidContact.editContact(userID, contactID, contactName);
        console.log("editedContact :", editedContact);
        return res.status(200).json(
            new ApiResponse(201, editedContact, `Contact edited successfully with name ${contactName}`)
        );
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

const deleteContact = asyncHandler( async (req, res) => {

    const { params = {}, user } = req;

    try {
        
        const userID = user._id;
        const contactID = checkID(params.contactID, "Contact ID to delete");

        const isContactValid = await Contact.isValidContact(contactID, userID);

        if (!isContactValid) {
            
            throw new ApiError(400, "Contact does'nt exist");
        }

        const deletedContact = await Contact.deleteContact(contactID, userID);

        return res.status(200).json(
            new ApiResponse(201, deletedContact, `Contact deleted successfully`)
        );} catch (error) {
        
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

export { addNewContact, fetchAllContacts, editContact, deleteContact };