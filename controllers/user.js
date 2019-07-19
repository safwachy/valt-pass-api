const User = require('../models/user');
const status = require('../helper/response');
const { body, param, validationResult } = require('express-validator/check');

exports.read = async (req, res) => {
    const errors = validationResult(req);
    // validate the body
    if (!errors.isEmpty()) {
        return status.preconditionError(res, errors);
    }

    try {
        let user = await User.findById(req.params.id)//), 'email vaults').populate('vaults', 'website username');
        
        if (!user) return status.responseBody(res, 404, {}, 'User not found.');
        //if (req.id != req.params.id) return status.responseBody(res, 403, {}, 'Unauthorized user query');

        return status.responseBody(res, 200, { user }, undefined);
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);        
    }
}

exports.validateRequest = (validationType) => {
    switch (validationType) {
        case 'read': {
            return [
                param('id')
                    .exists().withMessage('User Id Required')
            ]
        }
    }
}