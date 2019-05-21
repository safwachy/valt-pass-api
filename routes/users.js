const authController = require('../controllers/auth');
const { validateToken } = require('../helper/token');
const express = require('express');
const router = express.Router();

// Load Pages
router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

// Router Handlers
router.post('/login', authController.validateRequest('login'), authController.login);

router.post('/register', authController.validateRequest('register'), authController.register);

router.post('/verify', authController.validateRequest('verifyAccount'), authController.verifyAccount);

module.exports = router;