const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protectRoutes = require('../middlewares/protectRoutes.middleware');
const authorization = require('../middlewares/authorization.middleware');

// Protect all routes after this middleware
router.use(protectRoutes, authorization('admin'));

// CRUD (Admin endpoints)
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserById);

module.exports = router;
