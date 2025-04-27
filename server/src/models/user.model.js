import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true, // ✅ Index for faster searches
        validate: {
            validator: function (value) {
                return /^[a-zA-Z\s]+$/.test(value); // ✅ Only alphabets & spaces
            },
            message: "Full name must contain only letters and spaces."
        }
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // ✅ Unique index for quick lookups
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    contacts:[
        {
            type:Types.ObjectId,
            ref: "Contact"
        }
    ],
    refresh_token:{
        type: String
    },
    last_seen:{
        type: Date,
    }
}, {
    timestamps:true
});

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.statics.isRegistered = async function (query) {
    return await this.findOne(query);
};

userSchema.statics.createUser = async function (data={}) {
    // Ensure OTP is not stored in the database
    delete data.otp;

    // Create user
    const createdUser = await this.create(data);

    // Convert to plain object and remove sensitive fields
    const userObj = createdUser.toObject();
    delete userObj.password;
    delete userObj.refresh_token;

    return userObj;
}

userSchema.methods.checkPassword = async function(password) {
    // console.log('password :', password);
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            id:this._id,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
        _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generate_access_and_refresh_token = async function() {

    const accessToken = await this.generateAccessToken();
    const refreshToken = await this.generateRefreshToken();
    this.refresh_token = refreshToken;
    await this.save({validateBeforeSave:false});
    return { accessToken, refreshToken };
};

userSchema.methods.loginUser = async function () {
    console.log("methods loginUser");
    const user = this.toObject(); // Convert Mongoose document to plain object

    // Remove sensitive fields
    delete user.password;
    delete user.refresh_token;

    return user;
};

userSchema.statics.isUserOnApp = async function(email){

    return await this.findOne({email});
};

userSchema.methods.saveContact = async function(id){

    this.contacts.push(id);
    await this.save({validateBeforeSave: false});
};

const User = mongoose.model('User', userSchema);

export default User;