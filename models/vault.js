const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VaultSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    website: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Vault = mongoose.model('Vault', VaultSchema);

module.exports = Vault;