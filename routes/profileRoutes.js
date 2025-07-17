const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const protectRoutes = require('../middlewares/protectRoutes.middleware');
const imageUpload = require('../services/imageUpload');

// Protect all routes after this middleware
router.use(protectRoutes);

// AUTH (User endpoints)
router.get('/', profileController.getMe);
router.patch(
  '/',
  imageUpload.uploadSingleImage,
  imageUpload.resizeSingleImage,
  profileController.updateMe
);
router.delete('/', profileController.deleteMe);

module.exports = router;
