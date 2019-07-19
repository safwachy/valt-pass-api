const User = require('../models/user');
const { responseBody } = require('../helper/response');

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const validateToken = () => {

};

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers['auth'];
        if (!token) {
            return responseBody(res, 401, {}, 'Access token not found.');
        }

        const secret = process.env.SECRET;
        let decodedToken = await jwt.verify(token, secret);
        if (!decodedToken) {
            return responseBody(res, 401, {}, 'Invalid Token.');  
        }

        let user = await User.findById(decodedToken.id);
        if (!user) {
            return responseBody(res, 401, {}, 'Trouble authenticating token.');  
        }

        req.user = user.id;
        req.key = decodedToken.key;

        next();
    } catch (error) {
        return responseBody(res, 500, {}, error.message);        
    }
};

module.exports = {
    authenticate
}