const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const protectRoutes = require('../middlewares/protectRoutes.middleware');
const authorization = require('../middlewares/authorization.middleware');

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(protectRoutes, authorization('user'), reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReiviewById)
  .patch(protectRoutes, authorization('user'), reviewController.updateReview)
  .delete(protectRoutes, authorization('user'), reviewController.deleteReview);

module.exports = router;
