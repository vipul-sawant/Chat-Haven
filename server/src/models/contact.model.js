import mongoose, { Schema, Types } from "mongoose";
import ApiError from "../utils/ApiError.js";
// import ApiError from "../utils/ApiError.js";

const contactSchema = new Schema({
    userID:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    savedUserID:{
        type: Types.ObjectId,
        ref:"User",
        required: true
    },
    contactName:{
        type: String,
        required: true,
        trim: true,
        index: true, // ✅ Index for faster searches
        validate: {
            validator: function (value) {
                return /^[a-zA-Z\s]+$/.test(value); // ✅ Only alphabets & spaces
            },
            message: "Contact name must contain only letters and spaces."
        }
    },
}, {
    timestamps:true
});

// ✅ Case-Insensitive Unique Index on `userID` & `contactName`
contactSchema.index(
    { userID: 1, contactName: 1 },
    { unique: true, collation: { locale: "en", strength: 2 } }
);
contactSchema.statics.isUserSaved = async function(userID, savedUserID){

    const contact = await this.findOne({$and:[{userID}, {savedUserID}]});
    return contact;
};

contactSchema.statics.isContactNameAvailable = async function(userID, contactName){
    
    const contact = await this.findOne({$and:[{userID}, {contactName}]});
    return contact;
};

// contactSchema.statics.saveContact = async function(userID, savedUserID, contactName){
contactSchema.statics.saveContact = async function(userID, savedUser, contactName){

    // const contact = await this.create({userID, savedUserID, contactName});
    const contact = await this.create({userID, savedUserID:savedUser._id, contactName});

    const contactObj = contact.toObject();
    const { contactName:cName, _id, ...rest } = contactObj;
    // contactObj.savedUser = savedUser.email;
    // contactObj.savedUser = savedUser._id;
    // delete contactObj.
    const returnObj = {contactName:cName, _id, contactID:_id, savedUser:{email:savedUser.email, userID:savedUser._id}}
    console.log("returnObj :", returnObj);
    return returnObj;
};

contactSchema.methods.editContact = async function(/*contactId, */userID, savedUserID, contactName){

    if (this.userID.toString() !== userID.toString()) {
        throw new ApiError(403, "Unauthorized: You cannot update this note");
    }
    
    const existingNote = this;

    if (existingNote && existingNote.savedUserID.toString() === savedUserID.toString() && existingNote.contactName === contactName) {
        
        throw new ApiError(500, "Nothing to Update ");
    }

    existingNote.contactName = contactName;

    await existingNote.save();
    console.log('existingNote :', existingNote);

    return existingNote;
};

contactSchema.statics.isValidContact = async function(id, userID){

    const contact = await this.findById(id);

    if (contact) {
        const contactID = contact.userID;
        const returnObj = contactID.equals(userID)?contact:null;
        return returnObj;

    }
    return null;
    
};

contactSchema.statics.deleteContact = async function(id, userID){
    const contact = await this.findById(id);

    if (!contact) {
        throw new ApiError(404, "Contact not found");
    }

    if (!contact.userID.equals(userID)) {
        throw new ApiError(400, "Contact is not of this user");
    }

    const deletedContact = await this.findByIdAndDelete(id);
    console.log("deletedContact:", deletedContact);
    return deletedContact;
}
const Contact = mongoose.model('Contact', contactSchema);

export default Contact;