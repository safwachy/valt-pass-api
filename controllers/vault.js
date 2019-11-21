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
        await newVault.save();
        if (newVault) {
            // the encrypted doc should not be sent back
			return status.responseBody(res, 200, { vault: { _id: newVault._id , ...vaultBody } }, undefined);
        }
        return status.responseBody(res, 400, {}, 'An error has occured');
	} catch (error) {
		return status.responseBody(res, 500, {}, error.message);        
	}
};

exports.read = async (req, res) => {
	try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return status.preconditionError(res, errors);
        

	} catch (error) {
		return status.responseBody(res, 500, {}, error.message);        
	}
};

exports.update = async (req, res) => {
	try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return status.preconditionError(res, errors);
        

	} catch (error) {
		return status.responseBody(res, 500, {}, error.message);        
	}
};

exports.delete = async (req, res) => {
	try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return status.preconditionError(res, errors);
        

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
						if (value === 'all') return true;
						else if (value === 'password') return true;
						else if (value === 'contact') return true;
						else if (value === 'notes') return true;
						else {
							throw new Error('Invalid vault type');
						}
                    }),
                body('folder')
                    .exists().withMessage('Vault Folder Id required')
            ]
		}
		case 'read': {
			return [
				param('id')
					.exists().withMessage('User Id Required'),
                param('vaultId')
                    .exists().withMessage('Vault Id Required'),
			]
        }
        case 'update': {
            return [
                param('id')
                    .exists().withMessage('User Id Required'),
                param('vaultId')
                    .exists().withMessage('Vault Id Required'),
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
