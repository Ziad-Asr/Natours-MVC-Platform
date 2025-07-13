const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protectRoutes = require('../middlewares/protectRoutes.middleware');

// AUTH (User endpoints)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:reset_token', authController.resetPassword);
router.patch('/update-password', protectRoutes, authController.updatePassword);

module.exports = router;
