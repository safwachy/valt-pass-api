const User = require('../models/user');
const { responseBody } = require('../helper/response');
const { decodeAuthToken } = require('../helper/token');

require('dotenv').config();

const authenticate = async (req, res, next) => {
    try {
        const decodedToken = await decodeAuthToken(req);
        if (!decodedToken) return responseBody(res, 401, {}, 'Invalid Token.');  
        if (!decodedToken.authy) return responseBody(res, 401, {}, '2FA Required.');

        if (!decodedToken.id) return responseBody(res, 403, {}, 'Bad Token.');
        const user = await User.findById(decodedToken.id);
        if (!user) {
            return responseBody(res, 401, {}, 'Trouble authenticating token.');  
        }

        req.user = user.id;
        req.key = decodedToken.key;

        next();
    } catch (error) {
        return responseBody(res, 500, {}, error);        
    }
};

module.exports = {
    authenticate
}