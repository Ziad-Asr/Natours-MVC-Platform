const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const protectRoutes = require('../middlewares/protectRoutes.middleware');
const authorization = require('../middlewares/authorization.middleware');

// -------------------------------------------------------
// -------------------------------------------------------

// Param middleware:-
// -------------------
// A middleware that only runs on there is a specific param in the endpoint url (id, here as example)
// Note the (value) in (checkID middleware) id the 'id' here. (extracted from params).
// router.param('id', tourController.checkID);

// -------------------------------------------------------
// -------------------------------------------------------

// Alising :-
// ----------
router.route('/top-5-cheap').get(tourController.getAllTours);

// -------------------------------------------------------
// -------------------------------------------------------

// Stats (Aggrigation pipelines) :-
// --------------------------------
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    protectRoutes,
    authorization('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// -------------------------------------------------------
// -------------------------------------------------------

// CRUD :-
// -------
router
  .route('/')
  .get(tourController.getAllTours)
  .post(protectRoutes, authorization('admin'), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(
    protectRoutes,
    authorization('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    protectRoutes,
    authorization('admin', 'lead-guide'),
    tourController.deleteTour
  );

// #####################
// ### Nested routes ###
// #####################
// The second way of dealing with reviews instead of normal direct reviews CRUD.
// This is an alternative of sending the (tourID) inthe body.

// (POST) => URL: /tour/:tourId/reviews
// (GET) => URL: /tour/:tourId/reviews
// (GeTOne & Update & Delete) => URL: /tour/:tourId/reviews/:reviewId

// router
//   .route('/:tourId/reviews')
//   .get(
//     protectRoutes,
//     authorization('user'),
//     reviewController.getAllUserReviews
//   )
//   .post(
//     protectRoutes,
//     authorization('user'),
//     reviewController.createUserReview
//   );

// router
//   .route('/:tourId/reviews/:reviewId')
//   .get(
//     protectRoutes,
//     authorization('user'),
//     reviewController.geUserReviewById
//   )
//   .patch(
//     protectRoutes,
//     authorization('user'),
//     reviewController.updateUserReviewById
//   )
//   .delete(
//     protectRoutes,
//     authorization('user'),
//     reviewController.deleteUserReviewById
//   );

module.exports = router;
