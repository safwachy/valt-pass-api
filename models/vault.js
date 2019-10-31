const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaOptions = {
	collection: 'vaults',
	timestamps: true
};

const VaultSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    folder: { type: Schema.Types.ObjectId, ref: 'VaultFolder' },
    title: String,

    // for website credential data
    website: String,
    username: String,
    password: String, 

    // for contact info data
    contactName: String,
    email: String,
    phone: String,
    countryCode: { type: Number, default: 1 },
    birthday: Date,
    contactNotes: String,

    // for notes data
    notes: String

}, schemaOptions);

const Vault = mongoose.model('Vault', VaultSchema);

module.exports = Vault;