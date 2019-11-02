const { responseBody } = require('../helper/response');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const utf8 = require('utf8');
const fs = require('fs');

require('dotenv').config();

const generateAuthToken = async (tokenPayload) => {
    try {
        const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
        // const privateKey = fs.readFileSync('./private.key', 'utf8')
        const options = { 
            expiresIn: '1 hour',
            algorithm: 'RS256'
        }

        const token = jwt.sign(tokenPayload, privateKey, options);

        return token;
    } catch (error) {
        return error;
    }
};


const decodeAuthToken = async req => {
    try {
        const token = req.headers['auth'];
        if (!token) {
            return responseBody(res, 401, {}, 'Access token not found.');
        }

        const publicKey = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');
        // const publicKey = fs.readFileSync('./public.key', 'utf8')

        return jwt.verify(token, publicKey);
    } catch (error) {
        return error;        
    }
}

module.exports = {
    generateAuthToken,
    decodeAuthToken
};