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
        type: String,
        required: true
    },
    countryCode: {
        type: Number,
        default: 1
    },
    uniqueCode: String, // used to verify account after registration
    authyID: String, // used for Authy 2FA API
    vaults: [{
        type: Schema.Types.ObjectId, 
        ref: 'Vault'
    }],
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;