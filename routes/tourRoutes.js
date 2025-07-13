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
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// -------------------------------------------------------
// -------------------------------------------------------

// Stats (Aggrigation pipelines) :-
// --------------------------------
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// -------------------------------------------------------
// -------------------------------------------------------

// CRUD :-
// -------
router
  .route('/')
  .get(protectRoutes, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(
    protectRoutes,
    authorization('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
