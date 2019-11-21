const VaultFolder = require('../models/vaultFolder');
const status = require('../helper/response');
const { decryptVault } = require('../helper/encrypt');

const { body, param, validationResult } = require('express-validator/check');

exports.readAll = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return status.preconditionError(res, errors);

		const { id } = req.params;
		const { type } = req.query;
		const { key } = req;

		if (req.user != id) return status.responseBody(res, 401, {}, 'Unauthorized user query');
		if (!req.key) return status.responseBody(res, 403, {}, 'Encryption key not found');

		let populateOptions = {
			path: 'vaults',
			select: 'folder type title website username password contactName email phone countryCode birthday contactNotes notes',
		};
		if (type !== 'all') populateOptions.match = { type };

		let folders = await VaultFolder.find({ user: id }).populate(populateOptions).lean();
		
		let decryptedVaults = [];
		let decryptPromiseArr = [];
		for (let i = 0; i < folders.length; i++) {
			if (folders[i].vaults && folders[i].vaults.length) {
				for (let k = 0; k < folders[i].vaults.length; k++) {
					decryptPromiseArr.push(decryptVault(folders[i].vaults[k], key).catch(error => console.log(error)));
				}
				decryptedVaults = await Promise.all(decryptPromiseArr);
				folders[i].vaults = decryptedVaults;
			}
		}

		return status.responseBody(res, 200, { folders }, undefined);
	} catch (error) {
		return status.responseBody(res, 500, {}, error.message);        
	}
};

exports.create = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return status.preconditionError(res, errors);

		const { id } = req.params;
		if (req.user != id) return status.responseBody(res, 401, {}, 'Unauthorized user query');

		const body = {
			user: id,
			name: req.body.name
		};

		const newFolder = new VaultFolder(body);
		await newFolder.save();
		if (newFolder) {
			return status.responseBody(res, 200, { folder: newFolder }, undefined);
		}
		return status.responseBody(res, 400, {}, 'An error has occured');
	} catch (error) {
		return status.responseBody(res, 500, {}, error.message);        
	}
};

exports.validateRequest = validationType => {
	switch (validationType) {
		case 'readAll': {
			return [
				param('id')
					.exists().withMessage('User Id Required'),
				query('type')
					.exists().withMessage('Vault query parameter type required')
					.custom(value => {
						if (value === 'all') return true;
						else if (value === 'password') return true;
						else if (value === 'contact') return true;
						else if (value === 'notes') return true;
						else {
							throw new Error('Invalid query parameter');
						}
					})
			]
		}
		case 'create': {
			return [
				param('id')
					.exists().withMessage('User Id Required'),
				body('name')
					.exists().withMessage('Folder name Required'),
			]
		}
	}
};
