const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: "name is required",
        trim: true
    },
    phone: {
        type: String,
        required: "phone is require",
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: "email is required",
        unique: true,
        trim: true,
        lowercase:true
    },
    password: {
        type: String,
        required: "Password is required",
        minLen: 8, maxLen: 15
    },

}, { timestamps: true })


module.exports = mongoose.model("usermodel", userSchema);
