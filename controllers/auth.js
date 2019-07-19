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
            return status.responseBody(res, 409, {}, 'Email is already in use');
        }

        req.body.password = await bcrypt.hash(req.body.password, 8);
        let user = new User(req.body);

        user.uniqueCode = shortid.generate();
        
        await user.save();
        user.password = undefined; // do not display hashed password in response body

        sendEmail.sendVerificationCode(email, user.uniqueCode);

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
        let user = await User.findOne({ email }, 'password isVerified');
    
        if (!user) {
            return status.responseBody(res, 404, {}, 'Email or password does not match.');        
        }

        let validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return status.responseBody(res, 404, {}, 'Email or password does not match.');       
        }
        if (!user.isVerified) {
            return status.responseBody(res, 403, {}, 'User is not verified.');       
        }

        let appendedString = password + email;

        crypto.pbkdf2(appendedString, user._id.toString('hex'), 100000, 64, 'sha512', async (error, derivedKey) => {
            if (error) throw error;

            let tokenPayload = { 
                key: derivedKey.toString('hex'),
                id: user._id
            }

            try {
                let authToken = await token.generateAuthToken(tokenPayload, user.password);
            
                return status.responseBody(res, 200, { authToken }, undefined);   
            } catch (error) {
                return status.responseBody(res, 500, {}, error.message);
            }
        });
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
        let code = req.body.verificationCode;
        let user = await User.findOne({ uniqueCode: code });

        if (!user) {
            return status.responseBody(res, 404, {}, 'An account with that email does not exist.');   
        }
        if (code !== user.uniqueCode) {
            return status.responseBody(res, 403, {}, 'Invalid verification code.');  
        }

        user.uniqueCode = undefined;
        user.isVerified = true;
        await user.save();

        return status.responseBody(res, 200, {}, 'Account has been verified. Login to start using ValtPass!'); 
    } catch (error) {
        return status.responseBody(res, 500, {}, error.message);        
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
        case 'verifyAccount': {
            return [
                body('verificationCode')
                    .exists().withMessage('Verification code required.')
            ]
        }
    }
};