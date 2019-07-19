const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const { authenticate } = require('../middleware/authenticate');

const express = require('express');
const router = express.Router();

// Load Pages
router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

// Router Handlers
router.post('/login', authController.validateRequest('login'), authController.login);
router.post('/register', authController.validateRequest('register'), authController.register);
router.patch('/verify', authController.validateRequest('verifyAccount'), authController.verifyAccount);

router.get('/:id', authenticate, userController.validateRequest('read'), userController.read);

module.exports = router;