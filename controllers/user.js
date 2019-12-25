const User = require('../models/user');
const VaultFolder = require('../models/vaultFolder');
const Vault = require('../models/vault');
const status = require('../helper/response');
const { param, validationResult } = require('express-validator/check');

exports.read = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return status.preconditionError(res, errors);

        const user = await User.findById(req.params.id, 'email phone countryCode').lean();
        if (!user) return status.responseBody(res, 404, {}, 'User not found.');
        if (req.user != req.params.id) return status.responseBody(res, 403, {}, 'Unauthorized user query');

        return status.responseBody(res, 200, { user }, undefined);
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);        
    }
};

exports.delete = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return status.preconditionError(res, errors);

        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return status.responseBody(res, 404, {}, 'User not found.');
        if (req.user != id) return status.responseBody(res, 403, {}, 'Unauthorized user query');


        await Promise.all([
            Vault.deleteMany({ user: id }),
            VaultFolder.deleteMany({ user: id }),
            User.findByIdAndRemove(id)
        ]);
        return status.responseBody(res, 200, {}, 'User deleted');
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);        
    }
};

exports.validateRequest = validationType => {
    switch (validationType) {
        case 'read': {
            return [
                param('id')
                    .exists().withMessage('User Id Required')
            ]
        }
        case 'delete': {
            return [
                param('id')
                    .exists().withMessage('User Id Required')
            ]
        }
    }
};