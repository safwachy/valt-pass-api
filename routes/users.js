const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const { authenticate } = require('../middleware/authenticate');

const express = require('express');
const router = express.Router();

router.post('/login', authController.validateRequest('loginComplete'), authController.loginComplete);
// router.post('/register', authController.validateRequest('register'), authController.register);
router.patch('/:id/verify', authController.validateRequest('verifyAccount'), authController.verifyAccount);

router.get('/:id', authenticate, userController.validateRequest('read'), userController.read);

module.exports = router;