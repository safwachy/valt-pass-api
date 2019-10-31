const authController = require('../controllers/auth');

const express = require('express');
const router = express.Router();

router.get('/', (req,res) => res.render('welcome'));
router.use('/users', require('./users'));

router.post('/login', authController.validateRequest('login'), authController.login);
router.post('/register', authController.validateRequest('register'), authController.register);


module.exports = router;