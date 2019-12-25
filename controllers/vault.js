const Vault = require('../models/vault');
const status = require('../helper/response');
const { encryptVault, decryptVault } = require('../helper/encrypt');

const { body, param, validationResult } = require('express-validator/check');

exports.create = async (req, res) => {
	try {
        const errors = validationResult(req);
		if (!errors.isEmpty()) return status.preconditionError(res, errors);

        const { id } = req.params;
        const { folder, type } = req.body;

		if (req.user != id) return status.responseBody(res, 401, {}, 'Unauthorized user');
		if (!req.key) return status.responseBody(res, 403, {}, 'Encryption key not found');

        if (!folder) {
            const defaultFolder = await VaultFolder.findOne({ user: id, name: 'None' }).lean();
            folder = defaultFolder._id;
        }

        let vaultBody = {
            user: id,
            folder,
            type,
        };

        if (req.body.title) vaultBody.title = req.body.title;
        if (req.body.website) vaultBody.website = req.body.website;
        if (req.body.username) vaultBody.username = req.body.username;
        if (req.body.password) vaultBody.password = req.body.password;
        if (req.body.contactName) vaultBody.contactName = req.body.contactName;
        if (req.body.email) vaultBody.email = req.body.email;
        if (req.body.phone) vaultBody.phone = req.body.phone;
        if (req.body.countryCode) vaultBody.countryCode = req.body.countryCode;
        if (req.body.birthday) vaultBody.birthday = req.body.birthday;
        if (req.body.contactNotes) vaultBody.contactNotes = req.body.contactNotes;
        if (req.body.notes) vaultBody.notes = req.body.notes;

        const encryptedVaultBody = await encryptVault(vaultBody, req.key);
        const newVault = new Vault(encryptedVaultBody);
        newVault.save();
        if (newVault) {
            // the encrypted doc should not be sent back
			return status.responseBody(res, 200, { vault: { _id: newVault._id , ...vaultBody } }, undefined);
        }
        return status.responseBody(res, 400, {}, 'An error has occured');
	} catch (error) {
		return status.responseBody(res, 500, {}, error.message);        
	}
};

exports.update = async (req, res) => {
	try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return status.preconditionError(res, errors);
        
        const { id, vaultId } = req.params;

		if (req.user != id) return status.responseBody(res, 401, {}, 'Unauthorized user');
        if (!req.key) return status.responseBody(res, 403, {}, 'Encryption key not found');
        
        let vaultBody = {};
        
        if (req.body.type) vaultBody.type = req.body.type;
        if (req.body.title) vaultBody.title = req.body.title;
        if (req.body.website) vaultBody.website = req.body.website;
        if (req.body.username) vaultBody.username = req.body.username;
        if (req.body.password) vaultBody.password = req.body.password;
        if (req.body.contactName) vaultBody.contactName = req.body.contactName;
        if (req.body.email) vaultBody.email = req.body.email;
        if (req.body.phone) vaultBody.phone = req.body.phone;
        if (req.body.countryCode) vaultBody.countryCode = req.body.countryCode;
        if (req.body.birthday) vaultBody.birthday = req.body.birthday;
        if (req.body.contactNotes) vaultBody.contactNotes = req.body.contactNotes;
        if (req.body.notes) vaultBody.notes = req.body.notes;

        const encryptedVaultBody = await encryptVault(vaultBody, req.key);
        if (!encryptedVaultBody) throw new Error('Could not encrypt document');
        
        const updatedVault = await Vault.findByIdAndUpdate(vaultId, { $set: encryptedVaultBody }, { new: true }).lean();
        if (updatedVault) {
            const decryptedVault = await decryptVault(updatedVault, req.key);
            if (!decryptedVault) throw new Error('Could not encrypt document');

            return status.responseBody(res, 200, { vault: decryptedVault }, 'Update successful');
        }
	} catch (error) {
		return status.responseBody(res, 500, {}, error.message);        
	}
};

exports.delete = async (req, res) => {
	try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return status.preconditionError(res, errors);
        
        const { id, vaultId } = req.params;

        if (req.user != id) return status.responseBody(res, 401, {}, 'Unauthorized user');
        const deletedVault = await Vault.findByIdAndRemove(vaultId);
        if (deletedVault) return status.responseBody(res, 200, {}, 'Vault document deleted successfully');
	} catch (error) {
		return status.responseBody(res, 500, {}, error.message);        
	}
};

exports.validateRequest = validationType => {
	switch (validationType) {
		case 'create': {
			return [
				param('id')
					.exists().withMessage('User Id Required'),
                body('type')
					.exists().withMessage('Vault type required')
					.custom(value => {
						if (value === 'password') return true;
						else if (value === 'contact') return true;
						else if (value === 'notes') return true;
						else {
							throw new Error('Invalid string enumerator for \'type\'');
						}
                    }),
            ]
		}
        case 'update': {
            return [
                param('id')
                    .exists().withMessage('User Id Required'),
                param('vaultId')
                    .exists().withMessage('Vault Id Required'),
                body('type')
                    .custom(value => {
                        if (type) {
                            if (value === 'password') return true;
                            else if (value === 'contact') return true;
                            else if (value === 'notes') return true;
                            else {
                                throw new Error('Invalid string enumerator for \'type\'');
                            }
                        }
                    }),
            ]
        }
        case 'delete': {
            return [
                param('id')
                    .exists().withMessage('User Id Required'),
                param('vaultId')
                    .exists().withMessage('Vault Id Required'),
            ]
        }
	}
};
