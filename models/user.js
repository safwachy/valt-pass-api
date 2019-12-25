const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaOptions = {
    collection: 'users',
    timestamps: true
};

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true, unique: true},
    countryCode: { type: String, default: '1' },

    verificationData: { 
        code: String,
        timestamp: Date
    },
    isVerified: { type: Boolean, default: false },

    authyId: String, // used for Authy 2FA API
}, schemaOptions);

UserSchema.virtual('vaultfolders', {
    ref: 'VaultFolder',
    localField: '_id',
    foreignField: 'user'
});

const User = mongoose.model('User', UserSchema);

module.exports = User;