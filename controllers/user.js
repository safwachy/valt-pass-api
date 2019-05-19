const User = require('../models/user');

exports.read = async (req, res) => {

}

exports.validateRequest = async (validationType) => {
    switch (validationType) {
        case 'read': {
            return [
                param('id')
                    .exists().withMessage('User Id Required')
            ]
        }
    }
}