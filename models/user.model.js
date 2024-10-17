import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId;
        },
        minlength: 6
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailtoken: {type: String},
}, {timestamps: true});

const user = mongoose.model("User", userSchema);
export default user;