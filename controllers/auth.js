const User = require('../models/user');
const status = require('../helper/response');
const token = require('../helper/token');
const sendEmail = require('../helper/email');

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator/check');
const shortid = require('shortid');


exports.register = async (req, res) => {
    const errors = validationResult(req);
    // validate the body
    if (!errors.isEmpty()) {
        return status.preconditionError(res, errors);
    }

    try {
        let email = req.body.email;
        let locatedUser = await User.findOne({ email });
        if (locatedUser) {
            return status.responseBody(res, 409, {}, 'Email alredy in use');
        }

        req.body.password = await bcrypt.hash(req.body.password, 8);
        let user = new User(req.body);

        user.uniqueCode = shortid.generate();
        user.IsVerified = false; // assert that it is false

        await user.save();
        user.password = undefined; // do not display hashed password in response body

        sendEmail.sendVerificationCode({ email, code: user.uniqueCode });

        return status.responseBody(res, 200, { user }, undefined);
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    // validate the body
    if (!errors.isEmpty()) {
        return status.preconditionError(res, errors);
    }
    
    let { email, password } = req.body;
    try {
        let user = await User.findOne({ email }, 'email password');
    
        if (user) {
            let validPassword = await bcrypt.compare(password, user.password);
            if (validPassword) {
                if (!user.IsVerified) return status.responseBody(res, 403, {}, 'Account not verified.');

                crypto.pbkdf2(user.password, user.email, 10000, 64, 'sha512', (err, derivedKey) => {
                    if (error) throw error;
                    
                    let tokenPayload = { vaultKey: derivedKey.toString('hex'), id: user._id };
                    let authToken = token.generateAuthToken(tokenPayload, user.password);
                    
                    
                });
            }
        } 
        return status.responseBody(res, 404, {}, 'Email or password does not match.');        
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);        
    }
};

exports.verifyAccount = async (req, res) => {
    const errors = validationResult(req);
    // validate the body
    if (!errors.isEmpty()) {
        return status.preconditionError(res, errors);
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            if (req.body.verificationCode === user.uniqueCode) {
                user.IsVerified = true;
                return status.responseBody(res, 200, {}, 'Account has been verified. Login to start using ValtPass!');        
            }
            return status.responseBody(res, 403, {}, 'Invalid verification code.');        
        }
        return status.responseBody(res, 404, {}, 'An account with that email does not exist.');        
    } catch (error) {

    }
}

exports.logout = async function (req, res) {

};

exports.changePassword = async function (req, res) {

};

exports.validateRequest = (validationType) => {
    switch (validationType) {
        case 'register': 
        let numberRegex = new RegExp('^(?=.*[0-9])');
        let lowerCaseRegex = new RegExp('^(?=.*[a-z])');
        let upperCaseRegex = new RegExp('^(?=.*[A-Z])'); 
        let specialCharRegex = new RegExp('^(?=.*[$@$!%*?&])'); 
        {
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
                            throw new Error('Password confirmation incorrect.');
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
        case 'verifyAccount': {
            return [
                body('email')
                    .exists().withMessage('Email Required.')
                    .isEmail().withMessage('Invalid Email.'),
                body('verificationCode')
                    .exists().withMessage('Verification code required.')
            ]
        }
    }
};