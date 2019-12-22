const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const folderController = require('../controllers/vaultFolder');
const vaultController = require('../controllers/vault');
const { authenticate } = require('../middleware/authenticate');

const express = require('express');
const router = express.Router();

// Auth Endpoints
router.post('/login', authController.validateRequest('loginComplete'), authController.loginComplete);
router.patch('/:id/verify', authController.validateRequest('verifyAccount'), authController.verifyAccount);

// User Endpoints
router.get('/:id', authenticate, userController.validateRequest('read'), userController.read);
router.delete('/:id', authenticate, userController.validateRequest('delete'), userController.delete);

// Vault Folder Endpoints
router.post('/:id/folders', authenticate, folderController.validateRequest('create'), folderController.create);
router.get('/:id/folders', authenticate, folderController.validateRequest('readAll'), folderController.readAll);

// Vault Enpoints
router.post('/:id/vaults', authenticate, vaultController.validateRequest('create'), vaultController.create);
router.patch('/:id/vaults/:vaultId', authenticate, vaultController.validateRequest('update'), vaultController.update);
router.delete('/:id/vaults/:vaultId', authenticate, vaultController.validateRequest('delete'), vaultController.delete);

module.exports = router;