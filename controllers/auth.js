const User = require('../models/user');
const status = require('../helper/response');
const token = require('../helper/token');
const sendEmail = require('../helper/email');

require('dotenv').config();

const crypto = require('crypto');
const Client = require('authy-client').Client;
const bcrypt = require('bcryptjs');
const { body, param, validationResult } = require('express-validator/check');
const shortid = require('shortid');
const moment = require('moment');

const authy = new Client({key: process.env.TWILIO_API_KEY});

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return status.preconditionError(res, errors);

    try {
        const { email, phone } = req.body;
        const [locatedEmail, locatedPhone] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ phone }),
        ]);
        if (locatedEmail) return status.responseBody(res, 409, {}, 'Email is already in use');
        if (locatedPhone) return status.responseBody(res, 409, {}, 'Phone number is already in use');

        req.body.password = await bcrypt.hash(req.body.password, 8);
        let user = new User(req.body);

        user.verificationData = {
            code: shortid.generate(),
            timestamp: new Date()
        };
        
        await user.save();
        sendEmail.sendVerificationCode(email, user.verificationData.code);

        return status.responseBody(res, 200, { user: user._id }, undefined);
    } catch (error) {
        console.log(error)
        return status.responseBody(res, 500, {}, error.message);
    }
};

// In case user needs to request a new authy sms token
exports.sendSmsToken = async (req, res) => {

}

// first step for login: basic user and password verification
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return status.preconditionError(res, errors);
    
    let { email, password } = req.body;
    try {
        let user = await User.findOne({ email }, 'password isVerified authyId verificationData');
    
        if (!user) return status.responseBody(res, 404, {}, 'Email or password given was incorrect.');        

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) return status.responseBody(res, 404, {}, 'Email or password given was incorrect.');       
        if (!user.isVerified) return status.responseBody(res, 403, { user: user._id }, 'User is not verified.'); //route user to /verify

        const appendedString = password + email;


        crypto.pbkdf2(appendedString, user._id.toString('hex'), 100000, 16, 'sha512', async (error, derivedKey) => {
            if (error) throw error;

            let tokenPayload = { 
                key: derivedKey.toString('hex'),
                id: user._id
            }

            try {
                const [authToken] = await Promise.all([
                    token.generateAuthToken(tokenPayload),
                    authy.requestSms({ authyId: user.authyId })
                ].map(promise => promise.catch(error => console.log(error))));

                return status.responseBody(res, 200, { authToken, code: user.verificationData.code }, undefined);   
            } catch (error) {
                return status.responseBody(res, 500, {}, error.message);
            }
        });
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);        
    }
};

// second step for login: 2FA verification
exports.loginComplete = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return status.preconditionError(res, errors);

    try {
        const { 
            verificationCode,
            smsToken
        } = req.body

        const decodedToken = await token.decodeAuthToken(req);
        if (!decodedToken) return responseBody(res, 401, {}, 'Invalid Token.');  
        if (!decodedToken.id) return responseBody(res, 403, {}, 'Bad Token.');

        const user = await User.findById(decodedToken.id, 'password isVerified authyId verificationData');

        if (!user.isVerified) return status.responseBody(res, 403, {}, 'User is not verified.'); //route user to /verify
        if (verificationCode !== user.verificationData.code) return status.responseBody(res, 403, {}, 'Invalid verification code.');

        const authyRes = await authy.verifyToken({ authyId: user.authyId, token: smsToken });

        if (!authyRes) return status.responseBody(res, 401, {}, 'Error in validating SMS token.');

        const tokenPayload = { 
            key: decodedToken.key,
            id: decodedToken.id,
            authy: true
        };
        
        const newAuthToken = await token.generateAuthToken(tokenPayload);

        return status.responseBody(res, 200, { authToken: newAuthToken }, undefined);   
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);        
    }
}

exports.verifyAccount = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return status.preconditionError(res, errors);

    try {
        const code = req.body.verificationCode;
        let user = await User.findById(req.params.id, 'email countryCode phone verificationData isVerified');

        if (!user) return status.responseBody(res, 404, {}, 'User not found.'); 
        if (code !== user.verificationData.code) return status.responseBody(res, 403, {}, 'Invalid verification code.');

        const codeDate = moment(user.verificationData.timestamp);
        const currentDate = moment(Date.now());
        if (codeDate.diff(currentDate, 'hours') > 48) {
            user.verificationData = {
                code: shortid.generate(),
                timestamp: new Date()
            };
            await user.save();

            return status.responseBody(res, 409, {}, 'Code has expired. A new one has been sent to your email, please try again.');
        }

        const phoneString = user.phone.toString();
        const authyRes = await authy.registerUser({
            countryCode: user.countryCode,
            email: user.email,
            phone: phoneString
        });

        user.countryCode = undefined;
        user.authyId = authyRes.user.id;
        user.isVerified = true;
        await user.save();

        return status.responseBody(res, 200, {}, undefined); 
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);        
    }
}

exports.changePasswordRequest = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return status.preconditionError(res, errors);

    try {
        const { email } = req.body;
        const update = {
            code: shortid.generate(),
            timestamp: new Date()   
        };
        const user = User.findOneAndUpdate({ email }, { verificationData: update });

        if (user) sendEmail.sendPasswordChange(email, update.code);

        return status.responseBody(res, 200, {}, undefined); 
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);
    }
};

// data encryption key will change with new master password
exports.changePassword = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return status.preconditionError(res, errors);

    try {
        
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);
    }
}

exports.validateRequest = validationType => {
    const numberRegex = new RegExp('^(?=.*[0-9])');
    const lowerCaseRegex = new RegExp('^(?=.*[a-z])');
    const upperCaseRegex = new RegExp('^(?=.*[A-Z])'); 
    const specialCharRegex = new RegExp('^(?=.*[$@$!%*?&])'); 

    switch (validationType) {
        case 'register': {
            return [
                body('email')
                    .isLength({ min: 1 }).withMessage('Email Required.')
                    .isEmail().withMessage('Invalid Email.'),
                body('password')
                    .isLength({ min: 1 }).withMessage('Password Required.')
                    .isLength({ min: 10 }).withMessage('Password must be at least 10 chracters long.')
                    .matches(numberRegex).withMessage('Password must contain at least one number.')
                    .matches(lowerCaseRegex).withMessage('Password must contain at least one lowercase letter.')
                    .matches(upperCaseRegex).withMessage('Password must contain at least one capital letter.')
                    .matches(specialCharRegex).withMessage('Password must contain at least one special character')
                    .custom((value, { req }) => {
                        if (value !== req.body.confirmPassword) {
                            throw new Error('Passwords do not match.');
                        } else {
                            return true;
                        }
                    }),
                body('phone')
                    .exists().withMessage('Phone number required.')
                    .isMobilePhone('en-CA').withMessage('Invalid format for phone number.')
            ]
        }
        case 'login': {
            return [
                body('email')
                    .exists().withMessage('Email Required.')
                    .isEmail().withMessage('Invalid Email.'),
                body('password')
                    .exists().withMessage('Password Required.')
            ]
        }
        case 'loginComplete': {
            return[
                body('smsToken')
                    .exists().withMessage('2FA SMS Token Required.'),
                body('verificationCode')
                    .exists().withMessage('Unique verification code Required.')
            ]
        }
        case 'verifyAccount': {
            return [
                param('id')
                    .exists().withMessage('User Id Required'),
                body('verificationCode')
                    .exists().withMessage('Verification code required.')
            ]
        }
        case ('changePasswordRequest'): {
            return [
                body('email')
                .isLength({ min: 1 }).withMessage('Email Required.')
                .isEmail().withMessage('Invalid Email.'),        
            ]
        }
        case ('changePassword'): {
            return [
                body('password')
                    .isLength({ min: 1 }).withMessage('Password Required.')
                    .isLength({ min: 10 }).withMessage('Password must be at least 10 chracters long.')
                    .matches(numberRegex).withMessage('Password must contain at least one number.')
                    .matches(lowerCaseRegex).withMessage('Password must contain at least one lowercase letter.')
                    .matches(upperCaseRegex).withMessage('Password must contain at least one capital letter.')
                    .matches(specialCharRegex).withMessage('Password must contain at least one special character')
                    .custom((value, { req }) => {
                        if (value !== req.body.confirmPassword) {
                            throw new Error('Passwords do not match.');
                        } else {
                            return true;
                        }
                    })      
            ]
        }
    }
};