const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const protectRoutes = require('../middlewares/protectRoutes.middleware');

// AUTH (User endpoints)
router.patch('/', protectRoutes, profileController.updateMe);
router.delete('/', protectRoutes, profileController.deleteMe);

module.exports = router;
