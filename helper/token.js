const { responseBody } = require('../helper/response');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const generateAuthToken = async (tokenPayload) => {
    try {
        const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
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

        return jwt.verify(token, publicKey);
    } catch (error) {
        return error;        
    }
}

module.exports = {
    generateAuthToken,
    decodeAuthToken
};