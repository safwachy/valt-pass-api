const validator = require('validator');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        }
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
    vaults: [{
        type: Schema.Types.ObjectId, 
        ref: 'Vault'
    }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;