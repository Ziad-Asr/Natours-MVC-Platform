const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const protectRoutes = require('../middlewares/protectRoutes.middleware');
const authorization = require('../middlewares/authorization.middleware');

// Protect all routes after this middleware
router.use(protectRoutes);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authorization('user'), reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReiviewById)
  .patch(authorization('user', 'admin'), reviewController.updateReview)
  .delete(authorization('user', 'admin'), reviewController.deleteReview);

module.exports = router;
