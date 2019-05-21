const validator = require('validator');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    countryCode: {
        type: Number,
        default: 1
    },
    uniqueCode: String,  
    AuthyID: String, // used for Authy 2FA API
    vaults: [{
        type: Schema.Types.ObjectId, 
        ref: 'Vault'
    }],
    isVerified: Boolean
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;