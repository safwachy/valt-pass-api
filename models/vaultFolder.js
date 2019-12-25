const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaOptions = {
	collection: 'vaultfolders',
	timestamps: true
};

const VaultFolderSchema = new Schema({
  	user: { type: Schema.Types.ObjectId, ref: 'User' },
 	name: String,
}, schemaOptions);

VaultFolderSchema.virtual('vaults', {
	ref: 'Vault',
    localField: '_id',
    foreignField: 'folder'
});

const VaultFolder = mongoose.model('VaultFolder', VaultFolderSchema);

module.exports = VaultFolder;